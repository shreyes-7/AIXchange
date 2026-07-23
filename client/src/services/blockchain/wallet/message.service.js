/**
 * ============================================================================
 * AIXchange - Message Service
 * ----------------------------------------------------------------------------
 * Responsible for generating standardized messages that users sign with
 * MetaMask for wallet verification.
 *
 * IMPORTANT:
 * This file ONLY builds messages.
 * It does NOT sign or verify them.
 * ============================================================================
 */

import {
  APP_NAME,
  APP_VERSION,
  SIGN_MESSAGE_TITLE,
  SIGN_MESSAGE_PURPOSE,
} from "./constants.js";

/**
 * Builds the standard wallet verification message.
 *
 * @param {Object} params
 * @param {string} params.walletAddress - User wallet address
 * @param {string} params.nonce - Unique nonce
 * @param {string} params.timestamp - ISO timestamp
 *
 * @returns {string}
 */
export function buildVerificationMessage({
  walletAddress,
  nonce,
  timestamp,
}) {
  if (!walletAddress)
    throw new Error("Wallet address is required.");

  if (!nonce)
    throw new Error("Nonce is required.");

  if (!timestamp)
    throw new Error("Timestamp is required.");

  return `
====================================================
${SIGN_MESSAGE_TITLE}
====================================================

Application : ${APP_NAME}
Version     : ${APP_VERSION}

Purpose     : ${SIGN_MESSAGE_PURPOSE}

Wallet Address:
${walletAddress}

Nonce:
${nonce}

Timestamp:
${timestamp}

----------------------------------------------------
By signing this message you are proving ownership
of this wallet.

This request will NOT trigger a blockchain
transaction.

No gas fees will be charged.

If you did not initiate this request,
please reject it immediately.
----------------------------------------------------
`;
}

/**
 * Generates the current timestamp in ISO format.
 *
 * @returns {string}
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}