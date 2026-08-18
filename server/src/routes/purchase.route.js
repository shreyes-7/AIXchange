import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/purchase.controller.js";
import { datasetPurchaseParamSchema, paginationSchema, purchaseIdSchema, purchaseRequestSchema, purchaseSyncSchema, transactionHashParamSchema } from "../validators/purchase.validator.js";

const router = Router();
const purchaseWriteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { success: false, message: "Too many purchase requests. Try again later." } });

/** @swagger
 * /api/v1/purchases:
 *   post: { tags: [Transactions], summary: Prepare a client-signed PurchaseEngine transaction, security: [{ bearerAuth: [] }] }
 *   get: { tags: [Transactions], summary: List purchases for the authenticated wallet, security: [{ bearerAuth: [] }] }
 */
router.route("/").post(auth, purchaseWriteLimiter, validate(purchaseRequestSchema), controller.initiate).get(auth, validate(paginationSchema, "query"), controller.listMine);
/** @swagger
 * /api/v1/purchases/sync:
 *   post: { tags: [Transactions], summary: Verify a signed transaction and synchronize its confirmed purchase, security: [{ bearerAuth: [] }] }
 */
router.post("/sync", auth, purchaseWriteLimiter, validate(purchaseSyncSchema), controller.sync);
/** @swagger
 * /api/v1/purchases/status/{transactionHash}:
 *   get: { tags: [Transactions], summary: Get purchase transaction status, security: [{ bearerAuth: [] }] }
 */
router.get("/status/:transactionHash", auth, validate(transactionHashParamSchema, "params"), controller.status);
/** @swagger
 * /api/v1/purchases/dataset/{datasetId}:
 *   get: { tags: [Transactions], summary: List dataset purchases for an authorized owner, security: [{ bearerAuth: [] }] }
 */
router.get("/dataset/:datasetId", auth, validate(datasetPurchaseParamSchema, "params"), validate(paginationSchema, "query"), controller.datasetHistory);
/** @swagger
 * /api/v1/purchases/{purchaseId}/status:
 *   get: { tags: [Transactions], summary: Get purchase state, security: [{ bearerAuth: [] }] }
 */
router.get("/:purchaseId/status", auth, validate(purchaseIdSchema, "params"), controller.purchaseStatus);
/** @swagger
 * /api/v1/purchases/{purchaseId}:
 *   get: { tags: [Transactions], summary: Get a purchase visible to its buyer or dataset owner, security: [{ bearerAuth: [] }] }
 */
router.get("/:purchaseId", auth, validate(purchaseIdSchema, "params"), controller.get);

export default router;
