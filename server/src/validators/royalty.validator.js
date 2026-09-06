import Joi from "joi";

const ethAddress = Joi.string()
    .trim()
    .pattern(/^0x[0-9a-fA-F]{40}$/)
    .messages({
        "string.pattern.base": "Address must be a valid 40-character hexadecimal Ethereum address starting with 0x",
    });

const txHash = Joi.string()
    .trim()
    .pattern(/^0x[0-9a-fA-F]{64}$/)
    .messages({
        "string.pattern.base": "txHash must be a valid 64-character hexadecimal string starting with 0x",
    });

const weiAmount = Joi.alternatives()
    .try(
        Joi.string().trim().pattern(/^[1-9][0-9]*$/),
        Joi.number().positive()
    )
    .messages({
        "alternatives.match": "Amount must be a positive integer token amount in wei representation",
    });

export const distributionIdParamSchema = Joi.object({
    distributionId: Joi.string().trim().required().messages({
        "any.required": "distributionId parameter is required",
    }),
});

export const recipientAddressParamSchema = Joi.object({
    address: ethAddress.required().messages({
        "any.required": "Recipient Ethereum address is required",
    }),
});

export const sourceParamsSchema = Joi.object({
    sourceType: Joi.string()
        .trim()
        .uppercase()
        .valid("PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT")
        .required(),
    sourceId: Joi.string().trim().required(),
});

export const royaltyHistoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string()
        .valid("newest", "oldest", "block_asc", "block_desc")
        .default("newest"),
    sourceType: Joi.string()
        .trim()
        .uppercase()
        .valid("PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT")
        .optional(),
    sourceId: Joi.string().trim().optional(),
    recipient: ethAddress.optional(),
    payer: ethAddress.optional(),
    status: Joi.string()
        .trim()
        .uppercase()
        .valid("PENDING", "DISTRIBUTED", "CANCELLED")
        .optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    verify: Joi.boolean().optional(),
});

export const royaltyReportQuerySchema = Joi.object({
    sourceType: Joi.string()
        .trim()
        .uppercase()
        .valid("PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT")
        .optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
});

const recipientShareItem = Joi.object({
    recipient: ethAddress.required(),
    shareBps: Joi.number().integer().min(1).max(10000).required(),
});

export const calculateSplitSchema = Joi.object({
    totalRevenue: weiAmount.required(),
    treasuryFeeBps: Joi.number().integer().min(0).max(2000).default(250),
    recipients: Joi.array().items(recipientShareItem).min(1).max(50).required(),
});

export const prepareDistributeSchema = Joi.object({
    sourceType: Joi.string()
        .trim()
        .uppercase()
        .valid("PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT")
        .default("DIRECT"),
    sourceId: Joi.string().trim().default("0"),
    purchaseId: Joi.string().trim().optional(),
    totalRevenue: weiAmount.when("purchaseId", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    recipients: Joi.array().items(recipientShareItem).min(1).max(50).required(),
});

export const syncTransactionSchema = Joi.object({
    txHash: txHash.required(),
});

export const reconcileParamSchema = Joi.object({
    distributionId: Joi.string().trim().optional(),
});
