import * as adminService from "../services/admin.service.js";
import * as treasuryService from "../services/admin-treasury.service.js";

const send = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
};

// --- Users ---

export const listUsers = async (req, res, next) => {
    try {
        const result = await adminService.listUsers(req.query);
        send(res, 200, result, "Users retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getUserDetails = async (req, res, next) => {
    try {
        const user = await adminService.getUserDetails(req.params.userId);
        send(res, 200, user, "User details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await adminService.updateUserStatus(
            req.params.userId,
            req.body.status,
            req.body.reason,
            req.user,
            metadata
        );
        send(res, 200, updated, `User status updated to ${req.body.status}.`);
    } catch (error) {
        next(error);
    }
};

// --- Datasets ---

export const listDatasets = async (req, res, next) => {
    try {
        const result = await adminService.listDatasets(req.query);
        send(res, 200, result, "Datasets retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getDatasetDetails = async (req, res, next) => {
    try {
        const dataset = await adminService.getDatasetDetails(req.params.datasetId);
        send(res, 200, dataset, "Dataset details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const updateDatasetStatus = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await adminService.updateDatasetStatus(
            req.params.datasetId,
            req.body.status,
            req.body.reason,
            req.user,
            metadata
        );
        send(res, 200, updated, `Dataset status updated to ${req.body.status}.`);
    } catch (error) {
        next(error);
    }
};

// --- Models ---

export const listModels = async (req, res, next) => {
    try {
        const result = await adminService.listModels(req.query);
        send(res, 200, result, "Models retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getModelDetails = async (req, res, next) => {
    try {
        const model = await adminService.getModelDetails(req.params.modelId);
        send(res, 200, model, "Model details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const updateModelStatus = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await adminService.updateModelStatus(
            req.params.modelId,
            req.body.status,
            req.body.reason,
            req.user,
            metadata
        );
        send(res, 200, updated, `Model status updated to ${req.body.status}.`);
    } catch (error) {
        next(error);
    }
};

// --- Audits ---

export const listAudits = async (req, res, next) => {
    try {
        const result = await adminService.listAudits(req.query);
        send(res, 200, result, "Moderation audits retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

// --- Treasury ---

export const getTreasuryOverview = async (req, res, next) => {
    try {
        const result = await treasuryService.getTreasuryOverview();
        send(res, 200, result, "Authoritative treasury overview retrieved successfully.");
    } catch (error) {
        next(error);
    }
};
