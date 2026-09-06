import ModerationAudit from "../models/moderation-audit.model.js";

/**
 * Append-only audit logger.
 * Normal operations do not allow modification or deletion of audit entries.
 */
export const recordAudit = ({
    adminId,
    action,
    targetType,
    targetId,
    previousState,
    newState,
    reason,
    metadata = {},
}) => {
    return ModerationAudit.create({
        adminId,
        action,
        targetType,
        targetId: String(targetId),
        previousState,
        newState,
        reason,
        metadata,
    });
};

export const findMany = async ({
    page = 1,
    limit = 20,
    targetType,
    targetId,
    adminId,
    action,
    startDate,
    endDate,
} = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = String(targetId);
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [audits, total] = await Promise.all([
        ModerationAudit.find(filter)
            .populate("adminId", "name email role")
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        ModerationAudit.countDocuments(filter),
    ]);

    return {
        audits,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const findByTarget = (targetType, targetId, limit = 10) => {
    return ModerationAudit.find({ targetType, targetId: String(targetId) })
        .populate("adminId", "name email role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
