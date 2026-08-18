import Joi from "joi";

const MAX_UINT256 = (1n << 256n) - 1n;

const uint256 = Joi.alternatives().try(Joi.string().pattern(/^(0|[1-9]\d*)$/).max(78), Joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER));
const rights = Joi.object({
    canView: Joi.boolean().required(), canDownload: Joi.boolean().required(), canModify: Joi.boolean().required(), canTrain: Joi.boolean().required(),
    canInfer: Joi.boolean().required(), canCommercialUse: Joi.boolean().required(), canDistribute: Joi.boolean().required(), canSublicense: Joi.boolean().required(),
}).required();
const isoDate = Joi.date().iso();

export const createLicenseSchema = Joi.object({
    assetId: Joi.alternatives().try(Joi.number().integer().positive(), uint256).required(),
    assetType: Joi.string().valid("DATASET", "MODEL").required(),
    licenseType: Joi.string().valid("ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM").required(),
    pricingModel: Joi.string().valid("FIXED", "ROYALTY").required(),
    fixedPrice: uint256.default("0"),
    royaltyRate: Joi.number().integer().min(0).max(10000).default(0),
    metadataURI: Joi.string().trim().max(2048).required(),
    rights,
    restrictions: Joi.string().trim().max(10000).default(""),
    validFrom: isoDate.allow(null).default(null),
    validUntil: isoDate.allow(null).default(null),
}).custom((value, helpers) => {
    const price = BigInt(value.fixedPrice || "0");
    if (price > MAX_UINT256) return helpers.error("any.invalid", { message: "fixedPrice must fit in a uint256." });
    if (value.pricingModel === "FIXED" && (price <= 0n || value.royaltyRate !== 0)) return helpers.error("any.invalid", { message: "FIXED pricing requires fixedPrice > 0 and royaltyRate = 0." });
    if (value.pricingModel === "ROYALTY" && (price !== 0n || value.royaltyRate < 1 || value.royaltyRate > 10000)) return helpers.error("any.invalid", { message: "ROYALTY pricing requires fixedPrice = 0 and royaltyRate between 1 and 10000 BPS." });
    if (value.validFrom && value.validUntil && value.validUntil < value.validFrom) return helpers.error("any.invalid", { message: "validUntil must be greater than or equal to validFrom." });
    return value;
}).messages({ "any.invalid": "{{#message}}" });

export const updateLicenseSchema = Joi.object({
    fixedPrice: uint256, royaltyRate: Joi.number().integer().min(0).max(10000),
    metadataURI: Joi.string().trim().max(2048), rights: rights.optional(), restrictions: Joi.string().trim().max(10000),
}).min(1);
export const listLicenseSchema = Joi.object({
    assetId: Joi.alternatives().try(Joi.number().integer().positive(), uint256), assetType: Joi.string().valid("DATASET", "MODEL"),
    licensor: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/), licenseType: Joi.string().valid("ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM"),
    pricingModel: Joi.string().valid("FIXED", "ROYALTY"), status: Joi.string().valid("ACTIVE", "REVOKED", "EXPIRED"),
    active: Joi.boolean(), version: Joi.number().integer().positive(), page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), sort: Joi.string().valid("newest", "oldest", "version", "licenseId").default("newest"),
});
export const licenseIdSchema = Joi.object({ licenseId: Joi.number().integer().positive().required() });
export const assetIdParamSchema = Joi.object({ assetId: Joi.string().pattern(/^[1-9]\d*$/).required() });
export const licensorParamSchema = Joi.object({ address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required() });
export const syncLicenseSchema = Joi.object({ licenseId: Joi.number().integer().positive(), txHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(), operation: Joi.string().valid("create", "update", "revoke").default("create") }).custom((value, helpers) => { if (value.operation !== "create" && !value.licenseId) return helpers.error("any.invalid", { message: "licenseId is required for update and revoke synchronization." }); return value; }).messages({ "any.invalid": "{{#message}}" });
