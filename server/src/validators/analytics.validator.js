import Joi from "joi";

const baseDateFilter = {
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
    interval: Joi.string().valid("day", "week", "month").default("day"),
};

export const revenueQuerySchema = Joi.object({
    ...baseDateFilter,
    datasetId: Joi.number().integer().positive().optional(),
});

export const transactionQuerySchema = Joi.object({
    ...baseDateFilter,
    datasetId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid("CONFIRMED", "PENDING", "FAILED").optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

export const downloadQuerySchema = Joi.object({
    ...baseDateFilter,
    datasetId: Joi.number().integer().positive().optional(),
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    status: Joi.string().valid("SUCCESS", "FAILED").optional(),
});

export const apiCallQuerySchema = Joi.object({
    ...baseDateFilter,
    modelId: Joi.number().integer().positive().optional(),
    modelRef: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    modelVersion: Joi.number().integer().positive().optional(),
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    status: Joi.string().valid("SUCCESS", "FAILED").optional(),
});

export const userQuerySchema = Joi.object({
    ...baseDateFilter,
    role: Joi.string().valid("USER", "CREATOR", "ADMIN", "user", "creator", "admin").insensitive().optional(),
});

export const overviewQuerySchema = Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
});
