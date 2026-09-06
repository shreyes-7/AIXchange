import mongoose from "mongoose";

const recipientAllocationSchema = new mongoose.Schema(
    {
        recipient: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        shareBps: {
            type: Number,
            required: true,
            min: 0,
            max: 10000,
        },
        amount: {
            type: String,
            required: true,
            trim: true,
        },
        paid: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const royaltyDistributionSchema = new mongoose.Schema(
    {
        distributionId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            index: true,
        },
        sourceKey: {
            type: String,
            trim: true,
            lowercase: true,
            index: true,
        },
        sourceType: {
            type: String,
            required: true,
            enum: ["PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT"],
            index: true,
        },
        sourceTypeNum: {
            type: Number,
            required: true,
            enum: [0, 1, 2, 3],
            index: true,
        },
        sourceId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        payer: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        totalRevenue: {
            type: String,
            required: true,
            trim: true,
        },
        treasuryAmount: {
            type: String,
            required: true,
            trim: true,
            default: "0",
        },
        treasuryFeeBps: {
            type: Number,
            default: 0,
            min: 0,
            max: 10000,
        },
        recipientCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        recipients: {
            type: [recipientAllocationSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ["PENDING", "DISTRIBUTED", "CANCELLED"],
            default: "DISTRIBUTED",
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
                trim: true,
                lowercase: true,
            },
            transactionHash: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
                index: true,
            },
            blockNumber: {
                type: Number,
                required: true,
                index: true,
            },
            transactionIndex: {
                type: Number,
                default: 0,
            },
            logIndex: {
                type: Number,
                default: 0,
            },
            state: {
                type: String,
                enum: ["PREPARED", "PENDING", "CONFIRMED", "FAILED"],
                default: "CONFIRMED",
                index: true,
            },
        },
        blockTimestamp: {
            type: Date,
            required: true,
            index: true,
        },
        blockTimestampUnix: {
            type: String,
            required: true,
            trim: true,
        },
        reconciled: {
            type: Boolean,
            default: false,
            index: true,
        },
        reconciledAt: {
            type: Date,
            default: null,
        },
        reconciliationDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Performance & domain query indexes
royaltyDistributionSchema.index({ sourceType: 1, sourceId: 1 });
royaltyDistributionSchema.index({ "recipients.recipient": 1, blockTimestamp: -1 });
royaltyDistributionSchema.index({ payer: 1, blockTimestamp: -1 });
royaltyDistributionSchema.index({ blockTimestamp: -1 });
royaltyDistributionSchema.index({ "blockchain.blockNumber": -1 });

export default mongoose.model("RoyaltyDistribution", royaltyDistributionSchema);
