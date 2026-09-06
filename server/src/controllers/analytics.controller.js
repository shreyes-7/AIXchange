import analyticsService from "../services/analytics.service.js";

const send = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
};

export const getRevenue = async (req, res, next) => {
    try {
        const result = await analyticsService.getRevenueAnalytics(req.query);
        send(res, 200, result, "Revenue analytics retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getTransactions = async (req, res, next) => {
    try {
        const result = await analyticsService.getTransactionAnalytics(req.query);
        send(res, 200, result, "Transaction analytics retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getDownloads = async (req, res, next) => {
    try {
        const result = await analyticsService.getDownloadAnalytics(req.query);
        send(res, 200, result, "Download analytics retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getApiCalls = async (req, res, next) => {
    try {
        const result = await analyticsService.getApiCallAnalytics(req.query);
        send(res, 200, result, "API call analytics retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const result = await analyticsService.getUserAnalytics(req.query);
        send(res, 200, result, "User analytics retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getOverview = async (req, res, next) => {
    try {
        const result = await analyticsService.getOverviewAnalytics(req.query);
        send(res, 200, result, "Analytics overview retrieved successfully.");
    } catch (error) {
        next(error);
    }
};
