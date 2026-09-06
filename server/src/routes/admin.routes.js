import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as adminController from "../controllers/admin.controller.js";
import * as reportController from "../controllers/report.controller.js";
import * as fraudReviewController from "../controllers/fraud-review.controller.js";
import {
    userStatusUpdateSchema,
    datasetStatusUpdateSchema,
    modelStatusUpdateSchema,
    adminUserQuerySchema,
    adminDatasetQuerySchema,
    adminModelQuerySchema,
    fraudReviewSchema,
    fraudQuerySchema,
    ingestFlagsSchema,
    auditQuerySchema,
} from "../validators/admin.validator.js";
import {
    reportQuerySchema,
    reportAssignmentSchema,
    reportStatusUpdateSchema,
} from "../validators/report.validator.js";

const router = Router();

// Protect ALL admin routes with authentication and admin role
router.use(authenticate, requireAdmin);

// --- User Moderation ---
router.get("/users", validate(adminUserQuerySchema, "query"), adminController.listUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.patch("/users/:userId/status", validate(userStatusUpdateSchema, "body"), adminController.updateUserStatus);

// --- Dataset Moderation ---
router.get("/datasets", validate(adminDatasetQuerySchema, "query"), adminController.listDatasets);
router.get("/datasets/:datasetId", adminController.getDatasetDetails);
router.patch("/datasets/:datasetId/status", validate(datasetStatusUpdateSchema, "body"), adminController.updateDatasetStatus);

// --- Model Moderation ---
router.get("/models", validate(adminModelQuerySchema, "query"), adminController.listModels);
router.get("/models/:modelId", adminController.getModelDetails);
router.patch("/models/:modelId/status", validate(modelStatusUpdateSchema, "body"), adminController.updateModelStatus);

// --- Report Administration ---
router.get("/reports", validate(reportQuerySchema, "query"), reportController.listReports);
router.get("/reports/:reportId", reportController.getReportDetails);
router.patch("/reports/:reportId/assignment", validate(reportAssignmentSchema, "body"), reportController.assignReport);
router.patch("/reports/:reportId/status", validate(reportStatusUpdateSchema, "body"), reportController.updateReportStatus);

// --- Fraud Flag Ingestion & Review ---
router.post("/fraud-flags/ingest", validate(ingestFlagsSchema, "body"), fraudReviewController.ingestFlags);
router.get("/fraud-flags", validate(fraudQuerySchema, "query"), fraudReviewController.listFraudFlags);
router.get("/fraud-flags/:id", fraudReviewController.getFraudFlag);
router.patch("/fraud-flags/:id/status", validate(fraudReviewSchema, "body"), fraudReviewController.reviewFraudFlag);

// --- Append-Only Moderation Audit Log ---
router.get("/audits", validate(auditQuerySchema, "query"), adminController.listAudits);

// --- Authoritative Treasury Overview ---
router.get("/treasury", adminController.getTreasuryOverview);

export default router;
