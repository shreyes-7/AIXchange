import mongoose from "mongoose";

const indexerStateSchema = new mongoose.Schema({
    chainId: { type: Number, required: true },
    contractAddress: { type: String, required: true, lowercase: true },
    indexer: { type: String, required: true },
    lastIndexedBlock: { type: Number, required: true },
    lastSuccessfulSync: { type: Date },
    status: { type: String, default: "idle" },
}, { timestamps: true });

indexerStateSchema.index({ chainId: 1, contractAddress: 1, indexer: 1 }, { unique: true });

export default mongoose.model("IndexerState", indexerStateSchema);
