import mongoose from "mongoose";

const cashoutSchema = new mongoose.Schema(
    {
        cashoutId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        creatorWalletAddress: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        tokenAmount: {
            type: Number,
            required: true,
            min: 1,
        },
        grossInrAmount: {
            type: Number,
            required: true,
        },
        feeInrAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        netPayoutInrAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "REQUESTED",
                "APPROVED",
                "PROCESSING",
                "COMPLETED",
                "FAILED",
                "REJECTED",
            ],
            default: "REQUESTED",
            index: true,
        },
        bankDetails: {
            accountNumber: { type: String, default: null },
            ifsc: { type: String, default: null },
            upiId: { type: String, default: null },
            accountHolderName: { type: String, default: null },
        },
        escrowTxHash: {
            type: String,
            default: null,
        },
        burnTxHash: {
            type: String,
            default: null,
        },
        releaseTxHash: {
            type: String,
            default: null,
        },
        payoutReferenceId: {
            type: String,
            default: null,
        },
        failureReason: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Cashout = mongoose.model("Cashout", cashoutSchema);

export default Cashout;
