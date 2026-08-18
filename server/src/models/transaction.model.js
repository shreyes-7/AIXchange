import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    txHash: { type: String, required: true, lowercase: true, index: true },
    logIndex: { type: Number, required: true },
    blockNumber: { type: Number, required: true, index: true },
    contractAddress: { type: String, required: true, lowercase: true, index: true },
    eventType: { type: String, required: true, enum: ["Transfer", "TokensMinted", "TokensBurned", "DatasetPurchased"], index: true },
    from: { type: String, lowercase: true, index: true },
    to: { type: String, lowercase: true, index: true },
    amount: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
}, { timestamps: true });

transactionSchema.index({ txHash: 1, logIndex: 1 }, { unique: true });

export default mongoose.model("Transaction", transactionSchema);
