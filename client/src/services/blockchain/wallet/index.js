/**
 * ============================================================================
 * AIXchange - Wallet Module
 * ----------------------------------------------------------------------------
 * Central export file for all wallet-related services.
 * Import everything from this file instead of individual service files.
 * ============================================================================
 */

// Wallet Management
export * from "./wallet.service.js";

// MetaMask
export {
  getEthereumProvider,
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAccount,
  getProvider,
  getSigner,
  disconnectWallet,
  getChainId,
  getNetwork,
  onAccountsChanged,
  removeAccountsChangedListener,
  onChainChanged,
  removeChainChangedListener,
} from "./metamask.service.js";

// Network Utilities
export {
  isSupportedNetwork,
  switchNetwork,
  addNetwork,
  ensureSupportedNetwork,
} from "./network.service.js";

// Message Builder
export * from "./message.service.js";

// Signature Operations
export * from "./signer.service.js";
export * from "./verifier.service.js";

// Nonce Utilities
export * from "./nonce.service.js";

// Constants
export * from "./constants.js";