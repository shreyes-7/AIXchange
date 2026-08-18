import mongoose from "mongoose";

const royaltySchema = new mongoose.Schema({
    purchaseId: { type: Number, required: true },
    assetId: { type: Number, required: true },
    licenseId: { type: Number, required: true },
    licensorWallet: { type: String, required: true, lowercase: true },
    licensorAmount: { type: String, required: true },
    feeAmount: { type: String, required: true },
    transactionHash: { type: String, required: true, lowercase: true },
    logIndex: { type: Number, required: true },
    blockNumber: { type: Number, required: true },
    timestamp: { type: Date, required: true },
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
    purchaseId: { type: Number, unique: true, sparse: true, index: true },
    datasetId: { type: Number, required: true, index: true },
    licenseId: { type: Number, required: true, index: true },
    buyerWallet: { type: String, required: true, lowercase: true, index: true },
    licensorWallet: { type: String, required: true, lowercase: true },
    price: { type: String, default: "0" },
    feeAmount: { type: String, default: "0" },
    licensorAmount: { type: String, default: "0" },
    transactionHash: { type: String, required: true, lowercase: true, index: true },
    logIndex: { type: Number, default: null },
    blockNumber: { type: Number, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "FAILED"], required: true, default: "PENDING", index: true },
    chainId: { type: Number, required: true, index: true },
    contractAddress: { type: String, required: true, lowercase: true },
    royalty: { type: royaltySchema, default: null },
    lastVerifiedAt: { type: Date, default: null },
}, { timestamps: true });

purchaseSchema.index({ transactionHash: 1, logIndex: 1 }, { unique: true, sparse: true });
purchaseSchema.index({ buyerWallet: 1, status: 1, timestamp: -1 });
purchaseSchema.index({ datasetId: 1, status: 1, timestamp: -1 });

export default mongoose.model("Purchase", purchaseSchema);
