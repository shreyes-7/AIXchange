import { Router } from "express";
import multer from "multer";
import env from "../config/env.js";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as controller from "../controllers/dataset.controller.js";
import { blockchainSchema, createDatasetSchema, listDatasetSchema, reviewSchema, updateDatasetSchema, versionSchema } from "../validators/dataset.validator.js";
import ApiError from "../utils/ApiError.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.DATASET_MAX_UPLOAD_BYTES, files: 1 }, fileFilter: (req, file, cb) => file.originalname ? cb(null, true) : cb(new ApiError(400, "A file name is required.")) });
const handleUpload = (req, res, next) => upload.single("file")(req, res, (error) => next(error ? new ApiError(error.code === "LIMIT_FILE_SIZE" ? 413 : 400, error.message) : undefined));

/**
 * @swagger
 * /api/v1/datasets/upload:
 *   post:
 *     tags: [Datasets]
 *     summary: Encrypt and pin a dataset file to IPFS
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { multipart/form-data: { schema: { type: object, required: [file], properties: { file: { type: string, format: binary } } } } } }
 *     responses: { 201: { description: Encrypted IPFS artifact metadata } }
 */
router.post("/upload", auth, handleUpload, controller.upload);
/** @swagger
 * /api/v1/datasets:
 *   get: { tags: [Datasets], summary: Search the dataset catalog, parameters: [{ in: query, name: search, schema: { type: string } }, { in: query, name: category, schema: { type: string } }, { in: query, name: tags, schema: { type: string } }, { in: query, name: page, schema: { type: integer } }, { in: query, name: limit, schema: { type: integer } }] }
 *   post: { tags: [Datasets], summary: Create dataset metadata from an encrypted upload artifact, security: [{ bearerAuth: [] }] }
 */
router.route("/").get(validate(listDatasetSchema, "query"), controller.list).post(auth, validate(createDatasetSchema), controller.create);
/** @swagger
 * /api/v1/datasets/categories:
 *   get: { tags: [Datasets], summary: List active dataset categories with counts }
 */
router.get("/categories", controller.categories);
/** @swagger
 * /api/v1/datasets/{id}/preview:
 *   get: { tags: [Datasets], summary: Get a sanitized dataset preview; never returns protected file bytes }
 */
router.get("/:id/preview", controller.preview);
/** @swagger
 * /api/v1/datasets/{id}/blockchain:
 *   post: { tags: [Datasets], summary: Verify and synchronize a client-signed DatasetRegistry registration, security: [{ bearerAuth: [] }] }
 */
router.post("/:id/blockchain", auth, validate(blockchainSchema), controller.syncBlockchain);
/** @swagger
 * /api/v1/datasets/{id}/reviews:
 *   get: { tags: [Datasets], summary: List reviews }
 *   post: { tags: [Datasets], summary: Create or update own review, security: [{ bearerAuth: [] }] }
 */
router.get("/:id/reviews", controller.getReviews).post("/:id/reviews", auth, validate(reviewSchema), controller.addReview);
/** @swagger
 * /api/v1/datasets/{id}/versions:
 *   get: { tags: [Datasets], summary: List dataset versions }
 *   post: { tags: [Datasets], summary: Add an encrypted dataset version, security: [{ bearerAuth: [] }] }
 */
router.get("/:id/versions", controller.getVersions).post("/:id/versions", auth, validate(versionSchema), controller.addVersion);
/** @swagger
 * /api/v1/datasets/{id}/versions/{version}:
 *   get: { tags: [Datasets], summary: Get a dataset version's safe metadata }
 */
router.get("/:id/versions/:version", controller.getVersion);
router.route("/:id").get(controller.get).patch(auth, validate(updateDatasetSchema), controller.update).put(auth, validate(updateDatasetSchema), controller.update).delete(auth, controller.remove);

export default router;
