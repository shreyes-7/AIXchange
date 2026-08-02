import Joi from "joi";

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

export const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character.",
        }),
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .required(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required(),

    password: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character.",
        }),
});