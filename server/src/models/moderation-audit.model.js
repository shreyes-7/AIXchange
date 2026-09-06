import mongoose from "mongoose";
import { MODERATION_ACTIONS } from "../config/constants.js";

const moderationAuditSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: Object.values(MODERATION_ACTIONS),
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            enum: ["USER", "DATASET", "MODEL", "REPORT", "FRAUD_FLAG"],
            required: true,
            index: true,
        },
        targetId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        previousState: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        newState: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
            immutable: true,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

moderationAuditSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
moderationAuditSchema.index({ adminId: 1, createdAt: -1 });
moderationAuditSchema.index({ action: 1, createdAt: -1 });

const ModerationAudit = mongoose.model("ModerationAudit", moderationAuditSchema);

export default ModerationAudit;
