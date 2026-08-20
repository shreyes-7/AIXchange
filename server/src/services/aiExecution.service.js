import {
    SandboxClient,
    ConnectionError,
    AIExecutionError,
    SandboxError,
} from "../../../sandbox/src/index.js";
import env from "../config/env.js";
import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";

class AiExecutionService {
    constructor(client = null) {
        this.client = client || new SandboxClient({
            baseUrl: env.AI_SERVICE_URL,
            timeoutMs: env.AI_SERVICE_TIMEOUT_MS,
        });
    }

    _handleError(error, context = "AI Execution") {
        logger.error(`${context} error: ${error.message}`, { details: error.details });

        if (error instanceof ConnectionError) {
            return new ApiError(
                502,
                `AI Execution Substrate is unavailable: ${error.message}`,
                error.details
            );
        }

        if (error instanceof AIExecutionError) {
            return new ApiError(
                error.statusCode || 500,
                error.message || "AI Execution Substrate returned an error.",
                error.details
            );
        }

        if (error instanceof ApiError) {
            return error;
        }

        return new ApiError(500, `${context} failed: ${error.message}`);
    }

    /**
     * Start isolated model training pipeline.
     */
    async startTraining(trainingConfig) {
        try {
            logger.info(`Dispatching training to AI execution layer: ${trainingConfig.execution_id}`);
            return await this.client.train(trainingConfig);
        } catch (error) {
            throw this._handleError(error, "Start training");
        }
    }

    /**
     * Query execution status and progress metrics.
     */
    async getStatus(executionId) {
        try {
            return await this.client.getStatus(executionId);
        } catch (error) {
            throw this._handleError(error, `Get status for ${executionId}`);
        }
    }

    /**
     * Validate exported model artifact.
     */
    async validateModel(artifactPath, metadataPath = null) {
        try {
            return await this.client.validateModel(artifactPath, metadataPath);
        } catch (error) {
            throw this._handleError(error, "Validate model artifact");
        }
    }

    /**
     * Start JupyterLab session.
     */
    async startJupyter() {
        try {
            return await this.client.startJupyter();
        } catch (error) {
            throw this._handleError(error, "Start Jupyter");
        }
    }

    /**
     * Stop active JupyterLab session.
     */
    async stopJupyter() {
        try {
            return await this.client.stopJupyter();
        } catch (error) {
            throw this._handleError(error, "Stop Jupyter");
        }
    }

    /**
     * Get JupyterLab status.
     */
    async getJupyterStatus() {
        try {
            return await this.client.getJupyterStatus();
        } catch (error) {
            throw this._handleError(error, "Get Jupyter status");
        }
    }

    /**
     * Health check utility.
     */
    async checkHealth() {
        try {
            return await this.client.checkHealth();
        } catch {
            return false;
        }
    }
}

export default new AiExecutionService();
export { AiExecutionService };
