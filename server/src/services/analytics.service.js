import * as repository from "../repositories/analytics.repository.js";
import ApiError from "../utils/ApiError.js";

/**
 * Validates date ranges and boundaries in UTC
 */
const validateDateRange = (startDate, endDate) => {
    if (startDate) {
        const s = new Date(startDate);
        if (isNaN(s.getTime())) {
            throw new ApiError(400, "Invalid startDate parameter. Must be an ISO date string.");
        }
    }
    if (endDate) {
        const e = new Date(endDate);
        if (isNaN(e.getTime())) {
            throw new ApiError(400, "Invalid endDate parameter. Must be an ISO date string.");
        }
    }
    if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (s > e) {
            throw new ApiError(400, "startDate cannot be after endDate.");
        }
    }
};

/**
 * Validates and normalizes interval
 */
const normalizeInterval = (interval) => {
    const valid = ["day", "week", "month"];
    if (interval && !valid.includes(interval)) {
        throw new ApiError(400, `Invalid interval '${interval}'. Supported intervals are 'day', 'week', 'month'.`);
    }
    return interval || "day";
};

class AnalyticsService {
    async getRevenueAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);
        const interval = normalizeInterval(query.interval);

        return await repository.aggregateRevenue({
            startDate: query.startDate,
            endDate: query.endDate,
            datasetId: query.datasetId,
            interval,
        });
    }

    async getTransactionAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);
        const interval = normalizeInterval(query.interval);

        return await repository.aggregateTransactions({
            startDate: query.startDate,
            endDate: query.endDate,
            datasetId: query.datasetId,
            status: query.status,
            interval,
            page: query.page || 1,
            limit: query.limit || 20,
        });
    }

    async getDownloadAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);
        const interval = normalizeInterval(query.interval);

        return await repository.aggregateDownloads({
            startDate: query.startDate,
            endDate: query.endDate,
            datasetId: query.datasetId,
            userId: query.userId,
            status: query.status,
            interval,
        });
    }

    async getApiCallAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);
        const interval = normalizeInterval(query.interval);

        return await repository.aggregateApiCalls({
            startDate: query.startDate,
            endDate: query.endDate,
            modelId: query.modelId,
            modelRef: query.modelRef,
            modelVersion: query.modelVersion,
            userId: query.userId,
            status: query.status,
            interval,
        });
    }

    async getUserAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);
        const interval = normalizeInterval(query.interval);

        return await repository.aggregateUsers({
            startDate: query.startDate,
            endDate: query.endDate,
            role: query.role ? query.role.toUpperCase() : undefined,
            interval,
        });
    }

    async getOverviewAnalytics(query = {}) {
        validateDateRange(query.startDate, query.endDate);

        return await repository.getOverview({
            startDate: query.startDate,
            endDate: query.endDate,
        });
    }
}

export default new AnalyticsService();
