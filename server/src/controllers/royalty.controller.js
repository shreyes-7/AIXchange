import royaltyService from "../services/royalty.service.js";

const send = (res, status, data, message) =>
    res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const getDistribution = async (req, res, next) => {
    try {
        const verifyOnChain = req.query.verify === "true" || req.query.verify === true;
        const result = await royaltyService.getByDistributionId(req.params.distributionId, {
            verifyOnChain,
        });
        send(res, 200, result, "Royalty distribution retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getDistributionAllocations = async (req, res, next) => {
    try {
        const result = await royaltyService.getAllocations(req.params.distributionId);
        send(res, 200, result, "Distribution allocations retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getRecipientHistory = async (req, res, next) => {
    try {
        const result = await royaltyService.getByRecipient(req.params.address, req.query);
        send(res, 200, result, "Recipient royalty history retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getSourceDistribution = async (req, res, next) => {
    try {
        const { sourceType, sourceId } = req.params;
        const result = await royaltyService.getBySource(sourceType, sourceId);
        send(res, 200, result, "Source royalty distribution retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getHistory = async (req, res, next) => {
    try {
        const { page, limit, sort, sourceType, sourceId, recipient, payer, status, from, to } = req.query;
        const filters = { sourceType, sourceId, recipient, payer, status, from, to };
        const options = { page, limit, sort };
        const result = await royaltyService.getHistory(filters, options);
        send(res, 200, result, "Royalty history retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getSummary = async (req, res, next) => {
    try {
        const { sourceType, from, to } = req.query;
        const result = await royaltyService.getSummary({ sourceType, from, to });
        send(res, 200, result, "Royalty overview summary retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const getReports = async (req, res, next) => {
    try {
        const { sourceType, from, to } = req.query;
        const result = await royaltyService.getReports({ sourceType, from, to });
        send(res, 200, result, "Royalty reports retrieved successfully.");
    } catch (error) {
        next(error);
    }
};

export const calculateSplitPreview = async (req, res, next) => {
    try {
        const result = await royaltyService.previewSplit(req.body);
        send(res, 200, result, "Revenue split simulation calculated successfully.");
    } catch (error) {
        next(error);
    }
};

export const prepareDistribution = async (req, res, next) => {
    try {
        const result = await royaltyService.prepareDistribution(req.user, req.body);
        send(res, 202, result, "Royalty distribution transaction prepared successfully.");
    } catch (error) {
        next(error);
    }
};

export const syncDistribution = async (req, res, next) => {
    try {
        const result = await royaltyService.syncTransaction(req.user, req.body);
        send(
            res,
            result.state === "PENDING" ? 202 : 200,
            result,
            result.state === "PENDING"
                ? "Distribution transaction is pending confirmation on blockchain."
                : "Distribution transaction verified and indexed successfully."
        );
    } catch (error) {
        next(error);
    }
};

export const reconcile = async (req, res, next) => {
    try {
        const distId = req.params.distributionId;
        if (distId) {
            const result = await royaltyService.reconcileDistribution(distId);
            send(res, 200, result, `Reconciliation completed for distribution #${distId}.`);
        } else {
            const limit = parseInt(req.query.limit, 10) || 50;
            const result = await royaltyService.reconcileAll({ limit });
            send(res, 200, result, "Batch reconciliation completed successfully.");
        }
    } catch (error) {
        next(error);
    }
};
