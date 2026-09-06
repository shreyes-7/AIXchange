import mongoose from "mongoose";
import * as reportRepository from "../repositories/report.repository.js";
import * as auditRepository from "../repositories/moderation-audit.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import Dataset from "../models/dataset.model.js";
import Model from "../models/model.model.js";
import ApiError from "../utils/ApiError.js";
import {
    REPORT_TARGET_TYPES,
    REPORT_STATUS,
    MODERATION_ACTIONS,
    USER_ROLES,
} from "../config/constants.js";

export const createReport = async (
    reporterUser,
    { targetType, targetId, category, description, priority }
) => {
    // 1. Verify target existence in canonical collection
    let targetExists = false;

    if (targetType === REPORT_TARGET_TYPES.USER) {
        if (mongoose.isValidObjectId(targetId)) {
            const user = await userRepository.findById(targetId);
            targetExists = Boolean(user);
        }
    } else if (targetType === REPORT_TARGET_TYPES.DATASET) {
        if (mongoose.isValidObjectId(targetId)) {
            const dataset = await Dataset.findById(targetId);
            targetExists = Boolean(dataset);
        }
    } else if (targetType === REPORT_TARGET_TYPES.MODEL) {
        if (mongoose.isValidObjectId(targetId)) {
            const model = await Model.findById(targetId);
            targetExists = Boolean(model);
        } else if (!isNaN(Number(targetId))) {
            const model = await Model.findOne({ blockchainModelId: Number(targetId) });
            targetExists = Boolean(model);
        }
    }

    if (!targetExists) {
        throw new ApiError(400, `Target ${targetType} with ID ${targetId} does not exist.`);
    }

    const report = await reportRepository.createReport({
        reporterId: reporterUser.userId,
        targetType,
        targetId: String(targetId),
        category,
        description,
        priority,
        status: REPORT_STATUS.OPEN,
    });

    return report;
};

export const listReports = (queryParams) => {
    return reportRepository.findMany(queryParams);
};

export const getReportDetails = async (reportId) => {
    if (!mongoose.isValidObjectId(reportId)) {
        throw new ApiError(400, "Invalid report ID.");
    }

    const report = await reportRepository.findById(reportId);
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    // Fetch target entity summary
    let targetDetails = null;
    try {
        if (report.targetType === REPORT_TARGET_TYPES.USER) {
            const user = await userRepository.findById(report.targetId);
            if (user) {
                targetDetails = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            }
        } else if (report.targetType === REPORT_TARGET_TYPES.DATASET) {
            const ds = await Dataset.findById(report.targetId).select("title category status owner");
            if (ds) targetDetails = ds;
        } else if (report.targetType === REPORT_TARGET_TYPES.MODEL) {
            const mdl = await Model.findById(report.targetId).select("name category status active owner");
            if (mdl) targetDetails = mdl;
        }
    } catch {
        targetDetails = null;
    }

    const recentAudits = await auditRepository.findByTarget("REPORT", reportId, 5);

    return {
        ...report.toObject(),
        targetDetails,
        recentAudits,
    };
};

export const assignReport = async (reportId, adminId, currentAdmin, metadata = {}) => {
    if (!mongoose.isValidObjectId(reportId)) {
        throw new ApiError(400, "Invalid report ID.");
    }

    const report = await reportRepository.findById(reportId);
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    // Verify adminId is a valid user with ADMIN role
    const assignedUser = await userRepository.findById(adminId);
    if (!assignedUser || assignedUser.role !== USER_ROLES.ADMIN) {
        throw new ApiError(400, "Target assignee must be an active administrator.");
    }

    const previousAdminId = report.assignedAdminId ? report.assignedAdminId._id : null;
    const updated = await reportRepository.updateReport(reportId, {
        assignedAdminId: adminId,
    });

    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action: MODERATION_ACTIONS.REPORT_ASSIGN,
        targetType: "REPORT",
        targetId: reportId,
        previousState: { assignedAdminId: previousAdminId },
        newState: { assignedAdminId: adminId },
        reason: `Report assigned to admin ${assignedUser.name}`,
        metadata,
    });

    return updated;
};

export const updateReportStatus = async (
    reportId,
    { status: newStatus, resolution },
    currentAdmin,
    metadata = {}) => {
    if (!mongoose.isValidObjectId(reportId)) {
        throw new ApiError(400, "Invalid report ID.");
    }

    const report = await reportRepository.findById(reportId);
    if (!report) {
        throw new ApiError(404, "Report not found.");
    }

    if (report.status === newStatus) {
        return report;
    }

    // Enforce valid transitions
    const validTransitions = {
        [REPORT_STATUS.OPEN]: [REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED],
        [REPORT_STATUS.UNDER_REVIEW]: [REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED, REPORT_STATUS.OPEN],
        [REPORT_STATUS.RESOLVED]: [REPORT_STATUS.UNDER_REVIEW],
        [REPORT_STATUS.REJECTED]: [REPORT_STATUS.UNDER_REVIEW],
    };

    const allowedNext = validTransitions[report.status] || [];
    if (!allowedNext.includes(newStatus)) {
        throw new ApiError(400, `Cannot transition report from ${report.status} to ${newStatus}.`);
    }

    const updateFields = { status: newStatus };
    if (newStatus === REPORT_STATUS.RESOLVED || newStatus === REPORT_STATUS.REJECTED) {
        updateFields.resolution = resolution;
        updateFields.resolvedAt = new Date();
    }

    const previousStatus = report.status;
    const updated = await reportRepository.updateReport(reportId, updateFields);

    const action =
        newStatus === REPORT_STATUS.RESOLVED || newStatus === REPORT_STATUS.REJECTED
            ? MODERATION_ACTIONS.REPORT_RESOLVE
            : MODERATION_ACTIONS.REPORT_STATUS_CHANGE;

    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action,
        targetType: "REPORT",
        targetId: reportId,
        previousState: { status: previousStatus, resolution: report.resolution },
        newState: { status: newStatus, resolution: updateFields.resolution || null },
        reason: resolution || `Report status transitioned to ${newStatus}`,
        metadata,
    });

    return updated;
};
