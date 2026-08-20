import ApiResponse from "../utils/ApiResponse.js";
import sandboxService from "../services/sandbox.service.js";
import fileUploadService from "../services/fileUpload.service.js";
import trainingLogService from "../services/trainingLog.service.js";
import monitoringService from "../services/monitoring.service.js";
import * as sandboxFileRepository from "../repositories/sandbox-file.repository.js";

export const create = async (req, res, next) => {
    try {
        const sandbox = await sandboxService.createSandbox(req.user, req.body);
        return res
            .status(201)
            .json(new ApiResponse(201, "Sandbox created successfully.", sandbox));
    } catch (error) {
        next(error);
    }
};

export const listMine = async (req, res, next) => {
    try {
        const result = await sandboxService.listUserSandboxes(req.user, {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 20,
            status: req.query.status || null,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, "User sandboxes retrieved successfully.", result));
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const sandbox = await sandboxService.getSandbox(req.user, req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "Sandbox retrieved successfully.", sandbox));
    } catch (error) {
        next(error);
    }
};

export const uploadFile = async (req, res, next) => {
    try {
        const category = req.body?.category || null;
        const uploadedFile = await fileUploadService.processUpload(
            req.user,
            req.params.sandboxId,
            req.file,
            category
        );
        return res
            .status(201)
            .json(new ApiResponse(201, "File uploaded and associated with sandbox successfully.", uploadedFile));
    } catch (error) {
        next(error);
    }
};

export const listFiles = async (req, res, next) => {
    try {
        await sandboxService.getSandbox(req.user, req.params.sandboxId);
        const files = await sandboxFileRepository.findBySandbox(req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "Sandbox files retrieved successfully.", { files }));
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (req, res, next) => {
    try {
        const result = await fileUploadService.deleteFile(
            req.user,
            req.params.sandboxId,
            req.params.fileId
        );
        return res
            .status(200)
            .json(new ApiResponse(200, "Sandbox file deleted successfully.", result));
    } catch (error) {
        next(error);
    }
};

export const startTraining = async (req, res, next) => {
    try {
        const result = await sandboxService.startTraining(
            req.user,
            req.params.sandboxId,
            req.body
        );
        return res
            .status(200)
            .json(new ApiResponse(200, "Training execution dispatched successfully.", result));
    } catch (error) {
        next(error);
    }
};

export const getLogs = async (req, res, next) => {
    try {
        const logs = await trainingLogService.getLogs(req.user, req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "Training logs and metrics retrieved successfully.", logs));
    } catch (error) {
        next(error);
    }
};

export const syncStatus = async (req, res, next) => {
    try {
        await sandboxService.getSandbox(req.user, req.params.sandboxId);
        const updated = await monitoringService.syncSandbox(req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "Sandbox execution state synchronized successfully.", updated));
    } catch (error) {
        next(error);
    }
};

export const startJupyter = async (req, res, next) => {
    try {
        const session = await sandboxService.startJupyter(req.user, req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "JupyterLab session started successfully.", session));
    } catch (error) {
        next(error);
    }
};

export const stopJupyter = async (req, res, next) => {
    try {
        const session = await sandboxService.stopJupyter(req.user, req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "JupyterLab session stopped successfully.", session));
    } catch (error) {
        next(error);
    }
};

export const getJupyterStatus = async (req, res, next) => {
    try {
        const session = await sandboxService.getJupyterStatus(req.user, req.params.sandboxId);
        return res
            .status(200)
            .json(new ApiResponse(200, "JupyterLab status retrieved successfully.", session));
    } catch (error) {
        next(error);
    }
};
