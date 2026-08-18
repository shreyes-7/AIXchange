import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import tokenController from "../controllers/token.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/treasury/balance:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get the on-chain AIX treasury balance
 *     security: [{ bearerAuth: [] }]
 */
router.get("/balance", authenticate, tokenController.getTreasuryBalance);

export default router;
