import Joi from "joi";

const ethAddress = Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/);
const isoDate = Joi.date().iso();
const interval = Joi.string().valid("day", "week", "month").default("day");

export const eventsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    contract: Joi.string().trim().max(100),
    eventName: Joi.string().trim().max(100),
    address: ethAddress,
    fromBlock: Joi.number().integer().min(0),
    toBlock: Joi.number().integer().min(0),
    startDate: isoDate,
    endDate: isoDate,
    datasetId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().trim().max(32)),
    modelId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().trim().max(32)),
});

export const tokenAnalyticsQuerySchema = Joi.object({
    startDate: isoDate,
    endDate: isoDate,
    interval,
});

export const gasAnalyticsQuerySchema = Joi.object({
    contract: Joi.string().trim().max(100),
    startDate: isoDate,
    endDate: isoDate,
    interval,
});

export const overviewQuerySchema = Joi.object({
    startDate: isoDate,
    endDate: isoDate,
});
