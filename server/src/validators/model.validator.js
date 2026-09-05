import Joi from "joi";
import { ethers } from "ethers";

const ethAddress = Joi.string().custom((value, helpers) => {
    if (!ethers.isAddress(value)) {
        return helpers.error("any.invalid");
    }
    return ethers.getAddress(value);
}, "Ethereum Address Validation");

const sha256Hash = Joi.string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/)
    .message("modelHash must be a valid 64-character SHA-256 hex string");

const safePathRegex = /^(?!\.\.)(?!.*\/\.\.)(?!.*\\\.\.)[a-zA-Z0-9_\-\.\/]+$/;
const safeArtifactPath = Joi.string()
    .trim()
    .max(500)
    .regex(safePathRegex)
    .message("artifactPath must not contain directory traversal sequences (..) or illegal characters");

export const createModelSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(10000).allow("").default(""),
    category: Joi.string().trim().lowercase().max(80).required(),
    tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(20).default([]),
    framework: Joi.string()
        .valid("PyTorch", "TensorFlow", "Scikit-Learn", "ONNX", "Safetensors", "Other")
        .default("PyTorch"),
    modelType: Joi.string().trim().max(80).default("general"),
    metadataURI: Joi.string().trim().min(5).max(500).required(),
    modelHash: sha256Hash.required(),
    artifactPath: safeArtifactPath.allow(null, "").default(null),
    fileSize: Joi.number().min(0).default(0),
    changelog: Joi.string().trim().max(4000).allow("").default("Initial model version (v1)"),
    inferenceConfig: Joi.object({
        device: Joi.string().valid("cpu", "cuda").default("cpu"),
        batchSize: Joi.number().integer().min(1).max(128).default(1),
        timeoutMs: Joi.number().integer().min(1000).max(120000).default(30000),
    }).default(),
});

export const syncModelSchema = Joi.object({
    txHash: Joi.string()
        .trim()
        .regex(/^0x[a-fA-F0-9]{64}$/)
        .required()
        .messages({
            "string.pattern.base": "txHash must be a valid 66-character hex string starting with 0x",
        }),
    modelId: Joi.alternatives().try(Joi.number().integer().min(1), Joi.string().regex(/^\d+$/)).optional(),
    operation: Joi.string()
        .valid("register", "addVersion", "setStatus", "transferOwnership")
        .default("register"),
});

export const updateModelSchema = Joi.object({
    description: Joi.string().trim().max(10000).optional(),
    category: Joi.string().trim().lowercase().max(80).optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(20).optional(),
    framework: Joi.string()
        .valid("PyTorch", "TensorFlow", "Scikit-Learn", "ONNX", "Safetensors", "Other")
        .optional(),
    modelType: Joi.string().trim().max(80).optional(),
    inferenceConfig: Joi.object({
        device: Joi.string().valid("cpu", "cuda").optional(),
        batchSize: Joi.number().integer().min(1).max(128).optional(),
        timeoutMs: Joi.number().integer().min(1000).max(120000).optional(),
    }).optional(),
}).min(1);

export const addVersionSchema = Joi.object({
    metadataURI: Joi.string().trim().min(5).max(500).required(),
    modelHash: sha256Hash.required(),
    artifactPath: safeArtifactPath.allow(null, "").default(null),
    fileSize: Joi.number().min(0).default(0),
    changelog: Joi.string().trim().max(4000).allow("").default(""),
});

export const setStatusSchema = Joi.object({
    active: Joi.boolean().required(),
});

export const transferOwnershipSchema = Joi.object({
    newOwner: ethAddress.required(),
});

export const verifyHashSchema = Joi.object({
    versionNumber: Joi.number().integer().min(1).required(),
    expectedHash: sha256Hash.optional(),
    artifactPath: safeArtifactPath.optional(),
}).or("expectedHash", "artifactPath");

export const inferModelSchema = Joi.object({
    inputs: Joi.alternatives()
        .try(
            Joi.array().items(Joi.number()),
            Joi.array().items(Joi.array().items(Joi.number())),
            Joi.object()
        )
        .required()
        .messages({
            "alternatives.match": "inputs must be a feature array, a batch of feature arrays, or a key-value dictionary of tensors",
        }),
    versionNumber: Joi.number().integer().min(1).optional(),
    device: Joi.string().valid("cpu", "cuda").default("cpu"),
    return_probabilities: Joi.boolean().default(true),
    top_k: Joi.number().integer().min(1).max(1000).optional(),
});

export const listModelSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string()
        .valid("newest", "oldest", "name_asc", "name_desc", "version", "popular", "relevance")
        .default("newest"),
    category: Joi.string().trim().lowercase().max(80).optional(),
    framework: Joi.string()
        .valid("PyTorch", "TensorFlow", "Scikit-Learn", "ONNX", "Safetensors", "Other")
        .optional(),
    active: Joi.boolean().optional(),
    owner: Joi.string().trim().optional(),
    search: Joi.string().trim().max(200).optional(),
});

export const modelIdParamSchema = Joi.object({
    id: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "Model identifier parameter is required",
        }),
});

export const versionParamSchema = Joi.object({
    version: Joi.number().integer().min(1).required(),
});

export const modelVersionParamSchema = Joi.object({
    id: Joi.string().trim().required(),
    version: Joi.number().integer().min(1).required(),
});

export const ownerParamSchema = Joi.object({
    address: ethAddress.required(),
});
