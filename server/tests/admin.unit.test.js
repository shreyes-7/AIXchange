import test from "node:test";
import assert from "node:assert/strict";
import {
    userStatusUpdateSchema,
    datasetStatusUpdateSchema,
    modelStatusUpdateSchema,
    fraudReviewSchema,
    ingestFlagsSchema,
} from "../src/validators/admin.validator.js";
import {
    createReportSchema,
    reportAssignmentSchema,
    reportStatusUpdateSchema,
} from "../src/validators/report.validator.js";

test("Phase 12 Admin & Moderation Unit Tests: Validation and State Machine Rules", async (t) => {
    await t.test("userStatusUpdateSchema validates valid status and rejects invalid or empty reason", () => {
        const validActive = userStatusUpdateSchema.validate({ status: "ACTIVE", reason: "Account review completed." });
        assert.equal(validActive.error, undefined);

        const validSuspended = userStatusUpdateSchema.validate({ status: "SUSPENDED", reason: "Violated terms of service." });
        assert.equal(validSuspended.error, undefined);

        const invalidStatus = userStatusUpdateSchema.validate({ status: "DELETED", reason: "Violated rules." });
        assert.ok(invalidStatus.error);

        const shortReason = userStatusUpdateSchema.validate({ status: "SUSPENDED", reason: "no" });
        assert.ok(shortReason.error);
    });

    await t.test("datasetStatusUpdateSchema validates lowercase moderation states", () => {
        for (const status of ["active", "archived", "hidden", "under_review", "removed"]) {
            const valid = datasetStatusUpdateSchema.validate({ status, reason: "Content compliance check." });
            assert.equal(valid.error, undefined, `Expected status '${status}' to be valid`);
        }

        const invalid = datasetStatusUpdateSchema.validate({ status: "DELETED", reason: "Valid reason text." });
        assert.ok(invalid.error);
    });

    await t.test("modelStatusUpdateSchema validates allowed model statuses", () => {
        for (const status of ["active", "under_review", "hidden", "removed"]) {
            const valid = modelStatusUpdateSchema.validate({ status, reason: "Model security audit." });
            assert.equal(valid.error, undefined, `Expected status '${status}' to be valid`);
        }

        const invalid = modelStatusUpdateSchema.validate({ status: "archived", reason: "Valid reason text." });
        assert.ok(invalid.error);
    });

    await t.test("createReportSchema validates targets, categories, and description length", () => {
        const valid = createReportSchema.validate({
            targetType: "DATASET",
            targetId: "66d9c79f9435b801a21e7777",
            category: "COPYRIGHT",
            description: "Unauthorized copyrighted data included in version 1.",
            priority: "HIGH",
        });
        assert.equal(valid.error, undefined);

        const invalidTarget = createReportSchema.validate({
            targetType: "DATABASE",
            targetId: "66d9c79f9435b801a21e7777",
            category: "SPAM",
            description: "Spam content detected.",
        });
        assert.ok(invalidTarget.error);

        const shortDesc = createReportSchema.validate({
            targetType: "USER",
            targetId: "66d9c79f9435b801a21e7777",
            category: "SPAM",
            description: "bad",
        });
        assert.ok(shortDesc.error);
    });

    await t.test("reportStatusUpdateSchema enforces resolution notes on RESOLVED or REJECTED", () => {
        const underReview = reportStatusUpdateSchema.validate({ status: "UNDER_REVIEW" });
        assert.equal(underReview.error, undefined);

        const resolvedWithoutNote = reportStatusUpdateSchema.validate({ status: "RESOLVED" });
        assert.ok(resolvedWithoutNote.error);

        const resolvedWithNote = reportStatusUpdateSchema.validate({
            status: "RESOLVED",
            resolution: "Dataset hidden and copyright dispute processed.",
        });
        assert.equal(resolvedWithNote.error, undefined);

        const rejectedWithNote = reportStatusUpdateSchema.validate({
            status: "REJECTED",
            resolution: "Claim lacked valid evidence after investigation.",
        });
        assert.equal(rejectedWithNote.error, undefined);
    });

    await t.test("reportAssignmentSchema validates valid ObjectId string", () => {
        const valid = reportAssignmentSchema.validate({ adminId: "66d9c79f9435b801a21e7777" });
        assert.equal(valid.error, undefined);

        const invalid = reportAssignmentSchema.validate({ adminId: "not-an-id" });
        assert.ok(invalid.error);
    });

    await t.test("fraudReviewSchema validates review status and required reviewNotes", () => {
        for (const status of ["UNDER_REVIEW", "CONFIRMED", "DISMISSED"]) {
            const valid = fraudReviewSchema.validate({
                status,
                reviewNotes: "Investigated wallet transaction patterns thoroughly.",
            });
            assert.equal(valid.error, undefined);
        }

        const invalid = fraudReviewSchema.validate({
            status: "OPEN",
            reviewNotes: "Cannot re-open directly through this schema.",
        });
        assert.ok(invalid.error);

        const missingNotes = fraudReviewSchema.validate({ status: "CONFIRMED" });
        assert.ok(missingNotes.error);
    });

    await t.test("ingestFlagsSchema validates structured blockchain monitoring flag payloads", () => {
        const valid = ingestFlagsSchema.validate({
            flags: [
                {
                    flagId: "FLAG_LARGE_TRANSFER_0x123",
                    ruleId: "ABNORMAL_LARGE_TRANSFER",
                    severity: "HIGH",
                    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    transactionHash: "0x123abc",
                    description: "Transfer of 50000 AIX exceeds threshold",
                    evidence: { amountFormatted: "50000.0" },
                },
            ],
        });
        assert.equal(valid.error, undefined);

        const empty = ingestFlagsSchema.validate({ flags: [] });
        assert.ok(empty.error);
    });
});
