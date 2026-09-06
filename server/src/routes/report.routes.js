import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as reportController from "../controllers/report.controller.js";
import { createReportSchema } from "../validators/report.validator.js";

const router = Router();

// User report submission requires standard authentication
router.post("/", authenticate, validate(createReportSchema, "body"), reportController.createReport);

export default router;
