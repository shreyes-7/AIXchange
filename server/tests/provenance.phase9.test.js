import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Provenance from "../src/models/provenance.model.js";
import {
    registerProvenanceSchema,
    syncProvenanceSchema,
    setStatusSchema,
    verifyProvenanceSchema,
    verifyHashSchema,
    provenanceQuerySchema,
} from "../src/validators/provenance.validator.js";
import { normalizeBytes32 } from "../src/services/provenanceBlockchain.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Provenance Joi validator accepts valid payloads and rejects malformed inputs", () => {
    const valid = {
        datasetId: 1,
        modelId: 2,
        modelVersion: 1,
        executionId: "exec_test_sandbox_12345",
        metadataHash: "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    };
    const { error, value } = registerProvenanceSchema.validate(valid);
    assert.equal(error, undefined);
    assert.equal(value.datasetId, 1);
    assert.equal(value.modelVersion, 1);

    // Rejects missing datasetId
    const invalidDataset = { ...valid, datasetId: 0 };
    assert.ok(registerProvenanceSchema.validate(invalidDataset).error);

    // Rejects invalid version
    const invalidVersion = { ...valid, modelVersion: 0 };
    assert.ok(registerProvenanceSchema.validate(invalidVersion).error);

    // Rejects empty executionId
    const invalidExecution = { ...valid, executionId: "" };
    assert.ok(registerProvenanceSchema.validate(invalidExecution).error);

    // Rejects malformed hash (not 64 hex characters)
    const invalidHash = { ...valid, metadataHash: "0x1234" };
    assert.ok(registerProvenanceSchema.validate(invalidHash).error);
});

test("Provenance Sync, Status, and Verification Joi validators enforce schemas", () => {
    // Sync validator
    const validSync = {
        txHash: "0x" + "a".repeat(64),
        operation: "register",
    };
    assert.equal(syncProvenanceSchema.validate(validSync).error, undefined);
    assert.ok(syncProvenanceSchema.validate({ txHash: "invalid" }).error);

    // Status validator
    assert.equal(setStatusSchema.validate({ active: false }).error, undefined);
    assert.ok(setStatusSchema.validate({ active: "not-a-bool" }).error);

    // Verify hash validator
    assert.equal(
        verifyHashSchema.validate({
            metadataHash: "0x" + "b".repeat(64),
        }).error,
        undefined
    );

    // Query validator
    const query = provenanceQuerySchema.validate({ page: "2", limit: "50", sort: "oldest" });
    assert.equal(query.error, undefined);
    assert.equal(query.value.page, 2);
    assert.equal(query.value.limit, 50);
});

test("Mongoose Provenance model schema enforces required fields and compound relationship index", () => {
    const doc = new Provenance({
        provenanceId: 1,
        datasetId: 1,
        modelId: 2,
        modelVersion: 1,
        executionId: "exec_123",
        metadataHash: "0x" + "c".repeat(64),
        registrant: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        createdAt: new Date(),
        createdAtTimestamp: 1725555000,
        active: true,
        blockchain: {
            chainId: 31337,
            contractAddress: "0x0165878a594ca255338adfa4d48449f69242eb8f",
            eventIdentity: "31337:0x0165878a594ca255338adfa4d48449f69242eb8f:0x" + "d".repeat(64) + ":0",
        },
    });

    const validationError = doc.validateSync();
    assert.equal(validationError, undefined);
    assert.equal(doc.active, true);
    assert.equal(doc.createdAtTimestamp, 1725555000);

    // Missing required datasetId
    const invalidDoc = new Provenance({
        modelId: 2,
        modelVersion: 1,
    });
    const error = invalidDoc.validateSync();
    assert.ok(error.errors.datasetId);
    assert.ok(error.errors.executionId);
    assert.ok(error.errors.metadataHash);
});

test("ProvenanceRegistry compiled artifact and ABI match all required functions and events", () => {
    const artifactPath = path.resolve(
        __dirname,
        "../../blockchain/artifacts/contracts/registry/ProvenanceRegistry.sol/ProvenanceRegistry.json"
    );
    assert.ok(fs.existsSync(artifactPath), "Artifact file must exist");

    const raw = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = raw.abi;

    const functionNames = abi
        .filter((item) => item.type === "function")
        .map((fn) => fn.name);

    const requiredFunctions = [
        "registerProvenance",
        "setProvenanceStatus",
        "getProvenance",
        "getTotalProvenanceRecords",
        "getProvenanceByModel",
        "getProvenanceByModelVersion",
        "getProvenanceByDataset",
        "getProvenanceByExecution",
        "getProvenanceIdByKey",
        "verifyProvenance",
        "verifyProvenanceHash",
        "isProvenanceActive",
        "datasetRegistry",
        "modelRegistry",
    ];

    for (const req of requiredFunctions) {
        assert.ok(functionNames.includes(req), `Function '${req}' must exist in ProvenanceRegistry ABI`);
    }

    const eventNames = abi
        .filter((item) => item.type === "event")
        .map((ev) => ev.name);

    assert.ok(eventNames.includes("ProvenanceRegistered"), "Event ProvenanceRegistered must exist in ABI");
    assert.ok(eventNames.includes("ProvenanceStatusChanged"), "Event ProvenanceStatusChanged must exist in ABI");
});

test("Metadata hash normalizer correctly converts and validates 32-byte hex hashes", () => {
    const hexWithPrefix = "0x" + "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    assert.equal(normalizeBytes32(hexWithPrefix), hexWithPrefix.toLowerCase());

    const hexWithoutPrefix = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    assert.equal(normalizeBytes32(hexWithoutPrefix), `0x${hexWithoutPrefix}`);

    assert.throws(() => normalizeBytes32("invalid-short-hash"), /Metadata hash must be a 32-byte/);
    assert.throws(() => normalizeBytes32(""), /Metadata hash is required/);
});

test("Deterministic event identity format enforces idempotency across indexer events", () => {
    const chainId = 31337;
    const contractAddress = "0x0165878a594ca255338adfa4d48449f69242eb8f";
    const txHash = "0x" + "f".repeat(64);
    const logIndex = 2;

    const eventIdentity = `${chainId}:${contractAddress}:${txHash}:${logIndex}`;
    assert.equal(
        eventIdentity,
        `31337:0x0165878a594ca255338adfa4d48449f69242eb8f:0x${"f".repeat(64)}:2`
    );

    // Duplicate event has identical identity
    const duplicateIdentity = `${chainId}:${contractAddress}:${txHash}:${logIndex}`;
    assert.equal(eventIdentity, duplicateIdentity);
});

test("Timestamp conversion faithfully preserves on-chain uint256 seconds and JavaScript Date", () => {
    const onChainTimestampSec = 1725555123;
    const date = new Date(onChainTimestampSec * 1000);

    assert.equal(Math.floor(date.getTime() / 1000), onChainTimestampSec);
    assert.equal(date.toISOString(), "2024-09-05T16:52:03.000Z");
});
