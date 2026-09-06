import mongoose from "mongoose";

const inferenceCallSchema = new mongoose.Schema(
    {
        modelRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Model",
            required: true,
            index: true,
        },
        modelId: {
            type: Number,
            default: null,
            index: true,
        },
        modelVersion: {
            type: Number,
            default: 1,
            min: 1,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        userWallet: {
            type: String,
            lowercase: true,
            trim: true,
            default: null,
        },
        device: {
            type: String,
            default: "cpu",
            trim: true,
        },
        status: {
            type: String,
            enum: ["SUCCESS", "FAILED"],
            default: "SUCCESS",
            index: true,
        },
        executionTimeMs: {
            type: Number,
            default: 0,
            min: 0,
        },
        errorCode: {
            type: String,
            enum: ["NOT_FOUND", "INACTIVE", "EXECUTION_ERROR", "TIMEOUT", "UNAUTHORIZED", "INTERNAL_ERROR"],
            default: null,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

inferenceCallSchema.index({ modelRef: 1, status: 1, timestamp: -1 });
inferenceCallSchema.index({ modelId: 1, status: 1, timestamp: -1 });
inferenceCallSchema.index({ userId: 1, timestamp: -1 });
inferenceCallSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model("InferenceCall", inferenceCallSchema);
