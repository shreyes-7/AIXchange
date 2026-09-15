import express from "express";
import paymentController from "../controllers/payment.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/pricing", paymentController.getPricing);
router.get("/accounting", paymentController.getAccountingReport);

router.post("/create-order", authenticate, paymentController.createOrder);
router.post("/simulate-success", authenticate, paymentController.simulateSuccess);
router.post("/webhook", paymentController.handleWebhook);

router.post("/orders/:orderId/retry-mint", authenticate, paymentController.retryMint);
router.post("/orders/:orderId/refund", authenticate, paymentController.processRefund);
router.get("/orders", authenticate, paymentController.getUserOrders);

router.post("/cashout", authenticate, paymentController.requestCashout);
router.post("/cashout/:cashoutId/complete", authenticate, paymentController.completeCashout);
router.post("/cashout/:cashoutId/fail", authenticate, paymentController.failCashout);
router.get("/cashout/history", authenticate, paymentController.getUserCashouts);

export default router;
