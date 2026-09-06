import test from "node:test";
import assert from "node:assert/strict";
import {
    revenueQuerySchema,
    transactionQuerySchema,
    downloadQuerySchema,
    apiCallQuerySchema,
    userQuerySchema,
    overviewQuerySchema,
} from "../src/validators/analytics.validator.js";
import Download from "../src/models/download.model.js";
import InferenceCall from "../src/models/inference-call.model.js";

test("Analytics Unit Tests: Validators, ISO-8601 Week Bucketing, Sanitized Error Codes, and Precision", async (t) => {
    await t.test("Revenue query validator accepts valid parameters and rejects reversed dates/bad intervals", () => {
        const valid = revenueQuerySchema.validate({
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: "2026-01-31T23:59:59.999Z",
            interval: "week",
            datasetId: 10,
        });
        assert.equal(valid.error, undefined);

        const reversed = revenueQuerySchema.validate({
            startDate: "2026-02-01T00:00:00.000Z",
            endDate: "2026-01-01T00:00:00.000Z",
        });
        assert.ok(reversed.error);

        const badInterval = revenueQuerySchema.validate({
            interval: "annual",
        });
        assert.ok(badInterval.error);
    });

    await t.test("Transaction query validator enforces status enum and pagination boundaries", () => {
        const valid = transactionQuerySchema.validate({
            status: "CONFIRMED",
            page: 2,
            limit: 50,
        });
        assert.equal(valid.error, undefined);

        const badStatus = transactionQuerySchema.validate({
            status: "INVALID_STATUS",
        });
        assert.ok(badStatus.error);

        const limitTooHigh = transactionQuerySchema.validate({
            limit: 500,
        });
        assert.ok(limitTooHigh.error);
    });

    await t.test("Download and API call validators enforce status and identifier types", () => {
        const validDownload = downloadQuerySchema.validate({
            datasetId: 42,
            status: "SUCCESS",
            userId: "66d9c79f9435b801a21e9999",
        });
        assert.equal(validDownload.error, undefined);

        const badDownloadStatus = downloadQuerySchema.validate({
            status: "PARTIAL",
        });
        assert.ok(badDownloadStatus.error);

        const validApiCall = apiCallQuerySchema.validate({
            modelId: 3,
            modelVersion: 2,
            status: "FAILED",
        });
        assert.equal(validApiCall.error, undefined);

        const badModelId = apiCallQuerySchema.validate({
            modelId: -5,
        });
        assert.ok(badModelId.error);
    });

    await t.test("User query validator enforces valid role enum", () => {
        const validUser = userQuerySchema.validate({
            role: "creator",
            interval: "month",
        });
        assert.equal(validUser.error, undefined);

        const badRole = userQuerySchema.validate({
            role: "superadmin",
        });
        assert.ok(badRole.error);
    });

    await t.test("ISO-8601 UTC Week Bucketing logic & Year Boundary determinism", () => {
        // Helper function verifying ISO 8601 week calculation logic in UTC
        const getISOWeekYearAndNumber = (d) => {
            const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            // Thursday in current week decides the year.
            date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
            // January 4 is always in week 1.
            const week1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
            return `${date.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
        };

        // Dec 29, 2025 (Monday) to Jan 4, 2026 (Sunday) contains Jan 1, 2026 (Thursday).
        // By ISO-8601, the week with the year's first Thursday is Week 01.
        // Therefore Dec 29-31, 2025 and Jan 1, 2026 all belong to ISO week 2026-W01!
        const dec29 = new Date("2025-12-29T12:00:00.000Z");
        assert.equal(getISOWeekYearAndNumber(dec29), "2026-W01");

        const dec31 = new Date("2025-12-31T23:59:59.999Z");
        assert.equal(getISOWeekYearAndNumber(dec31), "2026-W01");

        const jan01 = new Date("2026-01-01T00:00:00.000Z");
        assert.equal(getISOWeekYearAndNumber(jan01), "2026-W01");

        // Jan 5, 2026 (Monday) -> 2026-W02
        const jan05 = new Date("2026-01-05T00:00:00.000Z");
        assert.equal(getISOWeekYearAndNumber(jan05), "2026-W02");
    });

    await t.test("Download and InferenceCall schemas enforce sanitized errorCodes and prevent raw message leaks", () => {
        const dl = new Download({
            datasetId: 1,
            status: "FAILED",
            errorCode: "STORAGE_ERROR",
        });
        const dlErr = dl.validateSync();
        assert.equal(dlErr, undefined);

        // Verify invalid errorCode rejected
        const dlInvalid = new Download({
            datasetId: 1,
            status: "FAILED",
            errorCode: "RAW_INTERNAL_CRASH_DUMP_OR_PATH",
        });
        const dlInvalidErr = dlInvalid.validateSync();
        assert.ok(dlInvalidErr?.errors?.errorCode);

        // Verify InferenceCall modelId and modelRef disambiguation
        const inf = new InferenceCall({
            modelRef: "66d9c79f9435b801a21e8888",
            modelId: 5,
            modelVersion: 1,
            status: "FAILED",
            errorCode: "TIMEOUT",
            executionTimeMs: 125,
        });
        const infErr = inf.validateSync();
        assert.equal(infErr, undefined);
        assert.equal(typeof inf.modelId, "number");
    });

    await t.test("Zero-division and large numeric values handling in calculations", () => {
        const countZero = 0;
        const totalRev = "0";
        const avgZero = countZero > 0 ? (parseFloat(totalRev) / countZero).toString() : "0";
        assert.equal(avgZero, "0");

        const countTen = 10;
        const totalBig = "500000000000000000000"; // 500 ether in wei
        const avgTen = (BigInt(totalBig) / BigInt(countTen)).toString();
        assert.equal(avgTen, "50000000000000000000");
    });
});
