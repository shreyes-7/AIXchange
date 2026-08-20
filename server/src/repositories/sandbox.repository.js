import Sandbox from "../models/sandbox.model.js";
import { SANDBOX_STATUS } from "../utils/constants.js";

export const create = (payload) => Sandbox.create(payload);

export const findById = (sandboxId) => Sandbox.findOne({ sandboxId }).lean();

export const findDocumentById = (sandboxId) => Sandbox.findOne({ sandboxId });

export const findByExecutionId = (executionId) => Sandbox.findOne({ executionId }).lean();

export const findByUser = async (userId, { page = 1, limit = 20, status = null } = {}) => {
    const filter = { userId };
    if (status) {
        filter.status = status;
    }
    const [sandboxes, total] = await Promise.all([
        Sandbox.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Sandbox.countDocuments(filter),
    ]);
    return {
        sandboxes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};

export const findByDataset = async (datasetId, { page = 1, limit = 20 } = {}) => {
    const filter = { datasetId };
    const [sandboxes, total] = await Promise.all([
        Sandbox.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Sandbox.countDocuments(filter),
    ]);
    return {
        sandboxes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};

export const findActiveSandboxes = () =>
    Sandbox.find({
        status: { $in: [SANDBOX_STATUS.CREATING, SANDBOX_STATUS.RUNNING] },
        executionId: { $ne: null },
    }).lean();

export const updateStatus = (sandboxId, status, extraFields = {}) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $set: { status, ...extraFields, updatedAt: new Date() } },
        { new: true }
    );

export const updateMetrics = (sandboxId, metrics) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $set: { metrics, lastSyncedAt: new Date() } },
        { new: true }
    );

export const updateArtifact = (sandboxId, artifact) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $set: { artifact, lastSyncedAt: new Date() } },
        { new: true }
    );

export const recordFailure = (sandboxId, failureReason, completedAt = new Date()) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        {
            $set: {
                status: SANDBOX_STATUS.FAILED,
                failureReason,
                completedAt,
                lastSyncedAt: new Date(),
            },
        },
        { new: true }
    );

export const updateLastSyncedAt = (sandboxId, date = new Date()) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $set: { lastSyncedAt: date } },
        { new: true }
    );

export const updateJupyterSession = (sandboxId, jupyter) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $set: { jupyter, updatedAt: new Date() } },
        { new: true }
    );

export const addFile = (sandboxId, fileDoc) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $push: { files: fileDoc }, $set: { updatedAt: new Date() } },
        { new: true }
    );

export const removeFile = (sandboxId, fileId) =>
    Sandbox.findOneAndUpdate(
        { sandboxId },
        { $pull: { files: { fileId } }, $set: { updatedAt: new Date() } },
        { new: true }
    );

export const deleteById = (sandboxId) => Sandbox.findOneAndDelete({ sandboxId });
