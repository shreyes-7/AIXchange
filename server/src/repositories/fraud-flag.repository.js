import FraudFlag from "../models/fraud-flag.model.js";

export const upsertFlags = async (flagsArray = []) => {
    if (!flagsArray.length) return [];

    const operations = flagsArray.map((flag) => ({
        updateOne: {
            filter: { flagId: flag.flagId },
            update: {
                $setOnInsert: {
                    flagId: flag.flagId,
                    ruleId: flag.ruleId,
                    severity: flag.severity,
                    address: flag.address?.toLowerCase(),
                    targetAddress: flag.targetAddress ? flag.targetAddress.toLowerCase() : null,
                    transactionHash: flag.transactionHash ? flag.transactionHash.toLowerCase() : null,
                    description: flag.description,
                    evidence: flag.evidence || {},
                    recommendedAction: flag.recommendedAction || "",
                    status: flag.status || "OPEN",
                    observedAt: flag.timestamp ? new Date(flag.timestamp) : new Date(),
                },
            },
            upsert: true,
        },
    }));

    await FraudFlag.bulkWrite(operations);
    const flagIds = flagsArray.map((f) => f.flagId);
    return FraudFlag.find({ flagId: { $in: flagIds } }).lean();
};

export const findById = (id) => {
    return FraudFlag.findById(id).populate("reviewedBy", "name email");
};

export const findByFlagId = (flagId) => {
    return FraudFlag.findOne({ flagId }).populate("reviewedBy", "name email");
};

export const findMany = async ({
    page = 1,
    limit = 20,
    severity,
    ruleId,
    status,
    address,
    transactionHash,
    startDate,
    endDate,
} = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (severity) filter.severity = severity;
    if (ruleId) filter.ruleId = ruleId;
    if (status) filter.status = status;
    if (address) filter.address = address.toLowerCase().trim();
    if (transactionHash) filter.transactionHash = transactionHash.toLowerCase().trim();

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [flags, total] = await Promise.all([
        FraudFlag.find(filter)
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        FraudFlag.countDocuments(filter),
    ]);

    return {
        flags,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const updateReviewStatus = (id, { status, reviewedBy, reviewNotes }) => {
    return FraudFlag.findByIdAndUpdate(
        id,
        {
            $set: {
                status,
                reviewedBy,
                reviewNotes,
                reviewedAt: new Date(),
            },
        },
        { returnDocument: "after" }
    ).populate("reviewedBy", "name email");
};
