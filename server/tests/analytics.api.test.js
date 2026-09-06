import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import analyticsService from "../src/services/analytics.service.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/jwt.js";

test("Analytics HTTP REST APIs: Authentication, Validation, and Response Contracts", async (t) => {
    let server;
    let baseUrl;

    const dummyUser = {
        _id: "66d9c79f9435b801a21e7777",
        email: "analytics-test@aixchange.io",
        role: "admin",
        wallet: {
            address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            verified: true,
        },
    };

    const dummyToken = generateAccessToken({ userId: dummyUser._id });

    // Save originals
    const originalUserFindById = User.findById;
    const originalGetRevenue = analyticsService.getRevenueAnalytics;
    const originalGetTransactions = analyticsService.getTransactionAnalytics;
    const originalGetDownloads = analyticsService.getDownloadAnalytics;
    const originalGetApiCalls = analyticsService.getApiCallAnalytics;
    const originalGetUsers = analyticsService.getUserAnalytics;
    const originalGetOverview = analyticsService.getOverviewAnalytics;

    // Mock User.findById for auth
    User.findById = (id) => Promise.resolve(String(id) === String(dummyUser._id) ? dummyUser : null);

    // Mock service layer
    analyticsService.getRevenueAnalytics = async (query) => {
        return {
            summary: {
                totalRevenue: "100000000000000000000",
                platformRevenue: "2500000000000000000",
                creatorRevenue: "97500000000000000000",
                datasetRevenue: "100000000000000000000",
                transactionCount: 5,
                averageTransactionValue: "20000000000000000000",
            },
            interval: query.interval || "day",
            timeline: [{ date: "2026-09-01", revenue: "100000000000000000000", transactionCount: 5 }],
        };
    };

    analyticsService.getTransactionAnalytics = async (query) => {
        return {
            summary: {
                totalTransactions: 6,
                successfulTransactions: 5,
                pendingTransactions: 1,
                failedTransactions: 0,
                totalTransactionValue: "100000000000000000000",
                averageTransactionValue: "20000000000000000000",
            },
            interval: query.interval || "day",
            timeline: [],
            transactions: [],
            pagination: { page: 1, limit: 20, total: 6, pages: 1 },
        };
    };

    analyticsService.getDownloadAnalytics = async (query) => {
        return {
            summary: {
                totalDownloads: 12,
                successfulDownloads: 11,
                failedDownloads: 1,
                uniqueDownloaders: 4,
            },
            byDataset: [{ datasetId: 1, totalDownloads: 12, uniqueDownloaders: 4 }],
            interval: query.interval || "day",
            timeline: [],
        };
    };

    analyticsService.getApiCallAnalytics = async (query) => {
        return {
            summary: {
                totalApiCalls: 30,
                successfulApiCalls: 29,
                failedApiCalls: 1,
                uniqueConsumers: 8,
                averageExecutionTimeMs: 45.2,
                totalExecutionTimeMs: 1356,
            },
            callsByModel: [{ modelId: 1, totalCalls: 30, averageExecutionTimeMs: 45.2 }],
            interval: query.interval || "day",
            timeline: [],
        };
    };

    analyticsService.getUserAnalytics = async (query) => {
        return {
            summary: {
                totalUsers: 20,
                newUsers: 5,
                activeUsers: 12,
                verifiedUsers: 15,
                usersWithPurchases: 5,
                usersWithDownloads: 4,
                usersWithApiCalls: 8,
            },
            interval: query.interval || "day",
            timeline: [],
        };
    };

    analyticsService.getOverviewAnalytics = async (query) => {
        return {
            revenue: { totalRevenue: "100000000000000000000", transactionCount: 5, averageTransactionValue: "20000000000000000000" },
            transactions: { totalTransactions: 6, successfulTransactions: 5, pendingTransactions: 1, failedTransactions: 0 },
            downloads: { totalDownloads: 12, successfulDownloads: 11, failedDownloads: 1, uniqueDownloaders: 4 },
            apiCalls: { totalApiCalls: 30, successfulApiCalls: 29, failedApiCalls: 1, uniqueConsumers: 8, averageExecutionTimeMs: 45.2 },
            users: { totalUsers: 20, newUsers: 5, activeUsers: 12 },
        };
    };

    t.before(async () => {
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1/analytics`;
    });

    t.after(async () => {
        User.findById = originalUserFindById;
        analyticsService.getRevenueAnalytics = originalGetRevenue;
        analyticsService.getTransactionAnalytics = originalGetTransactions;
        analyticsService.getDownloadAnalytics = originalGetDownloads;
        analyticsService.getApiCallAnalytics = originalGetApiCalls;
        analyticsService.getUserAnalytics = originalGetUsers;
        analyticsService.getOverviewAnalytics = originalGetOverview;

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    await t.test("All analytics routes reject unauthenticated requests with 401", async () => {
        const endpoints = ["/overview", "/revenue", "/transactions", "/downloads", "/api-calls", "/users"];
        for (const ep of endpoints) {
            const res = await fetch(`${baseUrl}${ep}`);
            assert.equal(res.status, 401, `Expected 401 for unauthenticated GET ${ep}`);
            const body = await res.json();
            assert.equal(body.success, false);
        }
    });

    await t.test("GET /revenue returns 200 and formatted revenue data with valid auth", async () => {
        const res = await fetch(`${baseUrl}/revenue?interval=week`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.summary.totalRevenue, "100000000000000000000");
        assert.equal(body.data.summary.transactionCount, 5);
        assert.equal(body.data.interval, "week");
    });

    await t.test("GET /revenue rejects invalid parameters with 400", async () => {
        const res = await fetch(`${baseUrl}/revenue?interval=invalid`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 400);
        const body = await res.json();
        assert.equal(body.success, false);
    });

    await t.test("GET /transactions returns 200 and marketplace purchase transaction data", async () => {
        const res = await fetch(`${baseUrl}/transactions?status=CONFIRMED`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.summary.successfulTransactions, 5);
        assert.equal(body.data.pagination.page, 1);
    });

    await t.test("GET /downloads returns 200 and dataset download metrics", async () => {
        const res = await fetch(`${baseUrl}/downloads?datasetId=1`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.summary.totalDownloads, 12);
        assert.equal(body.data.summary.uniqueDownloaders, 4);
    });

    await t.test("GET /api-calls returns 200 and AI inference metrics", async () => {
        const res = await fetch(`${baseUrl}/api-calls?modelId=1`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.summary.totalApiCalls, 30);
        assert.equal(body.data.summary.averageExecutionTimeMs, 45.2);
    });

    await t.test("GET /users returns 200 and user growth and active user metrics", async () => {
        const res = await fetch(`${baseUrl}/users?role=user`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.summary.totalUsers, 20);
        assert.equal(body.data.summary.activeUsers, 12);
    });

    await t.test("GET /overview returns 200 with unified KPIs across all 5 dimensions", async () => {
        const res = await fetch(`${baseUrl}/overview`, {
            headers: { Authorization: `Bearer ${dummyToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.ok(body.data.revenue);
        assert.ok(body.data.transactions);
        assert.ok(body.data.downloads);
        assert.ok(body.data.apiCalls);
        assert.ok(body.data.users);
    });
});
