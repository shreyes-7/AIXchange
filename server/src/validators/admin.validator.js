import Joi from "joi";
import {
    USER_STATUS,
    MODERATION_STATUS,
    USER_ROLES,
    FRAUD_REVIEW_STATUS,
    FRAUD_SEVERITY,
    MODERATION_ACTIONS,
} from "../config/constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const userStatusUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(USER_STATUS))
        .required(),
    reason: Joi.string().trim().min(3).max(1000).required(),
});

export const datasetStatusUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(MODERATION_STATUS))
        .required(),
    reason: Joi.string().trim().min(3).max(1000).required(),
});

export const modelStatusUpdateSchema = Joi.object({
    status: Joi.string()
        .valid("active", "under_review", "hidden", "removed")
        .required(),
    reason: Joi.string().trim().min(3).max(1000).required(),
});

export const adminUserQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow("").optional(),
    status: Joi.string().valid(...Object.values(USER_STATUS)).optional(),
    role: Joi.string().valid(...Object.values(USER_ROLES)).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sort: Joi.string().valid("newest", "oldest", "name_asc", "name_desc").default("newest"),
});

export const adminDatasetQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow("").optional(),
    status: Joi.string().valid(...Object.values(MODERATION_STATUS)).optional(),
    category: Joi.string().trim().optional(),
    owner: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sort: Joi.string().valid("newest", "oldest", "title_asc", "title_desc").default("newest"),
});

export const adminModelQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow("").optional(),
    status: Joi.string().valid("active", "under_review", "hidden", "removed").optional(),
    category: Joi.string().trim().optional(),
    framework: Joi.string().optional(),
    owner: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sort: Joi.string().valid("newest", "oldest", "name_asc", "name_desc", "version", "popular").default("newest"),
});

export const fraudReviewSchema = Joi.object({
    status: Joi.string()
        .valid("UNDER_REVIEW", "CONFIRMED", "DISMISSED")
        .required(),
    reviewNotes: Joi.string().trim().min(3).max(2000).required(),
});

export const fraudQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    severity: Joi.string().valid(...Object.values(FRAUD_SEVERITY)).optional(),
    ruleId: Joi.string().trim().optional(),
    status: Joi.string().valid(...Object.values(FRAUD_REVIEW_STATUS)).optional(),
    address: Joi.string().trim().optional(),
    transactionHash: Joi.string().trim().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
});

export const ingestFlagsSchema = Joi.object({
    flags: Joi.array()
        .items(
            Joi.object({
                flagId: Joi.string().required(),
                ruleId: Joi.string().required(),
                severity: Joi.string().valid(...Object.values(FRAUD_SEVERITY)).required(),
                address: Joi.string().required(),
                targetAddress: Joi.string().allow(null, "").optional(),
                transactionHash: Joi.string().allow(null, "").optional(),
                description: Joi.string().required(),
                evidence: Joi.object().optional(),
                recommendedAction: Joi.string().allow(null, "").optional(),
                status: Joi.string().valid(...Object.values(FRAUD_REVIEW_STATUS)).optional(),
                timestamp: Joi.date().optional(),
            })
        )
        .min(1)
        .required(),
});

export const auditQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    targetType: Joi.string().valid("USER", "DATASET", "MODEL", "REPORT", "FRAUD_FLAG").optional(),
    targetId: Joi.string().trim().optional(),
    adminId: Joi.string().pattern(objectIdPattern).optional(),
    action: Joi.string().valid(...Object.values(MODERATION_ACTIONS)).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
});
