/**
 * ============================================================================
 * AIXchange - Blockchain Constants
 * ----------------------------------------------------------------------------
 * This file contains all application-wide blockchain constants.
 * Keeping them here avoids hardcoding values throughout the project.
 * ============================================================================
 */

/**
 * Application Information
 */
export const APP_NAME = "AIXchange";
export const APP_VERSION = "1.0.0";

/**
 * Supported Blockchain Networks
 */
export const SUPPORTED_CHAINS = {
  HARDHAT: {
    chainId: 31337,
    chainHex: "0x7A69",
    name: "Hardhat Local Network",
    currency: "ETH",
  },

  SEPOLIA: {
    chainId: 11155111,
    chainHex: "0xaa36a7",
    name: "Sepolia Testnet",
    currency: "ETH",
  },
};

/**
 * Default network used during development.
 * Change this to SUPPORTED_CHAINS.SEPOLIA when deploying to testnet.
 */
export const DEFAULT_CHAIN = SUPPORTED_CHAINS.HARDHAT;

/**
 * Wallet Verification
 */
export const SIGN_MESSAGE_TITLE = "Welcome to AIXchange";
export const SIGN_MESSAGE_PURPOSE = "Wallet Verification";

/**
 * Wallet Connection Status
 */
export const WALLET_STATUS = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
};

/**
 * Common Blockchain Errors
 */
export const BLOCKCHAIN_ERRORS = {
  METAMASK_NOT_INSTALLED: "MetaMask extension is not installed.",
  WALLET_NOT_CONNECTED: "Wallet is not connected.",
  USER_REJECTED_REQUEST: "User rejected the wallet request.",
  UNSUPPORTED_NETWORK: "Unsupported blockchain network.",
  INVALID_SIGNATURE: "Invalid wallet signature.",
};

/**
 * API Endpoints
 * (These will be used once the backend wallet APIs are available.)
 */
export const WALLET_API = {
  REQUEST_NONCE: "/wallet/request-nonce",
  CONNECT: "/wallet/connect",
  DISCONNECT: "/wallet/disconnect",
  STATUS: "/wallet/status",
};