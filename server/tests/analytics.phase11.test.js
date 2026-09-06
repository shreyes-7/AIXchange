import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import env from "../src/config/env.js";
import Purchase from "../src/models/purchase.model.js";
import Download from "../src/models/download.model.js";
import InferenceCall from "../src/models/inference-call.model.js";
import User from "../src/models/user.model.js";
import * as repository from "../src/repositories/analytics.repository.js";

test("Task Groups 1–40: Phase 11 Backend Analytics E2E Repository & Aggregation Battery", async (t) => {
    // Connect to database if not connected
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI);
    }

    const testPrefix = `p11_test_${Date.now()}`;
    const buyerWalletA = `0xaaa${Date.now().toString(16)}000000000000000000000000000000000000`.slice(0, 42).toLowerCase();
    const buyerWalletB = `0xbbb${Date.now().toString(16)}000000000000000000000000000000000000`.slice(0, 42).toLowerCase();
    const licensorWallet = `0xccc${Date.now().toString(16)}000000000000000000000000000000000000`.slice(0, 42).toLowerCase();

    const testUserIdA = new mongoose.Types.ObjectId();
    const testUserIdB = new mongoose.Types.ObjectId();
    const testModelRef = new mongoose.Types.ObjectId();
    const testDatasetId = 98765;
    const testModelId = 555;

    // Seed test data
    const createdPurchases = [];
    const createdDownloads = [];
    const createdApiCalls = [];
    const createdUsers = [];

    t.before(async () => {
        // 1. Users
        createdUsers.push(
            await User.create({
                _id: testUserIdA,
                name: `${testPrefix}_UserA`,
                email: `${testPrefix}_a@test.com`,
                passwordHash: "dummyHash123",
                role: "USER",
                wallet: { address: buyerWalletA, verified: true },
                isEmailVerified: true,
                createdAt: new Date("2026-09-01T10:00:00.000Z"),
            }),
            await User.create({
                _id: testUserIdB,
                name: `${testPrefix}_UserB`,
                email: `${testPrefix}_b@test.com`,
                passwordHash: "dummyHash123",
                role: "CREATOR",
                wallet: { address: buyerWalletB, verified: false },
                isEmailVerified: false,
                createdAt: new Date("2026-09-02T10:00:00.000Z"),
            })
        );

        // 2. Purchases (Marketplace transactions)
        createdPurchases.push(
            await Purchase.create({
                purchaseId: Math.floor(Math.random() * 1000000) + 10000,
                datasetId: testDatasetId,
                licenseId: 1,
                buyerWallet: buyerWalletA,
                licensorWallet,
                price: "100000000000000000000", // 100 ETH / AIX
                feeAmount: "2500000000000000000",   // 2.5
                licensorAmount: "97500000000000000000", // 97.5
                transactionHash: `0x111${Date.now().toString(16)}000000000000000000000000000000000000000000000000000000`.slice(0, 66),
                status: "CONFIRMED",
                chainId: 31337,
                contractAddress: "0x0000000000000000000000000000000000000001",
                timestamp: new Date("2026-09-01T12:00:00.000Z"),
            }),
            await Purchase.create({
                purchaseId: Math.floor(Math.random() * 1000000) + 20000,
                datasetId: testDatasetId,
                licenseId: 1,
                buyerWallet: buyerWalletB,
                licensorWallet,
                price: "50000000000000000000", // 50 ETH / AIX
                feeAmount: "1250000000000000000",
                licensorAmount: "48750000000000000000",
                transactionHash: `0x222${Date.now().toString(16)}000000000000000000000000000000000000000000000000000000`.slice(0, 66),
                status: "CONFIRMED",
                chainId: 31337,
                contractAddress: "0x0000000000000000000000000000000000000001",
                timestamp: new Date("2026-09-02T14:00:00.000Z"),
            }),
            await Purchase.create({
                purchaseId: Math.floor(Math.random() * 1000000) + 30000,
                datasetId: testDatasetId,
                licenseId: 1,
                buyerWallet: buyerWalletA,
                licensorWallet,
                price: "30000000000000000000",
                transactionHash: `0x333${Date.now().toString(16)}000000000000000000000000000000000000000000000000000000`.slice(0, 66),
                status: "FAILED",
                chainId: 31337,
                contractAddress: "0x0000000000000000000000000000000000000001",
                timestamp: new Date("2026-09-03T10:00:00.000Z"),
            })
        );

        // 3. Downloads
        createdDownloads.push(
            await Download.create({
                datasetId: testDatasetId,
                userId: testUserIdA,
                userWallet: buyerWalletA,
                fileName: "data.bin",
                fileSize: 1024,
                status: "SUCCESS",
                timestamp: new Date("2026-09-01T15:00:00.000Z"),
            }),
            await Download.create({
                datasetId: testDatasetId,
                userId: testUserIdB,
                userWallet: buyerWalletB,
                fileName: "data.bin",
                fileSize: 1024,
                status: "FAILED",
                errorCode: "STORAGE_ERROR",
                timestamp: new Date("2026-09-02T16:00:00.000Z"),
            })
        );

        // 4. Inference Calls
        createdApiCalls.push(
            await InferenceCall.create({
                modelRef: testModelRef,
                modelId: testModelId,
                modelVersion: 1,
                userId: testUserIdA,
                userWallet: buyerWalletA,
                status: "SUCCESS",
                executionTimeMs: 40,
                device: "cpu",
                timestamp: new Date("2026-09-01T18:00:00.000Z"),
            }),
            await InferenceCall.create({
                modelRef: testModelRef,
                modelId: testModelId,
                modelVersion: 1,
                userId: testUserIdB,
                userWallet: buyerWalletB,
                status: "FAILED",
                executionTimeMs: 15,
                errorCode: "TIMEOUT",
                device: "cpu",
                timestamp: new Date("2026-09-02T19:00:00.000Z"),
            })
        );
    });

    t.after(async () => {
        // Cleanup test data
        await User.deleteMany({ _id: { $in: createdUsers.map((u) => u._id) } });
        await Purchase.deleteMany({ _id: { $in: createdPurchases.map((p) => p._id) } });
        await Download.deleteMany({ _id: { $in: createdDownloads.map((d) => d._id) } });
        await InferenceCall.deleteMany({ _id: { $in: createdApiCalls.map((a) => a._id) } });
        await mongoose.connection.close();
    });

    await t.test("Task Group 6 & 20: Revenue aggregation calculates exact totals, platform fee and timeline", async () => {
        const result = await repository.aggregateRevenue({
            datasetId: testDatasetId,
            startDate: "2026-09-01T00:00:00.000Z",
            endDate: "2026-09-05T23:59:59.999Z",
            interval: "day",
        });

        assert.equal(result.summary.transactionCount, 2); // 2 confirmed purchases
        assert.equal(result.summary.totalRevenue, "150000000000000000000"); // 100 + 50
        assert.equal(result.summary.platformRevenue, "3750000000000000000"); // 2.5 + 1.25
        assert.equal(result.summary.creatorRevenue, "146250000000000000000"); // 97.5 + 48.75
        assert.equal(result.summary.averageTransactionValue, "75000000000000000000"); // 150 / 2
        assert.equal(result.timeline.length, 2);
    });

    await t.test("Task Group 6 & 21: Transaction aggregation verifies status breakdown (CONFIRMED vs FAILED) strictly from Purchase", async () => {
        const result = await repository.aggregateTransactions({
            datasetId: testDatasetId,
            interval: "day",
            page: 1,
            limit: 10,
        });

        assert.equal(result.summary.totalTransactions, 3);
        assert.equal(result.summary.successfulTransactions, 2);
        assert.equal(result.summary.failedTransactions, 1);
        assert.equal(result.summary.pendingTransactions, 0);
        assert.ok(result.transactions.length >= 3);
    });

    await t.test("Task Group 6 & 22: Download aggregation calculates totals, unique downloaders, and failure status", async () => {
        const result = await repository.aggregateDownloads({
            datasetId: testDatasetId,
            interval: "day",
        });

        assert.equal(result.summary.totalDownloads, 2);
        assert.equal(result.summary.successfulDownloads, 1);
        assert.equal(result.summary.failedDownloads, 1);
        assert.equal(result.summary.uniqueDownloaders, 2);
        assert.ok(result.byDataset.length >= 1);
        assert.equal(result.byDataset[0].datasetId, testDatasetId);
    });

    await t.test("Task Group 6 & 23: API call aggregation calculates total calls, unique consumers, and execution time", async () => {
        const result = await repository.aggregateApiCalls({
            modelId: testModelId,
            interval: "day",
        });

        assert.equal(result.summary.totalApiCalls, 2);
        assert.equal(result.summary.successfulApiCalls, 1);
        assert.equal(result.summary.failedApiCalls, 1);
        assert.equal(result.summary.uniqueConsumers, 2);
        assert.equal(result.summary.averageExecutionTimeMs, 27.5); // (40 + 15) / 2
        assert.equal(result.summary.totalExecutionTimeMs, 55);
        assert.equal(result.callsByModel.length, 1);
    });

    await t.test("Task Group 6 & 24: User aggregation calculates growth, verified counts, and historically verifiable active users", async () => {
        const result = await repository.aggregateUsers({
            startDate: "2026-09-01T00:00:00.000Z",
            endDate: "2026-09-05T23:59:59.999Z",
            interval: "day",
        });

        assert.ok(result.summary.totalUsers >= 2);
        assert.ok(result.summary.activeUsers >= 2); // Users with purchases, downloads, and inference
        assert.ok(result.meta.activeUserDefinition);
        assert.ok(result.meta.lastLoginLimitation);
    });

    await t.test("Task Group 18: Single-pass getOverview yields synthesized KPIs without time-series queries", async () => {
        const overview = await repository.getOverview({
            startDate: "2026-09-01T00:00:00.000Z",
            endDate: "2026-09-05T23:59:59.999Z",
        });

        assert.ok(overview.revenue);
        assert.ok(overview.transactions);
        assert.ok(overview.downloads);
        assert.ok(overview.apiCalls);
        assert.ok(overview.users);

        assert.ok(BigInt(overview.revenue.totalRevenue) >= 150000000000000000000n);
        assert.ok(overview.transactions.totalTransactions >= 3);
        assert.ok(overview.downloads.totalDownloads >= 2);
        assert.ok(overview.apiCalls.totalApiCalls >= 2);
        assert.ok(overview.users.totalUsers >= 2);
    });
});
