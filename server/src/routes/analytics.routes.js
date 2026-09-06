import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/analytics.controller.js";
import {
    revenueQuerySchema,
    transactionQuerySchema,
    downloadQuerySchema,
    apiCallQuerySchema,
    userQuerySchema,
    overviewQuerySchema,
} from "../validators/analytics.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Backend and Off-Chain Analytics APIs (Revenue, Transactions, Downloads, API Calls, Users, and Overview)
 */

/**
 * @swagger
 * /api/v1/analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve off-chain revenue analytics with summary and time-series aggregation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: datasetId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Revenue summary and timeline data
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/revenue", auth, validate(revenueQuerySchema, "query"), controller.getRevenue);

/**
 * @swagger
 * /api/v1/analytics/transactions:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve marketplace transaction analytics from Purchase records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: datasetId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, PENDING, FAILED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Marketplace transaction metrics, timeline, and paginated records
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/transactions", auth, validate(transactionQuerySchema, "query"), controller.getTransactions);

/**
 * @swagger
 * /api/v1/analytics/downloads:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve dataset download activity and trends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: datasetId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED]
 *     responses:
 *       200:
 *         description: Dataset download summary, dataset breakdown, and timeline
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/downloads", auth, validate(downloadQuerySchema, "query"), controller.getDownloads);

/**
 * @swagger
 * /api/v1/analytics/api-calls:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve AI model inference/API call analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: modelRef
 *         schema:
 *           type: string
 *       - in: query
 *         name: modelVersion
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED]
 *     responses:
 *       200:
 *         description: API call metrics, model breakdown, and timeline
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/api-calls", auth, validate(apiCallQuerySchema, "query"), controller.getApiCalls);

/**
 * @swagger
 * /api/v1/analytics/users:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve user lifecycle and historically verifiable active user analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, creator, admin]
 *     responses:
 *       200:
 *         description: User growth metrics, active users, and registration timeline
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/users", auth, validate(userQuerySchema, "query"), controller.getUsers);

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Retrieve a single-pass optimized platform analytics overview across all 5 domains
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Unified overview with revenue, transactions, downloads, apiCalls, and users
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/overview", auth, validate(overviewQuerySchema, "query"), controller.getOverview);

export default router;
