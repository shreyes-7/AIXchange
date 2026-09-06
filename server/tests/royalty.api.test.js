import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import royaltyService from "../src/services/royalty.service.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/jwt.js";

test("Task Group I & J: Royalty Engine HTTP API routes, authentication, validation, and responses", async (t) => {
    let server;
    let baseUrl;

    const dummyUser = {
        _id: "66d9c79f9435b801a21e9999",
        email: "royaltytest@aixchange.io",
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
    const originalGetByDistId = royaltyService.getByDistributionId;
    const originalGetAllocations = royaltyService.getAllocations;
    const originalGetByRecipient = royaltyService.getByRecipient;
    const originalGetBySource = royaltyService.getBySource;
    const originalGetHistory = royaltyService.getHistory;
    const originalGetSummary = royaltyService.getSummary;
    const originalGetReports = royaltyService.getReports;
    const originalPreviewSplit = royaltyService.previewSplit;
    const originalPrepare = royaltyService.prepareDistribution;
    const originalSync = royaltyService.syncTransaction;
    const originalReconcile = royaltyService.reconcileDistribution;
    const originalReconcileAll = royaltyService.reconcileAll;

    // Mock User.findById
    User.findById = (id) => Promise.resolve(String(id) === String(dummyUser._id) ? dummyUser : null);

    // Mock service layer
    royaltyService.getByDistributionId = async (id) => {
        if (id === "999") {
            const err = new Error("Royalty distribution #999 not found.");
            err.statusCode = 404;
            throw err;
        }
        return {
            distributionId: String(id),
            sourceType: "PURCHASE",
            sourceId: "101",
            totalRevenue: "1000000000000000000000",
            treasuryAmount: "25000000000000000000",
            status: "DISTRIBUTED",
            reconciled: false,
        };
    };

    royaltyService.getAllocations = async (id) => ({
        distributionId: String(id),
        totalRevenue: "1000000000000000000000",
        treasuryAmount: "25000000000000000000",
        recipientCount: 1,
        recipients: [
            {
                recipient: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                shareBps: 6000,
                amount: "600000000000000000000",
                paid: true,
            },
        ],
    });

    royaltyService.getByRecipient = async (address, options) => ({
        recipient: address.toLowerCase(),
        records: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    royaltyService.getBySource = async (sourceType, sourceId) => ({
        sourceType,
        sourceId,
        distribution: { distributionId: "1", sourceType, sourceId },
    });

    royaltyService.getHistory = async (filters, options) => ({
        records: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    royaltyService.getSummary = async (filters) => ({
        totalRevenue: "1000000000000000000000",
        totalDistributed: "975000000000000000000",
        totalTreasury: "25000000000000000000",
        distributionCount: 1,
        uniqueRecipientsCount: 2,
    });

    royaltyService.getReports = async (options) => ({
        bySource: {
            PURCHASE: { count: 1, totalRevenue: "1000000000000000000000" },
        },
        byDate: [],
        topRecipients: [],
    });

    royaltyService.previewSplit = async (payload) => ({
        totalRevenue: payload.totalRevenue,
        treasuryFeeBps: payload.treasuryFeeBps || 250,
        treasuryAmount: "25000000000000000000",
        recipientAmounts: ["600000000000000000000"],
        remainder: "0",
        recipients: payload.recipients,
    });

    royaltyService.prepareDistribution = async (user, payload) => ({
        state: "PREPARED",
        operation: "distributeRoyalty",
        transaction: {
            to: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
            data: "0x123456",
            chainId: 31337,
        },
    });

    royaltyService.syncTransaction = async (user, payload) => ({
        state: "CONFIRMED",
        txHash: payload.txHash,
        blockNumber: 42,
        distributionId: "1",
    });

    royaltyService.reconcileDistribution = async (id) => ({
        distributionId: String(id),
        reconciled: true,
        mismatches: [],
    });

    royaltyService.reconcileAll = async (options) => ({
        audited: 1,
        reconciled: 1,
        discrepancies: 0,
        results: [],
    });

    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}/api/v1/royalties`;
            resolve();
        });
    });

    t.after(() => {
        // Restore originals
        User.findById = originalUserFindById;
        royaltyService.getByDistributionId = originalGetByDistId;
        royaltyService.getAllocations = originalGetAllocations;
        royaltyService.getByRecipient = originalGetByRecipient;
        royaltyService.getBySource = originalGetBySource;
        royaltyService.getHistory = originalGetHistory;
        royaltyService.getSummary = originalGetSummary;
        royaltyService.getReports = originalGetReports;
        royaltyService.previewSplit = originalPreviewSplit;
        royaltyService.prepareDistribution = originalPrepare;
        royaltyService.syncTransaction = originalSync;
        royaltyService.reconcileDistribution = originalReconcile;
        royaltyService.reconcileAll = originalReconcileAll;

        server.close();
    });

    // Test 1: GET /distributions/:distributionId
    await t.test("GET /distributions/:distributionId returns distribution record", async () => {
        const res = await fetch(`${baseUrl}/distributions/1`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.distributionId, "1");
        assert.equal(body.data.totalRevenue, "1000000000000000000000");
    });

    // Test 2: GET /distributions/:distributionId (Not Found)
    await t.test("GET /distributions/999 returns 404 for nonexistent distribution", async () => {
        const res = await fetch(`${baseUrl}/distributions/999`);
        assert.equal(res.status, 404);
        const body = await res.json();
        assert.equal(body.success, false);
    });

    // Test 3: GET /distributions/:distributionId/allocations
    await t.test("GET /distributions/:distributionId/allocations returns recipient allocations", async () => {
        const res = await fetch(`${baseUrl}/distributions/1/allocations`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.recipientCount, 1);
        assert.equal(body.data.recipients[0].amount, "600000000000000000000");
    });

    // Test 4: GET /recipients/:address (Valid vs Invalid)
    await t.test("GET /recipients/:address validates Ethereum address", async () => {
        const validAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const res = await fetch(`${baseUrl}/recipients/${validAddr}`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);

        // Invalid address returns 400
        const badRes = await fetch(`${baseUrl}/recipients/invalid-address`);
        assert.equal(badRes.status, 400);
    });

    // Test 5: GET /source/:sourceType/:sourceId
    await t.test("GET /source/:sourceType/:sourceId validates source type", async () => {
        const res = await fetch(`${baseUrl}/source/PURCHASE/101`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.sourceType, "PURCHASE");

        // Invalid source type returns 400
        const badRes = await fetch(`${baseUrl}/source/INVALID_SOURCE/101`);
        assert.equal(badRes.status, 400);
    });

    // Test 6: GET /history, /summary, /reports
    await t.test("GET /history, /summary, and /reports return aggregate data", async () => {
        const histRes = await fetch(`${baseUrl}/history?page=1&limit=10&status=DISTRIBUTED`);
        assert.equal(histRes.status, 200);

        const sumRes = await fetch(`${baseUrl}/summary`);
        assert.equal(sumRes.status, 200);
        const sumBody = await sumRes.json();
        assert.equal(sumBody.data.distributionCount, 1);

        const repRes = await fetch(`${baseUrl}/reports`);
        assert.equal(repRes.status, 200);
    });

    // Test 7: POST /calculate-split
    await t.test("POST /calculate-split validates input and returns preview calculation", async () => {
        const validPayload = {
            totalRevenue: "1000000000000000000000",
            treasuryFeeBps: 250,
            recipients: [
                { recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", shareBps: 6000 },
            ],
        };

        const res = await fetch(`${baseUrl}/calculate-split`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validPayload),
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.treasuryAmount, "25000000000000000000");

        // Invalid: missing recipients returns 400
        const badRes = await fetch(`${baseUrl}/calculate-split`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ totalRevenue: "100" }),
        });
        assert.equal(badRes.status, 400);
    });

    // Test 8: POST /prepare requires authentication
    await t.test("POST /prepare requires authentication (401 unauthorized)", async () => {
        const res = await fetch(`${baseUrl}/prepare`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                totalRevenue: "1000000000000000000000",
                recipients: [{ recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", shareBps: 5000 }],
            }),
        });
        assert.equal(res.status, 401);

        // With valid token
        const authRes = await fetch(`${baseUrl}/prepare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${dummyToken}`,
            },
            body: JSON.stringify({
                totalRevenue: "1000000000000000000000",
                recipients: [{ recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", shareBps: 5000 }],
            }),
        });
        assert.equal(authRes.status, 202);
        const authBody = await authRes.json();
        assert.equal(authBody.data.state, "PREPARED");
    });

    // Test 9: POST /sync requires authentication and valid txHash
    await t.test("POST /sync verifies transaction receipt with auth", async () => {
        const res = await fetch(`${baseUrl}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${dummyToken}`,
            },
            body: JSON.stringify({
                txHash: "0x" + "a".repeat(64),
            }),
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.data.state, "CONFIRMED");
    });

    // Test 10: POST /reconcile
    await t.test("POST /reconcile performs reconciliation with auth", async () => {
        const res = await fetch(`${baseUrl}/reconcile/1`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${dummyToken}`,
            },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.data.reconciled, true);
    });
});
