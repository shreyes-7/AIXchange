import Joi from "joi";

const positive = Joi.alternatives().try(Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER), Joi.string().pattern(/^[1-9]\d*$/).max(16));
const txHash = Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required();

export const purchaseRequestSchema = Joi.object({ datasetId: positive.required(), licenseId: positive.required() });
export const purchaseSyncSchema = Joi.object({ datasetId: positive.required(), licenseId: positive.required(), transactionHash: txHash });
export const purchaseIdSchema = Joi.object({ purchaseId: Joi.number().integer().positive().required() });
export const transactionHashParamSchema = Joi.object({ transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required() });
export const datasetPurchaseParamSchema = Joi.object({ datasetId: Joi.string().pattern(/^[1-9]\d*$/).required() });
export const downloadQuerySchema = Joi.object({ licenseId: positive.required() });
export const paginationSchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20) });
