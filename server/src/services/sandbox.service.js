import { v4 as uuidv4 } from "uuid";
import path from "node:path";

import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";
import {
    SANDBOX_STATUS,
    FRAMEWORK_TYPES,
    OPTIMIZER_TYPES,
    LOSS_FUNCTIONS,
} from "../utils/constants.js";
import * as sandboxRepository from "../repositories/sandbox.repository.js";
import * as executionEventRepository from "../repositories/execution-event.repository.js";
import accessControl from "./access-control.service.js";
import aiExecutionService from "./aiExecution.service.js";
import fileUploadService from "./fileUpload.service.js";

class SandboxService {
    /**
     * Creates a new sandbox instance after validating dataset entitlement via Phase 6 access control.
     */
    async createSandbox(user, { datasetId, licenseId, name = null }) {
        logger.info(`Creating sandbox for user ${user.userId} on dataset ${datasetId} and license ${licenseId}`);

        // Phase 6 Access Validation
        const access = await accessControl.authorize(user, datasetId, licenseId);

        const sandboxId = uuidv4();

        const payload = {
            sandboxId,
            userId: user.userId,
            datasetId: access.datasetId,
            licenseId: access.licenseId,
            datasetRef: access.dataset?._id || null,
            status: SANDBOX_STATUS.READY,
            metrics: {
                currentEpoch: 0,
                totalEpochs: 0,
                history: [],
            },
            files: [],
        };

        const sandbox = await sandboxRepository.create(payload);

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            eventType: "CREATED",
            message: `Sandbox initialized for dataset ${access.datasetId} with license ${access.licenseId}`,
            data: { datasetId: access.datasetId, licenseId: access.licenseId },
        });

        logger.info(`Sandbox ${sandboxId} created successfully in READY state.`);
        return sandbox;
    }

    /**
     * Retrieves a sandbox by ID with strict ownership validation.
     */
    async getSandbox(user, sandboxId) {
        const sandbox = await sandboxRepository.findById(sandboxId);
        if (!sandbox) {
            throw new ApiError(404, "Sandbox not found.");
        }

        if (sandbox.userId.toString() !== user.userId.toString() && user.role !== "admin") {
            throw new ApiError(403, "You do not have permission to view this sandbox.");
        }

        return sandbox;
    }

    /**
     * Lists sandboxes for the authenticated user with optional pagination and status filtering.
     */
    async listUserSandboxes(user, { page = 1, limit = 20, status = null } = {}) {
        return await sandboxRepository.findByUser(user.userId, { page, limit, status });
    }

    /**
     * Initiates isolated AI model training inside the sandbox.
     * Staging uploaded files into the workspace hierarchy and communicating with the AI service.
     */
    async startTraining(user, sandboxId, trainingInput = {}) {
        const sandbox = await this.getSandbox(user, sandboxId);

        // State Machine validation: prevent conflicting or invalid executions
        if (sandbox.status === SANDBOX_STATUS.RUNNING) {
            throw new ApiError(409, "Training is already in progress for this sandbox.");
        }
        if (sandbox.status === SANDBOX_STATUS.COMPLETED) {
            throw new ApiError(409, "Training has already completed for this sandbox. Create a new sandbox to retrain.");
        }

        // Generate safe execution ID matching Shreyes's contract: alphanumeric / underscores
        const executionId = `exec_${sandboxId.replace(/-/g, "_")}`;

        logger.info(`Starting training orchestration for sandbox ${sandboxId} (execution: ${executionId})`);

        // 1. Stage uploaded files to workspace so they are accessible to AI Execution
        const { stagedFiles } = await fileUploadService.stageFilesForExecution(sandboxId, executionId);

        // Find primary dataset file if present among staged files
        const stagedDataFile = stagedFiles.find((f) => f.category === "data");
        const relativeDataPath = stagedDataFile ? path.relative("./workspace", stagedDataFile.destinationPath) : null;

        // 2. Construct valid TrainingConfig schema for python-services
        const framework = trainingInput.framework || FRAMEWORK_TYPES.PYTORCH;
        const modelSpec = {
            model_type: trainingInput.modelSpec?.modelType || "mlp",
            input_dim: trainingInput.modelSpec?.inputDim || 10,
            hidden_dims: trainingInput.modelSpec?.hiddenDims || [64, 32],
            output_dim: trainingInput.modelSpec?.outputDim || 2,
            activation: trainingInput.modelSpec?.activation || "relu",
            dropout_rate: trainingInput.modelSpec?.dropoutRate ?? 0.0,
        };

        const datasetSpec = {
            dataset_id: sandbox.datasetId,
            cid: sandbox.datasetRef?.ipfs?.cid || null,
            local_path: trainingInput.dataset?.localPath || relativeDataPath || null,
            format: trainingInput.dataset?.format || "csv",
            target_column: trainingInput.dataset?.targetColumn || null,
            feature_columns: trainingInput.dataset?.featureColumns || null,
            test_split_ratio: trainingInput.dataset?.testSplitRatio ?? 0.2,
        };

        const hp = trainingInput.hyperparameters || {};
        const hyperparameters = {
            epochs: hp.epochs || 10,
            batch_size: hp.batchSize || 32,
            learning_rate: hp.learningRate || 0.001,
            optimizer: hp.optimizer || OPTIMIZER_TYPES.ADAM,
            loss_function: hp.lossFunction || LOSS_FUNCTIONS.CROSS_ENTROPY,
            weight_decay: hp.weightDecay ?? 0.0,
            grad_clip_norm: hp.gradClipNorm || null,
            lr_decay_step: hp.lrDecayStep || null,
            lr_decay_gamma: hp.lrDecayGamma ?? 0.1,
        };

        const trainingConfig = {
            execution_id: executionId,
            framework,
            model_spec: modelSpec,
            dataset: datasetSpec,
            hyperparameters,
            checkpoint_interval: trainingInput.checkpointInterval || 5,
            keep_top_k_checkpoints: trainingInput.keepTopKCheckpoints || 3,
            device: trainingInput.device || "cpu",
            timeout_seconds: trainingInput.timeoutSeconds || 3600,
            export_format: trainingInput.exportFormat || "safetensors",
        };

        // 3. Update MongoDB state to RUNNING and record executionId
        await sandboxRepository.updateStatus(sandboxId, SANDBOX_STATUS.RUNNING, {
            executionId,
            trainingConfig: {
                framework,
                modelSpec: {
                    modelType: modelSpec.model_type,
                    inputDim: modelSpec.input_dim,
                    hiddenDims: modelSpec.hidden_dims,
                    outputDim: modelSpec.output_dim,
                    activation: modelSpec.activation,
                    dropoutRate: modelSpec.dropout_rate,
                },
                dataset: {
                    datasetId: datasetSpec.dataset_id,
                    cid: datasetSpec.cid,
                    localPath: datasetSpec.local_path,
                    format: datasetSpec.format,
                    targetColumn: datasetSpec.target_column,
                    featureColumns: datasetSpec.feature_columns || [],
                    testSplitRatio: datasetSpec.test_split_ratio,
                },
                hyperparameters: {
                    epochs: hyperparameters.epochs,
                    batchSize: hyperparameters.batch_size,
                    learningRate: hyperparameters.learning_rate,
                    optimizer: hyperparameters.optimizer,
                    lossFunction: hyperparameters.loss_function,
                    weightDecay: hyperparameters.weight_decay,
                    gradClipNorm: hyperparameters.grad_clip_norm,
                    lrDecayStep: hyperparameters.lr_decay_step,
                    lrDecayGamma: hyperparameters.lr_decay_gamma,
                },
                checkpointInterval: trainingConfig.checkpoint_interval,
                keepTopKCheckpoints: trainingConfig.keep_top_k_checkpoints,
                device: trainingConfig.device,
                timeoutSeconds: trainingConfig.timeout_seconds,
                exportFormat: trainingConfig.export_format,
            },
            startedAt: new Date(),
            failureReason: null,
        });

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            executionId,
            eventType: "TRAINING_STARTED",
            message: `Initiated training execution '${executionId}' with framework '${framework}'`,
            data: { executionId, framework, epochs: hyperparameters.epochs },
        });

        // 4. Dispatch to Python AI Execution service
        try {
            const aiResponse = await aiExecutionService.startTraining(trainingConfig);

            // If the AI service returned completion/failure immediately (synchronous run)
            if (aiResponse && aiResponse.state) {
                const finalStatus = aiResponse.state;
                const updateFields = {
                    status: finalStatus,
                    lastSyncedAt: new Date(),
                };

                if (finalStatus === SANDBOX_STATUS.COMPLETED) {
                    updateFields.completedAt = new Date();
                    if (aiResponse.artifacts) {
                        updateFields.artifact = {
                            artifactPath: aiResponse.artifacts.artifact_path || null,
                            metadataPath: aiResponse.artifacts.metadata_path || null,
                            summaryPath: aiResponse.artifacts.summary_path || null,
                            artifactHash: aiResponse.validation?.model_metadata?.artifact_hash_sha256 || null,
                            modelMetadata: aiResponse.validation?.model_metadata || null,
                            validated: aiResponse.validation?.is_valid || false,
                        };
                    }
                } else if (finalStatus === SANDBOX_STATUS.FAILED || finalStatus === SANDBOX_STATUS.TIMEOUT) {
                    updateFields.completedAt = new Date();
                    updateFields.failureReason = aiResponse.message || "Training failed";
                }

                if (aiResponse.progress) {
                    updateFields.metrics = {
                        currentEpoch: aiResponse.progress.current_epoch || 0,
                        totalEpochs: aiResponse.progress.total_epochs || hyperparameters.epochs,
                        bestValLoss: aiResponse.progress.best_val_loss ?? null,
                        bestValAccuracy: aiResponse.progress.best_val_accuracy ?? null,
                        history: (aiResponse.progress.history || []).map((m) => ({
                            epoch: m.epoch,
                            trainLoss: m.train_loss,
                            trainAccuracy: m.train_accuracy,
                            valLoss: m.val_loss,
                            valAccuracy: m.val_accuracy,
                            learningRate: m.learning_rate,
                            durationSeconds: m.duration_seconds,
                            timestamp: m.timestamp,
                        })),
                    };
                }

                await sandboxRepository.updateStatus(sandboxId, finalStatus, updateFields);
            }

            return {
                sandboxId,
                executionId,
                status: aiResponse.state || SANDBOX_STATUS.RUNNING,
                message: aiResponse.message || "Training pipeline executed",
                artifacts: aiResponse.artifacts || null,
            };
        } catch (error) {
            // Failure rollback / update
            await sandboxRepository.recordFailure(sandboxId, error.message);
            await executionEventRepository.record({
                eventId: uuidv4(),
                sandboxId,
                executionId,
                eventType: "FAILED",
                message: `Training dispatch failed: ${error.message}`,
                data: { error: error.message },
            });
            throw error;
        }
    }

    /**
     * Start Jupyter session inside sandbox.
     */
    async startJupyter(user, sandboxId) {
        const sandbox = await this.getSandbox(user, sandboxId);

        const jupyterInfo = await aiExecutionService.startJupyter();

        const sessionData = {
            active: true,
            port: jupyterInfo.port,
            url: jupyterInfo.url,
            startedAt: new Date(),
            stoppedAt: null,
        };

        await sandboxRepository.updateJupyterSession(sandboxId, sessionData);

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            eventType: "JUPYTER_STARTED",
            message: `JupyterLab session started on port ${jupyterInfo.port}`,
            data: { port: jupyterInfo.port, url: jupyterInfo.url },
        });

        return sessionData;
    }

    /**
     * Stop active Jupyter session inside sandbox.
     */
    async stopJupyter(user, sandboxId) {
        const sandbox = await this.getSandbox(user, sandboxId);

        const result = await aiExecutionService.stopJupyter();

        const sessionData = {
            active: false,
            port: sandbox.jupyter?.port || null,
            url: sandbox.jupyter?.url || null,
            startedAt: sandbox.jupyter?.startedAt || null,
            stoppedAt: new Date(),
        };

        await sandboxRepository.updateJupyterSession(sandboxId, sessionData);

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            eventType: "JUPYTER_STOPPED",
            message: "JupyterLab session terminated",
            data: { stopped: result.stopped },
        });

        return sessionData;
    }

    /**
     * Get Jupyter session status.
     */
    async getJupyterStatus(user, sandboxId) {
        const sandbox = await this.getSandbox(user, sandboxId);

        try {
            const aiStatus = await aiExecutionService.getJupyterStatus();
            return {
                active: aiStatus.status === "RUNNING",
                port: aiStatus.port,
                url: aiStatus.url,
                startedAt: sandbox.jupyter?.startedAt || null,
                stoppedAt: sandbox.jupyter?.stoppedAt || null,
            };
        } catch {
            return sandbox.jupyter || { active: false, url: null };
        }
    }
}

export default new SandboxService();
export { SandboxService };
