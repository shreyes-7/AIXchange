import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import mongoose from "mongoose";
import env from "../src/config/env.js";
import provenanceBlockchainService from "../src/services/provenanceBlockchain.service.js";
import * as provenanceRepository from "../src/repositories/provenance.repository.js";
import provenanceService from "../src/services/provenance.service.js";
import Provenance from "../src/models/provenance.model.js";

test("E2E Provenance Integration Flow: Blockchain -> Indexer/Sync -> Verification -> DAG & Timeline", async (t) => {
    // 1. Connect to MongoDB and Hardhat RPC Provider
    const mongoUri = env.MONGODB_URI || "mongodb://localhost:27017/aixchange";
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }

    const rpcUrl = env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    assert.equal(Number(network.chainId), 31337, "Must connect to local Hardhat node (chainId 31337)");

    // Hardhat Account #0 is deployer and owner of Model 1
    const userPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const userSigner = new ethers.Wallet(userPrivateKey, provider);
    const userAddress = await userSigner.getAddress();

    const testExecutionId = `exec-e2e-${Date.now()}`;
    const testDatasetId = 1;
    const testModelId = 1;
    const testModelVersion = 1;
    const testMetadataHash = ethers.keccak256(ethers.toUtf8Bytes(`e2e_metadata_${Date.now()}`));

    // Clean up any previous test record with this execution ID
    await Provenance.deleteMany({ executionId: testExecutionId });

    // Step 1: Prepare registration tx via backend service (Zero-custody signing)
    const prep = await provenanceBlockchainService.prepareRegister(
        testDatasetId,
        testModelId,
        testModelVersion,
        testExecutionId,
        testMetadataHash,
        userAddress
    );

    assert.ok(prep.to, "Target contract address must be defined");
    assert.ok(prep.data.startsWith("0x"), "Calldata must be a valid hex string");
    assert.equal(prep.from.toLowerCase(), userAddress.toLowerCase());

    // Step 2: Client signs and broadcasts tx to blockchain
    const txResponse = await userSigner.sendTransaction({
        to: prep.to,
        data: prep.data,
        gasLimit: 500000n
    });
    assert.ok(txResponse.hash, "Transaction hash must exist");

    // Wait for mining
    const receipt = await txResponse.wait(1);
    assert.equal(receipt.status, 1, "Transaction must succeed on-chain");

    // Step 3: Backend confirms receipt and extracts canonical on-chain provenance record
    const confirmResult = await provenanceBlockchainService.confirmTransaction(
        txResponse.hash,
        { operation: "register" },
        userAddress
    );
    assert.equal(confirmResult.state, "CONFIRMED");
    const onChainProvId = confirmResult.provenanceId;
    assert.ok(onChainProvId > 0, "On-chain provenance ID must be assigned");

    // Step 4: Synchronize transaction into MongoDB projection
    const syncRes = await provenanceService.sync(
        { wallet: { address: userAddress, verified: true } },
        { txHash: txResponse.hash, operation: "register" }
    );
    assert.ok(syncRes, "Sync result must be returned");
    assert.equal(syncRes.provenanceId, onChainProvId);
    const syncDoc = syncRes.provenance;
    assert.equal(syncDoc.provenanceId, onChainProvId);
    assert.equal(syncDoc.executionId, testExecutionId);
    assert.equal(syncDoc.registrant.toLowerCase(), userAddress.toLowerCase());
    assert.equal(syncDoc.datasetId, testDatasetId);
    assert.equal(syncDoc.modelId, testModelId);
    assert.equal(syncDoc.modelVersion, testModelVersion);

    // Step 5: Verify Idempotency - syncing the exact same event must not duplicate MongoDB document
    const syncRes2 = await provenanceService.sync(
        { wallet: { address: userAddress, verified: true } },
        { txHash: txResponse.hash, operation: "register" }
    );
    assert.equal(syncRes2.provenance._id.toString(), syncDoc._id.toString(), "Sync must be idempotent on composite event identity");

    const totalMatching = await Provenance.countDocuments({ executionId: testExecutionId });
    assert.equal(totalMatching, 1, "There must be exactly 1 record for this unique lineage");

    // Step 6: Test separation of MongoDB _id and on-chain provenanceId
    const fetchedByProvId = await provenanceService.getByProvenanceId(onChainProvId);
    assert.equal(fetchedByProvId.provenanceId, onChainProvId);

    const fetchedByMongoId = await provenanceService.getByMongoId(syncDoc._id.toString());
    assert.equal(fetchedByMongoId.provenanceId, onChainProvId);

    // Step 7: On-chain Verification (Positive verification)
    const verification = await provenanceService.verify(onChainProvId);
    assert.equal(verification.verified_on_chain, true, "On-chain verification should succeed");
    assert.equal(verification.onChainRecord.provenanceId, onChainProvId);

    // Step 8: On-chain Hash Verification
    const hashCheck = await provenanceService.verifyHash(onChainProvId, testMetadataHash);
    assert.equal(hashCheck.verified_on_chain, true, "Valid hash should match on-chain record");

    // Step 9: Tampered Hash Verification (Negative verification)
    const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("completely_fabricated_content"));
    const tamperedCheck = await provenanceService.verifyHash(onChainProvId, tamperedHash);
    assert.equal(tamperedCheck.verified_on_chain, false, "Tampered hash must be rejected on-chain");

    // Step 10: DAG Lineage Graph and Timeline for Model
    const graph = await provenanceService.getGraph(testModelId);
    assert.ok(graph.nodes.length >= 3, "DAG must contain at least dataset, execution, and model nodes");
    assert.ok(graph.edges.length >= 2, "DAG must contain at least input and output edges");

    const timeline = await provenanceService.getTimeline(testModelId);
    assert.ok(timeline.events.length >= 1, "Timeline must contain at least the registration event");
    assert.ok(timeline.events.some(e => e.eventType === "PROVENANCE_REGISTERED"));

    // Step 11: Status Update (Deactivation)
    const prepStatus = await provenanceBlockchainService.prepareSetStatus(
        onChainProvId,
        false,
        userAddress
    );
    const statusTx = await userSigner.sendTransaction({
        to: prepStatus.to,
        data: prepStatus.data,
        gasLimit: 300000n
    });
    await statusTx.wait(1);

    // Update MongoDB status
    const updatedRecord = await provenanceRepository.updateStatus(onChainProvId, false);
    assert.equal(updatedRecord.active, false, "Active state should now be false");

    // Verify on-chain status reflects deactivation
    const onChainActive = await provenanceBlockchainService.isProvenanceActive(onChainProvId);
    assert.equal(onChainActive, false, "Contract must report provenance as inactive");

    // Clean up test document
    await Provenance.deleteMany({ executionId: testExecutionId });
    await mongoose.connection.close();
});
