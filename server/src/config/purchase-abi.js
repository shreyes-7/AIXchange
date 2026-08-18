export const PURCHASE_ENGINE_ABI = [
    "function purchaseDataset(uint256 datasetId,uint256 licenseId) returns (uint256 purchaseId)",
    "function getPurchase(uint256 purchaseId) view returns (tuple(uint256 purchaseId,uint256 assetId,uint8 assetType,uint256 licenseId,address buyer,address licensor,uint256 price,uint256 feeAmount,uint256 licensorAmount,uint256 timestamp,bool active))",
    "function getPurchasesByBuyer(address buyer) view returns (uint256[])",
    "function getPurchasesByDataset(uint256 datasetId) view returns (uint256[])",
    "function hasAccess(address buyer,uint256 datasetId,uint256 licenseId) view returns (bool)",
    "function getTotalPurchases() view returns (uint256)",
    "function isExclusiveLicenseSold(uint256 licenseId) view returns (bool)",
    "function getPlatformFee() view returns (uint256)",
    "event DatasetPurchased(uint256 indexed purchaseId,uint256 indexed datasetId,uint256 licenseId,address indexed buyer,address licensor,uint256 price,uint256 feeAmount,uint256 licensorAmount,uint256 timestamp)",
    "event RoyaltyTriggered(uint256 indexed purchaseId,uint256 indexed assetId,uint256 licenseId,address indexed licensor,uint256 licensorAmount,uint256 feeAmount,uint256 timestamp)",
    "event PlatformFeeUpdated(uint256 oldFeeBps,uint256 newFeeBps)",
];
