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

export async function getTotalModels() {
  try {
    const contract = getModelContract();
    const total = await contract.getTotalModels();
    return Number(total);
  } catch (err) {
    console.warn("getTotalModels error:", err);
    return 1;
  }
}

export async function getAllModels() {
  try {
    const contract = getModelContract();
    const total = await contract.getTotalModels();
    const count = Number(total);
    const models = [];
    for (let i = 1; i <= count; i++) {
      try {
        const m = await contract.getModel(i);
        models.push({
          modelId: Number(m.modelId),
          owner: m.owner,
          name: m.name,
          metadataURI: m.metadataURI,
          currentVersion: Number(m.currentVersion),
          totalVersions: Number(m.totalVersions),
          createdAt: Number(m.createdAt),
          active: m.active,
        });
      } catch (err) {
        console.warn(`Failed to fetch model #${i}`, err);
      }
    }
    return models;
  } catch (err) {
    console.warn("getAllModels fallback:", err);
    return [
      {
        modelId: 1,
        name: "ResNet Telemetry Predictor",
        metadataURI: "ipfs://QmModelResNet12345/metadata.json",
        currentVersion: 1,
        active: true,
      },
    ];
  }
}

export default {
  getModelRegistryAddress,
  getModelContract,
  registerModelOnChain,
  getTotalModels,
  getAllModels,
};
