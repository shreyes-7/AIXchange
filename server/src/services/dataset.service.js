import crypto from "crypto";
import { ethers } from "ethers";
import mongoose from "mongoose";
import env from "../config/env.js";
import Dataset from "../models/dataset.model.js";
import ApiError from "../utils/ApiError.js";

const DATASET_REGISTRY_ABI = [
    "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId,address owner,string cid,string license,uint256 royalty,uint256 createdAt,bool active))",
    "event DatasetRegistered(uint256 indexed datasetId,address indexed owner,string cid,string license,uint256 royalty,uint256 createdAt)",
];
const registryInterface = new ethers.Interface(DATASET_REGISTRY_ABI);
const findDataset = async (id, projection) => {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid dataset ID.");
    return Dataset.findById(id).select(projection || "");
};

const encryptionKey = () => {
    if (!env.DATASET_ENCRYPTION_KEY) throw new ApiError(503, "Dataset encryption is not configured.");
    const key = Buffer.from(env.DATASET_ENCRYPTION_KEY, "base64");
    if (key.length !== 32) throw new ApiError(503, "DATASET_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
    return key;
};

const ownerFilter = (dataset, user) => {
    if (!dataset) throw new ApiError(404, "Dataset not found.");
    if (String(dataset.owner) !== String(user.userId) && user.role !== "ADMIN") throw new ApiError(403, "You do not own this dataset.");
    return dataset;
};

const publicDataset = (dataset) => {
    const item = dataset.toObject ? dataset.toObject() : dataset;
    delete item.file?.encryption;
    delete item.versions;
    delete item.reviews;
    return item;
};

const safePreview = (buffer, mimetype) => {
    if (!/^(text\/|application\/(json|csv))/.test(mimetype) || buffer.length > 512 * 1024) return null;
    try {
        const text = buffer.toString("utf8", 0, Math.min(buffer.length, 128 * 1024));
        if (mimetype.includes("json")) {
            const value = JSON.parse(text);
            const redact = (v, key = "") => {
                if (/password|secret|token|key|email|phone|address/i.test(key)) return "[redacted]";
                if (Array.isArray(v)) return v.slice(0, 5).map((x) => redact(x));
                if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).slice(0, 20).map(([k, x]) => [k, redact(x, k)]));
                return typeof v === "string" ? v.slice(0, 200) : v;
            };
            return { format: "json", sample: redact(value) };
        }
        const lines = text.split(/\r?\n/).slice(0, 6);
        const headers = (lines[0] || "").split(",");
        const sensitive = /password|secret|token|key|email|phone|address/i;
        return { format: "csv", headers: headers.map((h) => sensitive.test(h) ? "[redacted]" : h.slice(0, 100)), rows: lines.slice(1).map((line) => line.split(",").map((v, i) => sensitive.test(headers[i] || "") ? "[redacted]" : v.slice(0, 200))) };
    } catch { return { format: "text", notice: "Preview unavailable for this file format." }; }
};

export const encryptAndPin = async (file) => {
    if (!file?.buffer?.length) throw new ApiError(400, "A dataset file is required.");
    const key = encryptionKey();
    const contentHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    if (!env.PINATA_JWT) throw new ApiError(503, "Pinata is not configured.");
    const form = new FormData();
    form.append("file", new Blob([ciphertext], { type: "application/octet-stream" }), `${file.originalname}.enc`);
    form.append("pinataMetadata", JSON.stringify({ name: `${file.originalname}.enc`, keyvalues: { encrypted: "true", algorithm: "AES-256-GCM", sha256: contentHash } }));
    let response;
    try { response = await fetch(env.PINATA_API_URL, { method: "POST", headers: { Authorization: `Bearer ${env.PINATA_JWT}` }, body: form }); }
    catch { throw new ApiError(502, "Could not reach Pinata."); }
    if (!response.ok) throw new ApiError(502, "Pinata rejected the encrypted dataset upload.");
    const pinned = await response.json();
    if (!pinned.IpfsHash) throw new ApiError(502, "Pinata returned no IPFS CID.");
    return { cid: pinned.IpfsHash, contentHash, size: file.size, fileName: file.originalname, mimeType: file.mimetype || "application/octet-stream", encryption: { algorithm: "AES-256-GCM", iv: iv.toString("base64"), authTag: authTag.toString("base64") }, preview: safePreview(file.buffer, file.mimetype || "") };
};

export const create = async (user, payload) => {
    const { upload, ...metadata } = payload;
    const dataset = await Dataset.create({ ...metadata, owner: user.userId, file: { ...upload, preview: undefined }, preview: upload.preview || null, versions: [{ version: 1, changelog: "Initial version", cid: upload.cid, contentHash: upload.contentHash, encryption: upload.encryption, size: upload.size, fileName: upload.fileName }] });
    return publicDataset(dataset);
};
export const list = async (query) => {
    const { page, limit, search, category, tags, owner, visibility, sort } = query;
    const filter = { status: "active" };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (owner) filter.owner = owner;
    if (visibility) filter.visibility = visibility;
    if (tags) filter.tags = { $all: (Array.isArray(tags) ? tags : tags.split(",")).map((tag) => tag.trim().toLowerCase()).filter(Boolean) };
    const sorts = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, rating: { ratingAverage: -1, ratingCount: -1 }, title: { title: 1 } };
    const [total, datasets] = await Promise.all([Dataset.countDocuments(filter), Dataset.find(filter).sort(sorts[sort]).skip((page - 1) * limit).limit(limit).select("-reviews -versions -file.encryption")]);
    return { datasets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
export const categories = async () => Dataset.aggregate([{ $match: { status: "active" } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $project: { _id: 0, name: "$_id", count: 1 } }, { $sort: { name: 1 } }]);
export const get = async (id) => { const dataset = await findDataset(id, "-reviews -versions -file.encryption"); if (!dataset) throw new ApiError(404, "Dataset not found."); return dataset; };
export const update = async (id, user, payload) => { const dataset = ownerFilter(await findDataset(id), user); if (payload.upload) { const { upload, ...metadata } = payload; Object.assign(dataset, metadata, { file: { ...upload, preview: undefined }, preview: upload.preview || null }); } else Object.assign(dataset, payload); await dataset.save(); return publicDataset(dataset); };
export const remove = async (id, user) => { const dataset = ownerFilter(await findDataset(id), user); dataset.status = "archived"; await dataset.save(); };
export const preview = async (id) => { const dataset = await findDataset(id, "preview file.fileName file.mimeType file.size currentVersion"); if (!dataset) throw new ApiError(404, "Dataset not found."); return { ...dataset.toObject(), encrypted: true, notice: "Preview is sanitized metadata only; protected dataset content is never served." }; };
export const reviews = async (id, page = 1, limit = 20) => { const dataset = await findDataset(id, "reviews ratingAverage ratingCount"); if (!dataset) throw new ApiError(404, "Dataset not found."); await dataset.populate("reviews.user", "name"); const start = (page - 1) * limit; return { reviews: dataset.reviews.slice(start, start + limit), ratingAverage: dataset.ratingAverage, ratingCount: dataset.ratingCount, pagination: { page, limit, total: dataset.reviews.length, pages: Math.ceil(dataset.reviews.length / limit) } }; };
export const addReview = async (id, user, payload) => { const dataset = await findDataset(id); if (!dataset) throw new ApiError(404, "Dataset not found."); const existing = dataset.reviews.find((r) => String(r.user) === String(user.userId)); if (existing) { existing.rating = payload.rating; existing.comment = payload.comment; existing.updatedAt = new Date(); } else dataset.reviews.push({ ...payload, user: user.userId }); dataset.ratingCount = dataset.reviews.length; dataset.ratingAverage = dataset.ratingCount ? Number((dataset.reviews.reduce((sum, r) => sum + r.rating, 0) / dataset.ratingCount).toFixed(2)) : 0; await dataset.save(); return { ratingAverage: dataset.ratingAverage, ratingCount: dataset.ratingCount }; };
export const versions = async (id) => { const dataset = await findDataset(id, "currentVersion versions"); if (!dataset) throw new ApiError(404, "Dataset not found."); return { currentVersion: dataset.currentVersion, versions: dataset.versions.map((version) => { const item = version.toObject(); delete item.encryption; return item; }) }; };
export const addVersion = async (id, user, payload) => { const dataset = ownerFilter(await findDataset(id), user); const version = dataset.currentVersion + 1; const { upload, changelog } = payload; dataset.currentVersion = version; dataset.file = { ...upload, mimeType: dataset.file.mimeType }; dataset.versions.push({ version, changelog, cid: upload.cid, contentHash: upload.contentHash, encryption: upload.encryption, size: upload.size, fileName: upload.fileName }); await dataset.save(); return { version }; };
export const getVersion = async (id, version) => { const dataset = await findDataset(id, "versions"); if (!dataset) throw new ApiError(404, "Dataset not found."); const item = dataset.versions.find((v) => v.version === Number(version)); if (!item) throw new ApiError(404, "Dataset version not found."); const result = item.toObject(); delete result.encryption; return result; };
export const syncBlockchain = async (id, user, { blockchainDatasetId, txHash }) => {
    const dataset = ownerFilter(await findDataset(id), user);
    if (!user.wallet?.verified || !user.wallet?.address) throw new ApiError(400, "A verified wallet is required before blockchain synchronization.");
    if (!env.DATASET_REGISTRY_ADDRESS || !ethers.isAddress(env.DATASET_REGISTRY_ADDRESS)) throw new ApiError(503, "DatasetRegistry is not configured.");
    const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== env.BLOCKCHAIN_CHAIN_ID) throw new ApiError(503, "Blockchain network does not match configured chain.");
    const registry = new ethers.Contract(env.DATASET_REGISTRY_ADDRESS, DATASET_REGISTRY_ABI, provider);
    let chainDataset, receipt;
    try { [chainDataset, receipt] = await Promise.all([registry.getDataset(blockchainDatasetId), provider.getTransactionReceipt(txHash)]); } catch { throw new ApiError(400, "Could not verify the on-chain dataset registration."); }
    if (!receipt || receipt.status !== 1 || receipt.to?.toLowerCase() !== env.DATASET_REGISTRY_ADDRESS.toLowerCase()) throw new ApiError(400, "Transaction is not a successful DatasetRegistry transaction.");
    const emitted = receipt.logs.some((log) => { try { const parsed = registryInterface.parseLog(log); return log.address.toLowerCase() === env.DATASET_REGISTRY_ADDRESS.toLowerCase() && parsed?.name === "DatasetRegistered" && parsed.args.datasetId.toString() === String(blockchainDatasetId) && parsed.args.owner.toLowerCase() === user.wallet.address.toLowerCase(); } catch { return false; } });
    if (!emitted || chainDataset.owner.toLowerCase() !== user.wallet.address.toLowerCase() || chainDataset.cid !== dataset.file.cid || chainDataset.license !== dataset.license || chainDataset.royalty.toString() !== String(dataset.royaltyBps)) throw new ApiError(400, "On-chain registration does not match this dataset's CID, license, royalty, or verified wallet.");
    dataset.blockchain = { datasetId: String(blockchainDatasetId), txHash: txHash.toLowerCase(), owner: user.wallet.address.toLowerCase(), syncedAt: new Date() }; await dataset.save(); return dataset.blockchain;
};
