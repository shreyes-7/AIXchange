import mongoose from "mongoose";
import {
    REPORT_TARGET_TYPES,
    REPORT_CATEGORIES,
    REPORT_STATUS,
    REPORT_PRIORITIES,
} from "../config/constants.js";

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            enum: Object.values(REPORT_TARGET_TYPES),
            required: true,
            index: true,
        },
        targetId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            enum: Object.values(REPORT_CATEGORIES),
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 2000,
        },
        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.OPEN,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(REPORT_PRIORITIES),
            default: REPORT_PRIORITIES.MEDIUM,
            index: true,
        },
        assignedAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        resolution: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

reportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
