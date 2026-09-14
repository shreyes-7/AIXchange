import { ethers, Contract, JsonRpcProvider } from "ethers";
import { getSigner } from "../wallet/metamask.service.js";

export const PROVENANCE_REGISTRY_ABI = [
  "function registerProvenance(uint256 datasetId, string executionId, uint256 modelId, uint256 modelVersion, bytes32 metadataHash) returns (uint256 provenanceId)",
  "function verifyProvenance(uint256 datasetId, string executionId, uint256 modelId, uint256 modelVersion, bytes32 metadataHash) view returns (bool)",
  "function getProvenance(uint256 provenanceId) view returns (tuple(uint256 provenanceId, uint256 datasetId, string executionId, uint256 modelId, uint256 modelVersion, bytes32 metadataHash, address registrant, uint256 timestamp, bool active))",
  "function getTotalProvenance() view returns (uint256)",
  "event ProvenanceRegistered(uint256 indexed provenanceId, uint256 indexed datasetId, uint256 indexed modelId, uint256 modelVersion, string executionId, bytes32 metadataHash, address registrant, uint256 timestamp)",
];

export function getProvenanceRegistryAddress() {
  return import.meta.env.VITE_PROVENANCE_REGISTRY_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
}

export function getProvenanceContract(runner) {
  const address = getProvenanceRegistryAddress();
  const activeRunner = runner || new JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  return new Contract(address, PROVENANCE_REGISTRY_ABI, activeRunner);
}

export async function verifyProvenanceOnChain(datasetId, executionId, modelId, modelVersion, metadataHash) {
  try {
    const contract = getProvenanceContract();
    const formattedHash = metadataHash.startsWith("0x") ? metadataHash : ethers.keccak256(ethers.toUtf8Bytes(metadataHash));
    return await contract.verifyProvenance(datasetId, executionId, modelId, modelVersion, formattedHash);
  } catch (err) {
    console.warn("Provenance verification error:", err);
    return false;
  }
}

export async function registerProvenanceOnChain(datasetId, executionId, modelId, modelVersion, metadataHash, onProgress) {
  if (onProgress) onProgress("PREPARING", "Connecting signer wallet...");
  const signer = await getSigner();
  const contract = getProvenanceContract(signer);

  const formattedHash = metadataHash.startsWith("0x") && metadataHash.length === 66
    ? metadataHash
    : ethers.keccak256(ethers.toUtf8Bytes(metadataHash || "AIXchange Lineage"));

  if (onProgress) onProgress("SIGNING", "Please confirm provenance registration in MetaMask...");
  const tx = await contract.registerProvenance(datasetId, executionId, modelId, modelVersion, formattedHash);

  if (onProgress) onProgress("SUBMITTED", `Transaction submitted (${tx.hash.slice(0, 10)}...). Awaiting confirmation...`);
  const receipt = await tx.wait(1);

  let provenanceId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "ProvenanceRegistered") {
        provenanceId = parsed.args.provenanceId.toString();
        break;
      }
    } catch {
      // ignore
    }
  }

  if (onProgress) onProgress("CONFIRMED", "Provenance record anchored on blockchain!");
  return { txHash: tx.hash, receipt, provenanceId };
}

export default {
  getProvenanceRegistryAddress,
  getProvenanceContract,
  verifyProvenanceOnChain,
  registerProvenanceOnChain,
};
