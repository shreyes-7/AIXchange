import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/license.controller.js";
import { assetIdParamSchema, createLicenseSchema, licenseIdSchema, licensorParamSchema, listLicenseSchema, syncLicenseSchema, updateLicenseSchema } from "../validators/license.validator.js";

const router = Router();
const licenseWriteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { success: false, message: "Too many license write requests. Try again later." } });

/**
 * @swagger
 * /api/v1/licenses/templates:
 *   get:
 *     tags: [Licenses]
 *     summary: List immutable Phase 5 license templates
 */
router.get("/templates", controller.templates);
/** @swagger
 * /api/v1/licenses/templates/{type}:
 *   get: { tags: [Licenses], summary: Get one Academic, Commercial, Exclusive, or Custom template }
 */
router.get("/templates/:type", controller.template);
/** @swagger
 * /api/v1/licenses/sync:
 *   post: { tags: [Licenses], summary: Confirm a client-signed LicenseRegistry transaction and index it, security: [{ bearerAuth: [] }] }
 */
router.post("/sync", auth, licenseWriteLimiter, validate(syncLicenseSchema), controller.sync);
/** @swagger
 * /api/v1/licenses/asset/{assetId}:
 *   get: { tags: [Licenses], summary: List licenses for a dataset asset }
 */
router.get("/asset/:assetId", validate(assetIdParamSchema, "params"), validate(listLicenseSchema, "query"), controller.byAsset);
/** @swagger
 * /api/v1/licenses/licensor/{address}:
 *   get: { tags: [Licenses], summary: List licenses for a wallet address }
 */
router.get("/licensor/:address", validate(licensorParamSchema, "params"), validate(listLicenseSchema, "query"), controller.byLicensor);
/** @swagger
 * /api/v1/licenses:
 *   get: { tags: [Licenses], summary: Search and filter indexed licenses }
 *   post: { tags: [Licenses], summary: Validate and prepare a client-signed license creation transaction, security: [{ bearerAuth: [] }] }
 */
router.route("/").get(validate(listLicenseSchema, "query"), controller.list).post(auth, licenseWriteLimiter, validate(createLicenseSchema), controller.create);
/** @swagger
 * /api/v1/licenses/{licenseId}/verify:
 *   get: { tags: [Licenses], summary: Verify license state against LicenseRegistry }
 */
router.get("/:licenseId/verify", validate(licenseIdSchema, "params"), controller.verify);
/** @swagger
 * /api/v1/licenses/{licenseId}/revoke:
 *   post: { tags: [Licenses], summary: Prepare a client-signed revocation transaction, security: [{ bearerAuth: [] }] }
 */
router.post("/:licenseId/revoke", validate(licenseIdSchema, "params"), auth, licenseWriteLimiter, controller.revoke);
/** @swagger
 * /api/v1/licenses/{licenseId}:
 *   get: { tags: [Licenses], summary: Get an indexed license }
 *   patch: { tags: [Licenses], summary: Prepare a client-signed license update transaction, security: [{ bearerAuth: [] }] }
 */
router.route("/:licenseId").get(validate(licenseIdSchema, "params"), controller.get).patch(validate(licenseIdSchema, "params"), auth, licenseWriteLimiter, validate(updateLicenseSchema), controller.update).delete(validate(licenseIdSchema, "params"), auth, licenseWriteLimiter, controller.revoke);

export default router;
