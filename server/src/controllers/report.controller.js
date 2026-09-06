import * as reportService from "../services/report.service.js";

const send = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
};

export const createReport = async (req, res, next) => {
    try {
        const report = await reportService.createReport(req.user, req.body);
        send(res, 201, report, "Report created successfully.");
    } catch (error) {
        next(error);
    }
};

export const listReports = async (req, res, next) => {
    try {
        const result = await reportService.listReports(req.query);
        send(res, 200, result, "Reports retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getReportDetails = async (req, res, next) => {
    try {
        const report = await reportService.getReportDetails(req.params.reportId);
        send(res, 200, report, "Report details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const assignReport = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await reportService.assignReport(
            req.params.reportId,
            req.body.adminId,
            req.user,
            metadata
        );
        send(res, 200, updated, "Report assigned successfully.");
    } catch (error) {
        next(error);
    }
};

export const updateReportStatus = async (req, res, next) => {
    try {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        };
        const updated = await reportService.updateReportStatus(
            req.params.reportId,
            req.body,
            req.user,
            metadata
        );
        send(res, 200, updated, `Report status updated to ${req.body.status}.`);
    } catch (error) {
        next(error);
    }
};
