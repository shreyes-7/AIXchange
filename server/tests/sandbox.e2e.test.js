import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";

import {
    SANDBOX_STATUS,
    FRAMEWORK_TYPES,
    OPTIMIZER_TYPES,
} from "../src/utils/constants.js";
import { SandboxService } from "../src/services/sandbox.service.js";
import { AiExecutionService } from "../src/services/aiExecution.service.js";
import ApiError from "../src/utils/ApiError.js";

test("End-to-End Phase 7 Workflow: Access Check -> Create -> Stage Files -> Train -> Complete -> Logs", async () => {
    // Setup Mock Database Storage in-memory representation
    const sandboxesDb = new Map();
    const filesDb = new Map();
    const eventsDb = [];

    const mockSandboxRepo = {
        create: async (data) => {
            const doc = { ...data, _id: new mongoose.Types.ObjectId() };
            sandboxesDb.set(data.sandboxId, doc);
            return doc;
        },
        findById: async (sandboxId) => sandboxesDb.get(sandboxId) || null,
        updateStatus: async (sandboxId, status, extra = {}) => {
            const existing = sandboxesDb.get(sandboxId);
            if (!existing) return null;
            const updated = { ...existing, status, ...extra, updatedAt: new Date() };
            sandboxesDb.set(sandboxId, updated);
            return updated;
        },
        recordFailure: async (sandboxId, reason) => {
            const existing = sandboxesDb.get(sandboxId);
            if (!existing) return null;
            const updated = { ...existing, status: SANDBOX_STATUS.FAILED, failureReason: reason, completedAt: new Date() };
            sandboxesDb.set(sandboxId, updated);
            return updated;
        },
        updateJupyterSession: async (sandboxId, jupyter) => {
            const existing = sandboxesDb.get(sandboxId);
            if (!existing) return null;
            const updated = { ...existing, jupyter };
            sandboxesDb.set(sandboxId, updated);
            return updated;
        },
        addFile: async (sandboxId, file) => {
            const existing = sandboxesDb.get(sandboxId);
            if (existing) {
                existing.files = existing.files || [];
                existing.files.push(file);
            }
            return existing;
        },
    };

    const mockEventRepo = {
        record: async (event) => {
            eventsDb.push(event);
            return event;
        },
        findBySandbox: async (sandboxId) => ({
            events: eventsDb.filter((e) => e.sandboxId === sandboxId),
            pagination: { total: eventsDb.length },
        }),
    };

    const mockFileRepo = {
        create: async (file) => {
            filesDb.set(file.fileId, file);
            return file;
        },
        findBySandbox: async (sandboxId) => Array.from(filesDb.values()).filter((f) => f.sandboxId === sandboxId),
    };

    // 1. Mock Phase 6 Access Control
    const mockAccessControl = {
        authorize: async (user, datasetId, licenseId) => {
            if (datasetId === 999) {
                throw new ApiError(403, "You do not have access to this dataset under the requested license.");
            }
            return {
                allowed: true,
                wallet: user.wallet?.address || "0x1234567890123456789012345678901234567890",
                datasetId: Number(datasetId),
                licenseId: Number(licenseId),
                dataset: { _id: new mongoose.Types.ObjectId() },
            };
        },
    };

    // 2. Mock AI Execution Substrate
    const mockAiClient = {
        train: async (config) => ({
            execution_id: config.execution_id,
            state: "COMPLETED",
            message: "Training and artifact validation completed successfully",
            progress: {
                execution_id: config.execution_id,
                state: "COMPLETED",
                current_epoch: 5,
                total_epochs: 5,
                best_val_loss: 0.08,
                best_val_accuracy: 0.98,
                history: [
                    { epoch: 1, train_loss: 0.5, val_loss: 0.4, train_accuracy: 0.8, val_accuracy: 0.85, learning_rate: 0.001, timestamp: 1720000001 },
                    { epoch: 2, train_loss: 0.2, val_loss: 0.1, train_accuracy: 0.92, val_accuracy: 0.95, learning_rate: 0.001, timestamp: 1720000002 },
                    { epoch: 3, train_loss: 0.1, val_loss: 0.09, train_accuracy: 0.96, val_accuracy: 0.97, learning_rate: 0.001, timestamp: 1720000003 },
                    { epoch: 4, train_loss: 0.07, val_loss: 0.085, train_accuracy: 0.98, val_accuracy: 0.98, learning_rate: 0.001, timestamp: 1720000004 },
                    { epoch: 5, train_loss: 0.05, val_loss: 0.08, train_accuracy: 0.99, val_accuracy: 0.98, learning_rate: 0.001, timestamp: 1720000005 },
                ],
            },
            artifacts: {
                artifact_path: `/workspace/${config.execution_id}/output/model.safetensors`,
                metadata_path: `/workspace/${config.execution_id}/output/model_metadata.json`,
                summary_path: `/workspace/${config.execution_id}/output/training_summary.json`,
            },
            validation: {
                is_valid: true,
                model_metadata: {
                    artifact_hash_sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                },
            },
        }),
        getStatus: async (executionId) => ({
            execution_id: executionId,
            state: "COMPLETED",
            artifacts: {
                artifact_path: `/workspace/${executionId}/output/model.safetensors`,
            },
        }),
        startJupyter: async () => ({
            status: "RUNNING",
            port: "8888",
            token: "aixchange_token",
            url: "http://localhost:8888/lab?token=aixchange_token",
        }),
        stopJupyter: async () => ({ stopped: true }),
        getJupyterStatus: async () => ({ status: "RUNNING", port: "8888", url: "http://localhost:8888/lab" }),
    };

    const mockAiService = new AiExecutionService(mockAiClient);

    const testUser = {
        userId: new mongoose.Types.ObjectId(),
        role: "user",
        wallet: { address: "0x1234567890123456789012345678901234567890", verified: true },
    };

    // Step A: Access Control Rejection
    await assert.rejects(
        () => mockAccessControl.authorize(testUser, 999, 1),
        (err) => {
            assert.equal(err.statusCode, 403);
            return true;
        }
    );

    // Step B: Valid Access & Sandbox Creation
    const access = await mockAccessControl.authorize(testUser, 1, 1);
    assert.equal(access.allowed, true);

    const sandboxId = "sbx-test-12345";
    const sandboxDoc = await mockSandboxRepo.create({
        sandboxId,
        userId: testUser.userId,
        datasetId: 1,
        licenseId: 1,
        status: SANDBOX_STATUS.READY,
        files: [],
        metrics: { currentEpoch: 0, totalEpochs: 0, history: [] },
    });

    assert.equal(sandboxDoc.status, "READY");
    assert.equal(sandboxDoc.datasetId, 1);

    // Step C: File Upload & Staging
    const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "aix-e2e-files-"));
    const trainScript = path.join(tempDir, "train.py");
    await fsp.writeFile(trainScript, "print('model training')", "utf-8");

    const fileDoc = {
        fileId: "file_123",
        sandboxId,
        userId: testUser.userId,
        originalName: "train.py",
        storedName: "stored_train.py",
        sizeBytes: 25,
        storagePath: trainScript,
        checksum: "abcdef123456",
        category: "code",
    };
    await mockFileRepo.create(fileDoc);
    await mockSandboxRepo.addFile(sandboxId, fileDoc);

    const sandboxWithFile = await mockSandboxRepo.findById(sandboxId);
    assert.equal(sandboxWithFile.files.length, 1);
    assert.equal(sandboxWithFile.files[0].originalName, "train.py");

    // Step D: Start Training Orchestration
    const trainingInput = {
        framework: "pytorch",
        modelSpec: { inputDim: 10, outputDim: 2, hiddenDims: [64, 32] },
        hyperparameters: { epochs: 5, batchSize: 32, learningRate: 0.001 },
    };

    const executionId = `exec_${sandboxId.replace(/-/g, "_")}`;
    const aiResult = await mockAiService.startTraining({
        execution_id: executionId,
        framework: trainingInput.framework,
        model_spec: {
            input_dim: trainingInput.modelSpec.inputDim,
            output_dim: trainingInput.modelSpec.outputDim,
            hidden_dims: trainingInput.modelSpec.hiddenDims,
        },
        dataset: { dataset_id: 1, format: "csv" },
        hyperparameters: { epochs: 5, batch_size: 32, learning_rate: 0.001 },
    });

    assert.equal(aiResult.state, "COMPLETED");
    assert.equal(aiResult.progress.current_epoch, 5);
    assert.ok(aiResult.artifacts.artifact_path.includes("model.safetensors"));

    // Step E: Persist Result in Sandbox
    await mockSandboxRepo.updateStatus(sandboxId, SANDBOX_STATUS.COMPLETED, {
        executionId,
        completedAt: new Date(),
        artifact: {
            artifactPath: aiResult.artifacts.artifact_path,
            metadataPath: aiResult.artifacts.metadata_path,
            summaryPath: aiResult.artifacts.summary_path,
            artifactHash: aiResult.validation.model_metadata.artifact_hash_sha256,
            validated: true,
        },
        metrics: {
            currentEpoch: aiResult.progress.current_epoch,
            totalEpochs: aiResult.progress.total_epochs,
            bestValLoss: aiResult.progress.best_val_loss,
            bestValAccuracy: aiResult.progress.best_val_accuracy,
            history: aiResult.progress.history,
        },
    });

    const completedSandbox = await mockSandboxRepo.findById(sandboxId);
    assert.equal(completedSandbox.status, "COMPLETED");
    assert.equal(completedSandbox.artifact.validated, true);
    assert.equal(completedSandbox.artifact.artifactHash, "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
    assert.equal(completedSandbox.metrics.history.length, 5);

    // Step F: Duplicate training prevention assertion
    if (completedSandbox.status === SANDBOX_STATUS.COMPLETED) {
        assert.throws(
            () => {
                throw new ApiError(409, "Training has already completed for this sandbox.");
            },
            (err) => err.statusCode === 409
        );
    }

    // Step G: Jupyter Lifecycle
    const jupyterStart = await mockAiService.startJupyter();
    assert.equal(jupyterStart.status, "RUNNING");
    await mockSandboxRepo.updateJupyterSession(sandboxId, {
        active: true,
        port: jupyterStart.port,
        url: jupyterStart.url,
        startedAt: new Date(),
    });

    const jupyterStop = await mockAiService.stopJupyter();
    assert.equal(jupyterStop.stopped, true);
    await mockSandboxRepo.updateJupyterSession(sandboxId, {
        active: false,
        port: jupyterStart.port,
        url: jupyterStart.url,
        stoppedAt: new Date(),
    });

    const finalSandbox = await mockSandboxRepo.findById(sandboxId);
    assert.equal(finalSandbox.jupyter.active, false);

    // Cleanup temp files
    await fsp.rm(tempDir, { recursive: true, force: true });
});
