import mongoose from "mongoose";
import {
    SANDBOX_STATUS,
    FRAMEWORK_TYPES,
    OPTIMIZER_TYPES,
    LOSS_FUNCTIONS,
} from "../utils/constants.js";

const epochMetricSchema = new mongoose.Schema({
    epoch: { type: Number, required: true },
    trainLoss: { type: Number, required: true },
    trainAccuracy: { type: Number, default: null },
    valLoss: { type: Number, default: null },
    valAccuracy: { type: Number, default: null },
    learningRate: { type: Number, default: 0.001 },
    durationSeconds: { type: Number, default: 0 },
    timestamp: { type: Number, default: () => Date.now() / 1000 },
}, { _id: false });

const modelSpecSchema = new mongoose.Schema({
    modelType: { type: String, default: "mlp" },
    inputDim: { type: Number, required: true },
    hiddenDims: { type: [Number], default: [64, 32] },
    outputDim: { type: Number, required: true },
    activation: { type: String, default: "relu" },
    dropoutRate: { type: Number, default: 0.0 },
}, { _id: false });

const datasetSpecSchema = new mongoose.Schema({
    datasetId: { type: Number, default: null },
    cid: { type: String, default: null },
    localPath: { type: String, default: null },
    format: { type: String, default: "csv" },
    targetColumn: { type: String, default: null },
    featureColumns: { type: [String], default: [] },
    testSplitRatio: { type: Number, default: 0.2 },
}, { _id: false });

const hyperparametersSchema = new mongoose.Schema({
    epochs: { type: Number, default: 10 },
    batchSize: { type: Number, default: 32 },
    learningRate: { type: Number, default: 0.001 },
    optimizer: {
        type: String,
        enum: Object.values(OPTIMIZER_TYPES),
        default: OPTIMIZER_TYPES.ADAM,
    },
    lossFunction: {
        type: String,
        enum: Object.values(LOSS_FUNCTIONS),
        default: LOSS_FUNCTIONS.CROSS_ENTROPY,
    },
    weightDecay: { type: Number, default: 0.0 },
    gradClipNorm: { type: Number, default: null },
    lrDecayStep: { type: Number, default: null },
    lrDecayGamma: { type: Number, default: 0.1 },
}, { _id: false });

const trainingConfigSchema = new mongoose.Schema({
    framework: {
        type: String,
        enum: Object.values(FRAMEWORK_TYPES),
        default: FRAMEWORK_TYPES.PYTORCH,
    },
    modelSpec: { type: modelSpecSchema, required: true },
    dataset: { type: datasetSpecSchema, required: true },
    hyperparameters: { type: hyperparametersSchema, default: () => ({}) },
    checkpointInterval: { type: Number, default: 5 },
    keepTopKCheckpoints: { type: Number, default: 3 },
    device: { type: String, default: "cpu" },
    timeoutSeconds: { type: Number, default: 3600 },
    exportFormat: { type: String, default: "safetensors" },
}, { _id: false });

const sandboxSchema = new mongoose.Schema({
    sandboxId: { type: String, required: true, unique: true, index: true },
    executionId: { type: String, unique: true, sparse: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    datasetId: { type: Number, required: true, index: true },
    licenseId: { type: Number, required: true, index: true },
    datasetRef: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset", default: null },
    status: {
        type: String,
        enum: Object.values(SANDBOX_STATUS),
        default: SANDBOX_STATUS.CREATING,
        required: true,
        index: true,
    },
    trainingConfig: { type: trainingConfigSchema, default: null },
    files: [{
        fileId: { type: String, required: true },
        originalName: { type: String, required: true },
        storedName: { type: String, required: true },
        mimeType: { type: String, default: "application/octet-stream" },
        sizeBytes: { type: Number, required: true },
        category: { type: String, default: "other" },
        checksum: { type: String, required: true },
        storagePath: { type: String, required: true },
    }],
    metrics: {
        currentEpoch: { type: Number, default: 0 },
        totalEpochs: { type: Number, default: 0 },
        bestValLoss: { type: Number, default: null },
        bestValAccuracy: { type: Number, default: null },
        trainLoss: { type: Number, default: null },
        valLoss: { type: Number, default: null },
        trainAccuracy: { type: Number, default: null },
        valAccuracy: { type: Number, default: null },
        learningRate: { type: Number, default: null },
        history: { type: [epochMetricSchema], default: [] },
    },
    artifact: {
        artifactPath: { type: String, default: null },
        metadataPath: { type: String, default: null },
        summaryPath: { type: String, default: null },
        artifactHash: { type: String, default: null },
        modelMetadata: { type: mongoose.Schema.Types.Mixed, default: null },
        validated: { type: Boolean, default: false },
    },
    jupyter: {
        active: { type: Boolean, default: false },
        port: { type: String, default: null },
        url: { type: String, default: null },
        startedAt: { type: Date, default: null },
        stoppedAt: { type: Date, default: null },
    },
    failureReason: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastSyncedAt: { type: Date, default: null },
}, { timestamps: true });

sandboxSchema.index({ userId: 1, status: 1, createdAt: -1 });
sandboxSchema.index({ datasetId: 1, status: 1 });
sandboxSchema.index({ status: 1, lastSyncedAt: 1 });

export default mongoose.model("Sandbox", sandboxSchema);
