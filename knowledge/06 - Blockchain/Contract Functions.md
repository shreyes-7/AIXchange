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
