/**
 * AIXchange - Sandbox SDK Configuration
 */

export const defaultSandboxConfig = Object.freeze({
    aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
    timeoutMs: Number(process.env.AI_SERVICE_TIMEOUT_MS) || 30000,
    baseWorkspaceDir: process.env.WORKSPACE_DIR || "./workspace",
});
