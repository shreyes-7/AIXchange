import Joi from "joi";

export const generateNonceSchema = Joi.object({
    address: Joi.string()
        .trim()
        .lowercase()
        .required(),

    chainId: Joi.number()
        .required(),
});

export const verifyWalletSchema = Joi.object({
    address: Joi.string()
        .trim()
        .lowercase()
        .required(),

    signature: Joi.string()
        .required(),
});