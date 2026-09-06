import RoyaltyDistribution from "../models/royalty-distribution.model.js";

const parsePagination = (options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const parseSort = (sortOption) => {
    if (sortOption === "oldest") return { blockTimestamp: 1, _id: 1 };
    if (sortOption === "block_asc") return { "blockchain.blockNumber": 1, "blockchain.logIndex": 1, _id: 1 };
    if (sortOption === "block_desc") return { "blockchain.blockNumber": -1, "blockchain.logIndex": -1, _id: -1 };
    return { blockTimestamp: -1, _id: -1 }; // newest by default
};

export const createOrUpsertDistribution = async (distributionData) => {
    const distributionId = String(distributionData.distributionId);
    return RoyaltyDistribution.findOneAndUpdate(
        { distributionId },
        { $set: distributionData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

export const addRecipientAllocation = async (distributionId, allocation) => {
    const distId = String(distributionId);
    const recipientAddr = allocation.recipient.trim().toLowerCase();
    const amountStr = String(allocation.amount);
    const shareBpsNum = Number(allocation.shareBps);

    const doc = await RoyaltyDistribution.findOne({ distributionId: distId });
    if (!doc) {
        return null;
    }

    const existingIndex = doc.recipients.findIndex(
        (r) => r.recipient.toLowerCase() === recipientAddr
    );

    if (existingIndex >= 0) {
        doc.recipients[existingIndex].amount = amountStr;
        doc.recipients[existingIndex].shareBps = shareBpsNum;
        doc.recipients[existingIndex].paid = allocation.paid ?? true;
    } else {
        doc.recipients.push({
            recipient: recipientAddr,
            shareBps: shareBpsNum,
            amount: amountStr,
            paid: allocation.paid ?? true,
        });
    }

    doc.recipientCount = doc.recipients.length;
    return doc.save();
};

export const updateTreasuryAllocation = async (distributionId, { treasuryAmount, feeBps }) => {
    const distId = String(distributionId);
    return RoyaltyDistribution.findOneAndUpdate(
        { distributionId: distId },
        {
            $set: {
                treasuryAmount: String(treasuryAmount),
                treasuryFeeBps: Number(feeBps),
            },
        },
        { new: true }
    );
};

export const markDistributionCompleted = async (distributionId, { totalDistributed, recipientCount, timestamp }) => {
    const distId = String(distributionId);
    const update = {
        status: "DISTRIBUTED",
    };
    if (totalDistributed !== undefined) {
        update.totalRevenue = String(totalDistributed);
    }
    if (recipientCount !== undefined) {
        update.recipientCount = Number(recipientCount);
    }
    if (timestamp !== undefined) {
        update.blockTimestampUnix = String(timestamp);
        update.blockTimestamp = new Date(Number(timestamp) * 1000);
    }

    return RoyaltyDistribution.findOneAndUpdate(
        { distributionId: distId },
        { $set: update },
        { new: true }
    );
};

export const findByDistributionId = (distributionId) => {
    if (distributionId === undefined || distributionId === null) return Promise.resolve(null);
    return RoyaltyDistribution.findOne({ distributionId: String(distributionId) });
};

export const findByMongoId = (id) => {
    return RoyaltyDistribution.findById(id);
};

export const findBySource = (sourceType, sourceId) => {
    const filter = {
        sourceType: String(sourceType).toUpperCase(),
        sourceId: String(sourceId),
    };
    return RoyaltyDistribution.findOne(filter);
};

export const findByRecipient = async (recipientAddress, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const addr = String(recipientAddress).trim().toLowerCase();
    const filter = { "recipients.recipient": addr };

    const [records, total] = await Promise.all([
        RoyaltyDistribution.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        RoyaltyDistribution.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const findByTransactionHash = (txHash) => {
    if (!txHash) return Promise.resolve(null);
    return RoyaltyDistribution.findOne({
        "blockchain.transactionHash": String(txHash).trim().toLowerCase(),
    });
};

export const findByStatus = async (status, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const filter = { status: String(status).toUpperCase() };

    const [records, total] = await Promise.all([
        RoyaltyDistribution.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        RoyaltyDistribution.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const findHistory = async (filters = {}, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const query = {};

    if (filters.sourceType) {
        query.sourceType = String(filters.sourceType).toUpperCase();
    }
    if (filters.sourceId !== undefined && filters.sourceId !== "") {
        query.sourceId = String(filters.sourceId);
    }
    if (filters.recipient) {
        query["recipients.recipient"] = String(filters.recipient).trim().toLowerCase();
    }
    if (filters.payer) {
        query.payer = String(filters.payer).trim().toLowerCase();
    }
    if (filters.status) {
        query.status = String(filters.status).toUpperCase();
    }
    if (filters.from || filters.to) {
        query.blockTimestamp = {};
        if (filters.from) query.blockTimestamp.$gte = new Date(filters.from);
        if (filters.to) query.blockTimestamp.$lte = new Date(filters.to);
    }

    const [records, total] = await Promise.all([
        RoyaltyDistribution.find(query)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        RoyaltyDistribution.countDocuments(query),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const getSummary = async (filters = {}) => {
    const query = {};
    if (filters.sourceType) {
        query.sourceType = String(filters.sourceType).toUpperCase();
    }
    if (filters.from || filters.to) {
        query.blockTimestamp = {};
        if (filters.from) query.blockTimestamp.$gte = new Date(filters.from);
        if (filters.to) query.blockTimestamp.$lte = new Date(filters.to);
    }

    const docs = await RoyaltyDistribution.find(query).select("totalRevenue treasuryAmount recipients");

    let totalRevenueWei = 0n;
    let totalTreasuryWei = 0n;
    let totalDistributedWei = 0n;
    const recipientSet = new Set();

    for (const doc of docs) {
        try {
            if (doc.totalRevenue) totalRevenueWei += BigInt(doc.totalRevenue);
        } catch {
            // Ignore parse errors on invalid values
        }
        try {
            if (doc.treasuryAmount) totalTreasuryWei += BigInt(doc.treasuryAmount);
        } catch {
            // Ignore parse errors
        }

        if (Array.isArray(doc.recipients)) {
            for (const r of doc.recipients) {
                if (r.recipient) recipientSet.add(r.recipient.toLowerCase());
                try {
                    if (r.amount) totalDistributedWei += BigInt(r.amount);
                } catch {
                    // Ignore parse errors
                }
            }
        }
    }

    return {
        totalRevenue: totalRevenueWei.toString(),
        totalTreasury: totalTreasuryWei.toString(),
        totalDistributed: totalDistributedWei.toString(),
        distributionCount: docs.length,
        uniqueRecipientsCount: recipientSet.size,
    };
};

export const getReports = async (options = {}) => {
    const query = {};
    if (options.sourceType) {
        query.sourceType = String(options.sourceType).toUpperCase();
    }
    if (options.from || options.to) {
        query.blockTimestamp = {};
        if (options.from) query.blockTimestamp.$gte = new Date(options.from);
        if (options.to) query.blockTimestamp.$lte = new Date(options.to);
    }

    const docs = await RoyaltyDistribution.find(query).sort({ blockTimestamp: 1 });

    // Breakdown by sourceType
    const bySource = {
        PURCHASE: { count: 0, revenue: 0n, distributed: 0n, treasury: 0n },
        DERIVATIVE: { count: 0, revenue: 0n, distributed: 0n, treasury: 0n },
        INFERENCE: { count: 0, revenue: 0n, distributed: 0n, treasury: 0n },
        DIRECT: { count: 0, revenue: 0n, distributed: 0n, treasury: 0n },
    };

    // Breakdown by date (YYYY-MM-DD)
    const byDate = {};

    // Recipient totals
    const recipientTotals = {};

    for (const doc of docs) {
        const src = doc.sourceType || "DIRECT";
        if (!bySource[src]) {
            bySource[src] = { count: 0, revenue: 0n, distributed: 0n, treasury: 0n };
        }
        bySource[src].count += 1;

        let rev = 0n;
        let treas = 0n;
        try { if (doc.totalRevenue) rev = BigInt(doc.totalRevenue); } catch {}
        try { if (doc.treasuryAmount) treas = BigInt(doc.treasuryAmount); } catch {}

        bySource[src].revenue += rev;
        bySource[src].treasury += treas;

        const dateKey = doc.blockTimestamp
            ? doc.blockTimestamp.toISOString().slice(0, 10)
            : "unknown";
        if (!byDate[dateKey]) {
            byDate[dateKey] = { date: dateKey, count: 0, revenue: 0n, distributed: 0n, treasury: 0n };
        }
        byDate[dateKey].count += 1;
        byDate[dateKey].revenue += rev;
        byDate[dateKey].treasury += treas;

        if (Array.isArray(doc.recipients)) {
            for (const r of doc.recipients) {
                let amt = 0n;
                try { if (r.amount) amt = BigInt(r.amount); } catch {}
                bySource[src].distributed += amt;
                byDate[dateKey].distributed += amt;

                if (r.recipient) {
                    const recAddr = r.recipient.toLowerCase();
                    if (!recipientTotals[recAddr]) {
                        recipientTotals[recAddr] = { recipient: recAddr, totalClaimed: 0n, distributionCount: 0 };
                    }
                    recipientTotals[recAddr].totalClaimed += amt;
                    recipientTotals[recAddr].distributionCount += 1;
                }
            }
        }
    }

    // Format BigInts to strings
    const formattedBySource = {};
    for (const [k, v] of Object.entries(bySource)) {
        formattedBySource[k] = {
            count: v.count,
            totalRevenue: v.revenue.toString(),
            totalDistributed: v.distributed.toString(),
            treasuryAmount: v.treasury.toString(),
        };
    }

    const formattedByDate = Object.values(byDate).map((d) => ({
        date: d.date,
        count: d.count,
        totalRevenue: d.revenue.toString(),
        totalDistributed: d.distributed.toString(),
        treasuryAmount: d.treasury.toString(),
    }));

    const topRecipients = Object.values(recipientTotals)
        .map((r) => ({
            recipient: r.recipient,
            totalClaimed: r.totalClaimed.toString(),
            distributionCount: r.distributionCount,
        }))
        .sort((a, b) => {
            const diff = BigInt(b.totalClaimed) - BigInt(a.totalClaimed);
            return diff > 0n ? 1 : diff < 0n ? -1 : 0;
        })
        .slice(0, 50);

    return {
        bySource: formattedBySource,
        byDate: formattedByDate,
        topRecipients,
    };
};

export const updateReconciliation = async (distributionId, { reconciled, reconciledAt, reconciliationDetails }) => {
    const distId = String(distributionId);
    return RoyaltyDistribution.findOneAndUpdate(
        { distributionId: distId },
        {
            $set: {
                reconciled: Boolean(reconciled),
                reconciledAt: reconciledAt || new Date(),
                reconciliationDetails: reconciliationDetails || null,
            },
        },
        { new: true }
    );
};
