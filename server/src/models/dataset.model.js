import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    version: { type: Number, required: true },
    changelog: { type: String, trim: true, maxlength: 4000, default: "" },
    cid: { type: String, required: true },
    contentHash: { type: String, required: true },
    encryption: {
        algorithm: { type: String, required: true },
        iv: { type: String, required: true },
        authTag: { type: String, required: true },
    },
    size: { type: Number, required: true },
    fileName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { _id: true });

const datasetSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200, index: true },
    description: { type: String, trim: true, maxlength: 10000, default: "" },
    category: { type: String, required: true, trim: true, lowercase: true, maxlength: 80, index: true },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    license: { type: String, required: true, trim: true, maxlength: 120 },
    royaltyBps: { type: Number, required: true, min: 0, max: 10000, default: 0 },
    visibility: { type: String, enum: ["public", "protected"], default: "protected", index: true },
    status: { type: String, enum: ["active", "archived", "hidden", "under_review", "removed"], default: "active", index: true },
    file: {
        cid: { type: String, required: true },
        contentHash: { type: String, required: true, index: true },
        size: { type: Number, required: true },
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        encryption: {
            algorithm: { type: String, required: true },
            iv: { type: String, required: true },
            authTag: { type: String, required: true },
        },
    },
    preview: { type: mongoose.Schema.Types.Mixed, default: null },
    currentVersion: { type: Number, default: 1 },
    versions: { type: [versionSchema], default: [] },
    reviews: { type: [reviewSchema], default: [] },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    blockchain: {
        datasetId: { type: String, default: null, index: true },
        txHash: { type: String, default: null, lowercase: true },
        owner: { type: String, default: null, lowercase: true },
        syncedAt: { type: Date, default: null },
    },
}, { timestamps: true });

datasetSchema.index({ title: "text", description: "text", tags: "text" });
datasetSchema.index({ category: 1, tags: 1, createdAt: -1 });
datasetSchema.index({ "reviews.user": 1 });

export default mongoose.model("Dataset", datasetSchema);
