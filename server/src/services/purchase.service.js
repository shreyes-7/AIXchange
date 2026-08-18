import Dataset from "../models/dataset.model.js";
import License from "../models/license.model.js";
import * as repository from "../repositories/purchase.repository.js";
import purchaseBlockchain from "./purchaseBlockchain.service.js";
import licenseBlockchain from "./licenseBlockchain.service.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const id = (value, name) => { try { const parsed = BigInt(value); if (parsed <= 0n || parsed > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(); return Number(parsed); } catch { throw new ApiError(400, `${name} must be a positive integer.`); } };

const datasetFor = async (datasetId) => {
    const dataset = await Dataset.findOne({ "blockchain.datasetId": String(datasetId), status: "active" });
    if (!dataset) throw new ApiError(404, "Dataset not found.");
    return dataset;
};

const licenseFor = async (datasetId, licenseId) => {
    const license = await License.findOne({ licenseId, assetType: "DATASET", assetId: datasetId });
    if (!license) throw new ApiError(404, "License not found for this dataset.");
    if (license.status !== "ACTIVE") throw new ApiError(409, "License is not active.");
    return license;
};

const canViewPurchase = async (user, purchase) => {
    const wallet = purchaseBlockchain.wallet(user).toLowerCase();
    if (wallet === purchase.buyerWallet.toLowerCase()) return true;
    if (user.role === "ADMIN") return true;
    const dataset = await Dataset.findOne({ "blockchain.datasetId": String(purchase.datasetId) });
    return Boolean(dataset && String(dataset.owner) === String(user.userId));
};

export const initiate = async (user, input) => {
    const wallet = purchaseBlockchain.wallet(user);
    const datasetId = id(input.datasetId, "datasetId");
    const licenseId = id(input.licenseId, "licenseId");
    const dataset = await datasetFor(datasetId);
    const license = await licenseFor(datasetId, licenseId);
    if (String(dataset.owner) === String(user.userId) || dataset.blockchain.owner?.toLowerCase() === wallet.toLowerCase()) throw new ApiError(409, "Dataset owners cannot purchase their own dataset.");
    const authoritativeLicense = await licenseBlockchain.getLicense(licenseId);
    if (authoritativeLicense.assetId !== datasetId || authoritativeLicense.licensor.toLowerCase() !== license.licensor.toLowerCase() || authoritativeLicense.status !== "ACTIVE" || !(await licenseBlockchain.isActive(licenseId))) throw new ApiError(409, "License is not currently purchasable on-chain.");
    const transaction = await purchaseBlockchain.preparePurchase(datasetId, licenseId, wallet);
    logger.info("PURCHASE_TRANSACTION_PREPARED", { wallet, datasetId, licenseId });
    return { state: "PENDING", datasetId, licenseId, buyerWallet: wallet, transaction };
};

export const sync = async (user, input) => {
    const wallet = purchaseBlockchain.wallet(user);
    const datasetId = id(input.datasetId, "datasetId");
    const licenseId = id(input.licenseId, "licenseId");
    await datasetFor(datasetId); await licenseFor(datasetId, licenseId);
    const result = await purchaseBlockchain.verifyTransaction(input.transactionHash, { datasetId, licenseId }, wallet);
    const pending = await repository.createPending({ datasetId, licenseId, buyerWallet: wallet, licensorWallet: "0x0000000000000000000000000000000000000000", transactionHash: input.transactionHash, chainId: Number((await purchaseBlockchain.provider().getNetwork()).chainId), contractAddress: purchaseBlockchain.purchaseAddress });
    if (result.state === "PENDING") return { state: "PENDING", purchase: pending };
    if (result.state === "FAILED") { await repository.markFailed(input.transactionHash); return { state: "FAILED", transactionHash: input.transactionHash }; }
    const purchase = await repository.saveConfirmed({ ...result.purchase, transactionHash: result.txHash, logIndex: result.logIndex, blockNumber: result.blockNumber, chainId: Number((await purchaseBlockchain.provider().getNetwork()).chainId), contractAddress: purchaseBlockchain.purchaseAddress, status: "CONFIRMED", royalty: result.royalty });
    logger.info("PURCHASE_SYNCHRONIZED", { purchaseId: purchase.purchaseId, wallet, transactionHash: result.txHash });
    return { state: "CONFIRMED", purchase };
};

export const listMine = async (user, query) => repository.findByBuyer(purchaseBlockchain.wallet(user), query);
export const get = async (user, purchaseId) => { const purchase = await repository.findById(id(purchaseId, "purchaseId")); if (!purchase) throw new ApiError(404, "Purchase not found."); if (!(await canViewPurchase(user, purchase))) throw new ApiError(403, "You are not authorized to view this purchase."); return purchase; };
export const status = async (user, transactionHash) => { const purchase = await repository.findByTransaction(transactionHash); if (!purchase) throw new ApiError(404, "Purchase transaction not found."); if (!(await canViewPurchase(user, purchase))) throw new ApiError(403, "You are not authorized to view this purchase."); let onChain = null; if (purchase.status === "CONFIRMED" && purchase.purchaseId) { onChain = await purchaseBlockchain.getPurchase(purchase.purchaseId); if (onChain.buyerWallet.toLowerCase() !== purchase.buyerWallet.toLowerCase() || onChain.datasetId !== purchase.datasetId || onChain.licenseId !== purchase.licenseId) throw new ApiError(409, "Purchase projection does not match blockchain state."); } return { transactionHash, status: purchase.status, purchase, onChain }; };
export const listDatasetPurchases = async (user, datasetId, query) => { const numericId = id(datasetId, "datasetId"); const dataset = await datasetFor(numericId); const wallet = purchaseBlockchain.wallet(user); if (user.role !== "ADMIN" && String(dataset.owner) !== String(user.userId) && dataset.blockchain.owner?.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Only the dataset owner can view its purchases."); return repository.findByDataset(numericId, query); };
