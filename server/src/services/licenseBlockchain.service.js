import { ethers } from "ethers";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const LICENSE_REGISTRY_ABI = [
    "function createLicense((uint256 assetId,uint8 assetType,uint8 licenseType,uint8 pricingModel,uint256 fixedPrice,uint256 royaltyRate,string metadataURI,(bool canView,bool canDownload,bool canModify,bool canTrain,bool canInfer,bool canCommercialUse,bool canDistribute,bool canSublicense) rights,string restrictions,uint256 validFrom,uint256 validUntil) params) returns (uint256 licenseId)",
    "function updateLicense(uint256 licenseId,uint256 fixedPrice,uint256 royaltyRate,string metadataURI,(bool canView,bool canDownload,bool canModify,bool canTrain,bool canInfer,bool canCommercialUse,bool canDistribute,bool canSublicense) rights,string restrictions)",
    "function revokeLicense(uint256 licenseId)",
    "function getLicense(uint256 licenseId) view returns (tuple(uint256 licenseId,uint256 assetId,uint8 assetType,address licensor,uint8 licenseType,uint8 pricingModel,uint256 fixedPrice,uint256 royaltyRate,string metadataURI,(bool canView,bool canDownload,bool canModify,bool canTrain,bool canInfer,bool canCommercialUse,bool canDistribute,bool canSublicense) rights,string restrictions,uint256 validFrom,uint256 validUntil,uint8 status,uint256 createdAt,uint256 updatedAt,uint256 version))",
    "function getLicensesByAsset(uint8 assetType,uint256 assetId) view returns (uint256[])",
    "function getLicensesByLicensor(address licensor) view returns (uint256[])",
    "function getTotalLicenses() view returns (uint256)",
    "function isLicenseActive(uint256 licenseId) view returns (bool)",
    "function getLicensePricing(uint256 licenseId) view returns (uint8 model,uint256 fixedPrice,uint256 royaltyRate)",
    "function getLicenseRights(uint256 licenseId) view returns ((bool canView,bool canDownload,bool canModify,bool canTrain,bool canInfer,bool canCommercialUse,bool canDistribute,bool canSublicense) rights,string restrictions)",
    "function getLicenseType(uint256 licenseId) view returns (uint8)",
    "function setLicenseStatus(uint256 licenseId,uint8 status)",
    "event LicenseCreated(uint256 indexed licenseId,uint256 indexed assetId,uint8 assetType,address indexed licensor,uint8 licenseType,uint8 pricingModel,uint256 fixedPrice,uint256 royaltyRate,uint256 createdAt)",
    "event LicenseUpdated(uint256 indexed licenseId,uint256 fixedPrice,uint256 royaltyRate,string metadataURI,uint256 version,uint256 updatedAt)",
    "event LicenseRevoked(uint256 indexed licenseId,address indexed licensor,uint256 updatedAt)",
    "event LicenseStatusChanged(uint256 indexed licenseId,uint8 previousStatus,uint8 newStatus)",
];
const DATASET_REGISTRY_ABI = [
    "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId,address owner,string cid,string license,uint256 royalty,uint256 createdAt,bool active))",
    "function getDatasetOwner(uint256 datasetId) view returns (address)",
];

const assetTypes = { DATASET: 0, MODEL: 1 };
const licenseTypes = { ACADEMIC: 0, COMMERCIAL: 1, EXCLUSIVE: 2, CUSTOM: 3 };
const pricingModels = { FIXED: 0, ROYALTY: 1 };
const statuses = ["ACTIVE", "REVOKED", "EXPIRED"];

const requireAddress = (value, name) => {
    if (!value || !ethers.isAddress(value)) throw new ApiError(503, `${name} is not configured.`);
    return ethers.getAddress(value);
};

class LicenseBlockchainService {
    constructor() {
        this.interface = new ethers.Interface(LICENSE_REGISTRY_ABI);
    }

    get config() {
        return { registry: requireAddress(env.LICENSE_REGISTRY_ADDRESS, "LICENSE_REGISTRY_ADDRESS"), datasetRegistry: requireAddress(env.DATASET_REGISTRY_ADDRESS, "DATASET_REGISTRY_ADDRESS") };
    }

    provider() {
        if (!env.BLOCKCHAIN_RPC_URL || !env.BLOCKCHAIN_CHAIN_ID) throw new ApiError(503, "Blockchain RPC is not configured.");
        return new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    }

    async validateNetwork(provider = this.provider()) {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== env.BLOCKCHAIN_CHAIN_ID) throw new ApiError(503, "Blockchain network does not match configured chain.");
        return network;
    }

    contract(provider = this.provider()) { return new ethers.Contract(this.config.registry, LICENSE_REGISTRY_ABI, provider); }
    datasetContract(provider = this.provider()) { return new ethers.Contract(this.config.datasetRegistry, DATASET_REGISTRY_ABI, provider); }

    wallet(user) {
        if (!user?.wallet?.verified || !user.wallet.address) throw new ApiError(403, "A verified wallet is required.");
        try { return ethers.getAddress(user.wallet.address); } catch { throw new ApiError(403, "The authenticated wallet address is invalid."); }
    }

    async assertDatasetOwner(assetId, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        if (assetId <= 0n) throw new ApiError(400, "Asset ID must be greater than zero.");
        try {
            const owner = await this.datasetContract(provider).getDatasetOwner(assetId);
            if (owner.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Authenticated wallet does not own this dataset on-chain.");
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(404, "Dataset was not found on-chain.");
        }
    }

    normalize(raw) {
        return {
            licenseId: Number(raw.licenseId), assetId: Number(raw.assetId), assetType: ["DATASET", "MODEL"][Number(raw.assetType)] || "UNKNOWN", licensor: raw.licensor,
            licenseType: ["ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM"][Number(raw.licenseType)] || "UNKNOWN", pricingModel: ["FIXED", "ROYALTY"][Number(raw.pricingModel)] || "UNKNOWN",
            fixedPrice: raw.fixedPrice.toString(), royaltyRate: Number(raw.royaltyRate), metadataURI: raw.metadataURI, rights: this.normalizeRights(raw.rights), restrictions: raw.restrictions,
            validFrom: new Date(Number(raw.validFrom) * 1000), validUntil: Number(raw.validUntil) === 0 ? null : new Date(Number(raw.validUntil) * 1000), status: statuses[Number(raw.status)] || "UNKNOWN",
            version: Number(raw.version), createdAt: new Date(Number(raw.createdAt) * 1000), updatedAt: new Date(Number(raw.updatedAt) * 1000),
        };
    }

    normalizeRights(rights) { return { canView: Boolean(rights.canView), canDownload: Boolean(rights.canDownload), canModify: Boolean(rights.canModify), canTrain: Boolean(rights.canTrain), canInfer: Boolean(rights.canInfer), canCommercialUse: Boolean(rights.canCommercialUse), canDistribute: Boolean(rights.canDistribute), canSublicense: Boolean(rights.canSublicense) }; }
    contractParams(input) {
        return { assetId: BigInt(input.assetId), assetType: assetTypes[input.assetType], licenseType: licenseTypes[input.licenseType], pricingModel: pricingModels[input.pricingModel], fixedPrice: BigInt(input.fixedPrice || "0"), royaltyRate: Number(input.royaltyRate || 0), metadataURI: input.metadataURI, rights: input.rights, restrictions: input.restrictions, validFrom: input.validFrom ? BigInt(Math.floor(new Date(input.validFrom).getTime() / 1000)) : 0n, validUntil: input.validUntil ? BigInt(Math.floor(new Date(input.validUntil).getTime() / 1000)) : 0n };
    }

    async prepareCreate(input, wallet) {
        if (input.assetType === "MODEL") throw new ApiError(501, "MODEL licensing is not supported until the Model Registry phase.");
        const provider = this.provider(); await this.validateNetwork(provider); await this.assertDatasetOwner(BigInt(input.assetId), wallet);
        const tx = await this.contract(provider).createLicense.populateTransaction(this.contractParams(input));
        return { from: wallet, to: this.config.registry, data: tx.data, value: "0", chainId: String(env.BLOCKCHAIN_CHAIN_ID) };
    }

    async prepareUpdate(licenseId, input, wallet) { const provider = this.provider(); await this.validateNetwork(provider); const existing = await this.getLicense(licenseId, provider); if (existing.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Authenticated wallet is not the license licensor."); if (existing.status === "REVOKED") throw new ApiError(409, "Revoked licenses cannot be updated."); const tx = await this.contract(provider).updateLicense.populateTransaction(licenseId, BigInt(input.fixedPrice), input.royaltyRate, input.metadataURI, input.rights, input.restrictions); return { from: wallet, to: this.config.registry, data: tx.data, value: "0", chainId: String(env.BLOCKCHAIN_CHAIN_ID) }; }
    async prepareRevoke(licenseId, wallet) { const provider = this.provider(); await this.validateNetwork(provider); const existing = await this.getLicense(licenseId, provider); if (existing.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Authenticated wallet is not the license licensor."); if (existing.status === "REVOKED") throw new ApiError(409, "License is already revoked."); const tx = await this.contract(provider).revokeLicense.populateTransaction(licenseId); return { from: wallet, to: this.config.registry, data: tx.data, value: "0", chainId: String(env.BLOCKCHAIN_CHAIN_ID) }; }
    async getLicense(licenseId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try { return this.normalize(await this.contract(provider).getLicense(licenseId)); }
        catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") throw new ApiError(404, "License was not found on-chain.");
            throw new ApiError(503, "LicenseRegistry could not be queried.");
        }
    }
    async isActive(licenseId) { const provider = this.provider(); await this.validateNetwork(provider); try { return await this.contract(provider).isLicenseActive(licenseId); } catch { return false; } }
    async getLicenseIdsByAsset(assetType, assetId) { const provider = this.provider(); await this.validateNetwork(provider); return (await this.contract(provider).getLicensesByAsset(assetTypes[assetType], assetId)).map(Number); }
    async getLicenseIdsByLicensor(address) { const provider = this.provider(); await this.validateNetwork(provider); return (await this.contract(provider).getLicensesByLicensor(address)).map(Number); }

    async confirmTransaction(txHash, expected, wallet) {
        const provider = this.provider(); await this.validateNetwork(provider); const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) return { state: "PENDING", txHash };
        if (receipt.status !== 1 || receipt.to?.toLowerCase() !== this.config.registry.toLowerCase()) throw new ApiError(502, "LicenseRegistry transaction failed.");
        const events = receipt.logs.filter((log) => log.address.toLowerCase() === this.config.registry.toLowerCase()).map((log) => { try { return { parsed: this.interface.parseLog(log), log }; } catch { return null; } }).filter(Boolean);
        const created = events.find(({ parsed }) => parsed.name === "LicenseCreated");
        const target = expected.operation === "create" ? created : events.find(({ parsed }) => parsed.name === (expected.operation === "update" ? "LicenseUpdated" : "LicenseRevoked") && parsed.args.licenseId.toString() === String(expected.licenseId));
        if (!target) throw new ApiError(400, "Transaction does not contain the expected LicenseRegistry event.");
        if (wallet && expected.operation === "create" && target.parsed.args.licensor.toLowerCase() !== wallet.toLowerCase()) throw new ApiError(403, "Transaction signer does not match the authenticated wallet.");
        const licenseId = Number(expected.licenseId || target.parsed.args.licenseId);
        return { state: "CONFIRMED", txHash: txHash.toLowerCase(), licenseId, blockNumber: receipt.blockNumber, license: await this.getLicense(licenseId, provider) };
    }
}

export { assetTypes, licenseTypes, pricingModels };
export default new LicenseBlockchainService();
