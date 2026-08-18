import express from "express";

import tokenController from "../controllers/token.controller.js";
import validate from "../middlewares/validation.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import { getHistorySchema, getTransactionSchema, purchaseSchema } from "../validators/token.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/token/balance:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get the authenticated wallet's on-chain AIX balance
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: On-chain balance } }
 */
router.get("/balance", authenticate, tokenController.getBalance);

router.get("/metadata", tokenController.getMetadata);
router.get("/supply", tokenController.getTotalSupply);

/**
 * @swagger
 * /api/v1/token/history:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get indexed events for the authenticated wallet
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 */
router.get("/history", authenticate, validate(getHistorySchema, "query"), tokenController.getHistory);

/**
 * @swagger
 * /api/v1/token/transactions/{txHash}:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get authenticated-wallet indexed events for a transaction hash
 *     security: [{ bearerAuth: [] }]
 */
router.get("/transactions/:txHash", authenticate, validate(getTransactionSchema, "params"), tokenController.getTransactionByHash);

/**
 * @swagger
 * /api/v1/token/purchase:
 *   post:
 *     tags: [Blockchain]
 *     summary: Build a verified-wallet purchase transaction for client signing
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [datasetId, licenseId]
 */
router.post("/purchase", authenticate, validate(purchaseSchema), tokenController.purchase);

export default router;
