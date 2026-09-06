import crypto from "crypto";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import * as repository from "../repositories/model.repository.js";
import blockchain from "./modelBlockchain.service.js";
import aiExecutionService from "./aiExecution.service.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";
import InferenceCall from "../models/inference-call.model.js";

const now = () => new Date();
const walletOf = (user) => blockchain.wallet(user);

const resolveModel = async (idOrBlockchainId) => {
    let model = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrBlockchainId);

    if (isObjectId) {
        model = await repository.findById(idOrBlockchainId);
    }
    if (!model && !isNaN(Number(idOrBlockchainId))) {
        model = await repository.findByBlockchainId(Number(idOrBlockchainId));
    }
    if (!model) {
        throw new ApiError(404, `Model '${idOrBlockchainId}' not found.`);
    }
    return model;
};

const sanitizeArtifactPath = (artifactPath) => {
    if (!artifactPath || typeof artifactPath !== "string") {
        throw new ApiError(400, "Artifact path is required and must be a string.");
    }
    const cleanPath = path.normalize(artifactPath).replace(/^(\.\.[\/\\])+/, "");
    if (cleanPath.includes("..") || path.isAbsolute(cleanPath)) {
        throw new ApiError(400, "Invalid artifact path: directory traversal and absolute paths are forbidden.");
    }
    const basePath = path.resolve(process.cwd(), env.WORKSPACE_DIR || "../python-services/workspace");
    const fullPath = path.resolve(basePath, cleanPath);
    if (!fullPath.startsWith(basePath)) {
        throw new ApiError(403, "Access to file outside the authorized workspace directory is forbidden.");
    }
    return fullPath;
};

const calculateFileSha256 = async (filePath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(new ApiError(404, `Artifact file not found at ${filePath}`));
        }
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex").toLowerCase()));
        stream.on("error", (err) => reject(new ApiError(500, `Failed to hash artifact: ${err.message}`)));
    });
};

class ModelService {
    async create(user, input) {
        const wallet = walletOf(user);
        const existing = await repository.findByNameAndOwner(input.name, wallet);
        if (existing) {
            throw new ApiError(409, `You already have a model named '${input.name}'.`);
        }

        const initialVersion = {
            versionNumber: 1,
            modelHash: input.modelHash.toLowerCase(),
            metadataURI: input.metadataURI,
            artifactPath: input.artifactPath || null,
            fileSize: input.fileSize || 0,
            changelog: input.changelog || "Initial model version (v1)",
            createdAt: now(),
            active: true,
        };

        const modelRecord = await repository.createModel({
            owner: user.userId,
            ownerWallet: wallet.toLowerCase(),
            name: input.name.trim(),
            description: input.description || "",
            category: input.category.toLowerCase().trim(),
            tags: input.tags || [],
            framework: input.framework || "PyTorch",
            modelType: input.modelType || "general",
            metadataURI: input.metadataURI,
            currentVersion: 1,
            totalVersions: 1,
            active: true,
            versions: [initialVersion],
            blockchain: {
                contractAddress: blockchain.config.registry.toLowerCase(),
                transactionHash: null,
                blockNumber: null,
                chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                state: "PREPARED",
                lastSyncedAt: now(),
            },
            inferenceConfig: input.inferenceConfig || {},
        });

        logger.info("MODEL_REGISTRATION_REQUESTED", {
            userId: String(user.userId),
            wallet,
            name: input.name,
        });

        const transaction = await blockchain.prepareRegister(
            input.name,
            input.metadataURI,
            input.modelHash,
            wallet
        );

        return {
            state: "PREPARED",
            operation: "register",
            transaction,
            model: modelRecord,
        };
    }

    async sync(user, input) {
        const wallet = walletOf(user);
        const op = input.operation || "register";

        const result = await blockchain.confirmTransaction(
            input.txHash,
            { operation: op, modelId: input.modelId },
            wallet
        );

        if (result.state === "PENDING") {
            return result;
        }

        const blockchainModelId = result.modelId;
        const chainModel = result.model;

        if (op === "register") {
            let model = await repository.findByNameAndOwner(chainModel.name, wallet);
            if (!model && input.modelId) {
                model = await repository.findByBlockchainId(blockchainModelId);
            }

            const initialVersion = {
                versionNumber: 1,
                modelHash: result.event.args.modelHash.toLowerCase(),
                metadataURI: chainModel.metadataURI,
                artifactPath: null,
                fileSize: 0,
                changelog: "Initial version (v1)",
                createdAt: chainModel.createdAt,
                active: true,
            };

            const payload = {
                blockchainModelId,
                owner: user.userId,
                ownerWallet: chainModel.owner.toLowerCase(),
                name: chainModel.name,
                description: model?.description || "",
                category: model?.category || "general",
                tags: model?.tags || [],
                framework: model?.framework || "PyTorch",
                modelType: model?.modelType || "general",
                metadataURI: chainModel.metadataURI,
                currentVersion: 1,
                totalVersions: 1,
                active: chainModel.active,
                versions: model?.versions?.length ? model.versions : [initialVersion],
                blockchain: {
                    contractAddress: blockchain.config.registry.toLowerCase(),
                    transactionHash: result.txHash,
                    blockNumber: result.blockNumber,
                    chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                    state: "CONFIRMED",
                    lastSyncedAt: now(),
                },
            };

            const saved = await repository.saveConfirmed(blockchainModelId, payload);
            logger.info("MODEL_REGISTERED_CONFIRMED", {
                modelId: blockchainModelId,
                wallet,
                transactionHash: result.txHash,
            });
            return { state: "CONFIRMED", model: saved };
        }

        if (op === "addVersion") {
            const versionNumber = Number(result.event.args.versionNumber);
            const versionHash = result.event.args.modelHash.toLowerCase();
            const metadataURI = result.event.args.metadataURI;

            const updated = await repository.addVersion(blockchainModelId, {
                versionNumber,
                modelHash: versionHash,
                metadataURI,
                artifactPath: null,
                fileSize: 0,
                changelog: `Version v${versionNumber}`,
                createdAt: now(),
                active: true,
            });

            logger.info("MODEL_VERSION_CONFIRMED", {
                modelId: blockchainModelId,
                versionNumber,
                transactionHash: result.txHash,
            });
            return { state: "CONFIRMED", model: updated };
        }

        if (op === "setStatus") {
            const active = chainModel.active;
            const updated = await repository.updateStatus(blockchainModelId, active);
            logger.info("MODEL_STATUS_CONFIRMED", {
                modelId: blockchainModelId,
                active,
                transactionHash: result.txHash,
            });
            return { state: "CONFIRMED", model: updated };
        }

        if (op === "transferOwnership") {
            const newOwner = chainModel.owner.toLowerCase();
            const updated = await repository.updateOwnership(blockchainModelId, newOwner);
            logger.info("MODEL_OWNERSHIP_CONFIRMED", {
                modelId: blockchainModelId,
                newOwner,
                transactionHash: result.txHash,
            });
            return { state: "CONFIRMED", model: updated };
        }

        throw new ApiError(400, `Unsupported synchronization operation '${op}'.`);
    }

    async get(idOrBlockchainId) {
        const model = await resolveModel(idOrBlockchainId);
        let onChain = null;

        if (model.blockchainModelId) {
            try {
                onChain = await blockchain.getModel(model.blockchainModelId);
            } catch {
                // gracefully allow off-chain read if RPC is temporarily unavailable
            }
        }

        return {
            ...(model.toObject ? model.toObject() : model),
            onChainVerified: Boolean(onChain),
            onChainState: onChain,
        };
    }

    async list(query) {
        const filter = {};

        if (query.category) {
            filter.category = query.category.toLowerCase().trim();
        }
        if (query.framework) {
            filter.framework = query.framework;
        }
        if (typeof query.active === "boolean") {
            filter.active = query.active;
        }
        if (query.owner) {
            filter.ownerWallet = query.owner.toLowerCase().trim();
        }
        if (query.search && query.search.trim()) {
            return repository.search(query.search, filter, query);
        }

        return repository.findMany(filter, query);
    }

    async search(query) {
        const filter = {};
        if (typeof query.active === "boolean") {
            filter.active = query.active;
        }
        if (query.category) {
            filter.category = query.category.toLowerCase().trim();
        }
        if (query.framework) {
            filter.framework = query.framework;
        }
        return repository.search(query.search || "", filter, query);
    }

    async byOwner(ownerAddress, query = {}) {
        try {
            const cleanAddress = ethers.getAddress(ownerAddress).toLowerCase();
            return repository.findByOwner(cleanAddress, query);
        } catch {
            throw new ApiError(400, "Invalid owner wallet address.");
        }
    }

    async update(user, idOrBlockchainId, input) {
        const wallet = walletOf(user);
        const model = await resolveModel(idOrBlockchainId);

        if (model.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet is not the owner of this model.");
        }

        if (model.blockchainModelId) {
            const onChainOwner = await blockchain.getModelOwner(model.blockchainModelId);
            if (onChainOwner.toLowerCase() !== wallet.toLowerCase()) {
                throw new ApiError(403, "Authenticated wallet does not match on-chain model owner.");
            }
        }

        const payload = {};
        if (input.description !== undefined) payload.description = input.description;
        if (input.category !== undefined) payload.category = input.category.toLowerCase().trim();
        if (input.tags !== undefined) payload.tags = input.tags;
        if (input.framework !== undefined) payload.framework = input.framework;
        if (input.modelType !== undefined) payload.modelType = input.modelType;
        if (input.inferenceConfig !== undefined) payload.inferenceConfig = input.inferenceConfig;

        return repository.updateMetadata(model._id, payload);
    }

    async getVersions(idOrBlockchainId) {
        const model = await resolveModel(idOrBlockchainId);
        return {
            modelId: model.blockchainModelId || model._id,
            currentVersion: model.currentVersion,
            totalVersions: model.totalVersions,
            versions: model.versions || [],
        };
    }

    async getVersion(idOrBlockchainId, versionNumber) {
        const model = await resolveModel(idOrBlockchainId);
        const targetVer = Number(versionNumber);
        const versionRecord = model.versions?.find((v) => v.versionNumber === targetVer);

        if (!versionRecord) {
            throw new ApiError(404, `Version ${targetVer} not found for model '${idOrBlockchainId}'.`);
        }

        return {
            modelId: model.blockchainModelId || model._id,
            version: versionRecord,
        };
    }

    async addVersion(user, idOrBlockchainId, input) {
        const wallet = walletOf(user);
        const model = await resolveModel(idOrBlockchainId);

        if (!model.blockchainModelId) {
            throw new ApiError(400, "Model must be confirmed on-chain before adding new versions.");
        }

        const onChainOwner = await blockchain.getModelOwner(model.blockchainModelId);
        if (onChainOwner.toLowerCase() !== wallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const isActive = await blockchain.isModelActive(model.blockchainModelId);
        if (!isActive) {
            throw new ApiError(409, `Model #${model.blockchainModelId} is inactive on-chain.`);
        }

        const latestVersion = await blockchain.getLatestVersion(model.blockchainModelId);
        if (latestVersion.modelHash.toLowerCase() === input.modelHash.toLowerCase()) {
            throw new ApiError(
                409,
                `Version hash is identical to current version ${latestVersion.versionNumber} hash.`
            );
        }

        const transaction = await blockchain.prepareAddVersion(
            model.blockchainModelId,
            input.metadataURI,
            input.modelHash,
            wallet
        );

        return {
            state: "PREPARED",
            operation: "addVersion",
            modelId: model.blockchainModelId,
            transaction,
        };
    }

    async setStatus(user, idOrBlockchainId, active) {
        const wallet = walletOf(user);
        const model = await resolveModel(idOrBlockchainId);

        if (!model.blockchainModelId) {
            throw new ApiError(400, "Model must be confirmed on-chain before toggling status.");
        }

        const onChainOwner = await blockchain.getModelOwner(model.blockchainModelId);
        if (onChainOwner.toLowerCase() !== wallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const transaction = await blockchain.prepareSetStatus(
            model.blockchainModelId,
            active,
            wallet
        );

        return {
            state: "PREPARED",
            operation: "setStatus",
            modelId: model.blockchainModelId,
            active: Boolean(active),
            transaction,
        };
    }

    async transferOwnership(user, idOrBlockchainId, newOwner) {
        const wallet = walletOf(user);
        const model = await resolveModel(idOrBlockchainId);

        if (!model.blockchainModelId) {
            throw new ApiError(400, "Model must be confirmed on-chain before transferring ownership.");
        }

        const onChainOwner = await blockchain.getModelOwner(model.blockchainModelId);
        if (onChainOwner.toLowerCase() !== wallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const transaction = await blockchain.prepareTransferOwnership(
            model.blockchainModelId,
            newOwner,
            wallet
        );

        return {
            state: "PREPARED",
            operation: "transferOwnership",
            modelId: model.blockchainModelId,
            newOwner,
            transaction,
        };
    }

    async verifyHash(idOrBlockchainId, { versionNumber, expectedHash, artifactPath }) {
        const model = await resolveModel(idOrBlockchainId);
        const targetVer = Number(versionNumber);
        const versionRecord = model.versions?.find((v) => v.versionNumber === targetVer);

        if (!versionRecord) {
            throw new ApiError(404, `Version ${targetVer} not found on model record.`);
        }

        let hashToVerify = expectedHash ? expectedHash.toLowerCase().trim() : null;

        if (artifactPath) {
            const safePath = sanitizeArtifactPath(artifactPath);
            hashToVerify = await calculateFileSha256(safePath);
        }

        if (!hashToVerify) {
            throw new ApiError(400, "Either expectedHash or artifactPath must be provided for verification.");
        }

        if (!model.blockchainModelId) {
            const match = hashToVerify === versionRecord.modelHash.toLowerCase();
            return {
                verified: match,
                match,
                source: "offchain_draft",
                modelId: model._id,
                versionNumber: targetVer,
                expectedHash: hashToVerify,
                recordedHash: versionRecord.modelHash,
            };
        }

        const onChainVersion = await blockchain.getVersion(model.blockchainModelId, targetVer);
        const matchesOnChain = await blockchain.verifyModelHash(
            model.blockchainModelId,
            targetVer,
            hashToVerify
        );

        return {
            verified: matchesOnChain,
            match: matchesOnChain,
            source: "blockchain_authoritative",
            modelId: model.blockchainModelId,
            versionNumber: targetVer,
            computedHash: hashToVerify,
            onChainHash: onChainVersion.modelHash,
        };
    }

    async infer(user, idOrBlockchainId, payload) {
        const startTime = Date.now();
        let model = null;
        let targetVersionNumber = 1;
        let device = "cpu";
        let status = "SUCCESS";
        let errorCode = null;

        const recordInferenceAsync = (finalStatus, finalErrorCode) => {
            const executionTimeMs = Date.now() - startTime;
            Promise.resolve().then(async () => {
                try {
                    if (model?._id) {
                        await InferenceCall.create({
                            modelRef: model._id,
                            modelId: model.blockchainModelId ?? null,
                            modelVersion: targetVersionNumber,
                            userId: user?._id || user?.userId || null,
                            userWallet: user?.wallet?.address || null,
                            device,
                            status: finalStatus,
                            executionTimeMs,
                            errorCode: finalErrorCode,
                        });
                    }
                } catch (err) {
                    logger.warn(`Analytics inference tracking failed: ${err.message}`);
                }
            });
        };

        try {
            model = await resolveModel(idOrBlockchainId);

            if (!model.active) {
                errorCode = "INACTIVE";
                recordInferenceAsync("FAILED", errorCode);
                throw new ApiError(409, `Model '${model.name}' is inactive and cannot execute inference.`);
            }

            if (model.blockchainModelId) {
                const isChainActive = await blockchain.isModelActive(model.blockchainModelId);
                if (!isChainActive) {
                    errorCode = "INACTIVE";
                    recordInferenceAsync("FAILED", errorCode);
                    throw new ApiError(409, `Model #${model.blockchainModelId} is inactive on-chain.`);
                }
            }

            targetVersionNumber = payload.versionNumber ? Number(payload.versionNumber) : model.currentVersion;
            const versionRecord = model.versions?.find((v) => v.versionNumber === targetVersionNumber);
            if (!versionRecord) {
                errorCode = "NOT_FOUND";
                recordInferenceAsync("FAILED", errorCode);
                throw new ApiError(404, `Model version ${targetVersionNumber} not found.`);
            }
            if (!versionRecord.active) {
                errorCode = "INACTIVE";
                recordInferenceAsync("FAILED", errorCode);
                throw new ApiError(409, `Model version ${targetVersionNumber} is inactive.`);
            }

            const rawArtifact = versionRecord.artifactPath || `${model.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_v${targetVersionNumber}.safetensors`;
            const safeArtifactPath = sanitizeArtifactPath(rawArtifact);

            device = payload.device || model.inferenceConfig?.device || "cpu";

            const inferenceRequest = {
                model_artifact_path: safeArtifactPath,
                inputs: payload.inputs,
                device,
                return_probabilities: payload.return_probabilities ?? true,
                top_k: payload.top_k,
            };

            const result = await aiExecutionService.runInference(inferenceRequest);

            recordInferenceAsync("SUCCESS", null);

            return {
                modelId: model.blockchainModelId || model._id,
                modelName: model.name,
                version: targetVersionNumber,
                modelHash: versionRecord.modelHash,
                execution: result,
            };
        } catch (error) {
            if (!errorCode) {
                errorCode = error?.statusCode === 408 ? "TIMEOUT" : "EXECUTION_ERROR";
                recordInferenceAsync("FAILED", errorCode);
            }
            throw error;
        }
    }
}

const serviceInstance = new ModelService();

export const create = (user, input) => serviceInstance.create(user, input);
export const sync = (user, input) => serviceInstance.sync(user, input);
export const get = (id) => serviceInstance.get(id);
export const list = (query) => serviceInstance.list(query);
export const search = (query) => serviceInstance.search(query);
export const byOwner = (address, query) => serviceInstance.byOwner(address, query);
export const update = (user, id, input) => serviceInstance.update(user, id, input);
export const getVersions = (id) => serviceInstance.getVersions(id);
export const getVersion = (id, ver) => serviceInstance.getVersion(id, ver);
export const addVersion = (user, id, input) => serviceInstance.addVersion(user, id, input);
export const setStatus = (user, id, active) => serviceInstance.setStatus(user, id, active);
export const transferOwnership = (user, id, newOwner) => serviceInstance.transferOwnership(user, id, newOwner);
export const verifyHash = (id, input) => serviceInstance.verifyHash(id, input);
export const infer = (user, id, payload) => serviceInstance.infer(user, id, payload);

export default serviceInstance;
export { ModelService };
