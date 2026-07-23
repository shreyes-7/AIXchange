/**
 * ============================================================================
 * AIXchange - Network Service
 * ----------------------------------------------------------------------------
 * Handles blockchain network operations.
 *
 * Responsibilities:
 *  - Get current chain ID
 *  - Get current network
 *  - Validate supported networks
 *  - Switch network
 *  - Add network (if missing)
 * ============================================================================
 */

// import { BrowserProvider } from "ethers";
import { SUPPORTED_CHAINS } from "./constants.js";
import { getProvider } from "./metamask.service.js";
/**
 * Returns an ethers BrowserProvider.
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
 * Returns current chain ID.
 *
 * @returns {Promise<number>}
 */
export async function getChainId() {
  const provider = getProvider();
  const network = await provider.getNetwork();

  return Number(network.chainId);
}

/**
 * Returns current network details.
 *
 * @returns {Promise<Object>}
 */
export async function getNetwork() {
  const provider = getProvider();
  const network = await provider.getNetwork();

  return {
    chainId: Number(network.chainId),
    name: network.name,
  };
}

/**
 * Checks if current network is supported.
 *
 * @returns {Promise<boolean>}
 */
export async function isSupportedNetwork() {
  const chainId = await getChainId();

  return Object.values(SUPPORTED_CHAINS).some(
    (network) => network.chainId === chainId
  );
}

/**
 * Switches MetaMask to the specified network.
 *
 * @param {Object} networkConfig
 */
export async function switchNetwork(networkConfig) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [
        {
            chainId: networkConfig.chainHex,
        },
    ],
});

return true;
}

/**
 * Adds a new network to MetaMask.
 *
 * Useful if the user doesn't already have the network configured.
 *
 * @param {Object} network
 */
export async function addNetwork(network) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: network.chainHex,
        chainName: network.name,

        nativeCurrency: {
          name: network.currency,
          symbol: network.currency,
          decimals: 18,
        },

        rpcUrls: network.rpcUrls,

        blockExplorerUrls: network.blockExplorerUrls,
      },
    ],
  });
}

/**
 * Ensures user is connected to a supported network.
 *
 * @returns {Promise<void>}
 */
export async function ensureSupportedNetwork() {
  const supported = await isSupportedNetwork();

  if (!supported) {
    throw new Error("Unsupported blockchain network.");
  }
}