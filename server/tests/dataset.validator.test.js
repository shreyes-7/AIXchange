import test from "node:test";
import assert from "node:assert/strict";
import Dataset from "../src/models/dataset.model.js";
import { createDatasetSchema, reviewSchema } from "../src/validators/dataset.validator.js";

const upload = {
    cid: "bafybeigdyrzt5example",
    contentHash: "a".repeat(64),
    size: 42,
    fileName: "dataset.csv",
    mimeType: "text/csv",
    encryption: { algorithm: "AES-256-GCM", iv: "iv", authTag: "tag" },
    preview: { format: "csv", headers: ["name"] },
};

test("dataset creation requires encrypted upload metadata", () => {
    const valid = createDatasetSchema.validate({ title: "Sample data", category: "vision", license: "CC-BY-4.0", upload });
    assert.equal(valid.error, undefined);
    assert.equal(valid.value.visibility, "protected");
    assert.equal(valid.value.royaltyBps, 0);
    const invalid = createDatasetSchema.validate({ title: "Sample data", category: "vision", license: "CC-BY-4.0", upload: { cid: "plaintext" } });
    assert.ok(invalid.error);
});

test("review ratings are constrained to one through five", () => {
    assert.equal(reviewSchema.validate({ rating: 5, comment: "Useful" }).error, undefined);
    assert.ok(reviewSchema.validate({ rating: 6 }).error);
});

test("dataset model defaults protected files and keeps encryption metadata", () => {
    const dataset = new Dataset({ title: "Sample data", category: "vision", owner: "507f1f77bcf86cd799439011", license: "MIT", file: upload });
    assert.equal(dataset.visibility, "protected");
    assert.equal(dataset.file.encryption.algorithm, "AES-256-GCM");
    assert.equal(dataset.currentVersion, 1);
});
