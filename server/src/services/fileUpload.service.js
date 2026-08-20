import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import crypto from "node:crypto";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import env from "../config/env.js";
import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";
import { SANDBOX_FILE_CATEGORIES } from "../utils/constants.js";
import * as sandboxFileRepository from "../repositories/sandbox-file.repository.js";
import * as sandboxRepository from "../repositories/sandbox.repository.js";
import * as executionEventRepository from "../repositories/execution-event.repository.js";
import {
    validateContainedPath,
    stageWorkspaceFiles,
} from "../../../sandbox/src/index.js";

const ALLOWED_EXTENSIONS = new Set([
    ".py",
    ".json",
    ".csv",
    ".parquet",
    ".ipynb",
    ".yaml",
    ".yml",
    ".txt",
    ".npy",
    ".npz",
    ".tar",
    ".gz",
    ".zip",
]);

/**
 * Calculates SHA-256 checksum of a file.
 */
export async function calculateFileChecksum(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("error", reject);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}

/**
 * Categorizes a file based on its extension or client hint.
 */
export function inferFileCategory(filename, userCategory = null) {
    if (userCategory && Object.values(SANDBOX_FILE_CATEGORIES).includes(userCategory.toLowerCase())) {
        return userCategory.toLowerCase();
    }
    const ext = path.extname(filename).toLowerCase();
    if (ext === ".py") return SANDBOX_FILE_CATEGORIES.CODE;
    if (ext === ".ipynb") return SANDBOX_FILE_CATEGORIES.NOTEBOOK;
    if (ext === ".csv" || ext === ".parquet" || ext === ".npy" || ext === ".npz") return SANDBOX_FILE_CATEGORIES.DATA;
    if (ext === ".json" || ext === ".yaml" || ext === ".yml") return SANDBOX_FILE_CATEGORIES.CONFIG;
    return SANDBOX_FILE_CATEGORIES.OTHER;
}

/**
 * Multer storage disk configuration.
 */
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const sandboxId = req.params.sandboxId || "general";
            const uploadBase = path.resolve(env.SANDBOX_UPLOAD_DIR);
            const targetDir = validateContainedPath(uploadBase, sandboxId);
            await fsp.mkdir(targetDir, { recursive: true });
            cb(null, targetDir);
        } catch (err) {
            cb(new ApiError(400, `Invalid upload directory: ${err.message}`));
        }
    },
    filename: (req, file, cb) => {
        const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniquePrefix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
        cb(null, `${uniquePrefix}_${safeOriginal}`);
    },
});

/**
 * Multer file filter enforcing security and allowed types.
 */
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(
            new ApiError(
                400,
                `Unsupported file extension '${ext}'. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`
            )
        );
    }
    cb(null, true);
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.SANDBOX_MAX_FILE_BYTES, // Aligned with DATASET_MAX_UPLOAD_BYTES
    },
});

class FileUploadService {
    /**
     * Process an uploaded file, compute checksum, persist metadata in MongoDB, and link to sandbox.
     */
    async processUpload(user, sandboxId, file, userCategory = null) {
        if (!file) {
            throw new ApiError(400, "No file uploaded.");
        }

        const sandbox = await sandboxRepository.findById(sandboxId);
        if (!sandbox) {
            // Remove uploaded file if sandbox does not exist
            if (file.path && fs.existsSync(file.path)) {
                await fsp.unlink(file.path).catch(() => {});
            }
            throw new ApiError(404, "Sandbox not found.");
        }

        // Ownership check
        if (sandbox.userId.toString() !== user.userId.toString() && user.role !== "admin") {
            if (file.path && fs.existsSync(file.path)) {
                await fsp.unlink(file.path).catch(() => {});
            }
            throw new ApiError(403, "You are not authorized to upload files to this sandbox.");
        }

        const fileId = uuidv4();
        const checksum = await calculateFileChecksum(file.path);
        const category = inferFileCategory(file.originalname, userCategory);

        const fileDoc = {
            fileId,
            sandboxId,
            userId: user.userId,
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype || "application/octet-stream",
            sizeBytes: file.size,
            storagePath: file.path,
            checksum,
            category,
        };

        const savedFile = await sandboxFileRepository.create(fileDoc);
        await sandboxRepository.addFile(sandboxId, fileDoc);

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            eventType: "FILE_UPLOADED",
            message: `Uploaded file '${file.originalname}' (${file.size} bytes)`,
            data: { fileId, originalName: file.originalname, category, checksum },
        });

        logger.info(`File uploaded successfully for sandbox ${sandboxId}: ${file.originalname} (${fileId})`);

        return savedFile;
    }

    /**
     * Delete an uploaded file from disk and database.
     */
    async deleteFile(user, sandboxId, fileId) {
        const sandbox = await sandboxRepository.findById(sandboxId);
        if (!sandbox) {
            throw new ApiError(404, "Sandbox not found.");
        }

        if (sandbox.userId.toString() !== user.userId.toString() && user.role !== "admin") {
            throw new ApiError(403, "You are not authorized to delete files from this sandbox.");
        }

        const file = await sandboxFileRepository.findById(fileId);
        if (!file || file.sandboxId !== sandboxId) {
            throw new ApiError(404, "File not found in this sandbox.");
        }

        if (file.storagePath && fs.existsSync(file.storagePath)) {
            await fsp.unlink(file.storagePath).catch((err) => {
                logger.warn(`Failed to remove file from disk: ${err.message}`);
            });
        }

        await sandboxFileRepository.deleteById(fileId);
        await sandboxRepository.removeFile(sandboxId, fileId);

        await executionEventRepository.record({
            eventId: uuidv4(),
            sandboxId,
            eventType: "FILE_DELETED",
            message: `Deleted file '${file.originalName}'`,
            data: { fileId, originalName: file.originalName },
        });

        return { deleted: true, fileId };
    }

    /**
     * Stages all uploaded files associated with a sandbox into the execution workspace layout.
     * Guarantees that the Python AI execution layer has direct access to the files.
     */
    async stageFilesForExecution(sandboxId, executionId) {
        const files = await sandboxFileRepository.findBySandbox(sandboxId);
        const baseDir = env.WORKSPACE_DIR;

        return await stageWorkspaceFiles(executionId, files, baseDir);
    }
}

export default new FileUploadService();
