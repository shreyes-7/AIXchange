import { ethers } from "ethers";
import env from "../config/env.js";
import { PURCHASE_ENGINE_ABI } from "../config/purchase-abi.js";
import ApiError from "../utils/ApiError.js";

const DATASET_REGISTRY_ABI = [
    "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId,address owner,string cid,string license,uint256 royalty,uint256 createdAt,bool active))",
];
const errorMessages = {
    AlreadyPurchased: "This license has already been purchased by the wallet.",
    SelfPurchaseNotAllowed: "Dataset owners cannot purchase their own dataset.",
    LicenseInactive: "The license is not active.",
    DatasetInactive: "The dataset is not active.",
    InsufficientBalance: "The wallet does not have enough AIX tokens.",
    InvalidLicenseForAsset: "The license does not belong to this dataset.",
    PurchasePaused: "Purchases are temporarily paused.",
};

const requireAddress = (value, name) => {
    if (!value || !ethers.isAddress(value)) throw new ApiError(503, `${name} is not configured.`);
    return ethers.getAddress(value);
};

class PurchaseBlockchainService {
    constructor() { this.interface = new ethers.Interface(PURCHASE_ENGINE_ABI); }

    provider() {
        if (!env.BLOCKCHAIN_RPC_URL || !env.BLOCKCHAIN_CHAIN_ID) throw new ApiError(503, "Blockchain RPC is not configured.");
        return new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    }

    get purchaseAddress() { return requireAddress(env.PURCHASE_ENGINE_ADDRESS, "PURCHASE_ENGINE_ADDRESS"); }
    datasetAddress() { return requireAddress(env.DATASET_REGISTRY_ADDRESS, "DATASET_REGISTRY_ADDRESS"); }
    contract(provider = this.provider()) { return new ethers.Contract(this.purchaseAddress, PURCHASE_ENGINE_ABI, provider); }
    datasetContract(provider = this.provider()) { return new ethers.Contract(this.datasetAddress(), DATASET_REGISTRY_ABI, provider); }

    async validateNetwork(provider = this.provider()) {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== env.BLOCKCHAIN_CHAIN_ID) throw new ApiError(503, "Blockchain network does not match configured chain.");
        return network;
    }

    wallet(user) {
        if (!user?.wallet?.verified || !user.wallet.address) throw new ApiError(403, "A verified wallet is required.");
        try { return ethers.getAddress(user.wallet.address); } catch { throw new ApiError(403, "The authenticated wallet address is invalid."); }
    }

    async getDataset(datasetId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try { return await this.datasetContract(provider).getDataset(datasetId); }
        catch { throw new ApiError(404, "Dataset was not found on-chain."); }
    }

    async preparePurchase(datasetId, licenseId, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const tx = await this.contract(provider).purchaseDataset.populateTransaction(datasetId, licenseId);
        return { from: wallet, to: this.purchaseAddress, data: tx.data, value: "0", chainId: String(env.BLOCKCHAIN_CHAIN_ID) };
    }

    normalizePurchase(raw) {
        return { purchaseId: Number(raw.purchaseId), datasetId: Number(raw.assetId), licenseId: Number(raw.licenseId), buyerWallet: raw.buyer, licensorWallet: raw.licensor, price: raw.price.toString(), feeAmount: raw.feeAmount.toString(), licensorAmount: raw.licensorAmount.toString(), timestamp: new Date(Number(raw.timestamp) * 1000), active: Boolean(raw.active) };
    }

    async getPurchase(purchaseId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try { return this.normalizePurchase(await this.contract(provider).getPurchase(purchaseId)); }
        catch (error) { if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") throw new ApiError(404, "Purchase was not found on-chain."); throw new ApiError(503, "PurchaseEngine could not be queried."); }
    }

    async hasAccess(wallet, datasetId, licenseId) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        try { return await this.contract(provider).hasAccess(wallet, datasetId, licenseId); } catch { throw new ApiError(503, "Purchase entitlement could not be verified."); }
    }

    mapContractError(error) {
        const name = error?.revert?.name || error?.info?.error?.data?.errorName || error?.shortMessage?.match(/custom error '([^']+)'/)?.[1];
        return new ApiError(name === "SelfPurchaseNotAllowed" ? 409 : name === "AlreadyPurchased" ? 409 : 400, errorMessages[name] || "PurchaseEngine rejected the purchase transaction.");
    }

    async verifyTransaction(txHash, expected, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        let transaction;
        try { transaction = await provider.getTransaction(txHash); } catch { throw new ApiError(503, "Purchase transaction could not be verified on the configured network."); }
        if (!transaction) throw new ApiError(404, "Purchase transaction was not found.");
        if (!transaction.to || transaction.to.toLowerCase() !== this.purchaseAddress.toLowerCase()) throw new ApiError(400, "Transaction did not target PurchaseEngine.");
        if (transaction.from.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Transaction buyer does not match the authenticated wallet.");
        let receipt;
        try { receipt = await provider.getTransactionReceipt(txHash); } catch { throw new ApiError(503, "Purchase confirmation could not be read from the configured network."); }
        if (!receipt) return { state: "PENDING", txHash: txHash.toLowerCase() };
        if (receipt.status !== 1 || receipt.to?.toLowerCase() !== this.purchaseAddress.toLowerCase()) return { state: "FAILED", txHash: txHash.toLowerCase() };
        let head;
        try { head = await provider.getBlockNumber(); } catch { throw new ApiError(503, "Purchase confirmation depth could not be verified."); }
        if (head - receipt.blockNumber + 1 < env.BLOCKCHAIN_CONFIRMATIONS) return { state: "PENDING", txHash: txHash.toLowerCase() };
        const events = receipt.logs.filter((log) => log.address.toLowerCase() === this.purchaseAddress.toLowerCase()).map((log) => { try { return { parsed: this.interface.parseLog(log), log }; } catch { return null; } }).filter(Boolean);
        const purchaseEvent = events.find(({ parsed }) => parsed.name === "DatasetPurchased");
        if (!purchaseEvent) throw new ApiError(400, "Successful transaction emitted no DatasetPurchased event.");
        const args = purchaseEvent.parsed.args;
        if (args.buyer.toLowerCase() !== wallet.toLowerCase() || args.datasetId.toString() !== String(expected.datasetId) || args.licenseId.toString() !== String(expected.licenseId)) throw new ApiError(400, "Purchase event does not match the requested dataset, license, and wallet.");
        const purchase = await this.getPurchase(Number(args.purchaseId), provider);
        if (purchase.buyerWallet.toLowerCase() !== wallet.toLowerCase() || purchase.datasetId !== Number(expected.datasetId) || purchase.licenseId !== Number(expected.licenseId)) throw new ApiError(400, "On-chain purchase record does not match the authenticated request.");
        const royaltyEvent = events.find(({ parsed }) => parsed.name === "RoyaltyTriggered" && parsed.args.purchaseId.toString() === args.purchaseId.toString());
        return { state: "CONFIRMED", txHash: txHash.toLowerCase(), blockNumber: receipt.blockNumber, logIndex: purchaseEvent.log.index, purchase, royalty: royaltyEvent ? { purchaseId: Number(royaltyEvent.parsed.args.purchaseId), assetId: Number(royaltyEvent.parsed.args.assetId), licenseId: Number(royaltyEvent.parsed.args.licenseId), licensorWallet: royaltyEvent.parsed.args.licensor, licensorAmount: royaltyEvent.parsed.args.licensorAmount.toString(), feeAmount: royaltyEvent.parsed.args.feeAmount.toString(), transactionHash: txHash.toLowerCase(), logIndex: royaltyEvent.log.index, blockNumber: receipt.blockNumber, timestamp: new Date(Number(royaltyEvent.parsed.args.timestamp) * 1000) } : null };
    }
}

export default new PurchaseBlockchainService();
