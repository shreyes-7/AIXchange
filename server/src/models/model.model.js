import mongoose from "mongoose";

const modelVersionSchema = new mongoose.Schema(
    {
        versionNumber: { type: Number, required: true, min: 1 },
        modelHash: { type: String, required: true, trim: true, lowercase: true },
        metadataURI: { type: String, required: true, trim: true },
        artifactPath: { type: String, default: null, trim: true },
        fileSize: { type: Number, default: 0, min: 0 },
        changelog: { type: String, trim: true, maxlength: 4000, default: "" },
        createdAt: { type: Date, default: Date.now },
        active: { type: Boolean, default: true },
    },
    { _id: false }
);

const modelSchema = new mongoose.Schema(
    {
        blockchainModelId: {
            type: Number,
            default: null,
            index: true,
            sparse: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        ownerWallet: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 10000,
            default: "",
        },
        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 80,
            index: true,
        },
        tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
        framework: {
            type: String,
            enum: ["PyTorch", "TensorFlow", "Scikit-Learn", "ONNX", "Safetensors", "Other"],
            default: "PyTorch",
            index: true,
        },
        modelType: {
            type: String,
            trim: true,
            default: "general",
            index: true,
        },
        metadataURI: {
            type: String,
            required: true,
            trim: true,
        },
        currentVersion: {
            type: Number,
            default: 1,
            min: 1,
        },
        totalVersions: {
            type: Number,
            default: 1,
            min: 1,
        },
        active: {
            type: Boolean,
            default: true,
            index: true,
        },
        versions: {
            type: [modelVersionSchema],
            default: [],
        },
        blockchain: {
            contractAddress: { type: String, lowercase: true, trim: true, default: null },
            transactionHash: { type: String, lowercase: true, trim: true, default: null },
            blockNumber: { type: Number, default: null },
            chainId: { type: Number, default: null },
            state: {
                type: String,
                enum: ["PREPARED", "PENDING", "CONFIRMED", "FAILED"],
                default: "PREPARED",
                index: true,
            },
            lastSyncedAt: { type: Date, default: null },
        },
        inferenceConfig: {
            device: { type: String, default: "cpu" },
            batchSize: { type: Number, default: 1, min: 1, max: 128 },
            timeoutMs: { type: Number, default: 30000, min: 1000, max: 120000 },
        },
    },
    { timestamps: true }
);

modelSchema.index({ ownerWallet: 1, name: 1 }, { unique: true });
modelSchema.index({ name: "text", description: "text", tags: "text" });
modelSchema.index({ active: 1, createdAt: -1 });
modelSchema.index({ category: 1, active: 1 });
modelSchema.index({ framework: 1, active: 1 });

export default mongoose.model("Model", modelSchema);
