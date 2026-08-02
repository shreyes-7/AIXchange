import { Router } from "express";

import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import * as walletController from "../controllers/wallet.controller.js";

import {
    generateNonceSchema,
    verifyWalletSchema,
} from "../validators/wallet.validator.js";

const router = Router();

/**
 * @swagger
 * /api/v1/wallet/nonce:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Generate wallet verification nonce
 *     description: Generates a nonce that the user must sign with their wallet to prove ownership.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - chainId
 *             properties:
 *               address:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *               chainId:
 *                 type: integer
 *                 example: 11155111
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Wallet already linked to another account
 */
router.post(
    "/nonce",
    auth,
    validate(generateNonceSchema),
    walletController.generateNonce
);

/**
 * @swagger
 * /api/v1/wallet/verify:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Verify wallet ownership
 *     description: Verifies the signed nonce and links the wallet to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signature
 *             properties:
 *               address:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *               signature:
 *                 type: string
 *                 example: "0x123456789abcdef..."
 *     responses:
 *       200:
 *         description: Wallet verified successfully
 *       400:
 *         description: Invalid request or expired nonce
 *       401:
 *         description: Invalid signature
 */
router.post(
    "/verify",
    auth,
    validate(verifyWalletSchema),
    walletController.verifyWallet
);

/**
 * @swagger
 * /api/v1/wallet/me:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get linked wallet details
 *     description: Returns the wallet information of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/me",
    auth,
    walletController.getWallet
);

/**
 * @swagger
 * /api/v1/wallet/unlink:
 *   delete:
 *     tags:
 *       - Wallet
 *     summary: Unlink wallet
 *     description: Removes the linked wallet from the authenticated user's account.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet unlinked successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
    "/unlink",
    auth,
    walletController.unlinkWallet
);

export default router;