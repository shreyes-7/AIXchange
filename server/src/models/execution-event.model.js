import mongoose from "mongoose";

const executionEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true, index: true },
    sandboxId: { type: String, required: true, index: true },
    executionId: { type: String, default: null, index: true },
    eventType: {
        type: String,
        required: true,
        enum: [
            "CREATED",
            "FILE_UPLOADED",
            "FILE_DELETED",
            "TRAINING_STARTED",
            "STATUS_SYNC",
            "METRICS_UPDATED",
            "COMPLETED",
            "FAILED",
            "CANCELLED",
            "TIMEOUT",
            "JUPYTER_STARTED",
            "JUPYTER_STOPPED",
        ],
        index: true,
    },
    message: { type: String, default: "" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

executionEventSchema.index({ sandboxId: 1, timestamp: 1 });
executionEventSchema.index({ executionId: 1, timestamp: 1 });

export default mongoose.model("ExecutionEvent", executionEventSchema);
