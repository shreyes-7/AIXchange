import mongoose from "mongoose";
import * as fraudFlagRepository from "../repositories/fraud-flag.repository.js";
import * as auditRepository from "../repositories/moderation-audit.repository.js";
import ApiError from "../utils/ApiError.js";
import { MODERATION_ACTIONS, FRAUD_REVIEW_STATUS } from "../config/constants.js";

/**
 * Ingests structured fraud flags produced by blockchain monitoring.
 * Does NOT independently evaluate raw blockchain events.
 */
export const ingestFlags = async (flagsArray = []) => {
    return fraudFlagRepository.upsertFlags(flagsArray);
};

export const listFraudFlags = (queryParams) => {
    return fraudFlagRepository.findMany(queryParams);
};

export const getFraudFlag = async (id) => {
    let flag;
    if (mongoose.isValidObjectId(id)) {
        flag = await fraudFlagRepository.findById(id);
    } else {
        flag = await fraudFlagRepository.findByFlagId(id);
    }

    if (!flag) {
        throw new ApiError(404, "Fraud flag not found.");
    }

    const recentAudits = await auditRepository.findByTarget("FRAUD_FLAG", flag._id, 5);

    return {
        ...flag.toObject(),
        recentAudits,
    };
};

export const reviewFraudFlag = async (
    id,
    { status: newStatus, reviewNotes },
    currentAdmin,
    metadata = {}) => {
    let flag;
    if (mongoose.isValidObjectId(id)) {
        flag = await fraudFlagRepository.findById(id);
    } else {
        flag = await fraudFlagRepository.findByFlagId(id);
    }

    if (!flag) {
        throw new ApiError(404, "Fraud flag not found.");
    }

    if (flag.status === newStatus) {
        return flag;
    }

    // Enforce valid transitions: OPEN / UNDER_REVIEW -> CONFIRMED / DISMISSED / UNDER_REVIEW
    const validTransitions = {
        [FRAUD_REVIEW_STATUS.OPEN]: [
            FRAUD_REVIEW_STATUS.UNDER_REVIEW,
            FRAUD_REVIEW_STATUS.CONFIRMED,
            FRAUD_REVIEW_STATUS.DISMISSED,
        ],
        [FRAUD_REVIEW_STATUS.UNDER_REVIEW]: [
            FRAUD_REVIEW_STATUS.CONFIRMED,
            FRAUD_REVIEW_STATUS.DISMISSED,
            FRAUD_REVIEW_STATUS.OPEN,
        ],
        [FRAUD_REVIEW_STATUS.CONFIRMED]: [FRAUD_REVIEW_STATUS.UNDER_REVIEW],
        [FRAUD_REVIEW_STATUS.DISMISSED]: [FRAUD_REVIEW_STATUS.UNDER_REVIEW],
    };

    const allowed = validTransitions[flag.status] || [];
    if (!allowed.includes(newStatus)) {
        throw new ApiError(400, `Cannot transition fraud flag from ${flag.status} to ${newStatus}.`);
    }

    const previousStatus = flag.status;
    const updated = await fraudFlagRepository.updateReviewStatus(flag._id, {
        status: newStatus,
        reviewedBy: currentAdmin.userId,
        reviewNotes,
    });

    // Append-only audit record
    await auditRepository.recordAudit({
        adminId: currentAdmin.userId,
        action: MODERATION_ACTIONS.FRAUD_FLAG_REVIEW,
        targetType: "FRAUD_FLAG",
        targetId: flag._id,
        previousState: { status: previousStatus },
        newState: { status: newStatus, reviewNotes },
        reason: reviewNotes,
        metadata,
    });

    // NOTE: In strict adherence to Rule 40, confirming a fraud flag does NOT
    // automatically suspend users or trigger on-chain mutations.
    return updated;
};
