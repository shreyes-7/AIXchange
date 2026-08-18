import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import tokenController from "../controllers/token.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/dashboard/wallet:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get the authenticated wallet dashboard
 *     security: [{ bearerAuth: [] }]
 */
router.get("/wallet", authenticate, tokenController.getWalletDashboard);

export default router;
