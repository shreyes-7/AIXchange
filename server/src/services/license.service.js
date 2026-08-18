import Dataset from "../models/dataset.model.js";
import * as repository from "../repositories/license.repository.js";
import blockchain from "./licenseBlockchain.service.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const now = () => new Date();
const MAX_UINT256 = (1n << 256n) - 1n;
const toAssetId = (value) => { try { const id = BigInt(value); if (id <= 0n || id > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(); return Number(id); } catch { throw new ApiError(400, "assetId must be a positive integer representable by the backend."); } };
const walletOf = (user) => blockchain.wallet(user);
const snapshot = (license) => ({ version: license.version, fixedPrice: license.fixedPrice, royaltyRate: license.royaltyRate, metadataURI: license.metadataURI, rights: license.rights, restrictions: license.restrictions, updatedAt: license.updatedAt });
const normalizeForResponse = (license) => license?.toObject ? license.toObject() : license;

const validateAsset = async (user, assetType, assetId) => {
    if (assetType === "MODEL") throw new ApiError(501, "MODEL licensing is not supported until the Model Registry phase.");
    const dataset = await Dataset.findOne({ "blockchain.datasetId": String(assetId), status: "active" });
    if (!dataset) throw new ApiError(404, "Dataset was not found in the Phase 4 dataset registry.");
    if (String(dataset.owner) !== String(user.userId)) throw new ApiError(403, "Authenticated user does not own this dataset.");
    return dataset;
};

const validateDates = (input) => {
    const validFrom = input.validFrom ? new Date(input.validFrom) : null;
    const validUntil = input.validUntil ? new Date(input.validUntil) : null;
    if (validFrom && Number.isNaN(validFrom.getTime())) throw new ApiError(400, "validFrom is invalid.");
    if (validUntil && Number.isNaN(validUntil.getTime())) throw new ApiError(400, "validUntil is invalid.");
    if (validFrom && validUntil && validUntil < validFrom) throw new ApiError(400, "validUntil must be greater than or equal to validFrom.");
    if (validUntil && validUntil <= now()) throw new ApiError(400, "validUntil must be in the future.");
    return { validFrom, validUntil };
};

const validateUpdateTerms = (existing, input) => {
    const terms = { fixedPrice: String(input.fixedPrice ?? existing.fixedPrice), royaltyRate: input.royaltyRate ?? existing.royaltyRate, metadataURI: input.metadataURI ?? existing.metadataURI, rights: input.rights ?? existing.rights, restrictions: input.restrictions ?? existing.restrictions };
    if (!terms.metadataURI?.trim()) throw new ApiError(400, "metadataURI is required.");
    const fixedPrice = BigInt(terms.fixedPrice);
    if (fixedPrice > MAX_UINT256) throw new ApiError(400, "fixedPrice must fit in a uint256.");
    if (existing.pricingModel === "FIXED" && (fixedPrice <= 0n || terms.royaltyRate !== 0)) throw new ApiError(400, "FIXED pricing requires fixedPrice > 0 and royaltyRate = 0.");
    if (existing.pricingModel === "ROYALTY" && (fixedPrice !== 0n || terms.royaltyRate < 1 || terms.royaltyRate > 10000)) throw new ApiError(400, "ROYALTY pricing requires fixedPrice = 0 and royaltyRate between 1 and 10000 BPS.");
    return terms;
};

export const create = async (user, input) => {
    const assetId = toAssetId(input.assetId);
    const wallet = walletOf(user);
    await validateAsset(user, input.assetType, assetId);
    const dates = validateDates(input);
    if (input.assetType === "DATASET") await blockchain.assertDatasetOwner(BigInt(assetId), wallet);
    const normalized = { ...input, assetId, fixedPrice: String(input.fixedPrice || "0"), ...dates };
    logger.info("LICENSE_CREATE_REQUESTED", { userId: String(user.userId), wallet, assetId });
    const transaction = await blockchain.prepareCreate(normalized, wallet);
    return { state: "PENDING", operation: "create", transaction, request: normalized };
};

export const sync = async (user, input, operation = "create") => {
    const wallet = walletOf(user);
    const result = await blockchain.confirmTransaction(input.txHash, { operation, licenseId: input.licenseId }, wallet);
    if (result.state === "PENDING") return result;
    const chain = result.license;
    if (chain.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "License licensor does not match the authenticated wallet.");
    const existing = await repository.findByLicenseId(result.licenseId);
    const chainPayload = { ...chain, blockchain: { contractAddress: blockchain.config.registry.toLowerCase(), transactionHash: result.txHash, blockNumber: result.blockNumber, chainId: Number((await blockchain.provider().getNetwork()).chainId), state: "CONFIRMED", lastSyncedAt: now() } };
    if (existing && operation !== "create") chainPayload.versions = [...(existing.versions || []), snapshot(existing)];
    if (!existing && operation === "create") chainPayload.versions = [];
    const saved = await repository.saveConfirmed(result.licenseId, chainPayload);
    logger.info(operation === "create" ? "LICENSE_CREATED" : operation === "update" ? "LICENSE_UPDATED" : "LICENSE_REVOKED", { licenseId: result.licenseId, wallet, transactionHash: result.txHash });
    return { state: "CONFIRMED", license: normalizeForResponse(saved) };
};

export const get = async (licenseId) => { const license = await repository.findByLicenseId(licenseId); if (!license) throw new ApiError(404, "License not found."); return license; };
export const verify = async (licenseId) => { const chain = await blockchain.getLicense(licenseId); const active = await blockchain.isActive(licenseId); return { exists: true, active, license: chain, source: "blockchain" }; };

export const list = async (query) => {
    const filter = {};
    if (query.assetId !== undefined) filter.assetId = toAssetId(query.assetId);
    if (query.assetType) filter.assetType = query.assetType;
    if (query.licensor) filter.licensor = query.licensor.toLowerCase();
    if (query.licenseType) filter.licenseType = query.licenseType;
    if (query.pricingModel) filter.pricingModel = query.pricingModel;
    if (query.status) filter.status = query.status;
    if (query.version) filter.version = query.version;
    if (query.active === true) { filter.status = "ACTIVE"; filter.validFrom = { $lte: now() }; filter.$or = [{ validUntil: null }, { validUntil: { $gte: now() } }]; }
    if (query.active === false) filter.$or = [{ status: { $ne: "ACTIVE" } }, { validFrom: { $gt: now() } }, { validUntil: { $lt: now() } }];
    return repository.findMany(filter, query);
};
export const byAsset = async (assetId, query = {}) => list({ ...query, assetId, assetType: query.assetType || "DATASET" });
export const byLicensor = async (address, query = {}) => { try { address = blockchain.wallet({ wallet: { address, verified: true } }); } catch { throw new ApiError(400, "Invalid licensor wallet address."); } return list({ ...query, licensor: address }); };

export const update = async (user, licenseId, input) => {
    const wallet = walletOf(user); const existing = await repository.findByLicenseId(licenseId); if (!existing) throw new ApiError(404, "License not found.");
    if (existing.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Authenticated wallet is not the license licensor.");
    if (existing.status !== "ACTIVE") throw new ApiError(409, "Only active licenses can be updated.");
    const terms = validateUpdateTerms(existing, input); logger.info("LICENSE_UPDATE_REQUESTED", { licenseId, wallet });
    return { state: "PENDING", operation: "update", licenseId: Number(licenseId), transaction: await blockchain.prepareUpdate(licenseId, terms, wallet) };
};

export const revoke = async (user, licenseId) => { const wallet = walletOf(user); const existing = await repository.findByLicenseId(licenseId); if (!existing) throw new ApiError(404, "License not found."); if (existing.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Authenticated wallet is not the license licensor."); if (existing.status === "REVOKED") throw new ApiError(409, "License is already revoked."); logger.info("LICENSE_REVOKE_REQUESTED", { licenseId, wallet }); return { state: "PENDING", operation: "revoke", licenseId: Number(licenseId), transaction: await blockchain.prepareRevoke(licenseId, wallet) }; };

const templates = {
    ACADEMIC: { templateId: "academic-v1", templateType: "ACADEMIC", version: 1, licenseType: "ACADEMIC", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, metadataURI: "ipfs://license-template/academic-v1", rights: { canView: true, canDownload: false, canModify: false, canTrain: true, canInfer: false, canCommercialUse: false, canDistribute: false, canSublicense: false }, restrictions: "Creator-defined academic terms.", validFrom: null, validUntil: null },
    COMMERCIAL: { templateId: "commercial-v1", templateType: "COMMERCIAL", version: 1, licenseType: "COMMERCIAL", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, pricingOptions: ["FIXED", "ROYALTY"], metadataURI: "ipfs://license-template/commercial-v1", rights: { canView: true, canDownload: true, canModify: false, canTrain: true, canInfer: true, canCommercialUse: true, canDistribute: false, canSublicense: false }, restrictions: "Creator-defined commercial terms.", validFrom: null, validUntil: null },
    EXCLUSIVE: { templateId: "exclusive-v1", templateType: "EXCLUSIVE", version: 1, licenseType: "EXCLUSIVE", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, metadataURI: "ipfs://license-template/exclusive-v1", rights: { canView: true, canDownload: true, canModify: false, canTrain: true, canInfer: true, canCommercialUse: true, canDistribute: false, canSublicense: false }, restrictions: "Exclusive license configuration; ownership is unchanged.", validFrom: null, validUntil: null },
    CUSTOM: { templateId: "custom-v1", templateType: "CUSTOM", version: 1, licenseType: "CUSTOM", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, metadataURI: "ipfs://license-template/custom-v1", rights: { canView: true, canDownload: false, canModify: false, canTrain: false, canInfer: false, canCommercialUse: false, canDistribute: false, canSublicense: false }, restrictions: "Creator-defined custom terms.", validFrom: null, validUntil: null },
};
export const getTemplates = () => Object.values(templates);
export const getTemplate = (type) => { const template = templates[String(type).toUpperCase()]; if (!template) throw new ApiError(404, "License template not found."); return template; };
