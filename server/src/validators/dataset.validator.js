import Joi from "joi";

const id = Joi.string().hex().length(24);
const tags = Joi.array().items(Joi.string().trim().lowercase().max(50)).max(20).unique();

export const createDatasetSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(10000).allow(""),
    category: Joi.string().trim().lowercase().max(80).required(),
    tags,
    license: Joi.string().trim().max(120).required(),
    royaltyBps: Joi.number().integer().min(0).max(10000).default(0),
    visibility: Joi.string().valid("public", "protected").default("protected"),
    upload: Joi.object({ cid: Joi.string().required(), contentHash: Joi.string().hex().length(64).required(), size: Joi.number().integer().min(1).required(), fileName: Joi.string().required(), mimeType: Joi.string().required(), encryption: Joi.object({ algorithm: Joi.string().required(), iv: Joi.string().required(), authTag: Joi.string().required() }).required(), preview: Joi.any().allow(null) }).required(),
});
export const updateDatasetSchema = createDatasetSchema.fork(["title", "category", "license", "upload"], (s) => s.optional()).min(1);
export const listDatasetSchema = Joi.object({ search: Joi.string().trim().max(200), category: Joi.string().trim().lowercase().max(80), tags: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim())), owner: id, visibility: Joi.string().valid("public", "protected"), page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), sort: Joi.string().valid("newest", "oldest", "rating", "title").default("newest") });
export const reviewSchema = Joi.object({ rating: Joi.number().integer().min(1).max(5).required(), comment: Joi.string().trim().max(2000).allow("").default("") });
export const versionSchema = Joi.object({ changelog: Joi.string().trim().max(4000).allow("").default(""), upload: Joi.object({ cid: Joi.string().required(), contentHash: Joi.string().hex().length(64).required(), size: Joi.number().integer().min(1).required(), fileName: Joi.string().required(), encryption: Joi.object({ algorithm: Joi.string().required(), iv: Joi.string().required(), authTag: Joi.string().required() }).required() }).required() });
export const blockchainSchema = Joi.object({ blockchainDatasetId: Joi.alternatives().try(Joi.string().pattern(/^\d+$/), Joi.number().integer().positive()).required(), txHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required() });
