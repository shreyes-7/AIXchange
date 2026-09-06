import mongoose from "mongoose";

const provenanceSchema = new mongoose.Schema(
    {
        provenanceId: {
            type: Number,
            unique: true,
            sparse: true,
            index: true,
        },
        datasetId: {
            type: Number,
            required: true,
            index: true,
        },
        modelId: {
            type: Number,
            required: true,
            index: true,
        },
        modelVersion: {
            type: Number,
            required: true,
            min: 1,
            index: true,
        },
        executionId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        metadataHash: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        registrant: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        createdAtTimestamp: {
            type: Number,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
            index: true,
        },
        blockchain: {
            chainId: {
                type: Number,
                required: true,
            },
            contractAddress: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
            transactionHash: {
                type: String,
                lowercase: true,
                trim: true,
                default: null,
            },
            blockNumber: {
                type: Number,
                default: null,
            },
            transactionIndex: {
                type: Number,
                default: null,
            },
            logIndex: {
                type: Number,
                default: null,
            },
            eventIdentity: {
                type: String,
                unique: true,
                sparse: true,
                trim: true,
            },
            state: {
                type: String,
                enum: ["PREPARED", "PENDING", "CONFIRMED", "FAILED"],
                default: "CONFIRMED",
                index: true,
            },
        },
        indexedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Enforce atomic unique relationship: 1 dataset + 1 execution + 1 model + 1 version
provenanceSchema.index(
    { datasetId: 1, executionId: 1, modelId: 1, modelVersion: 1 },
    { unique: true }
);

// Performance compound index for model version lookups
provenanceSchema.index({ modelId: 1, modelVersion: 1 });

// Timeline sorting indexes
provenanceSchema.index({ modelId: 1, createdAt: -1 });
provenanceSchema.index({ datasetId: 1, createdAt: -1 });
provenanceSchema.index({ "blockchain.blockNumber": -1, "blockchain.logIndex": -1 });

export default mongoose.model("Provenance", provenanceSchema);
