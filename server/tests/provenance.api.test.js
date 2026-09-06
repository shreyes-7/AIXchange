import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import provenanceService from "../src/services/provenance.service.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/jwt.js";

test("Provenance Engine HTTP API routes, authentication, validation, and responses", async (t) => {
    let server;
    let baseUrl;

    const dummyUser = {
        _id: "66d9c79f9435b801a21e4567",
        email: "provenanceuser@aixchange.io",
        role: "user",
        wallet: {
            address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            verified: true,
            linkedAt: new Date(),
        },
    };

    const dummyToken = generateAccessToken({ userId: dummyUser._id });

    // Save originals
    const originalUserFindById = User.findById;
    const originalCreate = provenanceService.create;
    const originalSync = provenanceService.sync;
    const originalGetByProvId = provenanceService.getByProvenanceId;
    const originalGetByMongoId = provenanceService.getByMongoId;
    const originalGetByDataset = provenanceService.getByDataset;
    const originalGetByExecution = provenanceService.getByExecution;
    const originalGetByModel = provenanceService.getByModel;
    const originalGetByModelVersion = provenanceService.getByModelVersion;
    const originalGetGraph = provenanceService.getGraph;
    const originalGetTimeline = provenanceService.getTimeline;
    const originalVerify = provenanceService.verify;
    const originalVerifyHash = provenanceService.verifyHash;
    const originalSetStatus = provenanceService.setStatus;

    // Mock User.findById
    User.findById = (id) => Promise.resolve(String(id) === String(dummyUser._id) ? dummyUser : null);

    // Mock service layer
    provenanceService.create = async (user, input) => ({
        state: "PREPARED",
        operation: "register",
        transaction: {
            to: "0x0165878a594ca255338adfa4d48449f69242eb8f",
            data: "0x123456",
        },
        provenance: input,
    });

    provenanceService.sync = async (user, input) => ({
        state: "CONFIRMED",
        provenanceId: 1,
        provenance: {
            provenanceId: 1,
            datasetId: 1,
            modelId: 1,
            modelVersion: 1,
            executionId: "exec_123",
            metadataHash: "0x" + "a".repeat(64),
            active: true,
        },
    });

    provenanceService.getByProvenanceId = async (id) => ({
        provenanceId: Number(id),
        datasetId: 1,
        modelId: 1,
        modelVersion: 1,
        executionId: "exec_123",
        metadataHash: "0x" + "a".repeat(64),
        active: true,
    });

    provenanceService.getByMongoId = async (id) => ({
        _id: id,
        provenanceId: 1,
        datasetId: 1,
        modelId: 1,
        modelVersion: 1,
        executionId: "exec_123",
        metadataHash: "0x" + "a".repeat(64),
        active: true,
    });

    provenanceService.getByDataset = async (datasetId, query) => ({
        records: [
            {
                provenanceId: 1,
                datasetId: Number(datasetId),
                modelId: 1,
                modelVersion: 1,
                executionId: "exec_123",
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    provenanceService.getByExecution = async (executionId, query) => ({
        records: [
            {
                provenanceId: 1,
                datasetId: 1,
                executionId: String(executionId),
                modelId: 1,
                modelVersion: 1,
            },
            {
                provenanceId: 2,
                datasetId: 2,
                executionId: String(executionId),
                modelId: 1,
                modelVersion: 1,
            },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });

    provenanceService.getByModel = async (modelId, query) => ({
        records: [
            {
                provenanceId: 1,
                modelId: Number(modelId),
                modelVersion: 1,
                datasetId: 1,
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    provenanceService.getByModelVersion = async (modelId, version, query) => ({
        records: [
            {
                provenanceId: 1,
                modelId: Number(modelId),
                modelVersion: Number(version),
                datasetId: 1,
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    provenanceService.getGraph = async (modelId) => ({
        modelId: Number(modelId),
        nodes: [
            { id: "dataset:1", type: "dataset", entityId: "1", label: "Dataset #1" },
            { id: "execution:exec_123", type: "execution", entityId: "exec_123", label: "Execution exec_123" },
            { id: `model:${modelId}`, type: "model", entityId: String(modelId), label: `Model #${modelId}` },
            { id: `model_version:${modelId}:1`, type: "model_version", entityId: `${modelId}:1`, version: 1, label: `Model #${modelId} v1` },
        ],
        edges: [
            { source: "dataset:1", target: "execution:exec_123", type: "USED_IN" },
            { source: "execution:exec_123", target: `model_version:${modelId}:1`, type: "PRODUCED" },
            { source: `model:${modelId}`, target: `model_version:${modelId}:1`, type: "HAS_VERSION" },
        ],
    });

    provenanceService.getTimeline = async (modelId) => ({
        modelId: Number(modelId),
        totalEvents: 1,
        events: [
            {
                timestamp: new Date().toISOString(),
                source: "blockchain_provenance",
                eventType: "PROVENANCE_REGISTERED",
                provenanceId: 1,
                datasetId: 1,
                modelId: Number(modelId),
                modelVersion: 1,
                executionId: "exec_123",
                active: true,
            },
        ],
    });

    provenanceService.verify = async (id, params) => ({
        provenanceId: Number(id),
        verified_on_chain: true,
        indexed: true,
        source: "blockchain",
    });

    provenanceService.verifyHash = async (id, hash) => ({
        provenanceId: Number(id),
        metadataHash: hash,
        verified_on_chain: true,
        source: "blockchain",
    });

    provenanceService.setStatus = async (user, id, active) => ({
        state: "PREPARED",
        operation: "setStatus",
        provenanceId: Number(id),
        active,
        transaction: {
            to: "0x0165878a594ca255338adfa4d48449f69242eb8f",
            data: "0x7890",
        },
    });

    await new Promise((resolve) => {
        server = app.listen(0, () => {
            baseUrl = `http://127.0.0.1:${server.address().port}`;
            resolve();
        });
    });

    t.after(() => {
        server.close();
        User.findById = originalUserFindById;
        provenanceService.create = originalCreate;
        provenanceService.sync = originalSync;
        provenanceService.getByProvenanceId = originalGetByProvId;
        provenanceService.getByMongoId = originalGetByMongoId;
        provenanceService.getByDataset = originalGetByDataset;
        provenanceService.getByExecution = originalGetByExecution;
        provenanceService.getByModel = originalGetByModel;
        provenanceService.getByModelVersion = originalGetByModelVersion;
        provenanceService.getGraph = originalGetGraph;
        provenanceService.getTimeline = originalGetTimeline;
        provenanceService.verify = originalVerify;
        provenanceService.verifyHash = originalVerifyHash;
        provenanceService.setStatus = originalSetStatus;
    });

    // 1. POST /api/v1/provenance (Requires Auth)
    const unauthPost = await fetch(`${baseUrl}/api/v1/provenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            datasetId: 1,
            modelId: 1,
            modelVersion: 1,
            executionId: "exec_123",
            metadataHash: "0x" + "a".repeat(64),
        }),
    });
    assert.equal(unauthPost.status, 401);

    const authPost = await fetch(`${baseUrl}/api/v1/provenance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dummyToken}`,
        },
        body: JSON.stringify({
            datasetId: 1,
            modelId: 1,
            modelVersion: 1,
            executionId: "exec_123",
            metadataHash: "0x" + "a".repeat(64),
        }),
    });
    assert.equal(authPost.status, 202);
    const authPostData = await authPost.json();
    assert.equal(authPostData.success, true);
    assert.equal(authPostData.data.state, "PREPARED");

    // 2. POST /api/v1/provenance/sync
    const syncRes = await fetch(`${baseUrl}/api/v1/provenance/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dummyToken}`,
        },
        body: JSON.stringify({
            txHash: "0x" + "b".repeat(64),
            operation: "register",
        }),
    });
    assert.equal(syncRes.status, 200);
    const syncData = await syncRes.json();
    assert.equal(syncData.data.state, "CONFIRMED");

    // 3. GET /api/v1/provenance/:id
    const getRes = await fetch(`${baseUrl}/api/v1/provenance/1`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.data.provenanceId, 1);

    // 4. GET /api/v1/provenance/dataset/:datasetId
    const datasetRes = await fetch(`${baseUrl}/api/v1/provenance/dataset/1?limit=10`);
    assert.equal(datasetRes.status, 200);
    const datasetData = await datasetRes.json();
    assert.equal(datasetData.data.records.length, 1);

    // 5. GET /api/v1/provenance/execution/:executionId (Multi-dataset test)
    const execRes = await fetch(`${baseUrl}/api/v1/provenance/execution/exec_123`);
    assert.equal(execRes.status, 200);
    const execData = await execRes.json();
    assert.equal(execData.data.records.length, 2, "Must preserve multi-dataset records");

    // 6. GET /api/v1/provenance/model/:modelId
    const modelRes = await fetch(`${baseUrl}/api/v1/provenance/model/1`);
    assert.equal(modelRes.status, 200);
    const modelData = await modelRes.json();
    assert.equal(modelData.data.records.length, 1);

    // 7. GET /api/v1/provenance/model/:modelId/version/:version
    const verRes = await fetch(`${baseUrl}/api/v1/provenance/model/1/version/1`);
    assert.equal(verRes.status, 200);
    const verData = await verRes.json();
    assert.equal(verData.data.records[0].modelVersion, 1);

    // 8. GET /api/v1/provenance/graph/:modelId
    const graphRes = await fetch(`${baseUrl}/api/v1/provenance/graph/1`);
    assert.equal(graphRes.status, 200);
    const graphData = await graphRes.json();
    assert.ok(graphData.data.nodes.length >= 4);
    assert.ok(graphData.data.edges.length >= 3);

    // 9. GET /api/v1/provenance/timeline/:modelId
    const timelineRes = await fetch(`${baseUrl}/api/v1/provenance/timeline/1`);
    assert.equal(timelineRes.status, 200);
    const timelineData = await timelineRes.json();
    assert.equal(timelineData.data.events.length, 1);

    // 10. POST & GET /api/v1/provenance/:id/verify
    const verifyPost = await fetch(`${baseUrl}/api/v1/provenance/1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: 1 }),
    });
    assert.equal(verifyPost.status, 200);
    const verifyPostData = await verifyPost.json();
    assert.equal(verifyPostData.data.verified_on_chain, true);

    const verifyGet = await fetch(`${baseUrl}/api/v1/provenance/1/verify`);
    assert.equal(verifyGet.status, 200);
    const verifyGetData = await verifyGet.json();
    assert.equal(verifyGetData.data.verified_on_chain, true);

    // 11. POST /api/v1/provenance/:id/verify-hash
    const hashRes = await fetch(`${baseUrl}/api/v1/provenance/1/verify-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadataHash: "0x" + "a".repeat(64) }),
    });
    assert.equal(hashRes.status, 200);
    const hashData = await hashRes.json();
    assert.equal(hashData.data.verified_on_chain, true);

    // 12. POST /api/v1/provenance/:id/status (Requires Auth)
    const statusRes = await fetch(`${baseUrl}/api/v1/provenance/1/status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dummyToken}`,
        },
        body: JSON.stringify({ active: false }),
    });
    assert.equal(statusRes.status, 202);

    // 13. Validation errors
    const badHashRes = await fetch(`${baseUrl}/api/v1/provenance/1/verify-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadataHash: "0xinvalid" }),
    });
    assert.equal(badHashRes.status, 400);
});
