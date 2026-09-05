import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import blockchainAnalyticsService from "../src/services/blockchain-analytics.service.js";

test("Blockchain Analytics HTTP API routes, controllers, and error handling", async (t) => {
    let server;
    let baseUrl;

    // Mock service layer for API route testing
    const originalGetEvents = blockchainAnalyticsService.getEvents;
    const originalGetTokenAnalytics = blockchainAnalyticsService.getTokenAnalytics;
    const originalGetGasAnalytics = blockchainAnalyticsService.getGasAnalytics;
    const originalGetOverview = blockchainAnalyticsService.getOverview;

    blockchainAnalyticsService.getEvents = async (query) => {
        if (query.address === "invalid-address" || query.limit === "1000") {
            const err = new Error("Validation Error");
            err.statusCode = 400;
            throw err;
        }
        return {
            events: [
                {
                    eventName: "Transfer",
                    contractName: "AIXToken",
                    transactionHash: "0x" + "1".repeat(64),
                    amount: "1000000000000000000",
                },
            ],
            pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        };
    };

    blockchainAnalyticsService.getTokenAnalytics = async (query) => {
        if (query.interval === "annual") {
            const err = new Error("Invalid interval");
            err.statusCode = 400;
            throw err;
        }
        return {
            summary: {
                transferCount: 10,
                totalVolumeRaw: "100000000000000000000",
                totalVolumeFormatted: 100,
                uniqueSendersCount: 3,
                uniqueReceiversCount: 4,
                uniqueParticipantsCount: 5,
            },
            categorizedSpending: {
                spentOnDatasetsRaw: "50000000000000000000",
                spentOnDatasetsFormatted: 50,
                distributedAsRoyaltiesRaw: "10000000000000000000",
                distributedAsRoyaltiesFormatted: 10,
                transferredToTreasuryRaw: "5000000000000000000",
                transferredToTreasuryFormatted: 5,
            },
            timeActivity: [
                { period: "2026-09-05", transferCount: 10, volumeRaw: "100000000000000000000", volumeFormatted: 100 },
            ],
        };
    };

    blockchainAnalyticsService.getGasAnalytics = async (query) => {
        return {
            summary: {
                transactionCount: 5,
                totalGasUsed: "250000",
                averageGasUsed: 50000,
                totalGasCostWei: "5000000000000000",
                totalGasCostEth: 0.005,
            },
            byContract: [],
            timeActivity: [],
        };
    };

    blockchainAnalyticsService.getOverview = async (query) => {
        return {
            transactionCount: 5,
            eventCount: 12,
            tokenVolume: { raw: "100000000000000000000", formatted: 100 },
            royaltyVolume: { raw: "10000000000000000000", formatted: 10 },
            gasUsed: { raw: "250000", average: 50000 },
            gasCost: { wei: "5000000000000000", eth: 0.005 },
        };
    };

    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });

    t.after(() => {
        server.close();
        blockchainAnalyticsService.getEvents = originalGetEvents;
        blockchainAnalyticsService.getTokenAnalytics = originalGetTokenAnalytics;
        blockchainAnalyticsService.getGasAnalytics = originalGetGasAnalytics;
        blockchainAnalyticsService.getOverview = originalGetOverview;
    });

    // 1. GET /api/v1/analytics/blockchain/events
    const resEvents = await fetch(`${baseUrl}/api/v1/analytics/blockchain/events?limit=5`);
    assert.equal(resEvents.status, 200);
    const dataEvents = await resEvents.json();
    assert.equal(dataEvents.success, true);
    assert.equal(dataEvents.data.events.length, 1);
    assert.equal(dataEvents.data.events[0].eventName, "Transfer");

    // 2. GET /api/v1/analytics/blockchain/token
    const resToken = await fetch(`${baseUrl}/api/v1/analytics/blockchain/token?interval=day`);
    assert.equal(resToken.status, 200);
    const dataToken = await resToken.json();
    assert.equal(dataToken.success, true);
    assert.equal(dataToken.data.summary.transferCount, 10);
    assert.equal(dataToken.data.summary.totalVolumeFormatted, 100);

    // 3. GET /api/v1/analytics/blockchain/gas
    const resGas = await fetch(`${baseUrl}/api/v1/analytics/blockchain/gas?interval=week`);
    assert.equal(resGas.status, 200);
    const dataGas = await resGas.json();
    assert.equal(dataGas.success, true);
    assert.equal(dataGas.data.summary.totalGasUsed, "250000");

    // 4. GET /api/v1/analytics/blockchain/overview
    const resOverview = await fetch(`${baseUrl}/api/v1/analytics/blockchain/overview`);
    assert.equal(resOverview.status, 200);
    const dataOverview = await resOverview.json();
    assert.equal(dataOverview.success, true);
    assert.equal(dataOverview.data.transactionCount, 5);
    assert.equal(dataOverview.data.eventCount, 12);

    // 5. Test alias route /api/analytics/blockchain/overview
    const resAlias = await fetch(`${baseUrl}/api/analytics/blockchain/overview`);
    assert.equal(resAlias.status, 200);
    const dataAlias = await resAlias.json();
    assert.equal(dataAlias.success, true);
    assert.equal(dataAlias.data.eventCount, 12);

    // 6. Test error response when service throws 400
    const resError = await fetch(`${baseUrl}/api/v1/analytics/blockchain/events?address=invalid-address`);
    assert.equal(resError.status, 400);
    const dataError = await resError.json();
    assert.equal(dataError.success, false);
});
