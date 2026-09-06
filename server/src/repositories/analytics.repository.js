import mongoose from "mongoose";
import Purchase from "../models/purchase.model.js";
import Download from "../models/download.model.js";
import InferenceCall from "../models/inference-call.model.js";
import User from "../models/user.model.js";

/**
 * Returns ISO-8601 UTC date format string based on interval
 * day: %Y-%m-%d
 * week: %G-W%V (ISO-8601 4-digit year and 2-digit week)
 * month: %Y-%m
 */
const getDateFormatForInterval = (interval) => {
    switch (interval) {
        case "month":
            return "%Y-%m";
        case "week":
            return "%G-W%V";
        case "day":
        default:
            return "%Y-%m-%d";
    }
};

/**
 * Builds standard UTC date range filter for a given field name
 */
const buildDateRangeFilter = (startDate, endDate, field = "timestamp") => {
    const filter = {};
    if (startDate || endDate) {
        filter[field] = {};
        if (startDate) filter[field].$gte = new Date(startDate);
        if (endDate) filter[field].$lte = new Date(endDate);
    }
    return filter;
};

/**
 * Aggregates off-chain revenue analytics from confirmed marketplace Purchases
 */
export const aggregateRevenue = async ({ startDate, endDate, datasetId, interval = "day" } = {}) => {
    const match = { status: "CONFIRMED" };
    if (datasetId) match.datasetId = Number(datasetId);

    const dateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    if (dateFilter.timestamp) match.timestamp = dateFilter.timestamp;

    const dateFormat = getDateFormatForInterval(interval);

    const [result] = await Purchase.aggregate([
        { $match: match },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalRevenueDecimal: { $sum: { $toDecimal: { $ifNull: ["$price", "0"] } } },
                            platformRevenueDecimal: { $sum: { $toDecimal: { $ifNull: ["$feeAmount", "0"] } } },
                            creatorRevenueDecimal: { $sum: { $toDecimal: { $ifNull: ["$licensorAmount", "0"] } } },
                            transactionCount: { $sum: 1 },
                            averageTransactionValueDecimal: { $avg: { $toDecimal: { $ifNull: ["$price", "0"] } } },
                        },
                    },
                ],
                timeline: [
                    {
                        $group: {
                            _id: { $dateToString: { format: dateFormat, date: "$timestamp", timezone: "UTC" } },
                            revenueDecimal: { $sum: { $toDecimal: { $ifNull: ["$price", "0"] } } },
                            transactionCount: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            revenue: { $toString: "$revenueDecimal" },
                            transactionCount: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const summaryData = result?.summary?.[0] || {
        totalRevenueDecimal: 0,
        platformRevenueDecimal: 0,
        creatorRevenueDecimal: 0,
        transactionCount: 0,
        averageTransactionValueDecimal: 0,
    };

    return {
        summary: {
            totalRevenue: summaryData.totalRevenueDecimal ? summaryData.totalRevenueDecimal.toString() : "0",
            platformRevenue: summaryData.platformRevenueDecimal ? summaryData.platformRevenueDecimal.toString() : "0",
            creatorRevenue: summaryData.creatorRevenueDecimal ? summaryData.creatorRevenueDecimal.toString() : "0",
            datasetRevenue: summaryData.totalRevenueDecimal ? summaryData.totalRevenueDecimal.toString() : "0",
            transactionCount: summaryData.transactionCount || 0,
            averageTransactionValue: summaryData.averageTransactionValueDecimal
                ? summaryData.averageTransactionValueDecimal.toString()
                : "0",
        },
        interval,
        timeline: result?.timeline || [],
    };
};

/**
 * Aggregates marketplace transaction analytics strictly from the off-chain Purchase collection
 */
export const aggregateTransactions = async ({
    startDate,
    endDate,
    datasetId,
    status,
    interval = "day",
    page = 1,
    limit = 20,
} = {}) => {
    const match = {};
    if (status) match.status = status;
    if (datasetId) match.datasetId = Number(datasetId);

    const dateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    if (dateFilter.timestamp) match.timestamp = dateFilter.timestamp;

    const dateFormat = getDateFormatForInterval(interval);
    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
    const pageLimit = Math.min(100, Math.max(1, Number(limit)));

    const [result] = await Purchase.aggregate([
        { $match: match },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalTransactions: { $sum: 1 },
                            successfulTransactions: {
                                $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] },
                            },
                            pendingTransactions: {
                                $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
                            },
                            failedTransactions: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            totalTransactionValueDecimal: {
                                $sum: { $toDecimal: { $ifNull: ["$price", "0"] } },
                            },
                            averageTransactionValueDecimal: {
                                $avg: { $toDecimal: { $ifNull: ["$price", "0"] } },
                            },
                        },
                    },
                ],
                timeline: [
                    {
                        $group: {
                            _id: { $dateToString: { format: dateFormat, date: "$timestamp", timezone: "UTC" } },
                            transactionCount: { $sum: 1 },
                            successfulCount: {
                                $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] },
                            },
                            failedCount: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            volumeDecimal: {
                                $sum: { $toDecimal: { $ifNull: ["$price", "0"] } },
                            },
                        },
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            transactionCount: 1,
                            successfulCount: 1,
                            failedCount: 1,
                            volume: { $toString: "$volumeDecimal" },
                        },
                    },
                ],
                paginatedRecords: [
                    { $sort: { timestamp: -1 } },
                    { $skip: skip },
                    { $limit: pageLimit },
                    {
                        $project: {
                            _id: 0,
                            purchaseId: 1,
                            datasetId: 1,
                            licenseId: 1,
                            buyerWallet: 1,
                            price: 1,
                            status: 1,
                            transactionHash: 1,
                            timestamp: 1,
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
    ]);

    const summaryData = result?.summary?.[0] || {
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalTransactionValueDecimal: 0,
        averageTransactionValueDecimal: 0,
    };

    const totalRecords = result?.totalCount?.[0]?.count || 0;

    return {
        summary: {
            totalTransactions: summaryData.totalTransactions || 0,
            successfulTransactions: summaryData.successfulTransactions || 0,
            pendingTransactions: summaryData.pendingTransactions || 0,
            failedTransactions: summaryData.failedTransactions || 0,
            totalTransactionValue: summaryData.totalTransactionValueDecimal
                ? summaryData.totalTransactionValueDecimal.toString()
                : "0",
            averageTransactionValue: summaryData.averageTransactionValueDecimal
                ? summaryData.averageTransactionValueDecimal.toString()
                : "0",
        },
        interval,
        timeline: result?.timeline || [],
        transactions: result?.paginatedRecords || [],
        pagination: {
            page: Number(page),
            limit: pageLimit,
            total: totalRecords,
            pages: Math.ceil(totalRecords / pageLimit),
        },
    };
};

/**
 * Aggregates dataset download analytics from Download records
 */
export const aggregateDownloads = async ({ startDate, endDate, datasetId, userId, status, interval = "day" } = {}) => {
    const match = {};
    if (datasetId) match.datasetId = Number(datasetId);
    if (status) match.status = status;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        match.userId = new mongoose.Types.ObjectId(userId);
    }

    const dateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    if (dateFilter.timestamp) match.timestamp = dateFilter.timestamp;

    const dateFormat = getDateFormatForInterval(interval);

    const [result] = await Download.aggregate([
        { $match: match },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalDownloads: { $sum: 1 },
                            successfulDownloads: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            failedDownloads: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            uniqueUsers: {
                                $addToSet: {
                                    $cond: [{ $ne: ["$userId", null] }, "$userId", "$$REMOVE"],
                                },
                            },
                        },
                    },
                ],
                byDataset: [
                    {
                        $group: {
                            _id: "$datasetId",
                            totalDownloads: { $sum: 1 },
                            successfulDownloads: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            uniqueUsers: {
                                $addToSet: {
                                    $cond: [{ $ne: ["$userId", null] }, "$userId", "$$REMOVE"],
                                },
                            },
                        },
                    },
                    { $sort: { totalDownloads: -1 } },
                    { $limit: 20 },
                    {
                        $project: {
                            _id: 0,
                            datasetId: "$_id",
                            totalDownloads: 1,
                            successfulDownloads: 1,
                            uniqueDownloaders: { $size: "$uniqueUsers" },
                        },
                    },
                ],
                timeline: [
                    {
                        $group: {
                            _id: { $dateToString: { format: dateFormat, date: "$timestamp", timezone: "UTC" } },
                            downloadCount: { $sum: 1 },
                            successfulCount: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            failedCount: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                        },
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            downloadCount: 1,
                            successfulCount: 1,
                            failedCount: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const summaryData = result?.summary?.[0] || {
        totalDownloads: 0,
        successfulDownloads: 0,
        failedDownloads: 0,
        uniqueUsers: [],
    };

    return {
        summary: {
            totalDownloads: summaryData.totalDownloads || 0,
            successfulDownloads: summaryData.successfulDownloads || 0,
            failedDownloads: summaryData.failedDownloads || 0,
            uniqueDownloaders: summaryData.uniqueUsers?.length || 0,
        },
        byDataset: result?.byDataset || [],
        interval,
        timeline: result?.timeline || [],
    };
};

/**
 * Aggregates AI model API/inference analytics from InferenceCall records
 */
export const aggregateApiCalls = async ({
    startDate,
    endDate,
    modelId,
    modelRef,
    modelVersion,
    userId,
    status,
    interval = "day",
} = {}) => {
    const match = {};
    if (modelId) match.modelId = Number(modelId);
    if (modelRef && mongoose.Types.ObjectId.isValid(modelRef)) {
        match.modelRef = new mongoose.Types.ObjectId(modelRef);
    }
    if (modelVersion) match.modelVersion = Number(modelVersion);
    if (status) match.status = status;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        match.userId = new mongoose.Types.ObjectId(userId);
    }

    const dateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    if (dateFilter.timestamp) match.timestamp = dateFilter.timestamp;

    const dateFormat = getDateFormatForInterval(interval);

    const [result] = await InferenceCall.aggregate([
        { $match: match },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalApiCalls: { $sum: 1 },
                            successfulApiCalls: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            failedApiCalls: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            uniqueConsumers: {
                                $addToSet: {
                                    $cond: [{ $ne: ["$userId", null] }, "$userId", "$$REMOVE"],
                                },
                            },
                            averageExecutionTimeMs: { $avg: "$executionTimeMs" },
                            totalExecutionTimeMs: { $sum: "$executionTimeMs" },
                        },
                    },
                ],
                callsByModel: [
                    {
                        $group: {
                            _id: { $ifNull: ["$modelId", "$modelRef"] },
                            modelRef: { $first: "$modelRef" },
                            totalCalls: { $sum: 1 },
                            successfulCalls: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            failedCalls: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            averageExecutionTimeMs: { $avg: "$executionTimeMs" },
                        },
                    },
                    { $sort: { totalCalls: -1 } },
                    { $limit: 20 },
                    {
                        $project: {
                            _id: 0,
                            modelId: "$_id",
                            modelRef: 1,
                            totalCalls: 1,
                            successfulCalls: 1,
                            failedCalls: 1,
                            averageExecutionTimeMs: { $round: ["$averageExecutionTimeMs", 2] },
                        },
                    },
                ],
                timeline: [
                    {
                        $group: {
                            _id: { $dateToString: { format: dateFormat, date: "$timestamp", timezone: "UTC" } },
                            callCount: { $sum: 1 },
                            successfulCount: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                            },
                            failedCount: {
                                $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                            },
                            averageExecutionTimeMs: { $avg: "$executionTimeMs" },
                        },
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            callCount: 1,
                            successfulCount: 1,
                            failedCount: 1,
                            averageExecutionTimeMs: { $round: ["$averageExecutionTimeMs", 2] },
                        },
                    },
                ],
            },
        },
    ]);

    const summaryData = result?.summary?.[0] || {
        totalApiCalls: 0,
        successfulApiCalls: 0,
        failedApiCalls: 0,
        uniqueConsumers: [],
        averageExecutionTimeMs: 0,
        totalExecutionTimeMs: 0,
    };

    return {
        summary: {
            totalApiCalls: summaryData.totalApiCalls || 0,
            successfulApiCalls: summaryData.successfulApiCalls || 0,
            failedApiCalls: summaryData.failedApiCalls || 0,
            uniqueConsumers: summaryData.uniqueConsumers?.length || 0,
            averageExecutionTimeMs: summaryData.averageExecutionTimeMs
                ? Math.round(summaryData.averageExecutionTimeMs * 100) / 100
                : 0,
            totalExecutionTimeMs: summaryData.totalExecutionTimeMs || 0,
        },
        callsByModel: result?.callsByModel || [],
        interval,
        timeline: result?.timeline || [],
    };
};

/**
 * Aggregates User analytics including registration growth and historically verifiable active users
 */
export const aggregateUsers = async ({ startDate, endDate, role, interval = "day" } = {}) => {
    const userMatch = {};
    if (role) userMatch.role = role;

    const dateFilter = buildDateRangeFilter(startDate, endDate, "createdAt");
    const newUsersMatch = { ...userMatch };
    if (dateFilter.createdAt) newUsersMatch.createdAt = dateFilter.createdAt;

    const dateFormat = getDateFormatForInterval(interval);

    // Active users: Historically verifiable activity within [startDate, endDate]
    const activityDateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");

    const [
        totalUsers,
        verifiedUsers,
        newUsersCount,
        timelineResult,
        purchasers,
        downloaders,
        consumers,
    ] = await Promise.all([
        User.countDocuments(userMatch),
        User.countDocuments({
            ...userMatch,
            $or: [{ "wallet.verified": true }, { isEmailVerified: true }],
        }),
        User.countDocuments(newUsersMatch),
        User.aggregate([
            { $match: newUsersMatch },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "UTC" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", newUsers: "$count" } },
        ]),
        Purchase.distinct("buyerWallet", activityDateFilter),
        Download.distinct("userId", activityDateFilter),
        InferenceCall.distinct("userId", activityDateFilter),
    ]);

    // Construct set of active users across verifiable activity
    const activeUserIdentifiers = new Set([
        ...purchasers.filter(Boolean),
        ...downloaders.map((id) => String(id)).filter(Boolean),
        ...consumers.map((id) => String(id)).filter(Boolean),
    ]);

    return {
        summary: {
            totalUsers,
            newUsers: newUsersCount,
            activeUsers: activeUserIdentifiers.size,
            verifiedUsers,
            usersWithPurchases: purchasers.length,
            usersWithDownloads: downloaders.length,
            usersWithApiCalls: consumers.length,
        },
        interval,
        timeline: timelineResult || [],
        meta: {
            activeUserDefinition:
                "Count of distinct users who executed a verifiable purchase, dataset download, or inference call within the queried date range.",
            lastLoginLimitation:
                "User.lastLoginAt records only the single latest login timestamp and cannot be used for historical interval active-user calculations.",
        },
    };
};

/**
 * Generates an optimized, single-pass overview across all 5 dimensions without redundant queries
 */
export const getOverview = async ({ startDate, endDate } = {}) => {
    const purchaseDateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    const downloadDateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    const inferenceDateFilter = buildDateRangeFilter(startDate, endDate, "timestamp");
    const userDateFilter = buildDateRangeFilter(startDate, endDate, "createdAt");

    const [purchaseSummaryResult, downloadSummaryResult, inferenceSummaryResult, totalUsers, newUsers, purchasers, downloaders, consumers] =
        await Promise.all([
            // 1. Single aggregate on Purchase
            Purchase.aggregate([
                { $match: { ...purchaseDateFilter } },
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        successfulTransactions: {
                            $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] },
                        },
                        pendingTransactions: {
                            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
                        },
                        failedTransactions: {
                            $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                        },
                        totalRevenueDecimal: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "CONFIRMED"] },
                                    { $toDecimal: { $ifNull: ["$price", "0"] } },
                                    { $toDecimal: "0" },
                                ],
                            },
                        },
                        platformRevenueDecimal: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "CONFIRMED"] },
                                    { $toDecimal: { $ifNull: ["$feeAmount", "0"] } },
                                    { $toDecimal: "0" },
                                ],
                            },
                        },
                        creatorRevenueDecimal: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "CONFIRMED"] },
                                    { $toDecimal: { $ifNull: ["$licensorAmount", "0"] } },
                                    { $toDecimal: "0" },
                                ],
                            },
                        },
                    },
                },
            ]),

            // 2. Single aggregate on Download
            Download.aggregate([
                { $match: { ...downloadDateFilter } },
                {
                    $group: {
                        _id: null,
                        totalDownloads: { $sum: 1 },
                        successfulDownloads: {
                            $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                        },
                        failedDownloads: {
                            $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                        },
                        uniqueUsers: {
                            $addToSet: {
                                $cond: [{ $ne: ["$userId", null] }, "$userId", "$$REMOVE"],
                            },
                        },
                    },
                },
            ]),

            // 3. Single aggregate on InferenceCall
            InferenceCall.aggregate([
                { $match: { ...inferenceDateFilter } },
                {
                    $group: {
                        _id: null,
                        totalApiCalls: { $sum: 1 },
                        successfulApiCalls: {
                            $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] },
                        },
                        failedApiCalls: {
                            $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                        },
                        uniqueConsumers: {
                            $addToSet: {
                                $cond: [{ $ne: ["$userId", null] }, "$userId", "$$REMOVE"],
                            },
                        },
                        averageExecutionTimeMs: { $avg: "$executionTimeMs" },
                    },
                },
            ]),

            // 4. User counts & active user identifiers
            User.countDocuments(),
            User.countDocuments(userDateFilter),
            Purchase.distinct("buyerWallet", purchaseDateFilter),
            Download.distinct("userId", downloadDateFilter),
            InferenceCall.distinct("userId", inferenceDateFilter),
        ]);

    const pSummary = purchaseSummaryResult[0] || {};
    const dSummary = downloadSummaryResult[0] || {};
    const iSummary = inferenceSummaryResult[0] || {};

    const confirmedCount = pSummary.successfulTransactions || 0;
    const totalRevDecimal = pSummary.totalRevenueDecimal || 0;
    const avgTransactionValue =
        confirmedCount > 0 && totalRevDecimal
            ? (parseFloat(totalRevDecimal.toString()) / confirmedCount).toString()
            : "0";

    const activeSet = new Set([
        ...purchasers.filter(Boolean),
        ...downloaders.map((id) => String(id)).filter(Boolean),
        ...consumers.map((id) => String(id)).filter(Boolean),
    ]);

    return {
        revenue: {
            totalRevenue: totalRevDecimal ? totalRevDecimal.toString() : "0",
            platformRevenue: pSummary.platformRevenueDecimal ? pSummary.platformRevenueDecimal.toString() : "0",
            creatorRevenue: pSummary.creatorRevenueDecimal ? pSummary.creatorRevenueDecimal.toString() : "0",
            transactionCount: confirmedCount,
            averageTransactionValue: avgTransactionValue,
        },
        transactions: {
            totalTransactions: pSummary.totalTransactions || 0,
            successfulTransactions: pSummary.successfulTransactions || 0,
            pendingTransactions: pSummary.pendingTransactions || 0,
            failedTransactions: pSummary.failedTransactions || 0,
        },
        downloads: {
            totalDownloads: dSummary.totalDownloads || 0,
            successfulDownloads: dSummary.successfulDownloads || 0,
            failedDownloads: dSummary.failedDownloads || 0,
            uniqueDownloaders: dSummary.uniqueUsers?.length || 0,
        },
        apiCalls: {
            totalApiCalls: iSummary.totalApiCalls || 0,
            successfulApiCalls: iSummary.successfulApiCalls || 0,
            failedApiCalls: iSummary.failedApiCalls || 0,
            uniqueConsumers: iSummary.uniqueConsumers?.length || 0,
            averageExecutionTimeMs: iSummary.averageExecutionTimeMs
                ? Math.round(iSummary.averageExecutionTimeMs * 100) / 100
                : 0,
        },
        users: {
            totalUsers,
            newUsers,
            activeUsers: activeSet.size,
        },
    };
};
