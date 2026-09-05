import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import modelBlockchainService from "../src/services/modelBlockchain.service.js";
import env from "../src/config/env.js";

test("Live Blockchain Integration: Registration, Versioning, Status, and On-Chain Hash Verification", async (t) => {
    const rpcUrl = env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Ensure local node is alive
    const network = await provider.getNetwork();
    assert.equal(Number(network.chainId), 31337, "Must connect to local Hardhat node (chainId 31337)");

    // Use Hardhat Account #1 for model creator
    const creatorPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const creatorSigner = new ethers.Wallet(creatorPrivateKey, provider);
    const creatorAddress = await creatorSigner.getAddress();

    const uniqueModelName = `E2E-ResNet-${Date.now()}`;
    const initialMetadataURI = "ipfs://QmE2ETestCIDHash/metadata.json";
    const initialModelHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    // 1. Prepare registration calldata through backend service
    const preparedTx = await modelBlockchainService.prepareRegister(
        uniqueModelName,
        initialMetadataURI,
        initialModelHash,
        creatorAddress
    );

    assert.equal(preparedTx.from.toLowerCase(), creatorAddress.toLowerCase());
    assert.ok(preparedTx.to);
    assert.ok(preparedTx.data.startsWith("0x"));

    let currentNonce = await provider.getTransactionCount(creatorAddress, "pending");

    // 2. Broadcast transaction to local blockchain node
    const txResponse = await creatorSigner.sendTransaction({
        to: preparedTx.to,
        data: preparedTx.data,
        nonce: currentNonce++,
    });
    assert.ok(txResponse.hash);

    // 3. Confirm receipt on-chain
    const receipt = await txResponse.wait(1);
    assert.equal(receipt.status, 1, "Transaction must succeed on-chain");

    // 4. Verify receipt via backend modelBlockchainService
    const verification = await modelBlockchainService.confirmTransaction(
        txResponse.hash,
        { operation: "register" },
        creatorAddress
    );
    assert.equal(verification.state, "CONFIRMED");
    assert.ok(verification.modelId > 0, "Assigned model ID must be greater than 0");
    assert.equal(verification.event.args.owner.toLowerCase(), creatorAddress.toLowerCase());
    assert.equal(verification.event.args.name, uniqueModelName);
    assert.equal(verification.event.args.modelHash, initialModelHash);

    const onChainModelId = verification.modelId;

    // 5. Query live contract on-chain state
    const onChainModel = await modelBlockchainService.getModel(onChainModelId);
    assert.equal(onChainModel.name, uniqueModelName);
    assert.equal(onChainModel.owner.toLowerCase(), creatorAddress.toLowerCase());
    assert.equal(onChainModel.currentVersion, 1);
    assert.equal(onChainModel.active, true);

    const onChainV1 = await modelBlockchainService.getVersion(onChainModelId, 1);
    assert.equal(onChainV1.versionNumber, 1);
    assert.equal(onChainV1.modelHash, initialModelHash);
    assert.equal(onChainV1.metadataURI, initialMetadataURI);
    assert.equal(onChainV1.active, true);

    // 6. Verify cryptographic hash directly against contract
    const matchesTrue = await modelBlockchainService.verifyModelHash(
        onChainModelId,
        1,
        initialModelHash
    );
    assert.equal(matchesTrue, true, "Matching hash must verify as true on-chain");

    const matchesFalse = await modelBlockchainService.verifyModelHash(
        onChainModelId,
        1,
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
    assert.equal(matchesFalse, false, "Mismatching hash must verify as false on-chain");

    // 7. Add Version 2 on-chain
    const v2MetadataURI = "ipfs://QmV2TestCIDHash/metadata.json";
    const v2ModelHash = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

    const preparedV2 = await modelBlockchainService.prepareAddVersion(
        onChainModelId,
        v2MetadataURI,
        v2ModelHash,
        creatorAddress
    );

    const v2Tx = await creatorSigner.sendTransaction({
        to: preparedV2.to,
        data: preparedV2.data,
        nonce: currentNonce++,
    });
    const v2Receipt = await v2Tx.wait(1);
    assert.equal(v2Receipt.status, 1);

    const v2Verification = await modelBlockchainService.confirmTransaction(
        v2Tx.hash,
        { operation: "addVersion", modelId: onChainModelId },
        creatorAddress
    );
    assert.equal(v2Verification.state, "CONFIRMED");
    assert.equal(Number(v2Verification.event.args.versionNumber), 2);
    assert.equal(v2Verification.event.args.modelHash, v2ModelHash);

    // Verify version 2 on-chain state
    const onChainV2 = await modelBlockchainService.getVersion(onChainModelId, 2);
    assert.equal(onChainV2.versionNumber, 2);
    assert.equal(onChainV2.modelHash, v2ModelHash);

    // 8. Toggle active status on-chain
    const preparedStatus = await modelBlockchainService.prepareSetStatus(
        onChainModelId,
        false,
        creatorAddress
    );
    const statusTx = await creatorSigner.sendTransaction({
        to: preparedStatus.to,
        data: preparedStatus.data,
        nonce: currentNonce++,
    });
    const statusReceipt = await statusTx.wait(1);
    assert.equal(statusReceipt.status, 1);
    assert.equal(statusReceipt.status, 1);

    const statusVerification = await modelBlockchainService.confirmTransaction(
        statusTx.hash,
        { operation: "setStatus", modelId: onChainModelId },
        creatorAddress
    );
    assert.equal(statusVerification.state, "CONFIRMED");
    assert.equal(statusVerification.event.args.active, false);

    const isActive = await modelBlockchainService.isModelActive(onChainModelId);
    assert.equal(isActive, false, "Model must be deactivated on-chain");
});
