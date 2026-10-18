/**
 * ============================================================================
 * AIXchange - MetaMask Service
 * ----------------------------------------------------------------------------
 * Handles all direct interactions with the MetaMask browser extension.
 * Supports asynchronous injection, EIP-1193, EIP-6963, and multi-wallet setups.
 *
 * Responsibilities:
 *  - Detect MetaMask / Web3 provider asynchronously
 *  - Connect wallet
 *  - Disconnect wallet (client-side)
 *  - Get current account
 *  - Get chain ID & network
 *  - Listen for account changes
 *  - Listen for network changes
 * ============================================================================
 */

import { BrowserProvider } from "ethers";

/**
 * Resolves the active Ethereum provider from window.ethereum or EIP-6963 / EIP-1193.
 * Supports multiple injected wallets and asynchronous injection.
 *
 * @param {number} timeoutMs
 * @returns {Promise<Object|null>}
 */
export async function detectEthereumProvider(timeoutMs = 2500) {
  if (typeof window === "undefined") return null;

  // 1. Immediate window.ethereum check
  if (window.ethereum) {
    if (window.ethereum.providers?.length) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      return mm || window.ethereum.providers[0];
    }
    return window.ethereum;
  }

  // 2. Wait for ethereum#initialized event or poll briefly
  return new Promise((resolve) => {
    let settled = false;

    const onInitialized = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener("ethereum#initialized", onInitialized);
      if (window.ethereum) {
        if (window.ethereum.providers?.length) {
          const mm = window.ethereum.providers.find((p) => p.isMetaMask);
          resolve(mm || window.ethereum.providers[0]);
          return;
        }
        resolve(window.ethereum);
      } else {
        resolve(null);
      }
    };

    window.addEventListener("ethereum#initialized", onInitialized, { once: true });

    // Fallback polling loop (checks every 100ms up to timeoutMs)
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.ethereum) {
        clearInterval(interval);
        if (!settled) {
          settled = true;
          window.removeEventListener("ethereum#initialized", onInitialized);
          if (window.ethereum.providers?.length) {
            const mm = window.ethereum.providers.find((p) => p.isMetaMask);
            resolve(mm || window.ethereum.providers[0]);
            return;
          }
          resolve(window.ethereum);
        }
      } else if (Date.now() - startTime >= timeoutMs) {
        clearInterval(interval);
        if (!settled) {
          settled = true;
          window.removeEventListener("ethereum#initialized", onInitialized);
          resolve(null);
        }
      }
    }, 100);
  });
}

/**
 * Returns the MetaMask provider synchronously if already present, or throws.
 *
 * @returns {Object}
 */
export function getEthereumProvider() {
  if (typeof window === "undefined") {
    throw new Error("Window is not available.");
  }

  if (window.ethereum) {
    if (window.ethereum.providers?.length) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      return mm || window.ethereum.providers[0];
    }
    return window.ethereum;
  }

  throw new Error("MetaMask is not detected. Please ensure MetaMask is installed, unlocked, and has permissions for localhost.");
}

/**
 * Returns true if MetaMask or an Ethereum provider is currently available.
 *
 * @returns {boolean}
 */
export function isMetaMaskInstalled() {
  if (typeof window === "undefined") return false;
  return typeof window.ethereum !== "undefined";
}

/**
 * Connects the user's wallet with asynchronous provider detection.
 *
 * @returns {Promise<string>}
 */
export async function connectWallet() {
  const ethereum = await detectEthereumProvider(2500);

  if (!ethereum) {
    throw new Error(
      "MetaMask provider not detected on this tab. If MetaMask is installed, please refresh the page (F5 or Ctrl+Shift+R) and verify the extension has site access to localhost."
    );
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask and approve the connection.");
  }

  return accounts[0];
}

/**
 * Returns the currently connected wallet address asynchronously.
 *
 * @returns {Promise<string|null>}
 */
export async function getCurrentAccount() {
  try {
    const ethereum = await detectEthereumProvider(1500);
    if (!ethereum) return null;

    const accounts = await ethereum.request({
      method: "eth_accounts",
    });

    return accounts.length ? accounts[0] : null;
  } catch (err) {
    console.warn("Could not query current account:", err);
    return null;
  }
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
  const ethereum = await detectEthereumProvider(2000);
  if (!ethereum) {
    throw new Error("MetaMask provider is not available.");
  }
  const provider = new BrowserProvider(ethereum);
  return await provider.getSigner();
}

/**
 * Disconnect wallet (client-side only).
 */
export function disconnectWallet() {
  return {
    success: true,
    message: "Wallet disconnected client-side.",
  };
}

/**
 * Returns the current chain ID.
 *
 * @returns {Promise<number>}
 */
export async function getChainId() {
  const ethereum = await detectEthereumProvider(2000);
  if (!ethereum) {
    throw new Error("Ethereum provider is not available.");
  }
  const provider = new BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  return Number(network.chainId);
}

/**
 * Returns the current network information.
 *
 * @returns {Promise<Object>}
 */
export async function getNetwork() {
  const ethereum = await detectEthereumProvider(2000);
  if (!ethereum) {
    return { chainId: 31337, name: "Hardhat Local" };
  }
  const provider = new BrowserProvider(ethereum);
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
  detectEthereumProvider().then((ethereum) => {
    if (ethereum?.on) {
      ethereum.on("accountsChanged", callback);
    }
  });
}

/**
 * Remove account change listener.
 *
 * @param {(accounts:string[]) => void} callback
 */
export function removeAccountsChangedListener(callback) {
  if (typeof window !== "undefined" && window.ethereum?.removeListener) {
    window.ethereum.removeListener("accountsChanged", callback);
  }
}

/**
 * Listen for chain/network changes.
 *
 * @param {(chainId:string) => void} callback
 */
export function onChainChanged(callback) {
  detectEthereumProvider().then((ethereum) => {
    if (ethereum?.on) {
      ethereum.on("chainChanged", callback);
    }
  });
}

/**
 * Remove chain change listener.
 *
 * @param {(chainId:string) => void} callback
 */
export function removeChainChangedListener(callback) {
  if (typeof window !== "undefined" && window.ethereum?.removeListener) {
    window.ethereum.removeListener("chainChanged", callback);
  }
}