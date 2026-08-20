/**
 * AIXchange - Sandbox Client (Phase 7)
 * HTTP client for communicating with the AI Execution Substrate (python-services).
 * Implements standard timeout management, structured error mapping,
 * and contract validation.
 */

import { defaultSandboxConfig } from "./config.js";

export class SandboxError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = "SandboxError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ConnectionError extends SandboxError {
    constructor(message, details = null) {
        super(message, 502, details);
        this.name = "ConnectionError";
    }
}

export class AIExecutionError extends SandboxError {
    constructor(message, statusCode = 500, details = null) {
        super(message, statusCode, details);
        this.name = "AIExecutionError";
    }
}

export class SandboxClient {
    /**
     * @param {Object} options
     * @param {string} [options.baseUrl] - Base URL of the AI Execution service
     * @param {number} [options.timeoutMs] - Request timeout in milliseconds
     * @param {Function} [options.fetchImpl] - Optional custom fetch implementation for testing
     */
    constructor(options = {}) {
        this.baseUrl = (options.baseUrl || defaultSandboxConfig.aiServiceUrl).replace(/\/+$/, "");
        this.timeoutMs = Number(options.timeoutMs) || defaultSandboxConfig.timeoutMs;
        this.fetchImpl = options.fetchImpl || globalThis.fetch;
    }

    /**
     * Internal request helper with timeout and error classification.
     */
    async _request(endpoint, { method = "GET", body = null, headers = {}, params = null } = {}) {
        let url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            }
            const queryStr = searchParams.toString();
            if (queryStr) {
                url += (url.includes("?") ? "&" : "?") + queryStr;
            }
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const requestOptions = {
            method,
            headers: {
                Accept: "application/json",
                ...headers,
            },
            signal: controller.signal,
        };

        if (body !== null) {
            requestOptions.headers["Content-Type"] = "application/json";
            requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        try {
            const response = await this.fetchImpl(url, requestOptions);
            clearTimeout(timer);

            let data;
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }
            }

            if (!response.ok) {
                const errorMessage = data?.detail?.message || data?.detail || data?.message || `AI Execution Service returned HTTP ${response.status}`;
                throw new AIExecutionError(
                    typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            clearTimeout(timer);

            if (error instanceof SandboxError) {
                throw error;
            }

            if (error.name === "AbortError") {
                throw new ConnectionError(
                    `AI Execution request timed out after ${this.timeoutMs}ms`,
                    { endpoint, timeoutMs: this.timeoutMs }
                );
            }

            throw new ConnectionError(
                `Failed to connect to AI Execution Substrate at ${this.baseUrl}: ${error.message}`,
                { originalError: error.message, endpoint }
            );
        }
    }

    /**
     * Start isolated model training pipeline.
     * @param {Object} config - Training configuration matching TrainingConfig schema
     * @returns {Promise<Object>} ExecutionResponse
     */
    async train(config) {
        if (!config || !config.execution_id) {
            throw new SandboxError("execution_id is required in TrainingConfig", 400);
        }
        return this._request("/api/v1/execution/train", {
            method: "POST",
            body: config,
        });
    }

    /**
     * Retrieve execution status, progress, and artifact paths.
     * @param {string} executionId - Execution identifier
     * @returns {Promise<Object>} ExecutionResponse
     */
    async getStatus(executionId) {
        if (!executionId) {
            throw new SandboxError("executionId is required", 400);
        }
        return this._request(`/api/v1/execution/${encodeURIComponent(executionId)}/status`, {
            method: "GET",
        });
    }

    /**
     * Validate a model artifact (.safetensors/.pt) and metadata.
     * @param {string} artifactPath - Path to artifact file
     * @param {string} [metadataPath] - Optional path to metadata JSON
     * @returns {Promise<Object>} ValidationResult
     */
    async validateModel(artifactPath, metadataPath = null) {
        if (!artifactPath) {
            throw new SandboxError("artifactPath is required for model validation", 400);
        }
        return this._request("/api/v1/execution/validate-model", {
            method: "POST",
            params: {
                artifact_path: artifactPath,
                metadata_path: metadataPath || undefined,
            },
        });
    }

    /**
     * Start an isolated Jupyter server inside the sandbox.
     * @returns {Promise<{ status: string, port: string, token: string, url: string }>}
     */
    async startJupyter() {
        return this._request("/api/v1/execution/jupyter/start", {
            method: "POST",
        });
    }

    /**
     * Stop the active Jupyter server.
     * @returns {Promise<{ stopped: boolean }>}
     */
    async stopJupyter() {
        return this._request("/api/v1/execution/jupyter/stop", {
            method: "POST",
        });
    }

    /**
     * Get Jupyter server lifecycle and connection status.
     * @returns {Promise<{ status: string, port: string, token: string, url: string }>}
     */
    async getJupyterStatus() {
        return this._request("/api/v1/execution/jupyter/status", {
            method: "GET",
        });
    }

    /**
     * Health check utility for the AI Execution Service.
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        try {
            await this._request("/health", { method: "GET" });
            return true;
        } catch {
            return false;
        }
    }
}
