import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/model.controller.js";
import {
    createModelSchema,
    syncModelSchema,
    updateModelSchema,
    addVersionSchema,
    setStatusSchema,
    transferOwnershipSchema,
    verifyHashSchema,
    inferModelSchema,
    listModelSchema,
    modelIdParamSchema,
    versionParamSchema,
    modelVersionParamSchema,
    ownerParamSchema,
} from "../validators/model.validator.js";

const router = Router();

const modelWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many model write requests. Try again later." },
});

const inferenceLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many inference requests. Try again later." },
});

/**
 * @swagger
 * /api/v1/models:
 *   get:
 *     tags: [Models]
 *     summary: Discover and filter AI models in the marketplace
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, name_asc, name_desc, version, popular] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: framework
 *         schema: { type: string, enum: [PyTorch, TensorFlow, Scikit-Learn, ONNX, Safetensors, Other] }
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *       - in: query
 *         name: owner
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of models with pagination metadata
 *   post:
 *     tags: [Models]
 *     summary: Prepare client-signed model registration transaction and create off-chain draft
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, metadataURI, modelHash]
 *             properties:
 *               name: { type: string, example: "ResNet-50-Classifier" }
 *               description: { type: string, example: "Fine-tuned computer vision classifier." }
 *               category: { type: string, example: "vision" }
 *               tags: { type: array, items: { type: string }, example: ["vision", "resnet", "pytorch"] }
 *               framework: { type: string, enum: [PyTorch, TensorFlow, Scikit-Learn, ONNX, Safetensors, Other], example: "PyTorch" }
 *               modelType: { type: string, example: "classification" }
 *               metadataURI: { type: string, example: "ipfs://QmModelMetaCID/metadata.json" }
 *               modelHash: { type: string, example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
 *     responses:
 *       202:
 *         description: Model registration transaction prepared for client signing
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Model with identical name already owned by user
 */
router
    .route("/")
    .get(validate(listModelSchema, "query"), controller.list)
    .post(auth, modelWriteLimiter, validate(createModelSchema), controller.create);

/**
 * @swagger
 * /api/v1/models/sync:
 *   post:
 *     tags: [Models]
 *     summary: Synchronize and index a client-signed ModelRegistry transaction
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [txHash]
 *             properties:
 *               txHash: { type: string, example: "0x3b01859580b06b29f95736712ac9ff31d5162ff054d5880bb6e147102e3b2e59" }
 *               modelId: { type: integer, example: 1 }
 *               operation: { type: string, enum: [register, addVersion, setStatus, transferOwnership], default: register }
 *     responses:
 *       200:
 *         description: Transaction confirmed and indexed into MongoDB projection
 *       202:
 *         description: Transaction is still pending mining
 *       400:
 *         description: Missing or invalid transaction data
 *       403:
 *         description: Signer does not match authenticated wallet
 *       502:
 *         description: Blockchain transaction reverted
 */
router.post("/sync", auth, modelWriteLimiter, validate(syncModelSchema), controller.sync);

/**
 * @swagger
 * /api/v1/models/search:
 *   get:
 *     tags: [Models]
 *     summary: Full-text search across model titles, descriptions, and tags
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated search results
 */
router.get("/search", validate(listModelSchema, "query"), controller.search);

/**
 * @swagger
 * /api/v1/models/owner/{address}:
 *   get:
 *     tags: [Models]
 *     summary: Retrieve models registered by a specific wallet address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Models owned by the address
 */
router.get("/owner/:address", validate(ownerParamSchema, "params"), validate(listModelSchema, "query"), controller.byOwner);

/**
 * @swagger
 * /api/v1/models/{id}:
 *   get:
 *     tags: [Models]
 *     summary: Retrieve model details by MongoDB ID or canonical blockchain model ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Model document with authoritative on-chain verification snapshot
 *       404:
 *         description: Model not found
 *   patch:
 *     tags: [Models]
 *     summary: Update off-chain metadata (restricted to model owner)
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
 *             properties:
 *               description: { type: string }
 *               category: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Model metadata updated
 *       403:
 *         description: Authenticated user does not own this model
 *       404:
 *         description: Model not found
 */
router
    .route("/:id")
    .get(validate(modelIdParamSchema, "params"), controller.get)
    .patch(auth, modelWriteLimiter, validate(modelIdParamSchema, "params"), validate(updateModelSchema), controller.update);

/**
 * @swagger
 * /api/v1/models/{id}/versions:
 *   get:
 *     tags: [Models]
 *     summary: List all recorded versions for a model
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Version history
 *   post:
 *     tags: [Models]
 *     summary: Prepare transaction for adding a new version (restricted to on-chain model owner)
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
 *             required: [metadataURI, modelHash]
 *             properties:
 *               metadataURI: { type: string }
 *               modelHash: { type: string }
 *               changelog: { type: string }
 *     responses:
 *       202:
 *         description: Add version transaction prepared
 *       403:
 *         description: Caller does not own the model
 *       409:
 *         description: Model is inactive or version hash is identical to latest
 */
router
    .route("/:id/versions")
    .get(validate(modelIdParamSchema, "params"), controller.getVersions)
    .post(auth, modelWriteLimiter, validate(modelIdParamSchema, "params"), validate(addVersionSchema), controller.addVersion);

/**
 * @swagger
 * /api/v1/models/{id}/versions/{version}:
 *   get:
 *     tags: [Models]
 *     summary: Retrieve details of a specific model version
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: version
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Specific version details
 *       404:
 *         description: Version not found
 */
router.get(
    "/:id/versions/:version",
    validate(modelVersionParamSchema, "params"),
    controller.getVersion
);

/**
 * @swagger
 * /api/v1/models/{id}/status:
 *   post:
 *     tags: [Models]
 *     summary: Prepare transaction to toggle active status (restricted to on-chain model owner)
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
 *         description: Status toggle transaction prepared
 */
router.post(
    "/:id/status",
    auth,
    modelWriteLimiter,
    validate(modelIdParamSchema, "params"),
    validate(setStatusSchema),
    controller.setStatus
);

/**
 * @swagger
 * /api/v1/models/{id}/transfer:
 *   post:
 *     tags: [Models]
 *     summary: Prepare transaction to transfer model ownership (restricted to current on-chain owner)
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
 *             required: [newOwner]
 *             properties:
 *               newOwner: { type: string, example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }
 *     responses:
 *       202:
 *         description: Ownership transfer transaction prepared
 */
router.post(
    "/:id/transfer",
    auth,
    modelWriteLimiter,
    validate(modelIdParamSchema, "params"),
    validate(transferOwnershipSchema),
    controller.transferOwnership
);

/**
 * @swagger
 * /api/v1/models/{id}/verify-hash:
 *   post:
 *     tags: [Models]
 *     summary: Verify cryptographic artifact hash against on-chain ModelRegistry record
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
 *             required: [versionNumber]
 *             properties:
 *               versionNumber: { type: integer, example: 1 }
 *               expectedHash: { type: string, example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
 *               artifactPath: { type: string, example: "models/checkpoint.pt" }
 *     responses:
 *       200:
 *         description: Hash verification result comparing computed vs on-chain anchored hash
 *       400:
 *         description: Validation error or missing hash inputs
 *       404:
 *         description: Model or version not found
 */
router.post(
    "/:id/verify-hash",
    validate(modelIdParamSchema, "params"),
    validate(verifyHashSchema),
    controller.verifyHash
);

/**
 * @swagger
 * /api/v1/models/{id}/infer:
 *   post:
 *     tags: [Models]
 *     summary: Execute model inference through Phase 7 AI Execution Substrate
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
 *             required: [inputs]
 *             properties:
 *               inputs:
 *                 description: Feature vector or batch of feature vectors
 *                 example: [0.5, -1.2, 3.4, 0.1]
 *               versionNumber: { type: integer, example: 1 }
 *               device: { type: string, enum: [cpu, cuda], default: cpu }
 *               return_probabilities: { type: boolean, default: true }
 *               top_k: { type: integer, example: 3 }
 *     responses:
 *       200:
 *         description: Inference result with predictions, latency, and confidence scores
 *       400:
 *         description: Malformed input or feature mismatch
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Model or artifact not found
 *       409:
 *         description: Model or version is inactive
 *       502:
 *         description: AI Execution Substrate unavailable
 */
router.post(
    "/:id/infer",
    auth,
    inferenceLimiter,
    validate(modelIdParamSchema, "params"),
    validate(inferModelSchema),
    controller.infer
);

export default router;
