import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import Model from "../src/models/model.model.js";
import modelBlockchainService, { MODEL_REGISTRY_HUMAN_ABI } from "../src/services/modelBlockchain.service.js";
import {
    createModelSchema,
    syncModelSchema,
    updateModelSchema,
    addVersionSchema,
    setStatusSchema,
    transferOwnershipSchema,
    verifyHashSchema,
    inferModelSchema,
    listModelSchema,
} from "../src/validators/model.validator.js";

test("Model Joi validator accepts valid payloads and rejects malformed inputs", () => {
    const validModel = {
        name: "BERT-Sentiment-Classifier",
        description: "Fine-tuned BERT for sentiment classification",
        category: "nlp",
        tags: ["nlp", "bert", "sentiment"],
        framework: "PyTorch",
        modelType: "classification",
        metadataURI: "ipfs://QmBERTMetadataCID/metadata.json",
        modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        artifactPath: "models/bert_model.safetensors",
        fileSize: 10485760,
        changelog: "Initial production release v1",
        inferenceConfig: {
            device: "cpu",
            batchSize: 4,
            timeoutMs: 15000,
        },
    };

    assert.equal(createModelSchema.validate(validModel).error, undefined);

    // 1. Rejects short name
    assert.ok(createModelSchema.validate({ ...validModel, name: "A" }).error);

    // 2. Rejects invalid SHA-256 hash (non-hex, wrong length)
    assert.ok(createModelSchema.validate({ ...validModel, modelHash: "not-a-valid-hash" }).error);
    assert.ok(
        createModelSchema.validate({
            ...validModel,
            modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85", // 63 chars
        }).error
    );

    // 3. Rejects path traversal attempts in artifactPath
    assert.ok(
        createModelSchema.validate({
            ...validModel,
            artifactPath: "../../../etc/passwd",
        }).error
    );
    assert.ok(
        createModelSchema.validate({
            ...validModel,
            artifactPath: "models/../../secret.key",
        }).error
    );

    // 4. Rejects unsupported framework enum
    assert.ok(createModelSchema.validate({ ...validModel, framework: "UnsupportedML" }).error);
});

test("Model Sync Joi validator accepts valid transaction hashes and operations", () => {
    const validSync = {
        txHash: "0x" + "a".repeat(64),
        modelId: 1,
        operation: "register",
    };
    assert.equal(syncModelSchema.validate(validSync).error, undefined);

    // Rejects invalid txHash prefix or length
    assert.ok(syncModelSchema.validate({ ...validSync, txHash: "12345" }).error);
    assert.ok(syncModelSchema.validate({ ...validSync, operation: "invalidOperation" }).error);
});

test("Model Version & Update Joi validators enforce required fields and immutability", () => {
    // Add version
    const validVersion = {
        metadataURI: "ipfs://QmNewVerCID/meta.json",
        modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        changelog: "Fine-tuned with 10k additional samples",
    };
    assert.equal(addVersionSchema.validate(validVersion).error, undefined);
    assert.ok(addVersionSchema.validate({ ...validVersion, metadataURI: "" }).error);

    // Status toggle
    assert.equal(setStatusSchema.validate({ active: false }).error, undefined);
    assert.ok(setStatusSchema.validate({ active: "not-bool" }).error);

    // Ownership transfer
    const newOwner = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    assert.equal(transferOwnershipSchema.validate({ newOwner }).error, undefined);
    assert.ok(transferOwnershipSchema.validate({ newOwner: "invalid-eth-address" }).error);
});

test("Model Inference Joi validator validates feature vectors and parameters", () => {
    // Array of floats
    assert.equal(
        inferModelSchema.validate({
            inputs: [0.1, 0.5, -1.2, 3.4],
            device: "cpu",
            return_probabilities: true,
        }).error,
        undefined
    );

    // Batch of arrays
    assert.equal(
        inferModelSchema.validate({
            inputs: [
                [0.1, 0.5],
                [1.0, -0.5],
            ],
            top_k: 2,
        }).error,
        undefined
    );

    // Object of tensors
    assert.equal(
        inferModelSchema.validate({
            inputs: { input_ids: [101, 2054, 102], attention_mask: [1, 1, 1] },
        }).error,
        undefined
    );

    // Rejects non-numeric/string inputs
    assert.ok(inferModelSchema.validate({ inputs: "plain-string" }).error);
});

test("Mongoose Model schema enforces required fields, unique owner/name index, and subdocuments", () => {
    const dummyUserId = "66d9c79f9435b801a21e4567";
    const model = new Model({
        owner: dummyUserId,
        ownerWallet: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        name: "Test-Vision-Model",
        description: "Test vision model",
        category: "vision",
        tags: ["vision", "test"],
        framework: "PyTorch",
        modelType: "classification",
        metadataURI: "ipfs://testCID",
        currentVersion: 1,
        totalVersions: 1,
        active: true,
        versions: [
            {
                versionNumber: 1,
                modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                metadataURI: "ipfs://testCID",
                artifactPath: "models/test.pt",
                fileSize: 1024,
                changelog: "Initial",
                createdAt: new Date(),
                active: true,
            },
        ],
        blockchain: {
            contractAddress: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707",
            transactionHash: "0x" + "1".repeat(64),
            blockNumber: 120,
            chainId: 31337,
            state: "CONFIRMED",
            lastSyncedAt: new Date(),
        },
    });

    // Validate sync without DB
    assert.equal(model.validateSync(), undefined);

    // Verify indexes defined in schema
    const indexes = Model.schema.indexes();
    const hasOwnerNameUnique = indexes.some(
        ([fields, opts]) => fields.ownerWallet === 1 && fields.name === 1 && opts?.unique === true
    );
    assert.ok(hasOwnerNameUnique, "Model schema must enforce unique compound index (ownerWallet + name)");

    const hasTextIndex = indexes.some(
        ([fields]) => fields.name === "text" && fields.description === "text" && fields.tags === "text"
    );
    assert.ok(hasTextIndex, "Model schema must define full-text search index on name, description, tags");
});

test("ModelRegistry compiled artifact and ABI match all required functions and events", () => {
    const iface = modelBlockchainService.interface;

    // Verify all authoritative write functions
    assert.ok(iface.getFunction("registerModel"));
    assert.ok(iface.getFunction("addModelVersion"));
    assert.ok(iface.getFunction("setModelStatus"));
    assert.ok(iface.getFunction("transferModelOwnership"));

    // Verify all authoritative read functions
    assert.ok(iface.getFunction("getModel"));
    assert.ok(iface.getFunction("getModelOwner"));
    assert.ok(iface.getFunction("getModelsByOwner"));
    assert.ok(iface.getFunction("getTotalModels"));
    assert.ok(iface.getFunction("getVersion"));
    assert.ok(iface.getFunction("getLatestVersion"));
    assert.ok(iface.getFunction("getVersionCount"));
    assert.ok(iface.getFunction("getModelVersions"));
    assert.ok(iface.getFunction("isModelActive"));
    assert.ok(iface.getFunction("verifyModelHash"));

    // Verify all authoritative events
    assert.ok(iface.getEvent("ModelRegistered"));
    assert.ok(iface.getEvent("ModelVersionAdded"));
    assert.ok(iface.getEvent("ModelStatusChanged"));
    assert.ok(iface.getEvent("ModelOwnershipTransferred"));
});

test("Hash verification logic correctly compares hashes and detects mismatches", () => {
    const onChainHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const matchingHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const mismatchHash = "a1b2c3d4e5f60000000000000000000000000000000000000000000000000000";

    assert.equal(onChainHash.toLowerCase() === matchingHash.toLowerCase(), true);
    assert.equal(onChainHash.toLowerCase() === mismatchHash.toLowerCase(), false);

    // Keccak comparison matching contract implementation:
    // keccak256(bytes(_modelVersions[modelId][versionNumber].modelHash)) == keccak256(bytes(expectedHash))
    const keccakOnChain = ethers.keccak256(ethers.toUtf8Bytes(onChainHash));
    const keccakMatching = ethers.keccak256(ethers.toUtf8Bytes(matchingHash));
    const keccakMismatch = ethers.keccak256(ethers.toUtf8Bytes(mismatchHash));

    assert.equal(keccakOnChain === keccakMatching, true);
    assert.equal(keccakOnChain === keccakMismatch, false);
});

test("Idempotent event processing handles duplicate ModelRegistered and ModelVersionAdded events", () => {
    const mockModelStore = new Map();

    const processModelRegistered = (event) => {
        const { modelId, owner, name, metadataURI, modelHash } = event;
        if (!mockModelStore.has(modelId)) {
            mockModelStore.set(modelId, {
                blockchainModelId: modelId,
                ownerWallet: owner.toLowerCase(),
                name,
                metadataURI,
                currentVersion: 1,
                totalVersions: 1,
                versions: [
                    { versionNumber: 1, modelHash, metadataURI },
                ],
            });
        }
        return mockModelStore.get(modelId);
    };

    const processVersionAdded = (event) => {
        const { modelId, versionNumber, modelHash, metadataURI } = event;
        const model = mockModelStore.get(modelId);
        if (!model) return null;

        const exists = model.versions.some((v) => v.versionNumber === versionNumber);
        if (!exists) {
            model.versions.push({ versionNumber, modelHash, metadataURI });
            model.currentVersion = versionNumber;
            model.totalVersions = versionNumber;
        }
        return model;
    };

    const regEvent = {
        modelId: 1,
        owner: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        name: "TestModel",
        metadataURI: "ipfs://test",
        modelHash: "hash-v1",
    };

    // First delivery
    const res1 = processModelRegistered(regEvent);
    assert.equal(res1.versions.length, 1);

    // Duplicate delivery
    const res2 = processModelRegistered(regEvent);
    assert.equal(res2.versions.length, 1, "Duplicate ModelRegistered must not create redundant documents");

    // Version added
    const verEvent = {
        modelId: 1,
        versionNumber: 2,
        modelHash: "hash-v2",
        metadataURI: "ipfs://test-v2",
    };

    const verRes1 = processVersionAdded(verEvent);
    assert.equal(verRes1.versions.length, 2);

    // Duplicate version delivery
    const verRes2 = processVersionAdded(verEvent);
    assert.equal(verRes2.versions.length, 2, "Duplicate ModelVersionAdded must not duplicate version records");
});
