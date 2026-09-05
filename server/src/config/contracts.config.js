import { ethers } from "ethers";
import env from "./env.js";

export const CONTRACT_ABIS = {
    AIXToken: [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event TokensMinted(address indexed to, uint256 amount)",
        "event TokensBurned(address indexed from, uint256 amount)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ],
    Treasury: [
        "event ETHDeposited(address indexed sender, uint256 amount)",
        "event ETHWithdrawn(address indexed recipient, uint256 amount)",
        "event TokenDeposited(address indexed token, address indexed sender, uint256 amount)",
        "event TokenWithdrawn(address indexed token, address indexed recipient, uint256 amount)",
        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ],
    DatasetRegistry: [
        "event DatasetRegistered(uint256 indexed datasetId, address indexed owner, string cid, string license, uint256 royalty, uint256 createdAt)",
        "event DatasetUpdated(uint256 indexed datasetId, string newCid, string newLicense, uint256 newRoyalty)",
        "event DatasetStatusChanged(uint256 indexed datasetId, bool active)",
        "event DatasetOwnershipTransferred(uint256 indexed datasetId, address indexed previousOwner, address indexed newOwner)"
    ],
    LicenseRegistry: [
        "event LicenseCreated(uint256 indexed licenseId, uint256 indexed assetId, uint8 assetType, address indexed licensor, uint8 licenseType, uint8 pricingModel, uint256 fixedPrice, uint256 royaltyRate, uint256 createdAt)",
        "event LicenseUpdated(uint256 indexed licenseId, uint256 fixedPrice, uint256 royaltyRate, string metadataURI, uint256 version, uint256 updatedAt)",
        "event LicenseRevoked(uint256 indexed licenseId, address indexed licensor, uint256 updatedAt)",
        "event LicenseStatusChanged(uint256 indexed licenseId, uint8 previousStatus, uint8 newStatus)"
    ],
    PurchaseEngine: [
        "event DatasetPurchased(uint256 indexed purchaseId, uint256 indexed datasetId, uint256 licenseId, address indexed buyer, address licensor, uint256 price, uint256 feeAmount, uint256 licensorAmount, uint256 timestamp)",
        "event RoyaltyTriggered(uint256 indexed purchaseId, uint256 indexed assetId, uint256 licenseId, address indexed licensor, uint256 licensorAmount, uint256 feeAmount, uint256 timestamp)",
        "event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps)"
    ],
    ModelRegistry: [
        "event ModelRegistered(uint256 indexed modelId, address indexed owner, string name, string metadataURI, string modelHash, uint256 initialVersion, uint256 createdAt)",
        "event ModelVersionAdded(uint256 indexed modelId, uint256 indexed versionNumber, string modelHash, string metadataURI, uint256 createdAt)",
        "event ModelStatusChanged(uint256 indexed modelId, bool active)",
        "event ModelOwnershipTransferred(uint256 indexed modelId, address indexed previousOwner, address indexed newOwner)"
    ],
    ProvenanceRegistry: [
        "event ProvenanceRegistered(uint256 indexed provenanceId, uint256 indexed datasetId, uint256 indexed modelId, uint256 modelVersion, string executionId, bytes32 metadataHash, address registrant, uint256 createdAt)",
        "event ProvenanceStatusChanged(uint256 indexed provenanceId, bool active, uint256 timestamp)"
    ],
    RoyaltyEngine: [
        "event DistributionCreated(uint256 indexed distributionId, bytes32 indexed sourceKey, uint8 sourceType, uint256 sourceId, address indexed payer, uint256 totalRevenue)",
        "event RecipientPaid(uint256 indexed distributionId, address indexed recipient, uint256 amount, uint256 shareBps)",
        "event TreasuryPaid(uint256 indexed distributionId, address indexed treasury, uint256 amount, uint256 feeBps)",
        "event DistributionCompleted(uint256 indexed distributionId, uint256 totalDistributed, uint256 recipientCount, uint256 timestamp)",
        "event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)",
        "event TreasuryFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps)"
    ]
};

/**
 * Returns active contract configurations for the indexer
 */
export const getActiveContractSources = (customEnv = env) => {
    const sources = [];

    const addIfConfigured = (name, address, abiKey) => {
        if (address && ethers.isAddress(address)) {
            sources.push({
                name,
                contractName: name,
                address: ethers.getAddress(address),
                interface: new ethers.Interface(CONTRACT_ABIS[abiKey]),
                events: Object.keys(new ethers.Interface(CONTRACT_ABIS[abiKey]).events)
            });
        }
    };

    addIfConfigured("AIXToken", customEnv.AIX_TOKEN_ADDRESS, "AIXToken");
    addIfConfigured("Treasury", customEnv.TREASURY_ADDRESS, "Treasury");
    addIfConfigured("DatasetRegistry", customEnv.DATASET_REGISTRY_ADDRESS, "DatasetRegistry");
    addIfConfigured("LicenseRegistry", customEnv.LICENSE_REGISTRY_ADDRESS, "LicenseRegistry");
    addIfConfigured("PurchaseEngine", customEnv.PURCHASE_ENGINE_ADDRESS, "PurchaseEngine");
    addIfConfigured("ModelRegistry", customEnv.MODEL_REGISTRY_ADDRESS, "ModelRegistry");
    addIfConfigured("ProvenanceRegistry", customEnv.PROVENANCE_REGISTRY_ADDRESS, "ProvenanceRegistry");
    addIfConfigured("RoyaltyEngine", customEnv.ROYALTY_ENGINE_ADDRESS, "RoyaltyEngine");

    return sources;
};
