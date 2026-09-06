import * as fraudReviewService from "../services/fraud-review.service.js";

const send = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
};

export const ingestFlags = async (req, res, next) => {
    try {
        const flags = req.body.flags || [];
        const result = await fraudReviewService.ingestFlags(flags);
        send(res, 201, result, `${result.length} fraud flags ingested successfully.`);
    } catch (error) {
        next(error);
    }
};

export const listFraudFlags = async (req, res, next) => {
    try {
        const result = await fraudReviewService.listFraudFlags(req.query);
        send(res, 200, result, "Fraud flags retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getFraudFlag = async (req, res, next) => {
    try {
        const flag = await fraudReviewService.getFraudFlag(req.params.id);
        send(res, 200, flag, "Fraud flag details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const reviewFraudFlag = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await fraudReviewService.reviewFraudFlag(
            req.params.id,
            req.body,
            req.user,
            metadata
        );
        send(res, 200, updated, `Fraud flag review status updated to ${req.body.status}.`);
    } catch (error) {
        next(error);
    }
};
