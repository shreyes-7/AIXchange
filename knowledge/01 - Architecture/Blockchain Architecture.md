# Blockchain Architecture

## Overview

The blockchain tier provides the trustless infrastructure of AIXchange. Implemented in Solidity `^0.8.28` and tested with Hardhat, the system coordinates token economics, decentralized asset registration, licensing governance, and purchase settlement.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AIXchange Smart Contracts                       │
├────────────────────────────────┬───────────────────────────────────────┤
│        Tokens & Vaults         │               Registries              │
│  • AIXToken.sol (ERC-20)       │  • DatasetRegistry.sol (Datasets)     │
│  • Treasury.sol (Protocol)     │  • LicenseRegistry.sol (Licensing)    │
├────────────────────────────────┴───────────────────────────────────────┤
│                          Settlement Engine                             │
│  • PurchaseEngine.sol (Atomic Payments, Exclusivity, Access Tracking) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Interaction Map

```
                  ┌──────────────────────┐
                  │    DatasetRegistry   │
                  │ (Ownership & Status) │
                  └──────────▲───────────┘
                             │ getDatasetOwner
                             │ isDatasetActive
                             │
                  ┌──────────┴───────────┐
                  │    LicenseRegistry   │
                  │ (Terms, Rights, Cost)│
                  └──────────▲───────────┘
                             │ getLicensePricing
                             │ isLicenseActive
                             │
                  ┌──────────┴───────────┐
                  │    PurchaseEngine    │
                  │  (Atomic Settlement) │
                  └───────┬──────────────┘
                          │
         ┌────────────────┴────────────────┐
         │ safeTransferFrom                │ safeTransferFrom
         ▼ (Fee: 2.50%)                    ▼ (Creator: 97.50%)
┌─────────────────┐               ┌─────────────────┐
│   Treasury.sol  │               │ Dataset Creator │
│ (Protocol Vault)│               │ (Licensor Payout│
└─────────────────┘               └─────────────────┘
```

---

## Contract Roles & Specifications

### 1. `AIXToken.sol` (`contracts/tokens/AIXToken.sol`)
- **Standard**: ERC-20 (OpenZeppelin v5).
- **Name / Symbol**: "AIXchange Token" / `AIX`.
- **Decimals**: 18.
- **Initial Supply**: 1,000,000,000 AIX (`10^9 * 10^18` wei).
- **Features**:
  - `burn(uint256 amount)` & `burnFrom(address account, uint256 amount)`.
  - `mint(address to, uint256 amount)` restricted to `onlyOwner`.

### 2. `Treasury.sol` (`contracts/governance/Treasury.sol`)
- **Purpose**: Protocol vault holding native ETH and ERC20 tokens collected from marketplace platform fees.
- **Access Control**: OpenZeppelin `Ownable`.
- **Key Functions**:
  - `receive() external payable`: Accepts direct ETH deposits.
  - `depositETH()` / `depositERC20(token, amount)`.
  - `withdrawETH(recipient, amount)` / `withdrawERC20(token, recipient, amount)`: Restricted to `onlyOwner`.

### 3. `DatasetRegistry.sol` (`contracts/registry/DatasetRegistry.sol`)
- **Purpose**: Decentralized catalog of AI datasets.
- **State Structure**: Auto-incrementing `datasetId` counter.
- **Key Functions**:
  - `registerDataset(cid, name, description, metadataUri, defaultLicense, defaultRoyaltyBps)`: Returns `uint256 datasetId`.
  - `updateDatasetMetadata(datasetId, name, description, metadataUri)`: Restricted to dataset owner.
  - `toggleDatasetStatus(datasetId)`: Active/inactive switch.
  - `transferDatasetOwnership(datasetId, newOwner)`: Updates ownership and shifts user dataset arrays with $O(1)$ swap-and-pop.
  - `getDataset(datasetId)`, `getDatasetOwner(datasetId)`, `getDatasetsByOwner(owner)`.

### 4. `LicenseRegistry.sol` (`contracts/licensing/LicenseRegistry.sol`)
- **Purpose**: Authoritative terms, rights, and pricing engine for assets.
- **License Types**: `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`.
- **Pricing Models**: `FIXED` (AIX units) and `ROYALTY` (basis points 0–10000).
- **Key Functions**:
  - `createLicense(assetId, assetType, licenseType, pricingModel, fixedPrice, royaltyBps, rights, restrictions, validFrom, validUntil)`: Verifies caller owns the asset via `IDatasetRegistry(datasetRegistry).getDatasetOwner(assetId)`.
  - `revokeLicense(licenseId)`: Restricted to licensor.
  - `isLicenseActive(licenseId)`: Evaluates active flag, revocation, and timestamp validity.
  - `getLicensePricing(licenseId)`: Helper for purchase engine.

### 5. `PurchaseEngine.sol` (`contracts/marketplace/PurchaseEngine.sol`)
- **Purpose**: Atomic marketplace settlement engine.
- **Security**: OpenZeppelin `ReentrancyGuard`, `Pausable`, `SafeERC20`.
- **Platform Fee**: Default `250` BPS (2.50%), configurable up to `1000` BPS (10.00%) by contract owner.
- **Key Functions**:
  - `purchaseDataset(datasetId, licenseId)`:
    1. Validates dataset and license validity.
    2. Enforces exclusivity locking (`_exclusiveLicensesSold[licenseId]`).
    3. Rejects duplicate active purchases (`_accessEntitlements[buyer][datasetId][licenseId]`).
    4. Calculates platform fee and creator share.
    5. Transfers AIX tokens using `safeTransferFrom`.
    6. Stores `PurchaseRecord` and updates `_accessEntitlements`.
    7. Emits `DatasetPurchased` and `RoyaltyTriggered`.
  - `hasAccess(buyer, datasetId, licenseId)`: Returns `true` if caller is dataset creator or has an unrevoked, unexpired purchase.
