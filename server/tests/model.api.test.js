import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import modelService from "../src/services/model.service.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/jwt.js";

test("Model Marketplace HTTP API routes, authentication, validation, and responses", async (t) => {
    let server;
    let baseUrl;

    const dummyUser = {
        _id: "66d9c79f9435b801a21e4567",
        email: "modelcreator@aixchange.io",
        role: "user",
        wallet: {
            address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            verified: true,
            linkedAt: new Date(),
        },
    };

    const dummyToken = generateAccessToken({ userId: dummyUser._id });

    // Save original service & User methods
    const originalUserFindById = User.findById;
    const originalCreate = modelService.create;
    const originalSync = modelService.sync;
    const originalGet = modelService.get;
    const originalList = modelService.list;
    const originalSearch = modelService.search;
    const originalByOwner = modelService.byOwner;
    const originalUpdate = modelService.update;
    const originalGetVersions = modelService.getVersions;
    const originalGetVersion = modelService.getVersion;
    const originalAddVersion = modelService.addVersion;
    const originalSetStatus = modelService.setStatus;
    const originalTransferOwnership = modelService.transferOwnership;
    const originalVerifyHash = modelService.verifyHash;
    const originalInfer = modelService.infer;

    // Mock User.findById for auth middleware
    User.findById = (id) => Promise.resolve(String(id) === String(dummyUser._id) ? dummyUser : null);

    // Mock service layer
    modelService.list = async (query) => ({
        models: [
            {
                _id: "66d9c79f9435b801a21e0001",
                blockchainModelId: 1,
                name: "GPT-Sentiment",
                category: "nlp",
                currentVersion: 1,
                active: true,
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    modelService.search = async (query) => ({
        models: [
            {
                _id: "66d9c79f9435b801a21e0001",
                blockchainModelId: 1,
                name: "GPT-Sentiment",
                category: "nlp",
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    modelService.byOwner = async (address) => ({
        models: [
            {
                _id: "66d9c79f9435b801a21e0001",
                blockchainModelId: 1,
                ownerWallet: address.toLowerCase(),
            },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    modelService.get = async (id) => ({
        _id: "66d9c79f9435b801a21e0001",
        blockchainModelId: 1,
        name: "GPT-Sentiment",
        currentVersion: 1,
        active: true,
        onChainVerified: true,
    });

    modelService.create = async (user, input) => ({
        state: "PREPARED",
        operation: "register",
        transaction: { to: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707", data: "0x1234" },
        model: { name: input.name, category: input.category },
    });

    modelService.sync = async (user, input) => ({
        state: "CONFIRMED",
        model: { blockchainModelId: 1, name: "GPT-Sentiment" },
    });

    modelService.update = async (user, id, input) => ({
        _id: id,
        description: input.description,
    });

    modelService.getVersions = async (id) => ({
        modelId: 1,
        currentVersion: 1,
        totalVersions: 1,
        versions: [{ versionNumber: 1, modelHash: "hash-1" }],
    });

    modelService.getVersion = async (id, ver) => ({
        modelId: 1,
        version: { versionNumber: Number(ver), modelHash: "hash-1" },
    });

    modelService.addVersion = async (user, id, input) => ({
        state: "PREPARED",
        operation: "addVersion",
        modelId: 1,
        transaction: { to: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707", data: "0x5678" },
    });

    modelService.setStatus = async (user, id, active) => ({
        state: "PREPARED",
        operation: "setStatus",
        modelId: 1,
        active,
        transaction: { to: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707", data: "0x9abc" },
    });

    modelService.transferOwnership = async (user, id, newOwner) => ({
        state: "PREPARED",
        operation: "transferOwnership",
        modelId: 1,
        newOwner,
        transaction: { to: "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707", data: "0xdef0" },
    });

    modelService.verifyHash = async (id, input) => ({
        verified: true,
        match: true,
        source: "blockchain_authoritative",
        modelId: 1,
        versionNumber: input.versionNumber,
        computedHash: input.expectedHash,
        onChainHash: input.expectedHash,
    });

    modelService.infer = async (user, id, input) => ({
        modelId: 1,
        modelName: "GPT-Sentiment",
        version: 1,
        execution: {
            predictions: [1],
            confidence: 0.98,
            latency_ms: 12.5,
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
        modelService.create = originalCreate;
        modelService.sync = originalSync;
        modelService.get = originalGet;
        modelService.list = originalList;
        modelService.search = originalSearch;
        modelService.byOwner = originalByOwner;
        modelService.update = originalUpdate;
        modelService.getVersions = originalGetVersions;
        modelService.getVersion = originalGetVersion;
        modelService.addVersion = originalAddVersion;
        modelService.setStatus = originalSetStatus;
        modelService.transferOwnership = originalTransferOwnership;
        modelService.verifyHash = originalVerifyHash;
        modelService.infer = originalInfer;
    });

    // 1. GET /api/v1/models (List)
    const listRes = await fetch(`${baseUrl}/api/v1/models?limit=10`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    assert.equal(listData.data.models.length, 1);

    // 2. GET /api/v1/models/search
    const searchRes = await fetch(`${baseUrl}/api/v1/models/search?search=sentiment`);
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.equal(searchData.success, true);

    // 3. GET /api/v1/models/owner/:address
    const ownerRes = await fetch(`${baseUrl}/api/v1/models/owner/${dummyUser.wallet.address}`);
    assert.equal(ownerRes.status, 200);
    const ownerData = await ownerRes.json();
    assert.equal(ownerData.success, true);

    // Invalid owner address -> 400
    const invalidOwnerRes = await fetch(`${baseUrl}/api/v1/models/owner/invalid-eth-address`);
    assert.equal(invalidOwnerRes.status, 400);

    // 4. GET /api/v1/models/:id
    const getRes = await fetch(`${baseUrl}/api/v1/models/1`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.data.onChainVerified, true);

    // 5. GET /api/v1/models/:id/versions
    const versRes = await fetch(`${baseUrl}/api/v1/models/1/versions`);
    assert.equal(versRes.status, 200);
    const versData = await versRes.json();
    assert.equal(versData.data.versions.length, 1);

    // 6. GET /api/v1/models/:id/versions/:version
    const verRes = await fetch(`${baseUrl}/api/v1/models/1/versions/1`);
    assert.equal(verRes.status, 200);

    // 7. POST /api/v1/models/:id/verify-hash
    const verifyRes = await fetch(`${baseUrl}/api/v1/models/1/verify-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            versionNumber: 1,
            expectedHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }),
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.data.verified, true);

    // 8. Auth tests: unauthenticated mutation requests must return 401
    const unauthPost = await fetch(`${baseUrl}/api/v1/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unauth" }),
    });
    assert.equal(unauthPost.status, 401);

    const unauthInfer = await fetch(`${baseUrl}/api/v1/models/1/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: [1, 2, 3] }),
    });
    assert.equal(unauthInfer.status, 401);

    // 9. Authenticated POST /api/v1/models
    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dummyToken}`,
    };

    const createRes = await fetch(`${baseUrl}/api/v1/models`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
            name: "BERT-Classifier",
            category: "nlp",
            metadataURI: "ipfs://testURI",
            modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }),
    });
    assert.equal(createRes.status, 202);
    const createData = await createRes.json();
    assert.equal(createData.data.state, "PREPARED");

    // 10. Authenticated POST /api/v1/models/sync
    const syncRes = await fetch(`${baseUrl}/api/v1/models/sync`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
            txHash: "0x" + "a".repeat(64),
            modelId: 1,
            operation: "register",
        }),
    });
    assert.equal(syncRes.status, 200);
    const syncData = await syncRes.json();
    assert.equal(syncData.data.state, "CONFIRMED");

    // 11. Authenticated PATCH /api/v1/models/:id
    const patchRes = await fetch(`${baseUrl}/api/v1/models/1`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ description: "Updated description text" }),
    });
    assert.equal(patchRes.status, 200);

    // 12. Authenticated POST /api/v1/models/:id/versions
    const addVerRes = await fetch(`${baseUrl}/api/v1/models/1/versions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
            metadataURI: "ipfs://newURI",
            modelHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            changelog: "New weights",
        }),
    });
    assert.equal(addVerRes.status, 202);

    // 13. Authenticated POST /api/v1/models/:id/status
    const statusRes = await fetch(`${baseUrl}/api/v1/models/1/status`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ active: false }),
    });
    assert.equal(statusRes.status, 202);

    // 14. Authenticated POST /api/v1/models/:id/transfer
    const transferRes = await fetch(`${baseUrl}/api/v1/models/1/transfer`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ newOwner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }),
    });
    assert.equal(transferRes.status, 202);

    // 15. Authenticated POST /api/v1/models/:id/infer
    const inferRes = await fetch(`${baseUrl}/api/v1/models/1/infer`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ inputs: [0.5, 1.2, -0.8] }),
    });
    assert.equal(inferRes.status, 200);
    const inferData = await inferRes.json();
    assert.equal(inferData.data.execution.confidence, 0.98);

    // 16. Validation error: malformed inference inputs
    const badInferRes = await fetch(`${baseUrl}/api/v1/models/1/infer`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ inputs: "not-an-array-or-tensor" }),
    });
    assert.equal(badInferRes.status, 400);
    const badInferData = await badInferRes.json();
    assert.equal(badInferData.success, false);
});
