import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId: {
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
        walletAddress: {
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
        fiatAmount: {
            type: Number,
            required: true,
            min: 1,
        },
        currency: {
            type: String,
            default: "INR",
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "PAID",
                "MINTED",
                "MINT_FAILED",
                "REFUND_REQUESTED",
                "REFUNDED",
                "FAILED",
            ],
            default: "PENDING",
            index: true,
        },
        paymentGateway: {
            type: String,
            default: "sandbox",
        },
        gatewayPaymentId: {
            type: String,
            sparse: true,
            unique: true,
            index: true,
        },
        gatewaySignature: {
            type: String,
            default: null,
        },
        mintAttempt: {
            type: Number,
            default: 0,
        },
        retryCount: {
            type: Number,
            default: 0,
        },
        mintStartedAt: {
            type: Date,
            default: null,
        },
        mintConfirmedAt: {
            type: Date,
            default: null,
        },
        lastRetryAt: {
            type: Date,
            default: null,
        },
        mintTxHash: {
            type: String,
            default: null,
        },
        mintBlockNumber: {
            type: Number,
            default: null,
        },
        failureReason: {
            type: String,
            default: null,
        },
        refundReason: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
