/**
 * ============================================================================
 * AIXchange - Verifier Service
 * ----------------------------------------------------------------------------
 * Responsible for verifying wallet signatures.
 *
 * Responsibilities:
 *  - Recover wallet address from a signed message
 *  - Verify signature ownership
 *  - Compare expected wallet with recovered wallet
 *
 * This service DOES NOT:
 *  - Connect MetaMask
 *  - Sign messages
 *  - Build messages
 * ============================================================================
 */

import { verifyMessage } from "ethers";

/**
 * Recovers the wallet address that signed the message.
 *
 * @param {string} message
 * @param {string} signature
 * @returns {string}
 */
export function recoverWallet(message, signature) {
  if (!message || typeof message !== "string") {
    throw new Error("Message is required.");
  }

  if (!signature || typeof signature !== "string") {
    throw new Error("Signature is required.");
  }

  return verifyMessage(message, signature);
}

/**
 * Verifies whether the signature belongs to the expected wallet.
 *
 * @param {Object} params
 * @param {string} params.expectedWallet
 * @param {string} params.message
 * @param {string} params.signature
 * @returns {boolean}
 */
export function verifySignature({
  expectedWallet,
  message,
  signature,
}) {
  if (!expectedWallet) {
    throw new Error("Expected wallet address is required.");
  }

  const recoveredWallet = recoverWallet(message, signature);

  return (
    recoveredWallet.toLowerCase() ===
    expectedWallet.toLowerCase()
  );
}

/**
 * Returns detailed verification results.
 *
 * Useful for debugging and backend integration.
 *
 * @param {Object} params
 * @param {string} params.expectedWallet
 * @param {string} params.message
 * @param {string} params.signature
 * @returns {Object}
 */
export function verifySignatureDetails({
  expectedWallet,
  message,
  signature,
}) {
  const recoveredWallet = recoverWallet(message, signature);

  const verified =
    recoveredWallet.toLowerCase() ===
    expectedWallet.toLowerCase();

  return {
    verified,
    expectedWallet,
    recoveredWallet,
    signature,
    verifiedAt: new Date().toISOString(),
  };
}