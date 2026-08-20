import { v4 as uuidv4 } from "uuid";

import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";
import { SANDBOX_STATUS } from "../utils/constants.js";
import * as sandboxRepository from "../repositories/sandbox.repository.js";
import * as executionEventRepository from "../repositories/execution-event.repository.js";
import aiExecutionService from "./aiExecution.service.js";

class MonitoringService {
    /**
     * Synchronizes a single sandbox's execution state from the AI Execution Substrate.
     */
    async syncSandbox(sandboxId) {
        const sandbox = await sandboxRepository.findById(sandboxId);
        if (!sandbox) {
            throw new ApiError(404, "Sandbox not found.");
        }

        if (!sandbox.executionId) {
            return sandbox;
        }

        // Avoid polling already completed/cancelled sandboxes repeatedly
        if (sandbox.status === SANDBOX_STATUS.COMPLETED || sandbox.status === SANDBOX_STATUS.CANCELLED) {
            return sandbox;
        }

        try {
            const aiStatus = await aiExecutionService.getStatus(sandbox.executionId);
            const rawState = aiStatus.state;
            const mappedStatus = Object.values(SANDBOX_STATUS).includes(rawState)
                ? rawState
                : SANDBOX_STATUS.FAILED;

            const updateFields = {
                status: mappedStatus,
                lastSyncedAt: new Date(),
            };

            // Synchronize metrics
            if (aiStatus.progress) {
                updateFields.metrics = {
                    currentEpoch: aiStatus.progress.current_epoch || 0,
                    totalEpochs: aiStatus.progress.total_epochs || sandbox.metrics?.totalEpochs || 0,
                    bestValLoss: aiStatus.progress.best_val_loss ?? null,
                    bestValAccuracy: aiStatus.progress.best_val_accuracy ?? null,
                    history: (aiStatus.progress.history || []).map((m) => ({
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

            // Handle completion or failure
            if (mappedStatus === SANDBOX_STATUS.COMPLETED) {
                updateFields.completedAt = new Date();
                if (aiStatus.artifacts) {
                    updateFields.artifact = {
                        artifactPath: aiStatus.artifacts.artifact_path || null,
                        metadataPath: aiStatus.artifacts.metadata_path || null,
                        summaryPath: aiStatus.artifacts.summary_path || null,
                        artifactHash: aiStatus.validation?.model_metadata?.artifact_hash_sha256 || null,
                        modelMetadata: aiStatus.validation?.model_metadata || null,
                        validated: aiStatus.validation?.is_valid || false,
                    };
                }
            } else if (mappedStatus === SANDBOX_STATUS.FAILED || mappedStatus === SANDBOX_STATUS.TIMEOUT) {
                updateFields.completedAt = new Date();
                updateFields.failureReason = aiStatus.message || aiStatus.progress?.error_message || "Execution terminated";
            }

            const updatedSandbox = await sandboxRepository.updateStatus(sandboxId, mappedStatus, updateFields);

            // Record event if status changed
            if (sandbox.status !== mappedStatus) {
                await executionEventRepository.record({
                    eventId: uuidv4(),
                    sandboxId,
                    executionId: sandbox.executionId,
                    eventType: mappedStatus === SANDBOX_STATUS.COMPLETED ? "COMPLETED" : (mappedStatus === SANDBOX_STATUS.FAILED ? "FAILED" : "STATUS_SYNC"),
                    message: `Execution state transitioned from ${sandbox.status} to ${mappedStatus}`,
                    data: { previousStatus: sandbox.status, newStatus: mappedStatus },
                });
                logger.info(`Sandbox ${sandboxId} status updated: ${sandbox.status} -> ${mappedStatus}`);
            }

            return updatedSandbox;
        } catch (error) {
            logger.warn(`Monitoring sync failed for sandbox ${sandboxId}: ${error.message}`);
            await sandboxRepository.updateLastSyncedAt(sandboxId);
            return sandbox;
        }
    }

    /**
     * Finds all active executions and synchronizes them in batch.
     */
    async syncAllActive() {
        const activeSandboxes = await sandboxRepository.findActiveSandboxes();
        if (!activeSandboxes || activeSandboxes.length === 0) {
            return { syncedCount: 0 };
        }

        logger.debug(`Synchronizing ${activeSandboxes.length} active sandbox executions...`);

        const results = await Promise.allSettled(
            activeSandboxes.map((s) => this.syncSandbox(s.sandboxId))
        );

        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        return { syncedCount: succeeded, totalActive: activeSandboxes.length };
    }
}

export default new MonitoringService();
export { MonitoringService };
