import Joi from "joi";

const transactionHash = Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).messages({ "string.pattern.base": "Transaction hash must be a valid 32-byte hash." });

export const getHistorySchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20) });
export const getTransactionSchema = Joi.object({ txHash: transactionHash.required() });
export const purchaseSchema = Joi.object({ datasetId: Joi.number().integer().min(1).required(), licenseId: Joi.number().integer().min(1).required() });
