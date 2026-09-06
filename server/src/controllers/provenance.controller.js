import mongoose from "mongoose";
import provenanceService from "../services/provenance.service.js";

const send = (res, status, data, message) =>
    res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const create = async (req, res, next) => {
    try {
        send(
            res,
            202,
            await provenanceService.create(req.user, req.body),
            "Provenance registration transaction prepared."
        );
    } catch (error) {
        next(error);
    }
};

export const sync = async (req, res, next) => {
    try {
        const result = await provenanceService.sync(req.user, req.body);
        send(
            res,
            result.state === "PENDING" ? 202 : 200,
            result,
            result.state === "PENDING"
                ? "Transaction pending on blockchain."
                : "Provenance projection synchronized with blockchain."
        );
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const idParam = req.params.id;
        const isObjectId = mongoose.Types.ObjectId.isValid(idParam);
        let result;
        if (!isNaN(Number(idParam))) {
            result = await provenanceService.getByProvenanceId(Number(idParam));
        } else if (isObjectId) {
            result = await provenanceService.getByMongoId(idParam);
        } else {
            result = await provenanceService.getByProvenanceId(idParam);
        }
        send(res, 200, result);
    } catch (error) {
        next(error);
    }
};

export const getByDataset = async (req, res, next) => {
    try {
        send(res, 200, await provenanceService.getByDataset(req.params.datasetId, req.query));
    } catch (error) {
        next(error);
    }
};

export const getByExecution = async (req, res, next) => {
    try {
        send(res, 200, await provenanceService.getByExecution(req.params.executionId, req.query));
    } catch (error) {
        next(error);
    }
};

export const getByModel = async (req, res, next) => {
    try {
        send(res, 200, await provenanceService.getByModel(req.params.modelId, req.query));
    } catch (error) {
        next(error);
    }
};

export const getByModelVersion = async (req, res, next) => {
    try {
        send(
            res,
            200,
            await provenanceService.getByModelVersion(
                req.params.modelId,
                req.params.version,
                req.query
            )
        );
    } catch (error) {
        next(error);
    }
};

export const getGraph = async (req, res, next) => {
    try {
        send(res, 200, await provenanceService.getGraph(req.params.modelId));
    } catch (error) {
        next(error);
    }
};

export const getTimeline = async (req, res, next) => {
    try {
        send(res, 200, await provenanceService.getTimeline(req.params.modelId));
    } catch (error) {
        next(error);
    }
};

export const verify = async (req, res, next) => {
    try {
        const idParam = req.params.id;
        send(res, 200, await provenanceService.verify(idParam, req.body || {}));
    } catch (error) {
        next(error);
    }
};

export const verifyHash = async (req, res, next) => {
    try {
        const idParam = req.params.id;
        send(res, 200, await provenanceService.verifyHash(idParam, req.body.metadataHash));
    } catch (error) {
        next(error);
    }
};

export const setStatus = async (req, res, next) => {
    try {
        const idParam = req.params.id;
        send(
            res,
            202,
            await provenanceService.setStatus(req.user, idParam, req.body.active),
            "Provenance status transaction prepared."
        );
    } catch (error) {
        next(error);
    }
};
