import blockchainAnalyticsService from "../services/blockchain-analytics.service.js";

const send = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
};

export const getEvents = async (req, res, next) => {
    try {
        const result = await blockchainAnalyticsService.getEvents(req.query);
        send(res, 200, result);
    } catch (error) {
        next(error);
    }
};

export const getTokenAnalytics = async (req, res, next) => {
    try {
        const result = await blockchainAnalyticsService.getTokenAnalytics(req.query);
        send(res, 200, result);
    } catch (error) {
        next(error);
    }
};

export const getGasAnalytics = async (req, res, next) => {
    try {
        const result = await blockchainAnalyticsService.getGasAnalytics(req.query);
        send(res, 200, result);
    } catch (error) {
        next(error);
    }
};

export const getOverview = async (req, res, next) => {
    try {
        const result = await blockchainAnalyticsService.getOverview(req.query);
        send(res, 200, result);
    } catch (error) {
        next(error);
    }
};
