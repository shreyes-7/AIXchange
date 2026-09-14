import { ethers, Contract, JsonRpcProvider } from "ethers";
import { getSigner } from "../wallet/metamask.service.js";

export const PURCHASE_ENGINE_ABI = [
  "function purchaseDataset(uint256 datasetId, uint256 licenseId) returns (uint256 purchaseId)",
  "function hasAccess(address buyer, uint256 datasetId, uint256 licenseId) view returns (bool)",
  "function hasAnyAccess(address buyer, uint256 datasetId) view returns (bool)",
  "function getPurchase(uint256 purchaseId) view returns (tuple(uint256 purchaseId, address buyer, address licensor, uint256 datasetId, uint256 licenseId, uint256 amountPaid, uint256 platformFee, uint256 creatorProceeds, uint256 purchasedAt, bool active))",
  "function getBuyerPurchases(address buyer) view returns (uint256[])",
  "function platformFeeBps() view returns (uint256)",
  "event DatasetPurchased(uint256 indexed purchaseId, address indexed buyer, address indexed licensor, uint256 datasetId, uint256 licenseId, uint256 amountPaid, uint256 platformFee, uint256 creatorProceeds, uint256 timestamp)",
];

export function getPurchaseEngineAddress() {
  return import.meta.env.VITE_PURCHASE_ENGINE_ADDRESS || "0x0165878A594ca255338adfa4d48449f69242Eb8F";
}

export function getPurchaseContract(runner) {
  const address = getPurchaseEngineAddress();
  const activeRunner = runner || new JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  return new Contract(address, PURCHASE_ENGINE_ABI, activeRunner);
}

export async function checkHasAccess(buyerAddress, datasetId, licenseId = 1) {
  try {
    const contract = getPurchaseContract();
    return await contract.hasAccess(buyerAddress, datasetId, licenseId);
  } catch (err) {
    console.warn("Error checking access on-chain:", err);
    return false;
  }
}

export async function executePurchase(datasetId, licenseId = 1, onProgress) {
  if (onProgress) onProgress("PREPARING", "Connecting signer wallet...");
  const signer = await getSigner();
  const contract = getPurchaseContract(signer);

  if (onProgress) onProgress("SIGNING", "Please confirm the purchase in MetaMask...");
  const tx = await contract.purchaseDataset(datasetId, licenseId);

  if (onProgress) onProgress("SUBMITTED", `Transaction submitted (${tx.hash.slice(0, 10)}...). Waiting for confirmation...`);
  const receipt = await tx.wait(1);

  let purchaseId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "DatasetPurchased") {
        purchaseId = parsed.args.purchaseId.toString();
        break;
      }
    } catch {
      // ignore other logs
    }
  }

  if (onProgress) onProgress("CONFIRMED", "Purchase confirmed on blockchain!");
  return { txHash: tx.hash, receipt, purchaseId };
}

export default {
  getPurchaseEngineAddress,
  getPurchaseContract,
  checkHasAccess,
  executePurchase,
};
