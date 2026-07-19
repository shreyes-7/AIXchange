import { Router } from "express";

import ApiResponse from "../utils/ApiResponse.js";

const router = Router();

router.get("/", (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "Server is running successfully.",
            {
                status: "OK",
                timestamp: new Date().toISOString(),
            }
        )
    );
});

export default router;