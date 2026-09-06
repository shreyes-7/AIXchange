import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import env from "../src/config/env.js";
import royaltyBlockchainService from "../src/services/royaltyBlockchain.service.js";
import * as royaltyRepository from "../src/repositories/royalty.repository.js";
import royaltyService from "../src/services/royalty.service.js";
import royaltyEventIndexer from "../src/jobs/royalty-event-indexer.js";
import RoyaltyDistribution from "../src/models/royalty-distribution.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Task Group O & T: E2E Royalty Integration Flow: Blockchain -> Indexer -> MongoDB -> REST API -> Reconciliation", async (t) => {
    const rpcUrl = env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    let network;
    try {
        network = await provider.getNetwork();
    } catch {
        t.skip("Local Hardhat RPC node (http://127.0.0.1:8545) is not reachable. Skipping E2E test.");
        return;
    }

    assert.equal(Number(network.chainId), 31337, "Must connect to local Hardhat node (chainId 31337)");

    // Connect to MongoDB if not connected
    const mongoUri = env.MONGODB_URI || "mongodb://localhost:27017/aixchange";
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }

    // Signer #0 is the local Hardhat deployer
    const deployerKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(deployerKey, provider);
    const signerAddress = await signer.getAddress();

    // Verify or deploy RoyaltyEngine on local node if needed
    let royaltyAddress = env.ROYALTY_ENGINE_ADDRESS;
    let aixTokenAddress = env.AIX_TOKEN_ADDRESS;
    let treasuryAddress = env.TREASURY_ADDRESS;

    const artifactPath = path.resolve(
        __dirname,
        "../../blockchain/artifacts/contracts/royalty/RoyaltyEngine.sol/RoyaltyEngine.json"
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const aixArtifactPath = path.resolve(
        __dirname,
        "../../blockchain/artifacts/contracts/tokens/AIXToken.sol/AIXToken.json"
    );
    const aixArtifact = JSON.parse(fs.readFileSync(aixArtifactPath, "utf8"));

    const treasuryArtifactPath = path.resolve(
        __dirname,
        "../../blockchain/artifacts/contracts/governance/Treasury.sol/Treasury.json"
    );
    const treasuryArtifact = JSON.parse(fs.readFileSync(treasuryArtifactPath, "utf8"));

    // Check code at royaltyAddress
    let code = royaltyAddress ? await provider.getCode(royaltyAddress) : "0x";
    if (!royaltyAddress || code === "0x") {
        console.log("RoyaltyEngine not deployed on node. Deploying local test instance...");

        // Deploy AIXToken if needed
        let aixCode = aixTokenAddress ? await provider.getCode(aixTokenAddress) : "0x";
        if (!aixTokenAddress || aixCode === "0x") {
            const AIXFactory = new ethers.ContractFactory(aixArtifact.abi, aixArtifact.bytecode, signer);
            const aix = await AIXFactory.deploy(ethers.parseEther("1000000"), signerAddress);
            await aix.waitForDeployment();
            aixTokenAddress = await aix.getAddress();
        }

        // Deploy Treasury if needed
        let treasCode = treasuryAddress ? await provider.getCode(treasuryAddress) : "0x";
        if (!treasuryAddress || treasCode === "0x") {
            const TreasFactory = new ethers.ContractFactory(treasuryArtifact.abi, treasuryArtifact.bytecode, signer);
            const treas = await TreasFactory.deploy(signerAddress);
            await treas.waitForDeployment();
            treasuryAddress = await treas.getAddress();
        }

        // Deploy RoyaltyEngine
        const RoyaltyFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
        const engine = await RoyaltyFactory.deploy(
            aixTokenAddress,
            treasuryAddress,
            ethers.ZeroAddress,
            250, // 2.50%
            signerAddress
        );
        await engine.waitForDeployment();
        royaltyAddress = await engine.getAddress();
        process.env.ROYALTY_ENGINE_ADDRESS = royaltyAddress;
    }

    const royaltyContract = new ethers.Contract(royaltyAddress, artifact.abi, signer);
    const aixContract = new ethers.Contract(aixTokenAddress, aixArtifact.abi, signer);

    // Step 1: Zero-custody calldata preparation
    const recipient1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const recipient2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    const shares = [
        { recipient: recipient1, shareBps: 6000 },
        { recipient: recipient2, shareBps: 3750 },
    ];
    const revenueAmount = ethers.parseEther("1000"); // 1000 AIX

    const prep = await royaltyBlockchainService.prepareDistributeRoyalty(
        "DIRECT",
        "0", // sourceId 0 for direct
        revenueAmount.toString(),
        shares,
        signerAddress
    );

    assert.equal(prep.to.toLowerCase(), royaltyAddress.toLowerCase());
    assert.ok(prep.data.startsWith("0x"));

    // Approve token spending to RoyaltyEngine
    let nonce = await provider.getTransactionCount(signerAddress, "pending");
    const approveTx = await aixContract.approve(royaltyAddress, revenueAmount, { nonce: nonce++ });
    await approveTx.wait(1);

    // Step 2: Client broadcasts transaction to blockchain
    const tx = await signer.sendTransaction({
        to: prep.to,
        data: prep.data,
        nonce: nonce++,
    });
    const receipt = await tx.wait(1);
    assert.equal(receipt.status, 1, "Distribution transaction must succeed");

    // Parse distributionId from events
    let distributionId;
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() === royaltyAddress.toLowerCase()) {
            try {
                const parsed = royaltyContract.interface.parseLog(log);
                if (parsed.name === "DistributionCreated") {
                    distributionId = parsed.args.distributionId.toString();
                }
            } catch {}
        }
    }
    assert.ok(distributionId, "DistributionCreated event must be emitted with distributionId");

    // Step 3: Run Indexer to index blockchain events into MongoDB
    await royaltyEventIndexer.runOnce();

    // Step 4: Verify MongoDB document projection
    const doc = await royaltyRepository.findByDistributionId(distributionId);
    assert.ok(doc, `Distribution #${distributionId} must exist in MongoDB`);
    assert.equal(doc.distributionId, distributionId);
    assert.equal(doc.totalRevenue, revenueAmount.toString());
    assert.equal(doc.sourceType, "DIRECT");
    assert.equal(doc.status, "DISTRIBUTED");
    assert.equal(doc.recipients.length, 2);
    assert.equal(doc.recipients[0].recipient, recipient1.toLowerCase());
    assert.equal(doc.recipients[0].amount, ethers.parseEther("600").toString());
    assert.equal(doc.recipients[1].recipient, recipient2.toLowerCase());
    assert.equal(doc.recipients[1].amount, ethers.parseEther("375").toString());
    assert.equal(doc.treasuryAmount, ethers.parseEther("25").toString());
    assert.equal(doc.reconciled, false, "reconciled must be false prior to reconciliation audit");

    // Step 5: Query REST API service layer
    const apiDist = await royaltyService.getByDistributionId(distributionId);
    assert.equal(apiDist.distributionId, distributionId);
    assert.equal(apiDist.totalRevenue, revenueAmount.toString());

    const apiAllocations = await royaltyService.getAllocations(distributionId);
    assert.equal(apiAllocations.recipients.length, 2);

    const recipientHistory = await royaltyService.getByRecipient(recipient1);
    assert.ok(recipientHistory.records.length >= 1);

    const summary = await royaltyService.getSummary();
    assert.ok(BigInt(summary.totalRevenue) >= revenueAmount);

    // Step 6: Authoritative Reconciliation Audit
    const recResult = await royaltyService.reconcileDistribution(distributionId);
    assert.equal(recResult.reconciled, true, "Distribution must successfully reconcile against on-chain state");
    assert.equal(recResult.mismatches.length, 0);

    const reconciledDoc = await royaltyRepository.findByDistributionId(distributionId);
    assert.equal(reconciledDoc.reconciled, true, "reconciled must now be true after audit");

    // Step 7: Idempotency check: Run indexer again and verify no duplicate entries
    await royaltyEventIndexer.runOnce();
    const docAfterReplay = await royaltyRepository.findByDistributionId(distributionId);
    assert.equal(docAfterReplay.recipients.length, 2, "Replaying events must not duplicate recipient allocations");

    await mongoose.connection.close();
});
