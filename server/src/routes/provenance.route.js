import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/provenance.controller.js";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import {
    registerProvenanceSchema,
    syncProvenanceSchema,
    setStatusSchema,
    verifyProvenanceSchema,
    verifyHashSchema,
    provenanceQuerySchema,
    provenanceIdParamSchema,
    datasetIdParamSchema,
    executionIdParamSchema,
    modelIdParamSchema,
    modelVersionParamSchema,
} from "../validators/provenance.validator.js";

const router = Router();

const provenanceWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many provenance write requests. Try again later." },
});

const provenanceVerifyLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many verification requests. Try again later." },
});

/**
 * @swagger
 * tags:
 *   name: Provenance
 *   description: On-chain provenance engine, lineage tracking, DAG graphs, and verification APIs
 */

/**
 * @swagger
 * /api/v1/provenance:
 *   post:
 *     tags: [Provenance]
 *     summary: Prepare transaction to register immutable provenance record linking Dataset, Execution, and Model Version
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [datasetId, modelId, modelVersion, executionId, metadataHash]
 *             properties:
 *               datasetId: { type: integer, example: 1 }
 *               modelId: { type: integer, example: 1 }
 *               modelVersion: { type: integer, example: 1 }
 *               executionId: { type: string, example: "exec-sandbox-12345" }
 *               metadataHash: { type: string, example: "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
 *     responses:
 *       202:
 *         description: Provenance registration transaction prepared
 *       400:
 *         description: Validation error or malformed hash
 *       401:
 *         description: Unauthorized
 */
router
    .route("/")
    .post(
        auth,
        provenanceWriteLimiter,
        validate(registerProvenanceSchema),
        controller.create
    );

/**
 * @swagger
 * /api/v1/provenance/sync:
 *   post:
 *     tags: [Provenance]
 *     summary: Confirm broadcast transaction on-chain and synchronize MongoDB projection
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
 *               operation: { type: string, enum: [register, setStatus], default: register }
 *     responses:
 *       200:
 *         description: Provenance projection synchronized
 *       202:
 *         description: Transaction pending on blockchain
 *       400:
 *         description: Invalid receipt or unexpected event
 */
router.post(
    "/sync",
    auth,
    provenanceWriteLimiter,
    validate(syncProvenanceSchema),
    controller.sync
);

/**
 * @swagger
 * /api/v1/provenance/dataset/{datasetId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Retrieve lineage of all models and executions trained using a specific dataset
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema: { type: integer }
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
 *         description: Paginated dataset lineage records
 */
router.get(
    "/dataset/:datasetId",
    validate(datasetIdParamSchema, "params"),
    validate(provenanceQuerySchema, "query"),
    controller.getByDataset
);

/**
 * @swagger
 * /api/v1/provenance/execution/{executionId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Retrieve provenance relationships produced by an execution run (supports multi-dataset runs)
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Execution lineage records
 */
router.get(
    "/execution/:executionId",
    validate(executionIdParamSchema, "params"),
    validate(provenanceQuerySchema, "query"),
    controller.getByExecution
);

/**
 * @swagger
 * /api/v1/provenance/model/{modelId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Retrieve lineage records for all versions of a model
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Model lineage records
 */
router.get(
    "/model/:modelId",
    validate(modelIdParamSchema, "params"),
    validate(provenanceQuerySchema, "query"),
    controller.getByModel
);

/**
 * @swagger
 * /api/v1/provenance/model/{modelId}/version/{version}:
 *   get:
 *     tags: [Provenance]
 *     summary: Retrieve lineage records for a specific model version
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: version
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Model version lineage records
 */
router.get(
    "/model/:modelId/version/:version",
    validate(modelVersionParamSchema, "params"),
    validate(provenanceQuerySchema, "query"),
    controller.getByModelVersion
);

/**
 * @swagger
 * /api/v1/provenance/graph/{modelId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Reconstruct directed lineage DAG graph suitable for visualization
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lineage DAG graph nodes and edges
 */
router.get(
    "/graph/:modelId",
    validate(modelIdParamSchema, "params"),
    controller.getGraph
);

/**
 * @swagger
 * /api/v1/provenance/timeline/{modelId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Chronological provenance audit trail with deterministic blockchain ordering
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chronological provenance events
 */
router.get(
    "/timeline/:modelId",
    validate(modelIdParamSchema, "params"),
    controller.getTimeline
);

/**
 * @swagger
 * /api/v1/provenance/{id}/verify:
 *   post:
 *     tags: [Provenance]
 *     summary: Verify provenance claim directly against canonical on-chain ProvenanceRegistry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               datasetId: { type: integer }
 *               executionId: { type: string }
 *               modelId: { type: integer }
 *               modelVersion: { type: integer }
 *               metadataHash: { type: string }
 *     responses:
 *       200:
 *         description: On-chain verification result
 */
router
    .route("/:id/verify")
    .post(
        provenanceVerifyLimiter,
        validate(provenanceIdParamSchema, "params"),
        validate(verifyProvenanceSchema),
        controller.verify
    )
    .get(
        provenanceVerifyLimiter,
        validate(provenanceIdParamSchema, "params"),
        controller.verify
    );

/**
 * @swagger
 * /api/v1/provenance/{id}/verify-hash:
 *   post:
 *     tags: [Provenance]
 *     summary: Verify metadata commitment hash directly against on-chain ProvenanceRegistry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [metadataHash]
 *             properties:
 *               metadataHash: { type: string, example: "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
 *     responses:
 *       200:
 *         description: Hash verification result
 */
router.post(
    "/:id/verify-hash",
    provenanceVerifyLimiter,
    validate(provenanceIdParamSchema, "params"),
    validate(verifyHashSchema),
    controller.verifyHash
);

/**
 * @swagger
 * /api/v1/provenance/{id}/status:
 *   post:
 *     tags: [Provenance]
 *     summary: Prepare transaction to toggle provenance active status (restricted to registrant or model owner)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [active]
 *             properties:
 *               active: { type: boolean }
 *     responses:
 *       202:
 *         description: Status transaction prepared
 */
router.post(
    "/:id/status",
    auth,
    provenanceWriteLimiter,
    validate(provenanceIdParamSchema, "params"),
    validate(setStatusSchema),
    controller.setStatus
);

/**
 * @swagger
 * /api/v1/provenance/{id}:
 *   get:
 *     tags: [Provenance]
 *     summary: Retrieve provenance record details by on-chain provenanceId or MongoDB ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Provenance record details
 *       404:
 *         description: Provenance not found
 */
router.get(
    "/:id",
    validate(provenanceIdParamSchema, "params"),
    controller.get
);

export default router;
