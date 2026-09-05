# Smart Contracts

This document provides technical summaries of each active smart contract in `blockchain/contracts/`.

---

## 1. `AIXToken.sol` (`contracts/tokens/AIXToken.sol`)

- **Inheritance**: `ERC20`, `ERC20Burnable`, `Ownable`
- **Role**: Native marketplace currency.
- **Initial Supply**: 1,000,000,000 AIX (minted to deployer).
- **Decimals**: 18.
- **Key State Variables**:
  - `name`: "AIXchange Token"
  - `symbol`: "AIX"

---

## 2. `Treasury.sol` (`contracts/governance/Treasury.sol`)

- **Inheritance**: `Ownable`, `ReentrancyGuard`
- **Role**: Platform fee vault holding native ETH and ERC-20 tokens.
- **Key State Variables**:
  - `_totalEthDeposited`: Total ETH received.
  - `_totalEthWithdrawn`: Total ETH withdrawn.

---

## 3. `DatasetRegistry.sol` (`contracts/registry/DatasetRegistry.sol`)

- **Inheritance**: `Ownable`, `IDatasetRegistry`
- **Role**: Authoritative registry for AI datasets and IPFS CIDs.
- **Key State Variables**:
  - `_totalDatasets`: Incremental counter of datasets.
  - `_datasets`: Mapping `uint256 => Structs.Dataset`.
  - `_ownerDatasets`: Mapping `address => uint256[]`.
  - `_ownerDatasetIndex`: Mapping `uint256 => uint256` ($O(1)$ swap-and-pop index).
  - `MAX_ROYALTY_BPS`: Constant `10000` (100%).

---

## 4. `LicenseRegistry.sol` (`contracts/licensing/LicenseRegistry.sol`)

- **Inheritance**: `ILicenseRegistry`
- **Role**: Authoritative terms, rights, and pricing registry for datasets and models.
- **Key State Variables**:
  - `_totalLicenses`: Incremental counter of licenses.
  - `_licenses`: Mapping `uint256 => Structs.License`.
  - `_assetLicenses`: Mapping `uint256 => uint256[]`.
  - `_licensorLicenses`: Mapping `address => uint256[]`.
  - `datasetRegistry`: Address of `DatasetRegistry.sol`.

---

## 5. `PurchaseEngine.sol` (`contracts/marketplace/PurchaseEngine.sol`)

- **Inheritance**: `IPurchaseEngine`, `Ownable`, `Pausable`, `ReentrancyGuard`
- **Role**: Atomic purchase settlement and access entitlement verification.
- **Key State Variables**:
  - `_totalPurchases`: Incremental counter of purchases.
  - `_purchases`: Mapping `uint256 => Structs.PurchaseRecord`.
  - `_buyerPurchases`: Mapping `address => uint256[]`.
  - `_datasetPurchases`: Mapping `uint256 => uint256[]`.
  - `_accessEntitlements`: Mapping `address => mapping(uint256 => mapping(uint256 => bool))` (`buyer => datasetId => licenseId => hasAccess`).
  - `_exclusiveLicensesSold`: Mapping `uint256 => bool`.
  - `_platformFeeBps`: Current platform fee (default `250` BPS = 2.50%).
  - `MAX_FEE_BPS`: Constant `1000` BPS (10.00%).
  - `aixToken`: Reference to `IERC20`.
  - `datasetRegistry`: Reference to `IDatasetRegistry`.
  - `licenseRegistry`: Reference to `ILicenseRegistry`.
  - `treasury`: Reference to `ITreasury`.

---

## 6. `ModelRegistry.sol` (`contracts/registry/ModelRegistry.sol`)

- **Inheritance**: `IModelRegistry`
- **Role**: Authoritative decentralized registry for AI model identity, cryptographic artifact hashes, version history, and ownership.
- **Key State Variables**:
  - `_nextModelId`: Auto-incrementing counter for unique model IDs.
  - `_models`: Mapping `uint256 => Structs.Model`.
  - `_modelVersions`: Mapping `uint256 => mapping(uint256 => Structs.ModelVersion)` (modelId => versionNumber => version record).
  - `_ownerModels`: Mapping `address => uint256[]`.
  - `_modelOwnerIndex`: Mapping `uint256 => uint256` ($O(1)$ swap-and-pop index).
  - `_ownerModelNameToId`: Mapping `address => mapping(string => uint256)` (owner-scoped unique name reservation).

---

## 7. `ProvenanceRegistry.sol` (`contracts/registry/ProvenanceRegistry.sol`)

- **Inheritance**: `IProvenanceRegistry`
- **Role**: Decentralized, immutable lineage relationship and verification layer linking Dataset -> Execution -> Model -> Model Version.
- **Key State Variables**:
  - `datasetRegistry`: Reference to `IDatasetRegistry` (Phase 4).
  - `modelRegistry`: Reference to `IModelRegistry` (Phase 8).
  - `_nextProvenanceId`: Auto-incrementing counter for unique provenance record IDs.
  - `_records`: Mapping `uint256 => Structs.ProvenanceRecord`.
  - `_provenanceKeys`: Mapping `bytes32 => uint256` (composite key duplicate protection).
  - `_modelProvenance`: Mapping `uint256 => uint256[]`.
  - `_modelVersionProvenance`: Mapping `uint256 => mapping(uint256 => uint256[])`.
  - `_datasetProvenance`: Mapping `uint256 => uint256[]`.
  - `_executionProvenance`: Mapping `string => uint256[]`.


