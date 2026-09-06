import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
    {
        datasetId: {
            type: Number,
            required: true,
            index: true,
        },
        datasetRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dataset",
            default: null,
            index: true,
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
        fileName: {
            type: String,
            default: "",
            trim: true,
        },
        fileSize: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["SUCCESS", "FAILED"],
            default: "SUCCESS",
            index: true,
        },
        errorCode: {
            type: String,
            enum: ["NOT_FOUND", "UNAUTHORIZED", "STORAGE_ERROR", "PAYLOAD_TOO_LARGE", "DECRYPTION_ERROR", "INTERNAL_ERROR"],
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

downloadSchema.index({ datasetId: 1, status: 1, timestamp: -1 });
downloadSchema.index({ userId: 1, timestamp: -1 });
downloadSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model("Download", downloadSchema);
