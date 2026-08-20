import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";
import * as sandboxRepository from "../repositories/sandbox.repository.js";
import * as executionEventRepository from "../repositories/execution-event.repository.js";
import aiExecutionService from "./aiExecution.service.js";

class TrainingLogService {
    /**
     * Retrieves structured training logs, epoch metrics history, and execution events
     * directly from the AI execution contract and backend audit trails.
     */
    async getLogs(user, sandboxId) {
        const sandbox = await sandboxRepository.findById(sandboxId);
        if (!sandbox) {
            throw new ApiError(404, "Sandbox not found.");
        }

        if (sandbox.userId.toString() !== user.userId.toString() && user.role !== "admin") {
            throw new ApiError(403, "You do not have permission to view logs for this sandbox.");
        }

        const executionId = sandbox.executionId;
        let aiStatus = null;

        if (executionId) {
            try {
                aiStatus = await aiExecutionService.getStatus(executionId);
            } catch (err) {
                logger.warn(`Could not fetch live AI status for logs on ${executionId}: ${err.message}`);
            }
        }

        // Retrieve backend recorded events
        const { events } = await executionEventRepository.findBySandbox(sandboxId, { limit: 100 });

        // Synthesize structured human-readable log lines from epoch metrics history
        const metricHistory = aiStatus?.progress?.history || sandbox.metrics?.history || [];
        const logs = [];

        for (const m of metricHistory) {
            const trainLoss = typeof m.train_loss === "number" ? m.train_loss : m.trainLoss;
            const valLoss = typeof m.val_loss === "number" ? m.val_loss : m.valLoss;
            const trainAcc = typeof m.train_accuracy === "number" ? m.train_accuracy : m.trainAccuracy;
            const valAcc = typeof m.val_accuracy === "number" ? m.val_accuracy : m.valAccuracy;
            const lr = typeof m.learning_rate === "number" ? m.learning_rate : m.learningRate;
            const epoch = m.epoch;
            const timestamp = m.timestamp ? new Date(m.timestamp * 1000).toISOString() : new Date().toISOString();

            let logMsg = `Epoch ${epoch} - train_loss: ${trainLoss?.toFixed?.(4) ?? trainLoss}`;
            if (valLoss !== null && valLoss !== undefined) {
                logMsg += `, val_loss: ${valLoss?.toFixed?.(4) ?? valLoss}`;
            }
            if (trainAcc !== null && trainAcc !== undefined) {
                logMsg += `, train_acc: ${(trainAcc * 100).toFixed(2)}%`;
            }
            if (valAcc !== null && valAcc !== undefined) {
                logMsg += `, val_acc: ${(valAcc * 100).toFixed(2)}%`;
            }
            if (lr !== null && lr !== undefined) {
                logMsg += `, lr: ${lr}`;
            }

            logs.push({
                timestamp,
                level: "INFO",
                epoch,
                message: logMsg,
            });
        }

        // Include failure reason in log stream if present
        if (sandbox.failureReason || aiStatus?.progress?.error_message) {
            logs.push({
                timestamp: (sandbox.completedAt || new Date()).toISOString(),
                level: "ERROR",
                message: sandbox.failureReason || aiStatus.progress.error_message,
            });
        }

        return {
            sandboxId,
            executionId,
            status: aiStatus?.state || sandbox.status,
            logs,
            progress: aiStatus?.progress || {
                currentEpoch: sandbox.metrics?.currentEpoch || 0,
                totalEpochs: sandbox.metrics?.totalEpochs || 0,
                bestValLoss: sandbox.metrics?.bestValLoss,
                history: sandbox.metrics?.history || [],
            },
            metrics: sandbox.metrics,
            artifacts: aiStatus?.artifacts || sandbox.artifact,
            events: events.map((e) => ({
                eventType: e.eventType,
                message: e.message,
                timestamp: e.timestamp,
            })),
        };
    }
}

export default new TrainingLogService();
