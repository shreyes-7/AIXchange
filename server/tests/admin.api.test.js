import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import app from "../src/app.js";
import env from "../src/config/env.js";
import User from "../src/models/user.model.js";
import Dataset from "../src/models/dataset.model.js";
import Report from "../src/models/report.model.js";
import { generateAccessToken } from "../src/utils/jwt.js";
import { hashPassword } from "../src/utils/password.js";

test("Admin HTTP REST APIs: Authorization, Security, Input Validation & Response Sanitization", async (t) => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI);
    }

    let server;
    let baseUrl;

    const testPrefix = `api_test_${Date.now()}`;
    const dummyAdminId = new mongoose.Types.ObjectId();
    const dummyUserId = new mongoose.Types.ObjectId();
    const dummySuspendedId = new mongoose.Types.ObjectId();
    const dummyDatasetId = new mongoose.Types.ObjectId();

    let adminToken;
    let userToken;
    let suspendedToken;

    // Helper request wrapper
    const request = (path, { method = "GET", token, body } = {}) => {
        return new Promise((resolve, reject) => {
            const url = new URL(path, baseUrl);
            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const req = http.request(
                url,
                {
                    method,
                    headers,
                },
                (res) => {
                    let data = "";
                    res.on("data", (chunk) => (data += chunk));
                    res.on("end", () => {
                        try {
                            const json = JSON.parse(data);
                            resolve({ status: res.statusCode, body: json });
                        } catch {
                            resolve({ status: res.statusCode, body: data });
                        }
                    });
                }
            );

            req.on("error", reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    };

    t.before(async () => {
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;

        const passHash = await hashPassword("Password123!");

        await User.create([
            {
                _id: dummyAdminId,
                name: `${testPrefix}_Admin`,
                email: `${testPrefix}_admin@test.com`,
                passwordHash: passHash,
                role: "ADMIN",
                status: "ACTIVE",
                wallet: { address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", verified: true },
            },
            {
                _id: dummyUserId,
                name: `${testPrefix}_User`,
                email: `${testPrefix}_user@test.com`,
                passwordHash: passHash,
                role: "USER",
                status: "ACTIVE",
                wallet: { address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", verified: true },
            },
            {
                _id: dummySuspendedId,
                name: `${testPrefix}_Suspended`,
                email: `${testPrefix}_suspended@test.com`,
                passwordHash: passHash,
                role: "USER",
                status: "SUSPENDED",
            },
        ]);

        await Dataset.create({
            _id: dummyDatasetId,
            title: `${testPrefix} Dataset`,
            description: "API test dataset",
            category: "general",
            owner: dummyUserId,
            license: "MIT",
            royaltyBps: 100,
            visibility: "public",
            status: "active",
            file: {
                cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                contentHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
                size: 1024,
                fileName: "test.csv",
                mimeType: "text/csv",
                encryption: { algorithm: "aes-256-gcm", iv: "123", authTag: "456" },
            },
        });

        adminToken = generateAccessToken({ userId: dummyAdminId, role: "ADMIN" });
        userToken = generateAccessToken({ userId: dummyUserId, role: "USER" });
        suspendedToken = generateAccessToken({ userId: dummySuspendedId, role: "USER" });
    });

    t.after(async () => {
        await User.deleteMany({ _id: { $in: [dummyAdminId, dummyUserId, dummySuspendedId] } });
        await Dataset.deleteMany({ _id: dummyDatasetId });
        await Report.deleteMany({ targetId: String(dummyDatasetId) });
        await new Promise((resolve) => server.close(resolve));
        await mongoose.disconnect();
    });

    await t.test("Unauthenticated requests to admin endpoints are rejected with 401", async () => {
        const res = await request("/api/v1/admin/users");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    await t.test("Authenticated standard user (USER role) requests to admin endpoints are rejected with 403", async () => {
        const res = await request("/api/v1/admin/users", { token: userToken });
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Access denied/i);
    });

    await t.test("Suspended user token is rejected by auth middleware with 403", async () => {
        const res = await request("/api/v1/reports", {
            method: "POST",
            token: suspendedToken,
            body: {
                targetType: "DATASET",
                targetId: String(dummyDatasetId),
                category: "SPAM",
                description: "Spam reported by suspended user",
            },
        });
        assert.equal(res.status, 403);
        assert.match(res.body.message, /Account is suspended/i);
    });

    await t.test("Authenticated administrator (ADMIN role) can access admin endpoints with 200", async () => {
        const res = await request("/api/v1/admin/users", { token: adminToken });
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.users));
        assert.ok(res.body.data.pagination);
    });

    await t.test("User details response never exposes password hashes, secrets, or verification tokens", async () => {
        const res = await request(`/api/v1/admin/users/${dummyUserId}`, { token: adminToken });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.passwordHash, undefined);
        assert.equal(res.body.data.passwordResetToken, undefined);
        assert.equal(res.body.data.emailVerificationToken, undefined);
        assert.ok(res.body.data.counts);
    });

    await t.test("Audit trail is append-only: PATCH or DELETE routes on audits do not exist (404)", async () => {
        const patchRes = await request("/api/v1/admin/audits/66d9c79f9435b801a21e1111", {
            method: "PATCH",
            token: adminToken,
            body: { reason: "tampered" },
        });
        assert.equal(patchRes.status, 404);

        const deleteRes = await request("/api/v1/admin/audits/66d9c79f9435b801a21e1111", {
            method: "DELETE",
            token: adminToken,
        });
        assert.equal(deleteRes.status, 404);
    });

    await t.test("Standard authenticated user can create a report on valid target", async () => {
        const res = await request("/api/v1/reports", {
            method: "POST",
            token: userToken,
            body: {
                targetType: "DATASET",
                targetId: String(dummyDatasetId),
                category: "SPAM",
                description: "Dataset description contains advertising spam links.",
                priority: "LOW",
            },
        });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.category, "SPAM");
        assert.equal(res.body.data.status, "OPEN");
    });

    await t.test("Creating a report on non-existent target is rejected with 400", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request("/api/v1/reports", {
            method: "POST",
            token: userToken,
            body: {
                targetType: "DATASET",
                targetId: String(fakeId),
                category: "SPAM",
                description: "Reporting a non-existent dataset target.",
            },
        });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /does not exist/i);
    });
});
