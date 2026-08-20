import mongoose from "mongoose";
import { SANDBOX_FILE_CATEGORIES } from "../utils/constants.js";

const sandboxFileSchema = new mongoose.Schema({
    fileId: { type: String, required: true, unique: true, index: true },
    sandboxId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    checksum: { type: String, required: true }, // SHA-256
    category: {
        type: String,
        enum: Object.values(SANDBOX_FILE_CATEGORIES),
        default: SANDBOX_FILE_CATEGORIES.OTHER,
        index: true,
    },
}, { timestamps: true });

sandboxFileSchema.index({ sandboxId: 1, category: 1 });
sandboxFileSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SandboxFile", sandboxFileSchema);
