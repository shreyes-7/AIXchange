import Joi from "joi";
import {
    REPORT_TARGET_TYPES,
    REPORT_CATEGORIES,
    REPORT_STATUS,
    REPORT_PRIORITIES,
} from "../config/constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createReportSchema = Joi.object({
    targetType: Joi.string()
        .valid(...Object.values(REPORT_TARGET_TYPES))
        .required(),
    targetId: Joi.string().trim().required(),
    category: Joi.string()
        .valid(...Object.values(REPORT_CATEGORIES))
        .required(),
    description: Joi.string().trim().min(5).max(2000).required(),
    priority: Joi.string()
        .valid(...Object.values(REPORT_PRIORITIES))
        .default(REPORT_PRIORITIES.MEDIUM),
});

export const reportAssignmentSchema = Joi.object({
    adminId: Joi.string().pattern(objectIdPattern).required(),
});

export const reportStatusUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(REPORT_STATUS))
        .required(),
    resolution: Joi.string()
        .trim()
        .max(2000)
        .when("status", {
            is: Joi.valid(REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED),
            then: Joi.required().messages({
                "any.required": "Resolution note is required when resolving or rejecting a report.",
            }),
            otherwise: Joi.optional().allow(null, ""),
        }),
});

export const reportQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid(...Object.values(REPORT_STATUS)).optional(),
    category: Joi.string().valid(...Object.values(REPORT_CATEGORIES)).optional(),
    targetType: Joi.string().valid(...Object.values(REPORT_TARGET_TYPES)).optional(),
    priority: Joi.string().valid(...Object.values(REPORT_PRIORITIES)).optional(),
    assignedAdminId: Joi.string().pattern(objectIdPattern).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sort: Joi.string().valid("newest", "oldest", "priority_desc").default("newest"),
});
