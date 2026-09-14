import { ethers, Contract, JsonRpcProvider } from "ethers";
import { getSigner } from "../wallet/metamask.service.js";

export const MODEL_REGISTRY_ABI = [
  "function registerModel(string name, string metadataURI, string modelHash) returns (uint256 modelId)",
  "function addModelVersion(uint256 modelId, string metadataURI, string modelHash) returns (uint256 versionNumber)",
  "function getModel(uint256 modelId) view returns (tuple(uint256 modelId, address owner, string name, string metadataURI, uint256 currentVersion, uint256 totalVersions, uint256 createdAt, bool active))",
  "function getTotalModels() view returns (uint256)",
  "function verifyModelHash(uint256 modelId, uint256 versionNumber, string expectedHash) view returns (bool)",
  "event ModelRegistered(uint256 indexed modelId, address indexed owner, string name, string metadataURI, string modelHash, uint256 initialVersion, uint256 createdAt)",
];

export function getModelRegistryAddress() {
  return import.meta.env.VITE_MODEL_REGISTRY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
}

export function getModelContract(runner) {
  const address = getModelRegistryAddress();
  const activeRunner = runner || new JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  return new Contract(address, MODEL_REGISTRY_ABI, activeRunner);
}

export async function registerModelOnChain(name, metadataURI, modelHash, onProgress) {
  if (onProgress) onProgress("PREPARING", "Connecting signer wallet...");
  const signer = await getSigner();
  const contract = getModelContract(signer);

  if (onProgress) onProgress("SIGNING", "Please confirm model registration in MetaMask...");
  const tx = await contract.registerModel(name, metadataURI, modelHash);

  if (onProgress) onProgress("SUBMITTED", `Transaction submitted (${tx.hash.slice(0, 10)}...). Waiting for confirmation...`);
  const receipt = await tx.wait(1);

  let modelId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "ModelRegistered") {
        modelId = parsed.args.modelId.toString();
        break;
      }
    } catch {
      // ignore
    }
  }

  if (onProgress) onProgress("CONFIRMED", "Model anchored on blockchain!");
  return { txHash: tx.hash, receipt, modelId };
}

export default {
  getModelRegistryAddress,
  getModelContract,
  registerModelOnChain,
};
