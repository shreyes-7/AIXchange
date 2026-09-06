import env from "../config/env.js";
import logger from "../config/logger.js";
import { decryptDatasetBuffer } from "./dataset.service.js";
import accessControl from "./access-control.service.js";
import ApiError from "../utils/ApiError.js";
import Download from "../models/download.model.js";

const safeFileName = (name) => String(name || "dataset.bin").replace(/[^a-zA-Z0-9._-]/g, "_");

const recordDownloadAsync = (payload) => {
    Promise.resolve().then(async () => {
        try {
            await Download.create(payload);
        } catch (err) {
            logger.warn(`Analytics download tracking failed: ${err.message}`);
        }
    });
};

export const fetchAuthorizedDataset = async (user, datasetId, licenseId) => {
    let dataset = null;
    try {
        const authResult = await accessControl.authorize(user, datasetId, licenseId);
        dataset = authResult.dataset;
        const cid = dataset.file?.cid;
        if (!cid) {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset?._id || null,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "NOT_FOUND",
            });
            throw new ApiError(404, "Dataset file is unavailable.");
        }

        let response;
        try {
            response = await fetch(`${env.PINATA_GATEWAY_URL.replace(/\/$/, "")}/${encodeURIComponent(cid)}`);
        } catch {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset?._id || null,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "STORAGE_ERROR",
            });
            throw new ApiError(502, "Dataset storage could not be reached.");
        }

        if (!response.ok) {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset?._id || null,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "STORAGE_ERROR",
            });
            throw new ApiError(502, "Dataset storage returned an error.");
        }

        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength && contentLength > env.DATASET_MAX_UPLOAD_BYTES + 1024) {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset?._id || null,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "PAYLOAD_TOO_LARGE",
            });
            throw new ApiError(413, "Dataset exceeds the configured download limit.");
        }

        const ciphertext = Buffer.from(await response.arrayBuffer());
        try {
            const buffer = decryptDatasetBuffer(ciphertext, dataset.file.encryption);
            const fileName = safeFileName(dataset.file.fileName);
            const size = dataset.file.size;

            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset._id,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                fileName,
                fileSize: size,
                status: "SUCCESS",
            });

            return { buffer, mimeType: dataset.file.mimeType, fileName, size };
        } catch (error) {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                datasetRef: dataset?._id || null,
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "DECRYPTION_ERROR",
            });
            if (error instanceof ApiError) throw error;
            throw new ApiError(502, "Dataset decryption failed.");
        }
    } catch (error) {
        if (!dataset && error?.statusCode === 403) {
            recordDownloadAsync({
                datasetId: Number(datasetId),
                userId: user?._id || user?.userId || null,
                userWallet: user?.wallet?.address || null,
                status: "FAILED",
                errorCode: "UNAUTHORIZED",
            });
        }
        throw error;
    }
};

