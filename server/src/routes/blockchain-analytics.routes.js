import { Router } from "express";
import * as controller from "../controllers/blockchain-analytics.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blockchain Analytics
 *   description: On-chain event, AIX token usage, and gas consumption analytics
 */

/**
 * @swagger
 * /api/v1/analytics/blockchain/events:
 *   get:
 *     tags: [Blockchain Analytics]
 *     summary: Retrieve indexed blockchain events with pagination and filters
 *     parameters:
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
 *       - in: query
 *         name: contract
 *         schema:
 *           type: string
 *         description: Contract name or address
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filter by participant address (from or to)
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
 *         description: Paginated list of indexed events
 */
router.get("/events", controller.getEvents);

/**
 * @swagger
 * /api/v1/analytics/blockchain/token:
 *   get:
 *     tags: [Blockchain Analytics]
 *     summary: Retrieve AIX token transfer volume, unique participants, and categorized spending
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
 *     responses:
 *       200:
 *         description: Aggregated token analytics
 */
router.get("/token", controller.getTokenAnalytics);

/**
 * @swagger
 * /api/v1/analytics/blockchain/gas:
 *   get:
 *     tags: [Blockchain Analytics]
 *     summary: Retrieve gas consumption, costs, contract breakdown, and time aggregation
 *     parameters:
 *       - in: query
 *         name: contract
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Aggregated gas metrics
 */
router.get("/gas", controller.getGasAnalytics);

/**
 * @swagger
 * /api/v1/analytics/blockchain/overview:
 *   get:
 *     tags: [Blockchain Analytics]
 *     summary: High-level overview of blockchain metrics
 *     responses:
 *       200:
 *         description: Overview of transactions, events, volume, and gas
 */
router.get("/overview", controller.getOverview);

export default router;
