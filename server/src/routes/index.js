import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import walletRoutes from "./wallet.route.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth",authRoutes);
router.use("/wallet", walletRoutes);

export default router;