import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import walletRoutes from "./wallet.route.js";
import tokenRoutes from "./token.route.js";
import treasuryRoutes from "./treasury.route.js";
import dashboardRoutes from "./dashboard.route.js";
import datasetRoutes from "./dataset.route.js";
import licenseRoutes from "./license.route.js";
import purchaseRoutes from "./purchase.route.js";
import sandboxRoutes from "./sandbox.route.js";
import blockchainAnalyticsRoutes from "./blockchain-analytics.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import modelRoutes from "./model.route.js";
import provenanceRoutes from "./provenance.route.js";
import royaltyRoutes from "./royalty.route.js";
import adminRoutes from "./admin.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth",authRoutes);
router.use("/wallet", walletRoutes);
router.use("/token",tokenRoutes);
router.use("/treasury", treasuryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/datasets", datasetRoutes);
router.use("/models", modelRoutes);
router.use("/provenance", provenanceRoutes);
router.use("/royalties", royaltyRoutes);
router.use("/licenses", licenseRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sandboxes", sandboxRoutes);
router.use("/analytics/blockchain", blockchainAnalyticsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);
router.use("/reports", reportRoutes);

export default router;
