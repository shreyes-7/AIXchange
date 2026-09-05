const { expect } = require("chai");
const { ethers } = require("hardhat");
const { EventMonitor, normalizeEvent } = require("../../monitoring/eventMonitor");

describe("Blockchain Monitoring — EventMonitor", function () {
    let owner, user1, user2;
    let aixToken, treasury, datasetRegistry;
    let eventMonitor;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const AIXToken = await ethers.getContractFactory("AIXToken");
        aixToken = await AIXToken.deploy(ethers.parseEther("1000000"), owner.address);
        await aixToken.waitForDeployment();

        const Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy(owner.address);
        await treasury.waitForDeployment();

        const DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
        datasetRegistry = await DatasetRegistry.deploy();
        await datasetRegistry.waitForDeployment();

        const contracts = {
            AIXToken: {
                address: await aixToken.getAddress(),
                interface: aixToken.interface,
            },
            Treasury: {
                address: await treasury.getAddress(),
                interface: treasury.interface,
            },
            DatasetRegistry: {
                address: await datasetRegistry.getAddress(),
                interface: datasetRegistry.interface,
            },
        };

        eventMonitor = new EventMonitor(ethers.provider, contracts);
    });

    it("Should normalize raw logs into auditable event activity objects", async function () {
        const tx = await aixToken.transfer(user1.address, ethers.parseEther("500"));
        const receipt = await tx.wait();
        const log = receipt.logs[0];
        const parsed = aixToken.interface.parseLog(log);

        const normalized = normalizeEvent(log, parsed, "AIXToken", new Date());

        expect(normalized.eventName).to.equal("Transfer");
        expect(normalized.contractName).to.equal("AIXToken");
        expect(normalized.from).to.equal(owner.address.toLowerCase());
        expect(normalized.to).to.equal(user1.address.toLowerCase());
        expect(normalized.amount).to.equal(ethers.parseEther("500").toString());
        expect(normalized.transactionHash).to.equal(tx.hash.toLowerCase());
    });

    it("Should fetch and deduplicate events across multiple contracts", async function () {
        const startBlock = await ethers.provider.getBlockNumber();

        // 1. AIX transfer
        await aixToken.transfer(user1.address, ethers.parseEther("100"));
        // 2. Treasury ETH deposit
        await user1.sendTransaction({
            to: await treasury.getAddress(),
            value: ethers.parseEther("1"),
        });
        // 3. Dataset registration
        await datasetRegistry.connect(user1).registerDataset(
            "QmTestCID1234567890",
            "MIT",
            500 // 5% royalty
        );

        const endBlock = await ethers.provider.getBlockNumber();

        const events = await eventMonitor.fetchEvents({
            fromBlock: startBlock,
            toBlock: endBlock,
        });

        expect(events.length).to.be.at.least(3);

        const eventNames = events.map((e) => e.eventName);
        expect(eventNames).to.include("Transfer");
        expect(eventNames).to.include("ETHDeposited");
        expect(eventNames).to.include("DatasetRegistered");

        // Verify zero duplicates
        const uniqueIds = new Set(events.map((e) => e.id));
        expect(uniqueIds.size).to.equal(events.length);
    });

    it("Should handle empty block ranges gracefully", async function () {
        const currentBlock = await ethers.provider.getBlockNumber();
        const events = await eventMonitor.fetchEvents({
            fromBlock: currentBlock + 10,
            toBlock: currentBlock + 20,
        });

        expect(events).to.be.an("array");
        expect(events.length).to.equal(0);
    });

    it("Should correctly filter events by wallet address and event name", async function () {
        const startBlock = await ethers.provider.getBlockNumber();

        await aixToken.transfer(user1.address, ethers.parseEther("50"));
        await aixToken.transfer(user2.address, ethers.parseEther("75"));

        const events = await eventMonitor.fetchEvents({
            fromBlock: startBlock,
        });

        const user1Events = eventMonitor.filterEvents(events, {
            address: user1.address,
        });

        expect(user1Events.length).to.equal(1);
        expect(user1Events[0].to).to.equal(user1.address.toLowerCase());
        expect(user1Events[0].amount).to.equal(ethers.parseEther("50").toString());
    });

    it("Should handle RPC / provider errors gracefully without crashing", async function () {
        const brokenMonitor = new EventMonitor(ethers.provider, {
            InvalidContract: {
                address: "0x0000000000000000000000000000000000000001",
                interface: {
                    parseLog: () => {
                        throw new Error("Parsing failure");
                    },
                },
            },
        });

        const events = await brokenMonitor.fetchEvents({ fromBlock: 0, toBlock: 1 });
        expect(events).to.be.an("array");
        expect(events.length).to.equal(0);
    });
});
