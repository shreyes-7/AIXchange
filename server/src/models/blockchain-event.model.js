import mongoose from "mongoose";

const blockchainEventSchema = new mongoose.Schema(
    {
        chainId: { type: Number, required: true },
        contractAddress: { type: String, required: true, lowercase: true },
        contractName: { type: String, required: true },
        eventName: { type: String, required: true },
        transactionHash: { type: String, required: true, lowercase: true },
        blockNumber: { type: Number, required: true },
        blockHash: { type: String, required: true, lowercase: true },
        blockTimestamp: { type: Date, required: true },
        logIndex: { type: Number, required: true },
        arguments: { type: mongoose.Schema.Types.Mixed, default: {} },

        // Normalized domain fields
        tokenAddress: { type: String, lowercase: true },
        assetId: { type: String },
        datasetId: { type: String },
        modelId: { type: String },
        modelVersion: { type: Number },
        licenseId: { type: String },
        purchaseId: { type: String },
        distributionId: { type: String },
        amount: { type: String }, // Raw BigInt integer string (wei precision)
        amountFormatted: { type: Number }, // Human-readable decimal representation
        royaltyAmount: { type: String }, // Raw BigInt integer string
        royaltyAmountFormatted: { type: Number },
        feeAmount: { type: String }, // Raw BigInt integer string
        from: { type: String, lowercase: true },
        to: { type: String, lowercase: true },
    },
    { timestamps: true }
);

// Enforce event uniqueness identity: transactionHash + logIndex
blockchainEventSchema.index({ transactionHash: 1, logIndex: 1 }, { unique: true });

// Performance queries and filters
blockchainEventSchema.index({ chainId: 1, contractAddress: 1, blockNumber: 1 });
blockchainEventSchema.index({ eventName: 1, blockTimestamp: -1 });
blockchainEventSchema.index({ contractName: 1, blockTimestamp: -1 });
blockchainEventSchema.index({ from: 1, blockTimestamp: -1 });
blockchainEventSchema.index({ to: 1, blockTimestamp: -1 });
blockchainEventSchema.index({ blockTimestamp: -1 });
blockchainEventSchema.index({ datasetId: 1 });
blockchainEventSchema.index({ modelId: 1 });

export default mongoose.model("BlockchainEvent", blockchainEventSchema);
