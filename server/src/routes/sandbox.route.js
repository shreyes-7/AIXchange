import { Router } from "express";
import rateLimit from "express-rate-limit";

import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/sandbox.controller.js";
import { uploadMiddleware } from "../services/fileUpload.service.js";
import {
    createSandboxSchema,
    startTrainingSchema,
    sandboxIdParamSchema,
    fileIdParamSchema,
    paginationSchema,
} from "../validators/sandbox.validator.js";

const router = Router();

const sandboxWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many sandbox requests. Try again later.",
    },
});

const executionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many training execution requests. Try again later.",
    },
});

/** @swagger
 * /api/v1/sandboxes:
 *   post:
 *     tags: [Sandbox]
 *     summary: Create a new isolated sandbox instance after Phase 6 access validation
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [datasetId, licenseId]
 *             properties:
 *               datasetId: { type: integer, example: 1 }
 *               licenseId: { type: integer, example: 1 }
 *               name: { type: string, example: "NLP Experiment" }
 *     responses:
 *       201: { description: Sandbox created in READY state }
 *       403: { description: Access entitlement denied }
 *   get:
 *     tags: [Sandbox]
 *     summary: List sandboxes for the authenticated user
 *     security: [{ bearerAuth: [] }]
 */
router.route("/")
    .post(auth, sandboxWriteLimiter, validate(createSandboxSchema), controller.create)
    .get(auth, validate(paginationSchema, "query"), controller.listMine);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}:
 *   get:
 *     tags: [Sandbox]
 *     summary: Get sandbox details and current lifecycle state
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:sandboxId", auth, validate(sandboxIdParamSchema, "params"), controller.get);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/files:
 *   post:
 *     tags: [Sandbox]
 *     summary: Upload training code, dataset, or config file to sandbox
 *     security: [{ bearerAuth: [] }]
 *   get:
 *     tags: [Sandbox]
 *     summary: List uploaded files associated with sandbox
 *     security: [{ bearerAuth: [] }]
 */
router.route("/:sandboxId/files")
    .post(auth, sandboxWriteLimiter, validate(sandboxIdParamSchema, "params"), uploadMiddleware.single("file"), controller.uploadFile)
    .get(auth, validate(sandboxIdParamSchema, "params"), controller.listFiles);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/files/{fileId}:
 *   delete:
 *     tags: [Sandbox]
 *     summary: Delete an uploaded file from sandbox
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/:sandboxId/files/:fileId", auth, validate(fileIdParamSchema, "params"), controller.deleteFile);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/train:
 *   post:
 *     tags: [Sandbox]
 *     summary: Initiate isolated training pipeline inside sandbox
 *     security: [{ bearerAuth: [] }]
 */
router.post("/:sandboxId/train", auth, executionLimiter, validate(sandboxIdParamSchema, "params"), validate(startTrainingSchema), controller.startTraining);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/logs:
 *   get:
 *     tags: [Sandbox]
 *     summary: Get structured training logs, progress metrics, and execution history
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:sandboxId/logs", auth, validate(sandboxIdParamSchema, "params"), controller.getLogs);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/monitor:
 *   get:
 *     tags: [Sandbox]
 *     summary: Synchronize and retrieve live execution state from AI Substrate
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:sandboxId/monitor", auth, validate(sandboxIdParamSchema, "params"), controller.syncStatus);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/jupyter/start:
 *   post:
 *     tags: [Sandbox]
 *     summary: Start isolated JupyterLab development environment
 *     security: [{ bearerAuth: [] }]
 */
router.post("/:sandboxId/jupyter/start", auth, executionLimiter, validate(sandboxIdParamSchema, "params"), controller.startJupyter);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/jupyter/stop:
 *   post:
 *     tags: [Sandbox]
 *     summary: Stop isolated JupyterLab environment
 *     security: [{ bearerAuth: [] }]
 */
router.post("/:sandboxId/jupyter/stop", auth, validate(sandboxIdParamSchema, "params"), controller.stopJupyter);

/** @swagger
 * /api/v1/sandboxes/{sandboxId}/jupyter/status:
 *   get:
 *     tags: [Sandbox]
 *     summary: Query JupyterLab environment status and connection URL
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:sandboxId/jupyter/status", auth, validate(sandboxIdParamSchema, "params"), controller.getJupyterStatus);

export default router;
