import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Dataset from "../src/models/dataset.model.js";
import Model from "../src/models/model.model.js";
import Report from "../src/models/report.model.js";
import ModerationAudit from "../src/models/moderation-audit.model.js";
import FraudFlag from "../src/models/fraud-flag.model.js";
import * as adminService from "../src/services/admin.service.js";
import * as reportService from "../src/services/report.service.js";
import * as fraudService from "../src/services/fraud-review.service.js";
import * as treasuryService from "../src/services/admin-treasury.service.js";
import * as authService from "../src/services/auth.service.js";
import { hashPassword } from "../src/utils/password.js";

test("Task Groups 0–37: Phase 12 Admin Backend, Moderation & Reports Comprehensive Battery", async (t) => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI);
    }

    const testPrefix = `p12_test_${Date.now()}`;
    const testAdminId = new mongoose.Types.ObjectId();
    const testUserAId = new mongoose.Types.ObjectId();
    const testUserBId = new mongoose.Types.ObjectId();

    let seededAdmin;
    let seededUserA;
    let seededUserB;
    let seededDataset;
    let seededModel;

    t.before(async () => {
        const passHash = await hashPassword("Password123!");

        // 1. Seed Admin
        seededAdmin = await User.create({
            _id: testAdminId,
            name: `${testPrefix}_Admin`,
            email: `${testPrefix}_admin@test.com`,
            passwordHash: passHash,
            role: "ADMIN",
            status: "ACTIVE",
            wallet: { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", verified: true },
        });

        // 2. Seed Standard User A
        seededUserA = await User.create({
            _id: testUserAId,
            name: `${testPrefix}_UserA`,
            email: `${testPrefix}_usera@test.com`,
            passwordHash: passHash,
            role: "USER",
            status: "ACTIVE",
            wallet: { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", verified: true },
        });

        // 3. Seed Standard User B
        seededUserB = await User.create({
            _id: testUserBId,
            name: `${testPrefix}_UserB`,
            email: `${testPrefix}_userb@test.com`,
            passwordHash: passHash,
            role: "CREATOR",
            status: "ACTIVE",
            wallet: { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", verified: true },
        });

        // 4. Seed Dataset
        seededDataset = await Dataset.create({
            title: `${testPrefix} NLP Dataset`,
            description: "A comprehensive corpus for LLM fine-tuning",
            category: "nlp",
            tags: ["llm", "nlp", "text"],
            owner: testUserBId,
            license: "MIT",
            royaltyBps: 250,
            visibility: "public",
            status: "active",
            file: {
                cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                contentHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                size: 2048,
                fileName: "corpus.jsonl",
                mimeType: "application/json",
                encryption: { algorithm: "aes-256-gcm", iv: "abc", authTag: "def" },
            },
        });

        // 5. Seed Model
        seededModel = await Model.create({
            name: `${testPrefix} Sentiment Classifier`,
            description: "High accuracy transformer for sentiment analysis",
            category: "nlp",
            tags: ["nlp", "sentiment"],
            framework: "PyTorch",
            metadataURI: "ipfs://bafybeimodelmetadata123",
            owner: testUserBId,
            ownerWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            status: "active",
            active: true,
        });
    });

    t.after(async () => {
        await User.deleteMany({ _id: { $in: [testAdminId, testUserAId, testUserBId] } });
        await Dataset.deleteMany({ _id: seededDataset._id });
        await Model.deleteMany({ _id: seededModel._id });
        await Report.deleteMany({ reporterId: { $in: [testAdminId, testUserAId, testUserBId] } });
        await ModerationAudit.deleteMany({ adminId: testAdminId });
        await FraudFlag.deleteMany({ flagId: { $regex: testPrefix } });
        await mongoose.disconnect();
    });

    await t.test("User Moderation: Suspend user blocks login, restore restores login, audited append-only", async () => {
        const adminContext = { userId: testAdminId, role: "ADMIN" };

        // 1. Suspend User B
        const suspended = await adminService.updateUserStatus(
            testUserBId,
            "SUSPENDED",
            "Violation of platform usage policy.",
            adminContext
        );
        assert.equal(suspended.status, "SUSPENDED");

        // Verify login fails with 403
        await assert.rejects(
            async () => {
                await authService.login(
                    { email: seededUserB.email, password: "Password123!" },
                    { ipAddress: "127.0.0.1", userAgent: "TestClient" }
                );
            },
            (err) => err.statusCode === 403 && /Account is suspended/i.test(err.message)
        );

        // Verify self-moderation guard blocks admin suspending self
        await assert.rejects(
            async () => {
                await adminService.updateUserStatus(
                    testAdminId,
                    "SUSPENDED",
                    "Self suspension attempt",
                    adminContext
                );
            },
            (err) => err.statusCode === 403 && /cannot suspend their own account/i.test(err.message)
        );

        // 2. Restore User B
        const restored = await adminService.updateUserStatus(
            testUserBId,
            "ACTIVE",
            "User appeal accepted.",
            adminContext
        );
        assert.equal(restored.status, "ACTIVE");

        // Verify login now succeeds
        const loginResult = await authService.login(
            { email: seededUserB.email, password: "Password123!" },
            { ipAddress: "127.0.0.1", userAgent: "TestClient" }
        );
        assert.ok(loginResult.accessToken);

        // Check audits
        const audits = await ModerationAudit.find({ targetType: "USER", targetId: String(testUserBId) }).sort({ createdAt: 1 });
        assert.equal(audits.length, 2);
        assert.equal(audits[0].action, "USER_SUSPEND");
        assert.equal(audits[1].action, "USER_RESTORE");
    });

    await t.test("Dataset Moderation: Hide and restore updates status and records audit trail", async () => {
        const adminContext = { userId: testAdminId, role: "ADMIN" };

        // Hide dataset
        const hidden = await adminService.updateDatasetStatus(
            seededDataset._id,
            "hidden",
            "Pending copyright review.",
            adminContext
        );
        assert.equal(hidden.status, "hidden");

        const dbDatasetHidden = await Dataset.findById(seededDataset._id);
        assert.equal(dbDatasetHidden.status, "hidden");

        // Restore dataset
        const restored = await adminService.updateDatasetStatus(
            seededDataset._id,
            "active",
            "Copyright review cleared.",
            adminContext
        );
        assert.equal(restored.status, "active");

        const audits = await ModerationAudit.find({ targetType: "DATASET", targetId: String(seededDataset._id) }).sort({ createdAt: 1 });
        assert.equal(audits.length, 2);
        assert.equal(audits[0].action, "DATASET_HIDE");
        assert.equal(audits[1].action, "DATASET_RESTORE");
    });

    await t.test("Model Moderation: Atomically synchronizes status and active boolean with audit trail", async () => {
        const adminContext = { userId: testAdminId, role: "ADMIN" };

        // Hide model
        const hidden = await adminService.updateModelStatus(
            seededModel._id,
            "hidden",
            "Security vulnerability reported.",
            adminContext
        );
        assert.equal(hidden.status, "hidden");
        assert.equal(hidden.active, false);

        // Verify in database
        const dbModelHidden = await Model.findById(seededModel._id);
        assert.equal(dbModelHidden.status, "hidden");
        assert.equal(dbModelHidden.active, false);

        // Restore model
        const restored = await adminService.updateModelStatus(
            seededModel._id,
            "active",
            "Security patch validated.",
            adminContext
        );
        assert.equal(restored.status, "active");
        assert.equal(restored.active, true);

        const dbModelRestored = await Model.findById(seededModel._id);
        assert.equal(dbModelRestored.status, "active");
        assert.equal(dbModelRestored.active, true);

        const audits = await ModerationAudit.find({ targetType: "MODEL", targetId: String(seededModel._id) }).sort({ createdAt: 1 });
        assert.equal(audits.length, 2);
        assert.equal(audits[0].action, "MODEL_HIDE");
        assert.equal(audits[1].action, "MODEL_RESTORE");
    });

    await t.test("Report Lifecycle: Creation -> Listing -> Assignment -> Under Review -> Resolution with Audits", async () => {
        const userAContext = { userId: testUserAId, role: "USER" };
        const adminContext = { userId: testAdminId, role: "ADMIN" };

        // 1. Create Report against Dataset
        const report = await reportService.createReport(userAContext, {
            targetType: "DATASET",
            targetId: String(seededDataset._id),
            category: "MISLEADING_CONTENT",
            description: "The dataset description does not accurately describe the contents.",
            priority: "MEDIUM",
        });
        assert.equal(report.status, "OPEN");
        assert.equal(String(report.reporterId), String(testUserAId));

        // 2. Admin lists reports
        const list = await reportService.listReports({ targetType: "DATASET", status: "OPEN" });
        assert.ok(list.reports.some((r) => String(r._id) === String(report._id)));

        // 3. Admin assigns report
        const assigned = await reportService.assignReport(report._id, testAdminId, adminContext);
        assert.equal(String(assigned.assignedAdminId._id), String(testAdminId));

        // 4. Admin updates to UNDER_REVIEW
        const underReview = await reportService.updateReportStatus(
            report._id,
            { status: "UNDER_REVIEW" },
            adminContext
        );
        assert.equal(underReview.status, "UNDER_REVIEW");

        // 5. Admin resolves report
        const resolved = await reportService.updateReportStatus(
            report._id,
            { status: "RESOLVED", resolution: "Dataset owner updated descriptions to accurately reflect corpus." },
            adminContext
        );
        assert.equal(resolved.status, "RESOLVED");
        assert.ok(resolved.resolvedAt);

        // Verify audits
        const reportAudits = await ModerationAudit.find({ targetType: "REPORT", targetId: String(report._id) });
        assert.equal(reportAudits.length, 3); // assign, under_review, resolve
    });

    await t.test("Blockchain Fraud Flag Integration: Ingestion, Admin Review & No Auto-Suspension", async () => {
        const adminContext = { userId: testAdminId, role: "ADMIN" };
        const testFlagId = `FLAG_LARGE_TRANSFER_${testPrefix}`;

        // 1. Ingest structured flag emitted by blockchain monitoring
        const ingested = await fraudService.ingestFlags([
            {
                flagId: testFlagId,
                ruleId: "ABNORMAL_LARGE_TRANSFER",
                severity: "CRITICAL",
                address: seededUserA.wallet.address,
                transactionHash: "0x123abc456def789",
                description: `Transfer of 1000000 AIX exceeds critical threshold`,
                evidence: { amountRaw: "1000000000000000000000000" },
                recommendedAction: "Review wallet history and require KYC verification",
            },
        ]);
        assert.equal(ingested.length, 1);

        // 2. Admin reviews flag to CONFIRMED
        const reviewed = await fraudService.reviewFraudFlag(
            testFlagId,
            {
                status: "CONFIRMED",
                reviewNotes: "Confirmed anomalous transfer pattern from external mixer.",
            },
            adminContext
        );
        assert.equal(reviewed.status, "CONFIRMED");
        assert.equal(String(reviewed.reviewedBy._id), String(testAdminId));
        assert.ok(reviewed.reviewedAt);

        // 3. Verify user was NOT automatically suspended (human-in-the-loop requirement)
        const userAAfterReview = await User.findById(testUserAId);
        assert.equal(userAAfterReview.status, "ACTIVE", "User must NOT be automatically suspended solely due to a fraud flag");

        // 4. Verify audit trail
        const flagAudits = await ModerationAudit.find({ targetType: "FRAUD_FLAG", targetId: String(reviewed._id) });
        assert.equal(flagAudits.length, 1);
        assert.equal(flagAudits[0].action, "FRAUD_FLAG_REVIEW");
    });

    await t.test("Authoritative Treasury: Admin retrieves treasury overview without calculation duplication", async () => {
        const treasuryOverview = await treasuryService.getTreasuryOverview();
        assert.ok(treasuryOverview.observedAt);
        assert.ok(treasuryOverview.balance);
    });
});
