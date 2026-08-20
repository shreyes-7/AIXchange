/**
 * AIXchange - Sandbox Workspace Layout & Staging Manager (Phase 7)
 * Strictly mirrors the directory layout expected by the AI Execution Substrate.
 * Enforces path containment to prevent path traversal and stages uploaded files
 * into the workspace hierarchy for genuine AI execution accessibility.
 */

import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { FileCategory } from "./types.js";

export class WorkspaceLayout {
    constructor(rootPath) {
        this.root = path.resolve(rootPath);
        this.input = path.join(this.root, "input");
        this.code = path.join(this.root, "code");
        this.data = path.join(this.root, "data");
        this.output = path.join(this.root, "output");
        this.checkpoints = path.join(this.root, "checkpoints");
        this.logs = path.join(this.root, "logs");
    }

    /**
     * Create all workspace subdirectories synchronously or ensure existence.
     */
    createAllSync() {
        for (const dir of [this.root, this.input, this.code, this.data, this.output, this.checkpoints, this.logs]) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
        return this;
    }

    /**
     * Create all workspace subdirectories asynchronously.
     */
    async createAll() {
        for (const dir of [this.root, this.input, this.code, this.data, this.output, this.checkpoints, this.logs]) {
            await fsp.mkdir(dir, { recursive: true });
        }
        return this;
    }

    toJSON() {
        return {
            root: this.root,
            input: this.input,
            code: this.code,
            data: this.data,
            output: this.output,
            checkpoints: this.checkpoints,
            logs: this.logs,
        };
    }
}

/**
 * Validates that an execution ID contains only safe alphanumeric/hyphen/underscore characters.
 */
export function sanitizeExecutionId(executionId) {
    if (!executionId || typeof executionId !== "string") {
        throw new Error("Invalid execution ID: must be a non-empty string.");
    }
    const sanitized = executionId.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
        throw new Error(`Invalid execution ID format: '${executionId}'. Only alphanumeric, underscores, and hyphens are permitted.`);
    }
    return sanitized;
}

/**
 * Validates that targetPath resolves strictly within baseDir to prevent path traversal attacks.
 */
export function validateContainedPath(baseDir, targetPath) {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, targetPath);

    // Ensure target begins with base path
    if (resolvedTarget !== resolvedBase && !resolvedTarget.startsWith(resolvedBase + path.sep)) {
        throw new Error(`Path traversal attempt detected: '${targetPath}' resolves outside '${baseDir}'.`);
    }
    return resolvedTarget;
}

/**
 * Maps a file category to its destination folder within the workspace layout.
 */
export function getWorkspaceDestinationForCategory(layout, category) {
    switch (category) {
        case FileCategory.CODE:
            return layout.code;
        case FileCategory.DATA:
            return layout.data;
        case FileCategory.CONFIG:
        case FileCategory.NOTEBOOK:
        case FileCategory.OTHER:
        default:
            return layout.input;
    }
}

/**
 * Stages uploaded server files into the sandbox execution workspace.
 * Ensures uploaded training scripts, data, and configs are genuinely accessible
 * to the AI Execution Substrate.
 *
 * @param {string} executionId - The sanitized execution ID
 * @param {Array<{ storagePath: string, originalName: string, category: string }>} files - Array of files to stage
 * @param {string} baseWorkspaceDir - Base directory where workspaces reside
 * @returns {Promise<{ layout: WorkspaceLayout, stagedFiles: Array<{ originalName: string, destinationPath: string, category: string }> }>}
 */
export async function stageWorkspaceFiles(executionId, files = [], baseWorkspaceDir = "./workspace") {
    const validExecId = sanitizeExecutionId(executionId);
    const workspaceRoot = validateContainedPath(baseWorkspaceDir, validExecId);
    const layout = new WorkspaceLayout(workspaceRoot);
    await layout.createAll();

    const stagedFiles = [];

    for (const file of files) {
        if (!file.storagePath || !fs.existsSync(file.storagePath)) {
            continue;
        }

        const safeFilename = path.basename(file.originalName || path.basename(file.storagePath));
        const targetDir = getWorkspaceDestinationForCategory(layout, file.category);
        const destinationPath = validateContainedPath(targetDir, safeFilename);

        // Copy the file into the workspace partition
        await fsp.copyFile(file.storagePath, destinationPath);

        stagedFiles.push({
            originalName: safeFilename,
            destinationPath,
            category: file.category || FileCategory.OTHER,
        });
    }

    return { layout, stagedFiles };
}
