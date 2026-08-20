import SandboxFile from "../models/sandbox-file.model.js";

export const create = (payload) => SandboxFile.create(payload);

export const findById = (fileId) => SandboxFile.findOne({ fileId }).lean();

export const findBySandbox = (sandboxId) =>
    SandboxFile.find({ sandboxId }).sort({ createdAt: 1 }).lean();

export const deleteById = (fileId) => SandboxFile.findOneAndDelete({ fileId });

export const deleteBySandbox = (sandboxId) => SandboxFile.deleteMany({ sandboxId });

export const countBySandbox = (sandboxId) => SandboxFile.countDocuments({ sandboxId });
