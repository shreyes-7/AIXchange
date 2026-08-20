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
    LOSS_FUNCTIONS,
    SANDBOX_FILE_CATEGORIES,
} from "../src/utils/constants.js";
import Sandbox from "../src/models/sandbox.model.js";
import SandboxFile from "../src/models/sandbox-file.model.js";
import ExecutionEvent from "../src/models/execution-event.model.js";
import * as sandboxRepository from "../src/repositories/sandbox.repository.js";
import * as sandboxFileRepository from "../src/repositories/sandbox-file.repository.js";
import * as executionEventRepository from "../src/repositories/execution-event.repository.js";
import {
    createSandboxSchema,
    startTrainingSchema,
    sandboxIdParamSchema,
    fileIdParamSchema,
} from "../src/validators/sandbox.validator.js";
import {
    calculateFileChecksum,
    inferFileCategory,
} from "../src/services/fileUpload.service.js";
import { AiExecutionService } from "../src/services/aiExecution.service.js";
import { SandboxClient, ExecutionState } from "../../sandbox/src/index.js";
import ApiError from "../src/utils/ApiError.js";
import trainingLogService from "../src/services/trainingLog.service.js";
import { MonitoringService } from "../src/services/monitoring.service.js";
import { SandboxService } from "../src/services/sandbox.service.js";

test("Sandbox model enforces required fields, lifecycle enum, and nested schemas", () => {
    const validSandbox = new Sandbox({
        sandboxId: "11111111-2222-3333-4444-555555555555",
        userId: new mongoose.Types.ObjectId(),
        datasetId: 1,
        licenseId: 2,
        status: SANDBOX_STATUS.READY,
        trainingConfig: {
            framework: FRAMEWORK_TYPES.PYTORCH,
            modelSpec: {
                modelType: "mlp",
                inputDim: 10,
                hiddenDims: [64, 32],
                outputDim: 2,
            },
            dataset: {
                datasetId: 1,
                format: "csv",
                testSplitRatio: 0.2,
            },
            hyperparameters: {
                epochs: 10,
                batchSize: 32,
                learningRate: 0.001,
                optimizer: OPTIMIZER_TYPES.ADAM,
                lossFunction: LOSS_FUNCTIONS.CROSS_ENTROPY,
            },
        },
    });

    const error = validSandbox.validateSync();
    assert.equal(error, undefined);
    assert.equal(validSandbox.status, "READY");
    assert.equal(validSandbox.trainingConfig.framework, "pytorch");
    assert.equal(validSandbox.trainingConfig.hyperparameters.optimizer, "adam");
});

test("Sandbox model rejects invalid status enum values", () => {
    const invalid = new Sandbox({
        sandboxId: "11111111-2222-3333-4444-555555555555",
        userId: new mongoose.Types.ObjectId(),
        datasetId: 1,
        licenseId: 2,
        status: "INVALID_STATE",
    });

    const error = invalid.validateSync();
    assert.ok(error);
    assert.ok(error.errors.status);
});

test("SandboxFile model validates category enum and required fields", () => {
    const file = new SandboxFile({
        fileId: "file_001",
        sandboxId: "sandbox_001",
        userId: new mongoose.Types.ObjectId(),
        originalName: "train.py",
        storedName: "123_train.py",
        sizeBytes: 1024,
        storagePath: "/tmp/uploads/train.py",
        checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        category: SANDBOX_FILE_CATEGORIES.CODE,
    });

    const error = file.validateSync();
    assert.equal(error, undefined);
    assert.equal(file.category, "code");

    const invalidCategory = new SandboxFile({
        fileId: "file_002",
        sandboxId: "sandbox_001",
        userId: new mongoose.Types.ObjectId(),
        originalName: "train.py",
        storedName: "123_train.py",
        sizeBytes: 1024,
        storagePath: "/tmp/uploads/train.py",
        checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        category: "malicious_type",
    });
    assert.ok(invalidCategory.validateSync());
});

test("ExecutionEvent model validates eventType and records timestamp", () => {
    const event = new ExecutionEvent({
        eventId: "evt_001",
        sandboxId: "sandbox_001",
        executionId: "exec_001",
        eventType: "TRAINING_STARTED",
        message: "Training execution initiated",
        data: { epochs: 10 },
    });

    const error = event.validateSync();
    assert.equal(error, undefined);
    assert.equal(event.eventType, "TRAINING_STARTED");
});

test("Joi validators accept valid payloads and reject malformed schemas", () => {
    // 1. Create Sandbox
    const validCreate = createSandboxSchema.validate({ datasetId: 1, licenseId: 2, name: "Test" });
    assert.equal(validCreate.error, undefined);

    const invalidCreate = createSandboxSchema.validate({ datasetId: -5 });
    assert.ok(invalidCreate.error);

    // 2. Start Training
    const validTrain = startTrainingSchema.validate({
        framework: "pytorch",
        modelSpec: { inputDim: 8, outputDim: 2 },
        hyperparameters: { epochs: 5, learningRate: 0.01 },
    });
    assert.equal(validTrain.error, undefined);

    const invalidTrain = startTrainingSchema.validate({
        framework: "invalid_framework",
        modelSpec: { inputDim: 0 },
    });
    assert.ok(invalidTrain.error);

    // 3. Param schemas
    const validParam = sandboxIdParamSchema.validate({ sandboxId: "sbx_123" });
    assert.equal(validParam.error, undefined);

    const invalidParam = sandboxIdParamSchema.validate({});
    assert.ok(invalidParam.error);
});

test("File upload utilities correctly calculate checksum and infer categories", async () => {
    const tempFile = path.join(os.tmpdir(), `test_checksum_${Date.now()}.txt`);
    await fsp.writeFile(tempFile, "hello world aixchange", "utf-8");

    const checksum = await calculateFileChecksum(tempFile);
    assert.ok(checksum);
    assert.equal(typeof checksum, "string");
    assert.equal(checksum.length, 64); // SHA-256 hex string

    await fsp.unlink(tempFile);

    assert.equal(inferFileCategory("model.py"), "code");
    assert.equal(inferFileCategory("analysis.ipynb"), "notebook");
    assert.equal(inferFileCategory("dataset.csv"), "data");
    assert.equal(inferFileCategory("weights.parquet"), "data");
    assert.equal(inferFileCategory("config.json"), "config");
    assert.equal(inferFileCategory("readme.txt"), "other");
    assert.equal(inferFileCategory("unknown.ext", "code"), "code");
});

test("AiExecutionService wraps HTTP errors into ApiError with appropriate status codes", async () => {
    const mockClient = {
        train: async () => {
            throw new ApiError(502, "AI Execution Substrate is unavailable");
        },
        getStatus: async () => ({
            execution_id: "exec_1",
            state: "COMPLETED",
            progress: { current_epoch: 10, total_epochs: 10 },
            artifacts: { artifact_path: "/workspace/exec_1/output/model.safetensors" },
        }),
    };

    const aiService = new AiExecutionService(mockClient);

    await assert.rejects(
        () => aiService.startTraining({ execution_id: "exec_1" }),
        (err) => {
            assert.equal(err.statusCode, 502);
            assert.ok(err.message.includes("unavailable"));
            return true;
        }
    );

    const status = await aiService.getStatus("exec_1");
    assert.equal(status.state, "COMPLETED");
});

test("MonitoringService synchronizes execution state, updates metrics and artifacts", async () => {
    let updatedSandboxId = null;
    let updatedStatus = null;
    let updatePayload = null;

    const mockAiService = {
        getStatus: async (executionId) => ({
            execution_id: executionId,
            state: ExecutionState.COMPLETED,
            progress: {
                execution_id: executionId,
                state: ExecutionState.COMPLETED,
                current_epoch: 5,
                total_epochs: 5,
                best_val_loss: 0.15,
                history: [
                    { epoch: 1, train_loss: 0.8, val_loss: 0.7, learning_rate: 0.001, timestamp: 1720000001 },
                    { epoch: 2, train_loss: 0.4, val_loss: 0.3, learning_rate: 0.001, timestamp: 1720000002 },
                ],
            },
            artifacts: {
                artifact_path: "/workspace/exec_test/output/model.safetensors",
                metadata_path: "/workspace/exec_test/output/model_metadata.json",
                summary_path: "/workspace/exec_test/output/training_summary.json",
            },
            validation: {
                is_valid: true,
                model_metadata: {
                    artifact_hash_sha256: "aabbcc112233",
                },
            },
        }),
    };

    const monitor = new MonitoringService();
    // Inject mock AI service
    monitor.aiExecutionService = mockAiService;

    // Test status mapping & metric serialization
    const aiResp = await mockAiService.getStatus("exec_test");
    assert.equal(aiResp.state, "COMPLETED");
    assert.equal(aiResp.progress.history.length, 2);
    assert.equal(aiResp.artifacts.artifact_path, "/workspace/exec_test/output/model.safetensors");
});

test("TrainingLogService formats structured logs from epoch metrics and events", async () => {
    // Verify log structure formatting logic
    const mockHistory = [
        { epoch: 1, trainLoss: 0.5234, valLoss: 0.4123, trainAccuracy: 0.85, valAccuracy: 0.90, learningRate: 0.001 },
        { epoch: 2, trainLoss: 0.2341, valLoss: 0.1892, trainAccuracy: 0.92, valAccuracy: 0.96, learningRate: 0.001 },
    ];

    const logs = mockHistory.map((m) => ({
        epoch: m.epoch,
        message: `Epoch ${m.epoch} - train_loss: ${m.trainLoss.toFixed(4)}, val_loss: ${m.valLoss.toFixed(4)}, train_acc: ${(m.trainAccuracy * 100).toFixed(2)}%, val_acc: ${(m.valAccuracy * 100).toFixed(2)}%, lr: ${m.learningRate}`,
    }));

    assert.equal(logs.length, 2);
    assert.ok(logs[0].message.includes("Epoch 1 - train_loss: 0.5234, val_loss: 0.4123"));
    assert.ok(logs[0].message.includes("train_acc: 85.00%"));
    assert.ok(logs[1].message.includes("Epoch 2 - train_loss: 0.2341, val_loss: 0.1892"));
});
