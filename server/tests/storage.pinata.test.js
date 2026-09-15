import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import { encryptAndPin, decryptDatasetBuffer, getEncryptedFileLocally, getDatasetStoragePath } from "../src/services/dataset.service.js";

test("Pinata IPFS & persistent storage: encrypts, writes to disk, and decrypts correctly", async () => {
    const originalText = "feature1,feature2,label\n1.0,2.0,1\n3.0,4.0,0\n";
    const originalBuffer = Buffer.from(originalText, "utf8");

    const file = {
        originalname: "test-dataset.csv",
        mimetype: "text/csv",
        size: originalBuffer.length,
        buffer: originalBuffer,
    };

    // 1. Encrypt and pin (or fallback to persistent local storage)
    const result = await encryptAndPin(file);

    assert.ok(result.cid, "CID should be generated");
    assert.ok(result.contentHash, "Content hash should be generated");
    assert.equal(result.fileName, "test-dataset.csv");
    assert.equal(result.encryption.algorithm, "AES-256-GCM");
    assert.ok(result.encryption.iv, "IV should be generated");
    assert.ok(result.encryption.authTag, "Auth tag should be generated");

    // 2. Verify file is persisted to disk
    const diskPath = getDatasetStoragePath(result.cid);
    assert.ok(fs.existsSync(diskPath), `Persistent file should exist on disk at ${diskPath}`);

    const storedCiphertext = await getEncryptedFileLocally(result.cid);
    assert.ok(storedCiphertext, "Stored ciphertext should be retrievable from local storage");

    // 3. Verify decryption restores original data
    const decryptedBuffer = decryptDatasetBuffer(storedCiphertext, result.encryption);
    assert.equal(decryptedBuffer.toString("utf8"), originalText, "Decrypted buffer must match original plain text");

    // Clean up test file
    try {
        await fs.promises.unlink(diskPath);
    } catch {}
});
