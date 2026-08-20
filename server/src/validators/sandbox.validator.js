import Joi from "joi";
import {
    SANDBOX_STATUS,
    FRAMEWORK_TYPES,
    OPTIMIZER_TYPES,
    LOSS_FUNCTIONS,
    SANDBOX_FILE_CATEGORIES,
} from "../utils/constants.js";

export const createSandboxSchema = Joi.object({
    datasetId: Joi.alternatives().try(
        Joi.number().integer().positive().required(),
        Joi.string().trim().regex(/^[1-9]\d*$/).required()
    ).required().messages({
        "any.required": "datasetId is required.",
    }),
    licenseId: Joi.alternatives().try(
        Joi.number().integer().positive().required(),
        Joi.string().trim().regex(/^[1-9]\d*$/).required()
    ).required().messages({
        "any.required": "licenseId is required.",
    }),
    name: Joi.string().trim().max(120).optional().allow(null, ""),
});

export const startTrainingSchema = Joi.object({
    framework: Joi.string()
        .valid(...Object.values(FRAMEWORK_TYPES))
        .default(FRAMEWORK_TYPES.PYTORCH),
    modelSpec: Joi.object({
        modelType: Joi.string().trim().default("mlp"),
        inputDim: Joi.number().integer().min(1).required().messages({
            "any.required": "modelSpec.inputDim is required.",
        }),
        hiddenDims: Joi.array().items(Joi.number().integer().min(1)).default([64, 32]),
        outputDim: Joi.number().integer().min(1).required().messages({
            "any.required": "modelSpec.outputDim is required.",
        }),
        activation: Joi.string().trim().valid("relu", "gelu", "tanh", "sigmoid").default("relu"),
        dropoutRate: Joi.number().min(0.0).max(0.8).default(0.0),
    }).required().messages({
        "any.required": "modelSpec is required to start training.",
    }),
    dataset: Joi.object({
        localPath: Joi.string().trim().optional().allow(null, ""),
        format: Joi.string().trim().default("csv"),
        targetColumn: Joi.string().trim().optional().allow(null, ""),
        featureColumns: Joi.array().items(Joi.string().trim()).optional().allow(null),
        testSplitRatio: Joi.number().min(0.0).max(0.5).default(0.2),
    }).default(() => ({})),
    hyperparameters: Joi.object({
        epochs: Joi.number().integer().min(1).max(1000).default(10),
        batchSize: Joi.number().integer().min(1).max(4096).default(32),
        learningRate: Joi.number().greater(0.0).max(1.0).default(0.001),
        optimizer: Joi.string()
            .valid(...Object.values(OPTIMIZER_TYPES))
            .default(OPTIMIZER_TYPES.ADAM),
        lossFunction: Joi.string()
            .valid(...Object.values(LOSS_FUNCTIONS))
            .default(LOSS_FUNCTIONS.CROSS_ENTROPY),
        weightDecay: Joi.number().min(0.0).max(0.1).default(0.0),
        gradClipNorm: Joi.number().greater(0.0).optional().allow(null),
        lrDecayStep: Joi.number().integer().min(1).optional().allow(null),
        lrDecayGamma: Joi.number().greater(0.0).max(1.0).default(0.1),
    }).default(() => ({})),
    checkpointInterval: Joi.number().integer().min(1).default(5),
    keepTopKCheckpoints: Joi.number().integer().min(1).default(3),
    device: Joi.string().valid("cpu", "cuda").default("cpu"),
    timeoutSeconds: Joi.number().integer().min(1).max(86400).default(3600),
    exportFormat: Joi.string().valid("safetensors", "pt", "torchscript").default("safetensors"),
});

export const sandboxIdParamSchema = Joi.object({
    sandboxId: Joi.string().trim().required().messages({
        "any.required": "sandboxId parameter is required.",
    }),
});

export const fileIdParamSchema = Joi.object({
    sandboxId: Joi.string().trim().required(),
    fileId: Joi.string().trim().required(),
});

export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string()
        .valid(...Object.values(SANDBOX_STATUS))
        .optional()
        .allow(null, ""),
});
