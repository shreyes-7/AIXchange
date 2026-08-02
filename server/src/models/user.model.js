import mongoose from "mongoose";

import { USER_ROLES } from "../config/constants.js";

const walletSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
        },

        chainId: {
            type: Number,
            default: null,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        linkedAt: {
            type: Date,
            default: null,
        },

        verificationNonce: {
            type: String,
            default: null,
            select: false,
        },

        nonceExpiresAt: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        _id: false,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
        },

        wallet: {
            type: walletSchema,
            default: () => ({}),
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerifiedAt: {
            type: Date,
            default: null,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;