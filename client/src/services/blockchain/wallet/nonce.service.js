/**
 * ============================================================================
 * AIXchange - Nonce Service
 * ----------------------------------------------------------------------------
 * Responsible for generating and managing nonces used during
 * wallet verification.
 *
 * NOTE:
 * Currently generates a local nonce.
 * Once the backend is ready, replace generateNonce() with
 * an API call to:
 *
 * POST /wallet/request-nonce
 * ============================================================================
 */

/**
 * Generates a cryptographically secure random nonce.
 *
 * @returns {string}
 */
export function generateNonce() {
  const randomBytes = new Uint8Array(16);

  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns a nonce together with the timestamp.
 *
 * @returns {{nonce: string, timestamp: string}}
 */
export function createNoncePayload() {
  return {
    nonce: generateNonce(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates a nonce.
 *
 * @param {string} nonce
 * @returns {boolean}
 */
export function isValidNonce(nonce) {
  return (
    typeof nonce === "string" &&
    nonce.length === 32 &&
    /^[a-fA-F0-9]+$/.test(nonce)
  );
}

/**
 * Placeholder for future backend integration.
 *
 * Replace this function once the backend API exists.
 *
 * Current:
 *  Generates nonce locally.
 *
 * Future:
 *  POST /wallet/request-nonce
 */
export async function getNonce() {
  return createNoncePayload();
}