const { expect } = require("chai");
const { ethers } = require("hardhat");
const { TreasuryMonitor } = require("../../monitoring/treasuryMonitor");

describe("Blockchain Monitoring — TreasuryMonitor", function () {
    let owner, user1, user2;
    let aixToken, treasury;
    let treasuryMonitor;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const AIXToken = await ethers.getContractFactory("AIXToken");
        aixToken = await AIXToken.deploy(ethers.parseEther("1000000"), owner.address);
        await aixToken.waitForDeployment();

        const Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy(owner.address);
        await treasury.waitForDeployment();

        treasuryMonitor = new TreasuryMonitor(treasury, ethers.provider);
    });

    it("Should accurately query live ETH and ERC20 token balances of Treasury", async function () {
        const tokenAddress = await aixToken.getAddress();
        const treasuryAddress = await treasury.getAddress();

        // Deposit ETH and Token
        await user1.sendTransaction({
            to: treasuryAddress,
            value: ethers.parseEther("2.5"),
        });

        await aixToken.transfer(user1.address, ethers.parseEther("1000"));
        await aixToken.connect(user1).approve(treasuryAddress, ethers.parseEther("1000"));
        await treasury.connect(user1).depositToken(tokenAddress, ethers.parseEther("1000"));

        const balances = await treasuryMonitor.getBalances([tokenAddress]);

        expect(balances.ethBalance.formatted).to.equal("2.5");
        expect(balances.tokens[tokenAddress.toLowerCase()].formatted).to.equal("1000.0");
    });

    it("Should classify Treasury events into inflows and outflows", function () {
        const ethInflowEvent = {
            contractName: "Treasury",
            eventName: "ETHDeposited",
            amount: ethers.parseEther("5").toString(),
            from: user1.address.toLowerCase(),
            transactionHash: "0x1111",
        };

        const tokenOutflowEvent = {
            contractName: "Treasury",
            eventName: "TokenWithdrawn",
            amount: ethers.parseEther("500").toString(),
            to: user2.address.toLowerCase(),
            transactionHash: "0x2222",
        };

        const royaltyPaidEvent = {
            contractName: "RoyaltyEngine",
            eventName: "TreasuryPaid",
            amount: ethers.parseEther("25").toString(),
            to: treasury.target ? treasury.target.toLowerCase() : "0x3333",
            transactionHash: "0x4444",
        };

        const classifiedInflow = treasuryMonitor.classifyEvent(ethInflowEvent);
        expect(classifiedInflow.type).to.equal("INFLOW");
        expect(classifiedInflow.asset).to.equal("ETH");

        const classifiedOutflow = treasuryMonitor.classifyEvent(tokenOutflowEvent);
        expect(classifiedOutflow.type).to.equal("OUTFLOW");
        expect(classifiedOutflow.asset).to.equal("TOKEN");

        const classifiedRoyalty = treasuryMonitor.classifyEvent(royaltyPaidEvent);
        expect(classifiedRoyalty.type).to.equal("INFLOW");
        expect(classifiedRoyalty.source).to.equal("ROYALTY_ENGINE");
    });

    it("Should summarize overall treasury activity and calculate net volumes", function () {
        const events = [
            {
                contractName: "Treasury",
                eventName: "TokenDeposited",
                amount: ethers.parseEther("1000").toString(),
                from: user1.address.toLowerCase(),
                transactionHash: "0x1",
            },
            {
                contractName: "Treasury",
                eventName: "TokenWithdrawn",
                amount: ethers.parseEther("300").toString(),
                to: user2.address.toLowerCase(),
                transactionHash: "0x2",
            },
            {
                contractName: "Treasury",
                eventName: "ETHDeposited",
                amount: ethers.parseEther("4").toString(),
                from: user1.address.toLowerCase(),
                transactionHash: "0x3",
            },
        ];

        const summary = treasuryMonitor.summarizeActivity(events);

        expect(summary.inflowsCount).to.equal(2);
        expect(summary.outflowsCount).to.equal(1);
        expect(summary.tokenInflow.formatted).to.equal("1000.0");
        expect(summary.tokenOutflow.formatted).to.equal("300.0");
        expect(summary.ethInflow.formatted).to.equal("4.0");
        expect(summary.ethOutflow.formatted).to.equal("0.0");
    });
});
