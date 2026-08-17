/**
 * ============================================================================
 * AIXchange - Dataset Type Definitions & Constants
 * ----------------------------------------------------------------------------
 * Type definitions and status constants for Phase 4 dataset marketplace.
 * ============================================================================
 */

/**
 * @typedef {Object} DatasetBlockchainRecord
 * @property {number} datasetId - Unique incremental dataset ID on-chain.
 * @property {string} owner - Ethereum address of the dataset owner.
 * @property {string} cid - IPFS Content Identifier / hash.
 * @property {string} license - License name (e.g. "MIT", "CC-BY-4.0", "Custom-Commercial").
 * @property {number} royalty - Royalty in basis points (e.g. 500 = 5.00%).
 * @property {string} royaltyPercentage - Formatted royalty string (e.g. "5.00%").
 * @property {number} createdAt - Unix timestamp of on-chain creation.
 * @property {string} createdAtFormatted - Human readable local date string.
 * @property {boolean} active - Status of dataset availability.
 */

/**
 * @typedef {Object} DatasetMetadata
 * @property {string} title - Dataset title/name.
 * @property {string} description - Description of the dataset contents.
 * @property {string} category - Category (e.g. "Computer Vision", "NLP", "Tabular", "Audio").
 * @property {string[]} tags - Tag keywords.
 * @property {string} format - File format (e.g. "CSV", "Parquet", "JSON", "Images").
 * @property {string} size - Size in human-readable format (e.g. "250 MB").
 * @property {number} sampleRows - Number of sample rows/items.
 */

/**
 * Lifecycle stages for blockchain transaction processing.
 */
export const TRANSACTION_STAGES = {
  IDLE: "IDLE",
  CHECKING_WALLET: "CHECKING_WALLET",
  CHECKING_NETWORK: "CHECKING_NETWORK",
  WAITING_FOR_SIGNATURE: "WAITING_FOR_SIGNATURE",
  SUBMITTED: "SUBMITTED",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
};

/**
 * Standard license choices for AI datasets.
 */
export const STANDARD_LICENSES = [
  { value: "MIT", label: "MIT License (Permissive Open Source)" },
  { value: "Apache-2.0", label: "Apache 2.0 (Permissive with Patent Grant)" },
  { value: "CC-BY-4.0", label: "Creative Commons Attribution 4.0 (Open Data)" },
  { value: "CC-BY-SA-4.0", label: "Creative Commons Attribution-ShareAlike 4.0" },
  { value: "CC0-1.0", label: "CC0 1.0 (Public Domain Dedication)" },
  { value: "Custom-Commercial", label: "Custom Commercial AI License" },
  { value: "Academic-Only", label: "Academic / Non-Commercial Research Only" },
];

/**
 * Standard categories for AI datasets.
 */
export const DATASET_CATEGORIES = [
  "All",
  "Computer Vision",
  "Natural Language Processing",
  "Audio & Speech",
  "Tabular & Financial",
  "Multimodal & Generative",
  "Medical & Healthcare",
];
