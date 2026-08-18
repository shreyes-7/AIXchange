import env from "../config/env.js";
import { decryptDatasetBuffer } from "./dataset.service.js";
import accessControl from "./access-control.service.js";
import ApiError from "../utils/ApiError.js";

const safeFileName = (name) => String(name || "dataset.bin").replace(/[^a-zA-Z0-9._-]/g, "_");

export const fetchAuthorizedDataset = async (user, datasetId, licenseId) => {
    const { dataset } = await accessControl.authorize(user, datasetId, licenseId);
    const cid = dataset.file?.cid;
    if (!cid) throw new ApiError(404, "Dataset file is unavailable.");
    let response;
    try { response = await fetch(`${env.PINATA_GATEWAY_URL.replace(/\/$/, "")}/${encodeURIComponent(cid)}`); }
    catch { throw new ApiError(502, "Dataset storage could not be reached."); }
    if (!response.ok) throw new ApiError(502, "Dataset storage returned an error.");
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength && contentLength > env.DATASET_MAX_UPLOAD_BYTES + 1024) throw new ApiError(413, "Dataset exceeds the configured download limit.");
    const ciphertext = Buffer.from(await response.arrayBuffer());
    try {
        return { buffer: decryptDatasetBuffer(ciphertext, dataset.file.encryption), mimeType: dataset.file.mimeType, fileName: safeFileName(dataset.file.fileName), size: dataset.file.size };
    } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(502, "Dataset decryption failed."); }
};
