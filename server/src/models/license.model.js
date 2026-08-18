import mongoose from "mongoose";

const rightsSchema = new mongoose.Schema({
    canView: { type: Boolean, required: true },
    canDownload: { type: Boolean, required: true },
    canModify: { type: Boolean, required: true },
    canTrain: { type: Boolean, required: true },
    canInfer: { type: Boolean, required: true },
    canCommercialUse: { type: Boolean, required: true },
    canDistribute: { type: Boolean, required: true },
    canSublicense: { type: Boolean, required: true },
}, { _id: false });

const versionSnapshotSchema = new mongoose.Schema({
    version: { type: Number, required: true },
    fixedPrice: { type: String, required: true },
    royaltyRate: { type: Number, required: true },
    metadataURI: { type: String, required: true },
    rights: { type: rightsSchema, required: true },
    restrictions: { type: String, default: "" },
    updatedAt: { type: Date, required: true },
}, { _id: false });

const licenseSchema = new mongoose.Schema({
    licenseId: { type: Number, required: true, unique: true, index: true },
    assetId: { type: Number, required: true, index: true },
    assetType: { type: String, enum: ["DATASET", "MODEL"], required: true, index: true },
    licensor: { type: String, required: true, lowercase: true, trim: true, index: true },
    licenseType: { type: String, enum: ["ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM"], required: true, index: true },
    pricingModel: { type: String, enum: ["FIXED", "ROYALTY"], required: true, index: true },
    fixedPrice: { type: String, required: true, default: "0" },
    royaltyRate: { type: Number, required: true, min: 0, max: 10000, default: 0 },
    metadataURI: { type: String, required: true, trim: true },
    rights: { type: rightsSchema, required: true },
    restrictions: { type: String, default: "" },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, default: null },
    status: { type: String, enum: ["ACTIVE", "REVOKED", "EXPIRED"], required: true, index: true },
    version: { type: Number, required: true, default: 1, index: true },
    versions: { type: [versionSnapshotSchema], default: [] },
    blockchain: {
        contractAddress: { type: String, required: true, lowercase: true },
        transactionHash: { type: String, lowercase: true, default: null },
        blockNumber: { type: Number, default: null },
        chainId: { type: Number, required: true },
        state: { type: String, enum: ["PENDING", "CONFIRMED", "FAILED"], default: "CONFIRMED" },
        lastSyncedAt: { type: Date, default: Date.now },
    },
}, { timestamps: true });

licenseSchema.index({ assetType: 1, assetId: 1, status: 1 });
licenseSchema.index({ licensor: 1, status: 1 });
licenseSchema.index({ assetId: 1, status: 1 });

export default mongoose.model("License", licenseSchema);
