import mongoose from "mongoose";
import * as userRepository from "../repositories/user.repository.js";
import * as modelRepository from "../repositories/model.repository.js";
import * as auditRepository from "../repositories/moderation-audit.repository.js";
import * as reportRepository from "../repositories/report.repository.js";
import Dataset from "../models/dataset.model.js";
import Model from "../models/model.model.js";
import ApiError from "../utils/ApiError.js";
import { MODERATION_ACTIONS, USER_STATUS } from "../config/constants.js";

// --- User Moderation ---

export const listUsers = (queryParams) => {
    return userRepository.findAdminUsers(queryParams);
};

export const getUserDetails = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.wallet?.verificationNonce;
    delete userObj.wallet?.nonceExpiresAt;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpiresAt;
    delete userObj.emailVerificationToken;

    const [counts, recentAudits, recentReports] = await Promise.all([
        userRepository.getUserCounts(userId),
        auditRepository.findByTarget("USER", userId, 5),
        reportRepository.findMany({ targetType: "USER", targetId: userId, limit: 5 }),
    ]);

    return {
        ...userObj,
        counts,
        recentAudits,
        recentReports: recentReports.reports,
    };
};

export const updateUserStatus = async (userId, newStatus, reason, currentAdmin, metadata = {}) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    // Self-moderation guard
    if (String(currentAdmin.userId) === String(userId)) {
        throw new ApiError(403, "Administrators cannot suspend their own account.");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Idempotent: If already in requested status, return safely without duplicate audit
    if (user.status === newStatus) {
        const sanitized = user.toObject();
        delete sanitized.passwordHash;
        return sanitized;
    }

    const previousStatus = user.status || USER_STATUS.ACTIVE;
    const updatedUser = await userRepository.updateUserStatus(userId, newStatus);

    const action =
        newStatus === USER_STATUS.SUSPENDED
            ? MODERATION_ACTIONS.USER_SUSPEND
            : MODERATION_ACTIONS.USER_RESTORE;

    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action,
        targetType: "USER",
        targetId: userId,
        previousState: { status: previousStatus },
        newState: { status: newStatus },
        reason,
        metadata,
    });

    const sanitized = updatedUser.toObject();
    delete sanitized.passwordHash;
    return sanitized;
};

// --- Dataset Moderation ---

export const listDatasets = async ({
    page = 1,
    limit = 20,
    search,
    status,
    category,
    owner,
    startDate,
    endDate,
    sort = "newest",
} = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};
    if (status) filter.status = status.toLowerCase();
    if (category) filter.category = category.toLowerCase().trim();
    if (owner && mongoose.isValidObjectId(owner)) filter.owner = owner;

    if (search && search.trim()) {
        const q = search.trim();
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { tags: { $regex: q, $options: "i" } },
        ];
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        title_asc: { title: 1 },
        title_desc: { title: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const [datasets, total] = await Promise.all([
        Dataset.find(filter)
            .select("-file.encryption")
            .populate("owner", "name email wallet.address")
            .sort(sortOrder)
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        Dataset.countDocuments(filter),
    ]);

    return {
        datasets,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const getDatasetDetails = async (datasetId) => {
    if (!mongoose.isValidObjectId(datasetId)) {
        throw new ApiError(400, "Invalid dataset ID.");
    }

    const dataset = await Dataset.findById(datasetId)
        .select("-file.encryption")
        .populate("owner", "name email wallet.address");

    if (!dataset) {
        throw new ApiError(404, "Dataset not found.");
    }

    const [reportCount, recentAudits] = await Promise.all([
        reportRepository.countByTarget("DATASET", datasetId),
        auditRepository.findByTarget("DATASET", datasetId, 5),
    ]);

    return {
        ...dataset.toObject(),
        reportCount,
        recentAudits,
    };
};

export const updateDatasetStatus = async (datasetId, newStatus, reason, currentAdmin, metadata = {}) => {
    if (!mongoose.isValidObjectId(datasetId)) {
        throw new ApiError(400, "Invalid dataset ID.");
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
        throw new ApiError(404, "Dataset not found.");
    }

    const normalizedStatus = newStatus.toLowerCase();
    if (dataset.status === normalizedStatus) {
        return dataset;
    }

    const previousStatus = dataset.status;
    const updated = await Dataset.findByIdAndUpdate(
        datasetId,
        { $set: { status: normalizedStatus } },
        { returnDocument: "after" }
    ).select("-file.encryption");

    let action = MODERATION_ACTIONS.DATASET_STATUS_CHANGE;
    if (normalizedStatus === "hidden") action = MODERATION_ACTIONS.DATASET_HIDE;
    if (normalizedStatus === "active") action = MODERATION_ACTIONS.DATASET_RESTORE;

    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action,
        targetType: "DATASET",
        targetId: datasetId,
        previousState: { status: previousStatus },
        newState: { status: normalizedStatus },
        reason,
        metadata,
    });

    return updated;
};

// --- Model Moderation ---

export const listModels = (queryParams) => {
    return modelRepository.findAdminModels(queryParams);
};

export const getModelDetails = async (modelId) => {
    let model;
    if (mongoose.isValidObjectId(modelId)) {
        model = await Model.findById(modelId).populate("owner", "name email wallet.address");
    } else if (!isNaN(Number(modelId))) {
        model = await Model.findOne({ blockchainModelId: Number(modelId) }).populate("owner", "name email wallet.address");
    }

    if (!model) {
        throw new ApiError(404, "Model not found.");
    }

    const [reportCount, recentAudits] = await Promise.all([
        reportRepository.countByTarget("MODEL", model._id),
        auditRepository.findByTarget("MODEL", model._id, 5),
    ]);

    return {
        ...model.toObject(),
        reportCount,
        recentAudits,
    };
};

export const updateModelStatus = async (modelId, newStatus, reason, currentAdmin, metadata = {}) => {
    let model;
    if (mongoose.isValidObjectId(modelId)) {
        model = await Model.findById(modelId);
    } else if (!isNaN(Number(modelId))) {
        model = await Model.findOne({ blockchainModelId: Number(modelId) });
    }

    if (!model) {
        throw new ApiError(404, "Model not found.");
    }

    const normalizedStatus = newStatus.toLowerCase();
    if (model.status === normalizedStatus && model.active === (normalizedStatus === "active")) {
        return model;
    }

    const previousState = {
        status: model.status || (model.active ? "active" : "hidden"),
        active: model.active,
    };

    // Atomic update of both status and active
    const updated = await modelRepository.updateModerationStatus(model._id, normalizedStatus);

    let action = MODERATION_ACTIONS.MODEL_STATUS_CHANGE;
    if (normalizedStatus === "hidden") action = MODERATION_ACTIONS.MODEL_HIDE;
    if (normalizedStatus === "active") action = MODERATION_ACTIONS.MODEL_RESTORE;

    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action,
        targetType: "MODEL",
        targetId: model._id,
        previousState,
        newState: { status: normalizedStatus, active: normalizedStatus === "active" },
        reason,
        metadata,
    });

    return updated;
};

// --- Audits ---

export const listAudits = (queryParams) => {
    return auditRepository.findMany(queryParams);
};
