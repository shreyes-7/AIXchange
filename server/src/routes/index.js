import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import walletRoutes from "./wallet.route.js";
import tokenRoutes from "./token.route.js";
import treasuryRoutes from "./treasury.route.js";
import dashboardRoutes from "./dashboard.route.js";
import datasetRoutes from "./dataset.route.js";
import licenseRoutes from "./license.route.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth",authRoutes);
router.use("/wallet", walletRoutes);
router.use("/token",tokenRoutes);
router.use("/treasury", treasuryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/datasets", datasetRoutes);
router.use("/licenses", licenseRoutes);

export default router;
