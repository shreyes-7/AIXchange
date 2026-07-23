/**
 * ============================================================================
 * AIXchange - Signer Service
 * ----------------------------------------------------------------------------
 * Responsible for signing messages using the connected MetaMask wallet.
 *
 * Responsibilities:
 *  - Get current signer
 *  - Sign arbitrary messages
 *  - Get signer address
 *
 * This service DOES NOT:
 *  - Generate messages
 *  - Verify signatures
 *  - Connect wallets
 * ============================================================================
 */

// import { BrowserProvider } from "ethers";
import { getProvider } from "./metamask.service.js";
/**
 * Returns the BrowserProvider.
 *
//  * @returns {BrowserProvider}
//  */
// function getProvider() {
//   if (!window.ethereum) {
//     throw new Error("MetaMask is not installed.");
//   }

//   return new BrowserProvider(window.ethereum);
// }

/**
 * Returns the currently connected signer.
 *
 * @returns {Promise<Signer>}
 */
export async function getSigner() {
  const provider = getProvider();

  return await provider.getSigner();
}

/**
 * Returns the connected wallet address.
 *
 * @returns {Promise<string>}
 */
export async function getSignerAddress() {
  const signer = await getSigner();

  return await signer.getAddress();
}

/**
 * Signs a message using MetaMask.
 *
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function signMessage(message) {
  if (!message || typeof message !== "string") {
    throw new Error("Message must be a non-empty string.");
  }

  const signer = await getSigner();

  const signature = await signer.signMessage(message);

  return signature;
}

/**
 * Signs a message and returns useful metadata.
 *
 * @param {string} message
 * @returns {Promise<Object>}
 */
export async function signVerificationMessage(message) {
  const signer = await getSigner();

  const walletAddress = await signer.getAddress();

  const signature = await signer.signMessage(message);

  return {
    walletAddress,
    signature,
    signedAt: new Date().toISOString(),
  };
}