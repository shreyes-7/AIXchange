import mongoose from "mongoose";
import { FRAUD_REVIEW_STATUS, FRAUD_SEVERITY } from "../config/constants.js";

const fraudFlagSchema = new mongoose.Schema(
    {
        flagId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        ruleId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        severity: {
            type: String,
            enum: Object.values(FRAUD_SEVERITY),
            required: true,
            index: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        targetAddress: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
        },
        transactionHash: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        evidence: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        recommendedAction: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(FRAUD_REVIEW_STATUS),
            default: FRAUD_REVIEW_STATUS.OPEN,
            index: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewNotes: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        observedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

fraudFlagSchema.index({ severity: 1, status: 1, createdAt: -1 });
fraudFlagSchema.index({ address: 1, createdAt: -1 });
fraudFlagSchema.index({ ruleId: 1, createdAt: -1 });

const FraudFlag = mongoose.model("FraudFlag", fraudFlagSchema);

export default FraudFlag;
