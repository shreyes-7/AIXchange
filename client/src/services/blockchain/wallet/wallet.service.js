/**
 * ============================================================================
 * AIXchange - Wallet Service
 * ----------------------------------------------------------------------------
 * High-level wallet service that orchestrates the complete wallet workflow.
 *
 * Responsibilities:
 *  - Connect wallet
 *  - Disconnect wallet
 *  - Link wallet (build + sign)
 *  - Verify signature
 *  - Get wallet information
 *  - Get network information
 *
 * NOTE:
 * Backend integration is intentionally omitted for now.
 * Once the backend is ready, replace the mocked nonce generation
 * with an API call and send the signed payload to /wallet/connect.
 * ============================================================================
 */

import {
  connectWallet,
  disconnectWallet,
  getCurrentAccount,
} from "./metamask.service.js";

import {
  getChainId,
  getNetwork,
  isSupportedNetwork,
} from "./network.service.js";

import { getNonce } from "./nonce.service.js";

import {
  buildVerificationMessage,
} from "./message.service.js";

import {
  signVerificationMessage,
} from "./signer.service.js";

import {
  verifySignature,
} from "./verifier.service.js";

/**
 * Connect MetaMask wallet.
 */
export async function connect() {
  const walletAddress = await connectWallet();

  const chainId = await getChainId();

  const network = await getNetwork();

  return {
    walletAddress,
    chainId,
    network,
  };
}

/**
 * Returns current wallet information.
 */
export async function getWallet() {
  const walletAddress = await getCurrentAccount();

  if (!walletAddress) {
    return null;
  }

  return {
    walletAddress,
    chainId: await getChainId(),
    network: await getNetwork(),
  };
}

/**
 * Returns blockchain network information.
 */
export async function getWalletNetwork() {
  return await getNetwork();
}

/**
 * Checks whether current network is supported.
 */
export async function validateNetwork() {
  return await isSupportedNetwork();
}

/**
 * Complete wallet linking flow.
 *
 * Current Flow:
 *
 * Connect Wallet
 *      ↓
 * Generate Nonce
 *      ↓
 * Build Message
 *      ↓
 * Sign Message
 *
 * Later:
 *
 * POST /wallet/connect
 */
export async function linkWallet() {

  const walletAddress = await connectWallet();

  const { nonce, timestamp } = await getNonce();

  const message = buildVerificationMessage({
    walletAddress,
    nonce,
    timestamp,
  });

  const signed = await signVerificationMessage(message);

  return {
    walletAddress,

    nonce,

    timestamp,

    message,

    signature: signed.signature,

    signedAt: signed.signedAt,
  };
}

/**
 * Complete wallet linking flow connected to AIXchange Backend API.
 *
 * Flow:
 * 1. Connect Wallet & get chainId
 * 2. POST /api/v1/wallet/nonce -> Receive challenge message
 * 3. Sign message via MetaMask
 * 4. POST /api/v1/wallet/verify -> Link wallet in MongoDB
 */
export async function linkWalletBackend({ accessToken, apiBaseUrl = "http://localhost:5000/api/v1" }) {
  if (!accessToken) {
    throw new Error("Access token (JWT) is required for backend wallet linking.");
  }

  const walletAddress = await connectWallet();
  const chainId = await getChainId();

  // 1. Fetch challenge message & nonce from backend
  const nonceRes = await fetch(`${apiBaseUrl}/wallet/nonce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ address: walletAddress, chainId }),
  });

  const nonceData = await nonceRes.json();
  if (!nonceRes.ok || !nonceData.success) {
    throw new Error(nonceData.message || "Failed to generate wallet nonce from backend.");
  }

  const { message } = nonceData.data;

  // 2. Sign message using MetaMask
  const signed = await signVerificationMessage(message);

  // 3. Send signature to backend for verification and MongoDB persistence
  const verifyRes = await fetch(`${apiBaseUrl}/wallet/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ address: walletAddress, signature: signed.signature }),
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(verifyData.message || "Failed to verify wallet signature on backend.");
  }

  return verifyData.data;
}

/**
 * Verify wallet signature locally.
 *
 * Later verification will also happen on backend.
 */
export function verifyWallet({
  walletAddress,
  message,
  signature,
}) {

  return verifySignature({
    expectedWallet: walletAddress,
    message,
    signature,
  });

}

/**
 * Disconnect wallet from application.
 *
 * NOTE:
 * MetaMask itself cannot be disconnected programmatically.
 */
export function disconnect() {

  return disconnectWallet();

}