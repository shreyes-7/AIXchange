/**
 * ============================================================================
 * AIXchange - Dataset Blockchain Service
 * ----------------------------------------------------------------------------
 * Service layer for interacting with the AIXchange DatasetRegistry smart contract.
 * Uses ethers.js v6 and integrates with wallet/network services.
 * ============================================================================
 */

import { ethers, Contract, JsonRpcProvider } from "ethers";
import { DATASET_REGISTRY_ABI } from "./dataset.abi.js";
import { getProvider, getSigner, isMetaMaskInstalled } from "../wallet/metamask.service.js";
import { isSupportedNetwork } from "../wallet/network.service.js";

let cachedContract = null;

/**
 * Returns the configured DatasetRegistry contract address from environment.
 * @returns {string}
 */
export function getDatasetRegistryAddress() {
  const address = import.meta.env.VITE_DATASET_REGISTRY_ADDRESS;
  return address || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
}

/**
 * Initializes and returns an ethers Contract instance for DatasetRegistry.
 * @param {string} [contractAddress] - Optional contract address override.
 * @param {ethers.ContractRunner} [runner] - Optional Ethers Signer or Provider instance.
 * @returns {ethers.Contract} Configured Contract instance.
 */
export function initializeDatasetContract(contractAddress, runner) {
  const targetAddress = contractAddress || getDatasetRegistryAddress();
  if (!targetAddress) {
    throw new Error("DatasetRegistry contract address is not configured. Set VITE_DATASET_REGISTRY_ADDRESS.");
  }

  let activeRunner = runner;
  if (!activeRunner) {
    if (isMetaMaskInstalled()) {
      activeRunner = getProvider();
    } else {
      const rpcUrl = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
      activeRunner = new JsonRpcProvider(rpcUrl);
    }
  }

  cachedContract = new Contract(targetAddress, DATASET_REGISTRY_ABI, activeRunner);
  return cachedContract;
}

/**
 * Gets the active DatasetRegistry contract instance.
 * @param {boolean} [requireSigner=false] - Whether to connect contract with signer.
 * @returns {Promise<ethers.Contract>} Active contract instance.
 */
export async function getContract(requireSigner = false) {
  const targetAddress = getDatasetRegistryAddress();

  if (requireSigner) {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is required to perform blockchain write operations.");
    }
    const supported = await isSupportedNetwork();
    if (!supported) {
      throw new Error("Current network is not supported. Please switch to the configured network.");
    }
    const signer = await getSigner();
    return new Contract(targetAddress, DATASET_REGISTRY_ABI, signer);
  }

  if (!cachedContract) {
    return initializeDatasetContract(targetAddress);
  }
  return cachedContract;
}

/**
 * Normalizes raw blockchain dataset struct to a clean JavaScript object.
 * @param {Object} raw
 * @returns {Object}
 */
export function normalizeDataset(raw) {
  const royaltyBps = Number(raw.royalty);
  const royaltyPercentage = (royaltyBps / 100).toFixed(2);
  const createdAtTimestamp = Number(raw.createdAt);

  return {
    datasetId: Number(raw.datasetId),
    owner: raw.owner,
    cid: raw.cid,
    license: raw.license,
    royalty: royaltyBps,
    royaltyPercentage: `${royaltyPercentage}%`,
    createdAt: createdAtTimestamp,
    createdAtFormatted: new Date(createdAtTimestamp * 1000).toLocaleString(),
    active: Boolean(raw.active),
  };
}

/**
 * Retrieves total number of registered datasets on-chain.
 * @returns {Promise<number>}
 */
export async function getTotalDatasets() {
  const contract = await getContract(false);
  const total = await contract.getTotalDatasets();
  return Number(total);
}

/**
 * Retrieves full dataset details for a given dataset ID.
 * @param {number|string} datasetId
 * @returns {Promise<Object>}
 */
export async function getDataset(datasetId) {
  const contract = await getContract(false);
  const raw = await contract.getDataset(datasetId);
  return normalizeDataset(raw);
}

/**
 * Retrieves the owner address for a given dataset ID.
 * @param {number|string} datasetId
 * @returns {Promise<string>}
 */
export async function getDatasetOwner(datasetId) {
  const contract = await getContract(false);
  return await contract.getDatasetOwner(datasetId);
}

/**
 * Retrieves all dataset IDs registered by a specific owner.
 * @param {string} ownerAddress
 * @returns {Promise<number[]>}
 */
export async function getDatasetsByOwner(ownerAddress) {
  const contract = await getContract(false);
  const ids = await contract.getDatasetsByOwner(ownerAddress);
  return ids.map((id) => Number(id));
}

/**
 * Retrieves all registered datasets from the blockchain.
 * @returns {Promise<Object[]>}
 */
export async function getAllDatasets() {
  const total = await getTotalDatasets();
  if (total === 0) return [];

  const contract = await getContract(false);
  const promises = [];
  for (let i = 1; i <= total; i++) {
    promises.push(
      contract.getDataset(i).then(normalizeDataset).catch(() => null)
    );
  }

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

/**
 * Registers a new dataset on-chain.
 * @param {Object} params
 * @param {string} params.cid - IPFS CID or dataset hash.
 * @param {string} params.license - License name (e.g. MIT, CC-BY-4.0).
 * @param {number} params.royalty - Royalty in basis points (0-10000).
 * @param {(state: string, data?: any) => void} [onProgress] - Lifecycle callback.
 * @returns {Promise<{ txHash: string, datasetId: number, receipt: any }>}
 */
export async function registerDataset({ cid, license, royalty }, onProgress) {
  if (!cid || typeof cid !== "string" || !cid.trim()) {
    throw new Error("Invalid IPFS CID/Hash.");
  }
  if (!license || typeof license !== "string" || !license.trim()) {
    throw new Error("Invalid license identifier.");
  }
  const royaltyNum = Number(royalty);
  if (isNaN(royaltyNum) || royaltyNum < 0 || royaltyNum > 10000) {
    throw new Error("Royalty must be between 0 and 10000 basis points (0% - 100%).");
  }

  if (onProgress) onProgress("CHECKING_WALLET");
  const contract = await getContract(true);

  if (onProgress) onProgress("WAITING_FOR_SIGNATURE");
  const tx = await contract.registerDataset(cid.trim(), license.trim(), royaltyNum);

  if (onProgress) onProgress("SUBMITTED", { txHash: tx.hash });
  const receipt = await tx.wait();

  // Extract datasetId from DatasetRegistered event
  let datasetId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === "DatasetRegistered") {
        datasetId = Number(parsed.args.datasetId);
        break;
      }
    } catch {
      // Non-matching log
    }
  }

  if (onProgress) onProgress("CONFIRMED", { txHash: tx.hash, datasetId, receipt });
  return { txHash: tx.hash, datasetId, receipt };
}

/**
 * Updates metadata for an existing dataset.
 * @param {Object} params
 * @param {number|string} params.datasetId
 * @param {string} params.cid
 * @param {string} params.license
 * @param {number} params.royalty
 * @param {(state: string, data?: any) => void} [onProgress]
 * @returns {Promise<any>}
 */
export async function updateDataset({ datasetId, cid, license, royalty }, onProgress) {
  if (onProgress) onProgress("CHECKING_WALLET");
  const contract = await getContract(true);

  if (onProgress) onProgress("WAITING_FOR_SIGNATURE");
  const tx = await contract.updateDataset(datasetId, cid.trim(), license.trim(), Number(royalty));

  if (onProgress) onProgress("SUBMITTED", { txHash: tx.hash });
  const receipt = await tx.wait();

  if (onProgress) onProgress("CONFIRMED", { txHash: tx.hash, receipt });
  return receipt;
}

/**
 * Sets dataset active/inactive status.
 * @param {number|string} datasetId
 * @param {boolean} active
 * @param {(state: string, data?: any) => void} [onProgress]
 * @returns {Promise<any>}
 */
export async function setDatasetStatus(datasetId, active, onProgress) {
  if (onProgress) onProgress("CHECKING_WALLET");
  const contract = await getContract(true);

  if (onProgress) onProgress("WAITING_FOR_SIGNATURE");
  const tx = await contract.setDatasetStatus(datasetId, active);

  if (onProgress) onProgress("SUBMITTED", { txHash: tx.hash });
  const receipt = await tx.wait();

  if (onProgress) onProgress("CONFIRMED", { txHash: tx.hash, receipt });
  return receipt;
}

/**
 * Transfers dataset ownership to a new address.
 * @param {number|string} datasetId
 * @param {string} newOwnerAddress
 * @param {(state: string, data?: any) => void} [onProgress]
 * @returns {Promise<any>}
 */
export async function transferDatasetOwnership(datasetId, newOwnerAddress, onProgress) {
  if (!ethers.isAddress(newOwnerAddress)) {
    throw new Error("Invalid recipient wallet address.");
  }

  if (onProgress) onProgress("CHECKING_WALLET");
  const contract = await getContract(true);

  if (onProgress) onProgress("WAITING_FOR_SIGNATURE");
  const tx = await contract.transferDatasetOwnership(datasetId, newOwnerAddress);

  if (onProgress) onProgress("SUBMITTED", { txHash: tx.hash });
  const receipt = await tx.wait();

  if (onProgress) onProgress("CONFIRMED", { txHash: tx.hash, receipt });
  return receipt;
}
