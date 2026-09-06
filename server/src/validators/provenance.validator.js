import Joi from "joi";

const bytes32Hex = Joi.string()
    .trim()
    .pattern(/^0x[0-9a-fA-F]{64}$/)
    .messages({
        "string.pattern.base": "metadataHash must be a 32-byte hexadecimal string starting with 0x (66 characters total)",
    });

const txHash = Joi.string()
    .trim()
    .pattern(/^0x[0-9a-fA-F]{64}$/)
    .messages({
        "string.pattern.base": "txHash must be a valid 66-character hex string starting with 0x",
    });

export const registerProvenanceSchema = Joi.object({
    datasetId: Joi.number().integer().min(1).required(),
    modelId: Joi.number().integer().min(1).required(),
    modelVersion: Joi.number().integer().min(1).required(),
    executionId: Joi.string().trim().min(1).max(128).required(),
    metadataHash: bytes32Hex.required(),
});

export const syncProvenanceSchema = Joi.object({
    txHash: txHash.required(),
    operation: Joi.string().valid("register", "setStatus").default("register"),
    provenanceId: Joi.number().integer().min(1).optional(),
});

export const setStatusSchema = Joi.object({
    active: Joi.boolean().required(),
});

export const verifyProvenanceSchema = Joi.object({
    datasetId: Joi.number().integer().min(1).optional(),
    executionId: Joi.string().trim().min(1).max(128).optional(),
    modelId: Joi.number().integer().min(1).optional(),
    modelVersion: Joi.number().integer().min(1).optional(),
    metadataHash: bytes32Hex.optional(),
});

export const verifyHashSchema = Joi.object({
    metadataHash: bytes32Hex.required(),
});

export const provenanceQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid("newest", "oldest", "block_asc", "block_desc").default("newest"),
    active: Joi.boolean().optional(),
});

export const provenanceIdParamSchema = Joi.object({
    id: Joi.string().trim().required().messages({
        "any.required": "Provenance ID parameter is required",
    }),
});

export const datasetIdParamSchema = Joi.object({
    datasetId: Joi.number().integer().min(1).required(),
});

export const executionIdParamSchema = Joi.object({
    executionId: Joi.string().trim().min(1).max(128).required(),
});

export const modelIdParamSchema = Joi.object({
    modelId: Joi.number().integer().min(1).required(),
});

export const modelVersionParamSchema = Joi.object({
    modelId: Joi.number().integer().min(1).required(),
    version: Joi.number().integer().min(1).required(),
});
