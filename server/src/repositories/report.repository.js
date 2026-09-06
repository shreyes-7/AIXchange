import Report from "../models/report.model.js";

export const createReport = (payload) => {
    return Report.create(payload);
};

export const findById = (reportId) => {
    return Report.findById(reportId)
        .populate("reporterId", "name email wallet.address")
        .populate("assignedAdminId", "name email");
};

export const findMany = async ({
    page = 1,
    limit = 20,
    status,
    category,
    targetType,
    priority,
    assignedAdminId,
    startDate,
    endDate,
    sort = "newest",
} = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (targetType) filter.targetType = targetType;
    if (priority) filter.priority = priority;
    if (assignedAdminId) filter.assignedAdminId = assignedAdminId;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        priority_desc: { priority: -1, createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const [reports, total] = await Promise.all([
        Report.find(filter)
            .populate("reporterId", "name email wallet.address")
            .populate("assignedAdminId", "name email")
            .sort(sortOrder)
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        Report.countDocuments(filter),
    ]);

    return {
        reports,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const updateReport = (reportId, updateFields) => {
    return Report.findByIdAndUpdate(
        reportId,
        { $set: updateFields },
        { returnDocument: "after" }
    )
        .populate("reporterId", "name email wallet.address")
        .populate("assignedAdminId", "name email");
};

export const countByTarget = (targetType, targetId) => {
    return Report.countDocuments({ targetType, targetId: String(targetId) });
};
