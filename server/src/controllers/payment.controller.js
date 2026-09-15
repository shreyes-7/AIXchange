import paymentService from "../services/payment.service.js";

class PaymentController {
    async getPricing(req, res, next) {
        try {
            const result = paymentService.getPricing();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async createOrder(req, res, next) {
        try {
            const { tokenAmount } = req.body;
            const result = await paymentService.createOrder(req.user, { tokenAmount });
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async handleWebhook(req, res, next) {
        try {
            const signature = req.headers["x-razorpay-signature"] || req.headers["stripe-signature"];
            const rawBody = req.rawBody || JSON.stringify(req.body);

            if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
                return res.status(401).json({ success: false, message: "Invalid webhook signature" });
            }

            const { orderId, paymentId, gatewayPaymentId } = req.body;
            const actualPaymentId = gatewayPaymentId || paymentId;

            const result = await paymentService.processWebhook({
                orderId,
                gatewayPaymentId: actualPaymentId,
                gatewaySignature: signature,
            });

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async simulateSuccess(req, res, next) {
        try {
            const { orderId } = req.body;
            const gatewayPaymentId = `sim_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const result = await paymentService.processWebhook({
                orderId,
                gatewayPaymentId,
            });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async retryMint(req, res, next) {
        try {
            const { orderId } = req.params;
            const result = await paymentService.retryMint(orderId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async processRefund(req, res, next) {
        try {
            const { orderId } = req.params;
            const { refundReason } = req.body;
            const result = await paymentService.processRefund(orderId, refundReason);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async requestCashout(req, res, next) {
        try {
            const { tokenAmount, bankDetails, bypassMinimumForTest } = req.body;
            const result = await paymentService.requestCashout(req.user, {
                tokenAmount,
                bankDetails,
                bypassMinimumForTest,
            });
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async completeCashout(req, res, next) {
        try {
            const { cashoutId } = req.params;
            const { payoutReferenceId } = req.body;
            const result = await paymentService.completeCashoutPayout(cashoutId, payoutReferenceId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async failCashout(req, res, next) {
        try {
            const { cashoutId } = req.params;
            const { failureReason } = req.body;
            const result = await paymentService.failCashoutPayout(cashoutId, failureReason);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getAccountingReport(req, res, next) {
        try {
            const result = await paymentService.getAccountingReport();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getUserOrders(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const result = await paymentService.getUserOrders(req.user, {
                page: Number(page),
                limit: Number(limit),
            });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getUserCashouts(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const result = await paymentService.getUserCashouts(req.user, {
                page: Number(page),
                limit: Number(limit),
            });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
