import mongoose from "mongoose";

import { SESSION_STATUS } from "../config/constants.js";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        refreshToken: {
            type: String,
            required: true,
            select: false,
        },

        status: {
            type: String,
            enum: Object.values(SESSION_STATUS),
            default: SESSION_STATUS.ACTIVE,
        },

        device: {
            type: String,
            default: "Unknown Device",
        },

        ipAddress: {
            type: String,
            default: null,
        },

        userAgent: {
            type: String,
            default: null,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

sessionSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;