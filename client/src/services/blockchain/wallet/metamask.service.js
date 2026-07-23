/**
 * ============================================================================
 * AIXchange - MetaMask Service
 * ----------------------------------------------------------------------------
 * Handles all direct interactions with the MetaMask browser extension.
 *
 * Responsibilities:
 *  - Detect MetaMask
 *  - Connect wallet
 *  - Disconnect wallet (client-side)
 *  - Get current account
 *  - Get chain ID
 *  - Listen for account changes
 *  - Listen for network changes
 * ============================================================================
 */

import { BrowserProvider } from "ethers";

/**
 * Returns the MetaMask provider.
 *
 * @returns {Object}
 */
export function getEthereumProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  return window.ethereum;
}

/**
 * Returns true if MetaMask is installed.
 *
 * @returns {boolean}
 */
export function isMetaMaskInstalled() {
  return typeof window.ethereum !== "undefined";
}

/**
 * Connects the user's wallet.
 *
 * @returns {Promise<string>}
 */
export async function connectWallet() {
  const ethereum = getEthereumProvider();

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

/**
 * Returns the currently connected wallet address.
 *
 * @returns {Promise<string|null>}
 */
export async function getCurrentAccount() {
  const ethereum = getEthereumProvider();

  const accounts = await ethereum.request({
    method: "eth_accounts",
  });

  return accounts.length ? accounts[0] : null;
}

/**
 * Returns an ethers BrowserProvider.
 *
 * @returns {BrowserProvider}
 */
export function getProvider() {
  return new BrowserProvider(getEthereumProvider());
}

/**
 * Returns the current signer.
 *
 * @returns {Promise<Signer>}
 */
export async function getSigner() {
  const provider = getProvider();

  return await provider.getSigner();
}

/**
 * Disconnect wallet (client-side only).
 *
 * NOTE:
 * MetaMask does NOT allow websites to programmatically disconnect.
 * This function simply clears local application state.
 */
export function disconnectWallet() {
  return {
    success: true,
    message:
      "Wallet disconnected from the application. Disconnecting from MetaMask must be done manually by the user.",
  };
}

/**
 * Returns the current chain ID.
 *
 * @returns {Promise<number>}
 */
export async function getChainId() {
  const provider = getProvider();

  const network = await provider.getNetwork();

  return Number(network.chainId);
}

/**
 * Returns the current network information.
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
 * Listen for wallet account changes.
 *
 * @param {(accounts:string[]) => void} callback
 */
export function onAccountsChanged(callback) {
  const ethereum = getEthereumProvider();

  ethereum.on("accountsChanged", callback);
}

/**
 * Remove account change listener.
 *
 * @param {(accounts:string[]) => void} callback
 */
export function removeAccountsChangedListener(callback) {
  const ethereum = getEthereumProvider();

  ethereum.removeListener("accountsChanged", callback);
}

/**
 * Listen for chain/network changes.
 *
 * @param {(chainId:string) => void} callback
 */
export function onChainChanged(callback) {
  const ethereum = getEthereumProvider();

  ethereum.on("chainChanged", callback);
}

/**
 * Remove chain change listener.
 *
 * @param {(chainId:string) => void} callback
 */
export function removeChainChangedListener(callback) {
  const ethereum = getEthereumProvider();

  ethereum.removeListener("chainChanged", callback);
}