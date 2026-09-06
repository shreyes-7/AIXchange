import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/royalty.controller.js";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import {
    distributionIdParamSchema,
    recipientAddressParamSchema,
    sourceParamsSchema,
    royaltyHistoryQuerySchema,
    royaltyReportQuerySchema,
    calculateSplitSchema,
    prepareDistributeSchema,
    syncTransactionSchema,
    reconcileParamSchema,
} from "../validators/royalty.validator.js";

const router = Router();

const royaltyLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many royalty requests. Try again later." },
});

const royaltyWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many write requests. Try again later." },
});

/**
 * @swagger
 * tags:
 *   name: Royalties
 *   description: On-chain royalty engine settlement, revenue splits, distributions, reporting, and reconciliation APIs
 */

/**
 * @swagger
 * /api/v1/royalties/distributions/{distributionId}:
 *   get:
 *     tags: [Royalties]
 *     summary: Retrieve on-chain backed royalty distribution by ID
 *     parameters:
 *       - in: path
 *         name: distributionId
 *         required: true
 *         schema: { type: string }
 *         description: Sequential distribution ID
 *       - in: query
 *         name: verify
 *         schema: { type: boolean }
 *         description: Cross-check against on-chain contract state
 *     responses:
 *       200:
 *         description: Distribution record retrieved successfully
 *       404:
 *         description: Distribution not found
 */
router.get(
    "/distributions/:distributionId",
    royaltyLimiter,
    validate(distributionIdParamSchema, "params"),
    controller.getDistribution
);

/**
 * @swagger
 * /api/v1/royalties/distributions/{distributionId}/allocations:
 *   get:
 *     tags: [Royalties]
 *     summary: Retrieve recipient and treasury allocations for a distribution
 *     parameters:
 *       - in: path
 *         name: distributionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Distribution allocations retrieved successfully
 *       404:
 *         description: Distribution not found
 */
router.get(
    "/distributions/:distributionId/allocations",
    royaltyLimiter,
    validate(distributionIdParamSchema, "params"),
    controller.getDistributionAllocations
);

/**
 * @swagger
 * /api/v1/royalties/recipients/{address}:
 *   get:
 *     tags: [Royalties]
 *     summary: Retrieve paginated royalty history for an individual recipient account
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Recipient history retrieved successfully
 *       400:
 *         description: Invalid address format
 */
router.get(
    "/recipients/:address",
    royaltyLimiter,
    validate(recipientAddressParamSchema, "params"),
    validate(royaltyHistoryQuerySchema, "query"),
    controller.getRecipientHistory
);

/**
 * @swagger
 * /api/v1/royalties/source/{sourceType}/{sourceId}:
 *   get:
 *     tags: [Royalties]
 *     summary: Retrieve distribution associated with a specific revenue source (e.g. PURCHASE, DERIVATIVE)
 *     parameters:
 *       - in: path
 *         name: sourceType
 *         required: true
 *         schema: { type: string, enum: [PURCHASE, DERIVATIVE, INFERENCE, DIRECT] }
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Source distribution retrieved successfully
 *       400:
 *         description: Invalid source parameters
 */
router.get(
    "/source/:sourceType/:sourceId",
    royaltyLimiter,
    validate(sourceParamsSchema, "params"),
    controller.getSourceDistribution
);

/**
 * @swagger
 * /api/v1/royalties/history:
 *   get:
 *     tags: [Royalties]
 *     summary: Query paginated royalty distribution history with multi-attribute filtering
 *     parameters:
 *       - in: query
 *         name: sourceType
 *         schema: { type: string, enum: [PURCHASE, DERIVATIVE, INFERENCE, DIRECT] }
 *       - in: query
 *         name: sourceId
 *         schema: { type: string }
 *       - in: query
 *         name: recipient
 *         schema: { type: string }
 *       - in: query
 *         name: payer
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, DISTRIBUTED, CANCELLED] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, block_asc, block_desc], default: newest }
 *     responses:
 *       200:
 *         description: Paginated distribution history
 */
router.get(
    "/history",
    royaltyLimiter,
    validate(royaltyHistoryQuerySchema, "query"),
    controller.getHistory
);

/**
 * @swagger
 * /api/v1/royalties/summary:
 *   get:
 *     tags: [Royalties]
 *     summary: Retrieve aggregate royalty overview metrics
 *     parameters:
 *       - in: query
 *         name: sourceType
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Summary metrics retrieved successfully
 */
router.get(
    "/summary",
    royaltyLimiter,
    validate(royaltyReportQuerySchema, "query"),
    controller.getSummary
);

/**
 * @swagger
 * /api/v1/royalties/reports:
 *   get:
 *     tags: [Royalties]
 *     summary: Generate multi-dimensional royalty reports (by source, by date, top recipients)
 *     parameters:
 *       - in: query
 *         name: sourceType
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Detailed royalty analytics and aggregations
 */
router.get(
    "/reports",
    royaltyLimiter,
    validate(royaltyReportQuerySchema, "query"),
    controller.getReports
);

/**
 * @swagger
 * /api/v1/royalties/calculate-split:
 *   post:
 *     tags: [Royalties]
 *     summary: Simulate/preview revenue split calculation on-chain without executing state changes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [totalRevenue, recipients]
 *             properties:
 *               totalRevenue: { type: string, example: "1000000000000000000000" }
 *               treasuryFeeBps: { type: integer, example: 250 }
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [recipient, shareBps]
 *                   properties:
 *                     recipient: { type: string, example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }
 *                     shareBps: { type: integer, example: 6000 }
 *     responses:
 *       200:
 *         description: Revenue split calculation simulation result
 *       400:
 *         description: Invalid calculation parameters
 */
router.post(
    "/calculate-split",
    royaltyLimiter,
    validate(calculateSplitSchema, "body"),
    controller.calculateSplitPreview
);

/**
 * @swagger
 * /api/v1/royalties/prepare:
 *   post:
 *     tags: [Royalties]
 *     summary: Zero-custody preparation of un-signed calldata for royalty distribution
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipients]
 *             properties:
 *               sourceType: { type: string, enum: [PURCHASE, DERIVATIVE, INFERENCE, DIRECT], default: DIRECT }
 *               sourceId: { type: string, default: "0" }
 *               purchaseId: { type: string }
 *               totalRevenue: { type: string, example: "1000000000000000000000" }
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [recipient, shareBps]
 *                   properties:
 *                     recipient: { type: string, example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }
 *                     shareBps: { type: integer, example: 6000 }
 *     responses:
 *       202:
 *         description: Transaction calldata prepared
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/prepare",
    auth,
    royaltyWriteLimiter,
    validate(prepareDistributeSchema, "body"),
    controller.prepareDistribution
);

/**
 * @swagger
 * /api/v1/royalties/sync:
 *   post:
 *     tags: [Royalties]
 *     summary: Verify broadcast transaction receipt and index royalty distribution
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [txHash]
 *             properties:
 *               txHash: { type: string, example: "0x3b9aca00847231073c828017949fe46736679d2d9a65f0992f2272de9f3c7fa6" }
 *     responses:
 *       200:
 *         description: Transaction verified and indexed
 *       202:
 *         description: Transaction pending on blockchain
 *       400:
 *         description: Transaction failed or reverted
 */
router.post(
    "/sync",
    auth,
    royaltyWriteLimiter,
    validate(syncTransactionSchema, "body"),
    controller.syncDistribution
);

/**
 * @swagger
 * /api/v1/royalties/reconcile/{distributionId}:
 *   post:
 *     tags: [Royalties]
 *     summary: Authoritative reconciliation of database distribution against on-chain smart contract
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: distributionId
 *         schema: { type: string }
 *         required: false
 *         description: If omitted, batch reconciles recent distributions
 *     responses:
 *       200:
 *         description: Reconciliation audit results
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/reconcile",
    auth,
    royaltyLimiter,
    controller.reconcile
);

router.post(
    "/reconcile/:distributionId",
    auth,
    royaltyLimiter,
    validate(reconcileParamSchema, "params"),
    controller.reconcile
);

export default router;
