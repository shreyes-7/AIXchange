# Contract Functions

This document catalogs the functions implemented in AIXchange smart contracts.

---

## 1. `AIXToken.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mint` | `external` | `onlyOwner` | `address to, uint256 amount` | None | Mints new tokens |
| `burn` | `public` | None | `uint256 amount` | None | Burns caller tokens |
| `burnFrom` | `public` | None | `address account, uint256 amount` | None | Burns spender tokens |

---

## 2. `Treasury.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `receive` | `external` | `payable` | None | None | Accepts direct ETH |
| `depositETH` | `external` | `payable` | None | None | Explicit ETH deposit |
| `depositERC20` | `external` | `nonReentrant` | `address token, uint256 amount` | None | Deposits ERC20 tokens |
| `withdrawETH` | `external` | `onlyOwner, nonReentrant` | `address payable to, uint256 amount` | None | Withdraws ETH |
| `withdrawERC20` | `external` | `onlyOwner, nonReentrant` | `address token, address to, uint256 amount` | None | Withdraws ERC20 tokens |
| `getETHBalance` | `external view` | None | None | `uint256` | Current vault ETH |
| `getERC20Balance` | `external view` | None | `address token` | `uint256` | Current vault token balance |

---

## 3. `DatasetRegistry.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `registerDataset` | `external` | None | `string cid, string name, string desc, string uri, string lic, uint256 bps` | `uint256` | Registers dataset |
| `updateDatasetMetadata` | `external` | None | `uint256 id, string name, string desc, string uri` | None | Updates metadata |
| `updateDatasetCID` | `external` | None | `uint256 id, string newCid` | None | Updates IPFS CID |
| `toggleDatasetStatus` | `external` | None | `uint256 id` | None | Toggles active flag |
| `transferDatasetOwnership` | `external` | None | `uint256 id, address newOwner` | None | Transfers ownership |
| `getDataset` | `external view` | None | `uint256 id` | `Dataset` | Returns dataset record |
| `getDatasetOwner` | `external view` | None | `uint256 id` | `address` | Returns owner address |
| `getDatasetsByOwner` | `external view` | None | `address owner` | `uint256[]` | Returns owner dataset IDs |
| `getTotalDatasets` | `external view` | None | None | `uint256` | Total datasets count |

---

## 4. `LicenseRegistry.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createLicense` | `external` | None | `LicenseParams params` | `uint256` | Issues new license |
| `updateLicense` | `external` | None | `uint256 id, uint256 price, string uri, LicenseRights rights` | None | Updates license terms |
| `revokeLicense` | `external` | None | `uint256 id` | None | Revokes license |
| `isLicenseActive` | `external view` | None | `uint256 id` | `bool` | Checks validity |
| `getLicense` | `external view` | None | `uint256 id` | `License` | Returns full license |
| `getLicensePricing` | `external view` | None | `uint256 id` | `PricingModel, uint256, uint256` | Returns pricing terms |
| `getLicensesByAsset` | `external view` | None | `uint256 assetId` | `uint256[]` | Returns asset licenses |
| `getLicensesByLicensor` | `external view` | None | `address licensor` | `uint256[]` | Returns licensor licenses |

---

## 5. `PurchaseEngine.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `purchaseDataset` | `external` | `whenNotPaused, nonReentrant` | `uint256 datasetId, uint256 licenseId` | `uint256` | Settles dataset purchase |
| `hasAccess` | `external view` | None | `address buyer, uint256 datasetId, uint256 licenseId` | `bool` | Verifies access entitlement |
| `getPurchase` | `external view` | None | `uint256 id` | `PurchaseRecord` | Returns purchase receipt |
| `getPurchasesByBuyer` | `external view` | None | `address buyer` | `uint256[]` | Returns buyer purchases |
| `getPurchasesByDataset` | `external view` | None | `uint256 datasetId` | `uint256[]` | Returns dataset purchases |
| `setPlatformFee` | `external` | `onlyOwner` | `uint256 newFeeBps` | None | Updates platform fee rate |
| `pause` / `unpause` | `external` | `onlyOwner` | None | None | Circuit breaker controls |

---

## 6. `ModelRegistry.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `registerModel` | `external` | None | `string name, string metadataURI, string modelHash` | `uint256` | Registers new model and initial v1 record |
| `addModelVersion` | `external` | None | `uint256 modelId, string metadataURI, string modelHash` | `uint256` | Adds new version to existing model (owner only) |
| `setModelStatus` | `external` | None | `uint256 modelId, bool active` | None | Toggles model active status (owner only) |
| `transferModelOwnership` | `external` | None | `uint256 modelId, address newOwner` | None | Transfers model ownership (owner only) |
| `getModel` | `external view` | None | `uint256 modelId` | `Model` | Returns full model record |
| `getModelOwner` | `external view` | None | `uint256 modelId` | `address` | Returns current model owner |
| `getModelsByOwner` | `external view` | None | `address owner` | `uint256[]` | Returns all model IDs owned by address |
| `getTotalModels` | `external view` | None | None | `uint256` | Returns total registered model count |
| `getVersion` | `external view` | None | `uint256 modelId, uint256 versionNumber` | `ModelVersion` | Returns specific historical version |
| `getLatestVersion` | `external view` | None | `uint256 modelId` | `ModelVersion` | Returns current/latest version record |
| `getVersionCount` | `external view` | None | `uint256 modelId` | `uint256` | Returns total version count for model |
| `getModelVersions` | `external view` | None | `uint256 modelId` | `ModelVersion[]` | Returns all version records for model |
| `isModelActive` | `external view` | None | `uint256 modelId` | `bool` | Returns active status of model |
| `verifyModelHash` | `external view` | None | `uint256 modelId, uint256 versionNumber, string expectedHash` | `bool` | Verifies hash integrity against version |

---

## 7. `ProvenanceRegistry.sol`

| Function | Visibility | Modifiers | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `registerProvenance` | `external` | None | `uint256 datasetId, uint256 modelId, uint256 modelVersion, string executionId, bytes32 metadataHash` | `uint256` | Anchors immutable provenance relationship |
| `setProvenanceStatus` | `external` | None | `uint256 provenanceId, bool active` | None | Toggles active status (registrant / model owner) |
| `getProvenance` | `external view` | None | `uint256 provenanceId` | `ProvenanceRecord` | Returns full provenance record struct |
| `getTotalProvenanceRecords`| `external view` | None | None | `uint256` | Returns total registered provenance count |
| `getProvenanceByModel` | `external view` | None | `uint256 modelId` | `uint256[]` | Returns provenance IDs for a model |
| `getProvenanceByModelVersion` | `external view` | None | `uint256 modelId, uint256 modelVersion` | `uint256[]` | Returns provenance IDs for model version |
| `getProvenanceByDataset` | `external view` | None | `uint256 datasetId` | `uint256[]` | Returns provenance IDs using dataset |
| `getProvenanceByExecution` | `external view` | None | `string executionId` | `uint256[]` | Returns provenance IDs for execution |
| `getProvenanceIdByKey` | `external view` | None | `uint256 datasetId, string executionId, uint256 modelId, uint256 modelVersion` | `uint256` | Returns provenance ID for composite key |
| `verifyProvenance` | `external view` | None | `uint256 provenanceId, uint256 expectedDatasetId, string expectedExecutionId, uint256 expectedModelId, uint256 expectedModelVersion, bytes32 expectedMetadataHash` | `bool` | Verifies full provenance claim |
| `verifyProvenanceHash` | `external view` | None | `uint256 provenanceId, bytes32 expectedMetadataHash` | `bool` | Verifies metadata hash commitment |
| `isProvenanceActive` | `external view` | None | `uint256 provenanceId` | `bool` | Returns active status of provenance record |
| `datasetRegistry` | `external view` | None | None | `IDatasetRegistry` | Returns linked DatasetRegistry address |
| `modelRegistry` | `external view` | None | None | `IModelRegistry` | Returns linked ModelRegistry address |


