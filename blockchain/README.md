# AIXchange Blockchain Layer

The **AIXchange Blockchain Layer** provides the decentralized trust, ownership, settlement, and verification infrastructure for the AIXchange platform. Built using **Solidity ^0.8.28**, **Hardhat**, **OpenZeppelin Contracts v5**, and **Ethers.js v6**, it delivers:

- **Immutable Asset Registries**: On-chain tracking of datasets, machine learning models, and model versions.
- **Verifiable AI Provenance DAG**: Directed Acyclic Graph connecting datasets, execution environments, model artifacts, and metadata commitments.
- **Trustless Licensing & Atomic Settlement**: Granular legal/economic terms and atomic token-based purchasing with platform fee routing.
- **Multi-Party Royalty Settlements**: Deterministic revenue distribution across up to 50 recipients with zero-leakage remainder handling.
- **Treasury Vault Security**: Multi-asset vault holding native ETH and ERC-20 tokens with SafeERC20 protections.
- **Continuous Monitoring & Fraud Detection**: Off-chain event ingestion, balance tracking, and a deterministic 5-rule fraud detection engine.

---

## 📖 Table of Contents

1. [Architectural Overview](#-1-architectural-overview)
2. [Smart Contracts Catalog](#-2-smart-contracts-catalog)
   - [AIXToken.sol](#aixtokensol-contracts-tokens-)
   - [Treasury.sol](#treasurysol-contracts-governance-)
   - [DatasetRegistry.sol](#datasetregistrysol-contracts-registry-)
   - [LicenseRegistry.sol](#licenseregistrysol-contracts-licensing-)
   - [PurchaseEngine.sol](#purchaseenginesol-contracts-marketplace-)
   - [ModelRegistry.sol](#modelregistrysol-contracts-registry-)
   - [ProvenanceRegistry.sol](#provenanceregistrysol-contracts-registry-)
   - [RoyaltyEngine.sol](#royaltyenginesol-contracts-royalty-)
3. [Shared Libraries & Interfaces](#-3-shared-libraries--interfaces)
4. [Monitoring & Deterministic Fraud Engine](#-4-monitoring--deterministic-fraud-engine)
5. [Gas Consumption Benchmarks](#-5-gas-consumption-benchmarks)
6. [Automated Test Suites (279 Tests)](#-6-automated-test-suites-279-tests)
7. [Deployment & Management Scripts](#-7-deployment--management-scripts)
8. [Security Invariants & Developer Guidelines](#-8-security-invariants--developer-guidelines)
9. [Troubleshooting & FAQ](#-9-troubleshooting--faq)

---

## 🏛️ 1. Architectural Overview

The blockchain layer decouples heavy binary storage (dataset archives, PyTorch weights) from on-chain logic. Raw payloads are stored on IPFS or cloud storage, while smart contracts strictly maintain **content identifiers (CIDs)**, **SHA-256 artifact digests**, **access entitlements**, **licensing rules**, and **payment state transitions**.

```text
                                  ┌────────────────────────┐
                                  │       AIXToken.sol     │
                                  │ (ERC-20, 18 Decimals)  │
                                  └───────────┬────────────┘
                                              │ safeTransferFrom
                                              ▼
┌──────────────────────┐  queries  ┌──────────────────────┐  splits fee  ┌──────────────────────┐
│ DatasetRegistry.sol  │◄──────────│  PurchaseEngine.sol  │─────────────►│     Treasury.sol     │
│ (IPFS CIDs, Owners)  │           │ (Atomic Settlement)  │ (2.50% BPS)  │ (Platform Vault)     │
└──────────┬───────────┘           └──────────┬───────────┘              └──────────▲───────────┘
           │                                  │                                     │
           │ verifies                         │ access                              │ absorbs
           ▼                                  ▼ entitlement                         │ dust
┌──────────────────────┐           ┌──────────────────────┐              ┌──────────┴───────────┐
│ LicenseRegistry.sol  │           │ Docker AI Sandbox    │              │  RoyaltyEngine.sol   │
│ (Rights, Fixed/BPS)  │           │ (Execution Substrate)│              │ (Multi-Party Splits) │
└──────────────────────┘           └──────────┬───────────┘              └──────────────────────┘
                                              │ generates SHA-256
                                              ▼
┌──────────────────────┐           ┌──────────────────────┐
│  ModelRegistry.sol   │◄──────────│ProvenanceRegistry.sol│
│ (SHA-256, Versions)  │  verifies │ (Lineage DAG Anchor) │
└──────────────────────┘           └──────────────────────┘
```

---

## 📜 2. Smart Contracts Catalog

### AIXToken.sol (`contracts/tokens/`)
The native utility token for the AIXchange ecosystem.
- **Standard**: ERC-20 with standard ERC-20 metadata extensions.
- **Decimals**: 18.
- **Initial Supply**: 1,000,000,000 AIX ($1 \times 10^9 \times 10^{18}$ base units) minted to the contract deployer.
- **Minting**: Restricted to the contract owner via OpenZeppelin `Ownable`.
- **Burning**: Public `burn(amount)` and `burnFrom(account, amount)` allowing token destruction.
- **Interface**: `IAIXToken.sol`.

### Treasury.sol (`contracts/governance/`)
The multi-asset platform vault holding protocol reserves, collected marketplace fees, and remainder rounding dust.
- **Native ETH**: Accepts direct transfers via `receive() external payable` and emits `ETHDeposited`.
- **ERC-20 Deposits**: `depositToken(address token, uint256 amount)` uses OpenZeppelin `SafeERC20.safeTransferFrom` to safely transfer tokens from callers into the Treasury. Emits `TokenDeposited`.
- **Withdrawals**: Owner-restricted `withdrawETH(address payable to, uint256 amount)` and `withdrawToken(address token, address to, uint256 amount)` with strict zero-address and zero-balance validations.
- **Interface**: `ITreasury.sol`.

### DatasetRegistry.sol (`contracts/registry/`)
The authoritative on-chain registry for dataset ownership and IPFS content identifiers.
- **Dataset Identification**: Auto-incrementing identifier (`datasetId = 1, 2, 3...`).
- **Data Model**: Stores `DatasetRecord` (`datasetId`, `owner`, `cid`, `license`, `royalty` in BPS, `createdAt`, `active`).
- **Lookups**: $O(1)$ lookup via mapping; enumerations via `getDatasetsByOwner(owner)` and `getTotalDatasets()`.
- **Ownership Management**: `transferDatasetOwnership(datasetId, newOwner)` updates owner index arrays using an $O(1)$ swap-and-pop algorithm.
- **Metadata Management**: `updateDataset(datasetId, newCid, newLicense, newRoyalty)` and `setDatasetStatus(datasetId, active)`.
- **Interface**: `IDatasetRegistry.sol`.

### LicenseRegistry.sol (`contracts/licensing/`)
Defines legal permissions, rights, and pricing models for datasets.
- **License Types**:
  - `0`: `ACADEMIC`
  - `1`: `COMMERCIAL`
  - `2`: `EXCLUSIVE`
  - `3`: `CUSTOM`
- **Pricing Models**:
  - `0`: `FIXED` (priced in AIX token units)
  - `1`: `ROYALTY` (basis points $0 \le \text{rate} \le 10000$)
- **Granular Permissions (`LicenseRights`)**: Boolean flags controlling `canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, and `canSublicense`.
- **Ownership Verification**: Automatically queries `DatasetRegistry.getDatasetOwner(assetId)` to guarantee that only the authentic dataset creator can issue licenses.
- **Temporal Validity**: Tracks `validFrom` and `validUntil` unix timestamps; queryable via `isLicenseActive(licenseId)`.
- **Interface**: `ILicenseRegistry.sol`.

### PurchaseEngine.sol (`contracts/marketplace/`)
The decentralized clearing and settlement engine for dataset licensing.
- **Atomic Settlement**: `purchaseDataset(datasetId, licenseId)` executes payment clearing in a single transaction.
- **Authoritative Pricing**: Reads pricing directly from `LicenseRegistry.getLicensePricing(licenseId)`.
- **Fee Routing**: Deducts platform fee (default 2.50% / 250 BPS) directly to `Treasury` and transfers the remaining 97.50% to the dataset licensor via `SafeERC20.safeTransferFrom`.
- **Access Entitlement**: Records immutable buyer entitlement (`hasAccess(buyer, datasetId, licenseId)`) without transferring underlying asset copyright.
- **Exclusivity Lock**: Automatically disables `EXCLUSIVE` licenses upon first purchase (`isExclusiveLicenseSold(licenseId) = true`), rejecting all future buyers.
- **Duplicate Prevention**: Reverts redundant purchases if the caller already holds an active, unexpired license.
- **Security**: Built with OpenZeppelin `ReentrancyGuard`, `Pausable`, and Checks-Effects-Interactions (CEI).
- **Interface**: `IPurchaseEngine.sol`.

### ModelRegistry.sol (`contracts/registry/`)
Anchors trained machine learning models and versioned artifact hashes on-chain.
- **Model Identity**: Sequential model identifier generation (`modelId = 1, 2, ...`).
- **Cryptographic Hash Anchoring**: Stores SHA-256 digests (`modelHash`) generated during sandbox training. Raw weight files (`.safetensors`, `.pt`) remain off-chain.
- **Append-Only Versioning**: `addModelVersion(modelId, metadataUri, modelHash)` appends `ModelVersion` records (`versionNumber = 1, 2, 3...`) with timestamp tracking.
- **On-Chain Verification**: `verifyModelHash(modelId, versionNumber, expectedHash)` enables deterministic verification of model integrity without off-chain dependencies.
- **Duplicate Protection**: Enforces name uniqueness per owner and blocks consecutive identical artifact hash updates.
- **Ownership Handoff**: Transfers model ownership while preserving historical version integrity.
- **Interface**: `IModelRegistry.sol`.

### ProvenanceRegistry.sol (`contracts/registry/`)
The cryptographic lineage Directed Acyclic Graph (DAG) for artificial intelligence assets.
- **Lineage Edge**: Binds source dataset (`datasetId` from `DatasetRegistry`), execution instance (`executionId` from Docker sandbox), trained model (`modelId`), and version (`modelVersion` from `ModelRegistry`).
- **Cryptographic Commitment**: Anchors `metadataHash` (SHA-256 digest of `model_metadata.json`).
- **Composite Key Uniqueness**: Enforces single-edge uniqueness via:
  $$\text{compositeKey} = \text{keccak256}(\text{abi.encodePacked}(datasetId, executionId, modelId, modelVersion))$$
- **On-Chain Verification**: `verifyProvenance(datasetId, executionId, modelId, modelVersion, metadataHash)` deterministically asserts lineage validity.
- **Auditable Status**: Model creators can deactivate disputed lineage records via `setProvenanceStatus(provenanceId, active)`.
- **Interface**: `IProvenanceRegistry.sol`.

### RoyaltyEngine.sol (`contracts/royalty/`)
Secondary revenue splitting and royalty distribution engine.
- **Multi-Party Distribution**: Distributes AIX token revenue across up to 50 recipients per batch using basis points (`BPS_DENOMINATOR = 10000`).
- **Platform Fee Inflow**: Deducts protocol fee (default 2.50% / 250 BPS, max 20.00% / 2000 BPS) routed directly to `Treasury`.
- **Zero-Leakage Remainder Accounting**: Integer division truncation dust is automatically allocated to the platform Treasury:
  $$\sum_{i=1}^n \text{recipientAmounts}[i] + \text{treasuryAmount} \equiv \text{totalRevenue}$$
- **Anti-Replay Protection**: Prevents duplicate distributions of the same transaction or source:
  $$\text{distributionKey} = \text{keccak256}(\text{abi.encodePacked}(sourceType, sourceId))$$
- **PurchaseEngine Integration**: Dedicated helper `distributePurchaseRoyalty(purchaseId, recipients)` to split dataset sales revenue among downstream collaborators.
- **Interface**: `IRoyaltyEngine.sol`.

---

## 📚 3. Shared Libraries & Interfaces

The contracts rely on shared libraries in `contracts/libraries/` to ensure zero-gas string overhead, consistent event signatures, and uniform data models:

- **`Structs.sol`**: Contains canonical struct definitions:
  - `DatasetRecord`, `LicenseRecord`, `LicenseRights`, `PurchaseRecord`
  - `ModelRecord`, `ModelVersion`, `ProvenanceRecord`
  - `RoyaltyDistribution`, `RoyaltyRecipient`
- **`Errors.sol`**: Custom Solidity errors reducing runtime revert gas costs:
  - `ZeroAddress()`, `ZeroAmount()`, `NotAuthorized()`, `AlreadyExists()`
  - `NotFound()`, `InactiveEntity()`, `InvalidState()`, `AllocationExceeded()`
- **`Events.sol`**: Indexed event declarations for off-chain indexing:
  - `DatasetRegistered`, `DatasetUpdated`, `OwnershipTransferred`
  - `LicenseCreated`, `LicenseRevoked`
  - `DatasetPurchased`, `AccessGranted`
  - `ModelRegistered`, `ModelVersionAdded`, `ModelHashVerified`
  - `ProvenanceRegistered`, `ProvenanceStatusChanged`
  - `RoyaltyDistributed`, `TokenDeposited`, `TokenWithdrawn`

---

## 🛡️ 4. Monitoring & Deterministic Fraud Engine

Located in `blockchain/monitoring/`, the monitoring module tracks on-chain activity and evaluates transaction streams against transparent, explainable security rules without altering on-chain state.

```text
 JSON-RPC Provider (Hardhat / Sepolia)
                 │
                 ▼
      ┌─────────────────────┐
      │   EventMonitor.js   │ ──► Deduplicates logs, sanitizes BigInts, handles backoff
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  TreasuryMonitor.js │ ──► Queries ETH/ERC-20 balances, aggregates inflows/outflows
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │   FraudEngine.js    │ ──► Evaluates 5 Deterministic Rules
      └──────────┬──────────┘
                 │
                 ▼
      Standardized Security Flags (LOW, MEDIUM, HIGH, CRITICAL)
```

### Deterministic Fraud Rules (`FraudEngine.js`)

| Rule Identifier | Trigger Condition | Default Threshold | Severity |
| :--- | :--- | :--- | :--- |
| `RAPID_TRANSACTIONS` | High frequency of transactions from a single sender | $\ge 5$ transactions in 60 seconds | `MEDIUM` |
| `ABNORMAL_LARGE_TRANSFER`| Single token transfer exceeding threshold | $> 50{,}000$ AIX tokens | `HIGH` |
| `SUSPICIOUS_TREASURY_ACTIVITY` | High-value withdrawal or drain from Treasury vault | $> 100{,}000$ AIX or $> 10$ ETH | `CRITICAL` |
| `UNUSUAL_ROYALTY_PATTERN`| Excessive royalty distribution in a single call | $> 25{,}000$ AIX tokens | `HIGH` |
| `REPEATED_FAILED_TRANSACTIONS`| Consecutive transaction reverts indicating probing | $\ge 3$ consecutive failures | `MEDIUM` |

---

## ⚡ 5. Gas Consumption Benchmarks

Gas consumption was rigorously measured on a local Hardhat node via `scripts/runGasBenchmark.js` and bounded in `test/integration/GasBenchmarking.test.js`:

| Contract | Function Call | Actual Gas Used | Safety Limit | Margin | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AIXToken` | `transfer(to, amount)` | **51,610** | < 70,000 | +26.3% | PASS |
| `AIXToken` | `approve(spender, amount)` | **46,394** | < 60,000 | +22.7% | PASS |
| `Treasury` | `depositToken(token, amount)` | **57,594** | < 100,000 | +42.4% | PASS |
| `Treasury` | `withdrawToken(token, to, amount)` | **43,254** | < 70,000 | +38.2% | PASS |
| `DatasetRegistry` | `registerDataset(cid, license, bps)` | **280,498** | < 350,000 | +19.9% | PASS |
| `DatasetRegistry` | `updateDataset(id, cid, license, bps)`| **47,612** | < 90,000 | +47.1% | PASS |
| `LicenseRegistry` | `createLicense(id, type, model, rights)`| **386,427** | < 450,000 | +14.1% | PASS |
| `ModelRegistry` | `registerModel(name, uri, hash)` | **443,495** | < 500,000 | +11.3% | PASS |
| `ModelRegistry` | `addModelVersion(id, uri, hash)` | **208,402** | < 250,000 | +16.6% | PASS |
| `PurchaseEngine` | `purchaseDataset(datasetId, licenseId)`| **482,112** | < 600,000 | +19.6% | PASS |
| `RoyaltyEngine` | `distributeRoyalty(recipients, ...)` | **641,770** | < 750,000 | +14.4% | PASS |
| `ProvenanceRegistry`| `registerProvenance(...)` | **483,396** | < 600,000 | +19.4% | PASS |

---

## 🧪 6. Automated Test Suites (279 Tests)

The blockchain test suite consists of **279 passing automated tests** verifying every contract, edge condition, failure mode, and gas limit:

```bash
cd blockchain
npx hardhat test
```

### Breakdown of Test Suites

| Test Suite File | Tests | Focus Area |
| :--- | :--- | :--- |
| `test/integration/BlockchainApiIntegration.test.js` | 9 | End-to-end user lifecycle, OpenAPI schema compliance |
| `test/integration/GasBenchmarking.test.js` | 12 | Gas consumption upper bounds across all core operations |
| `test/monitoring/EventMonitor.test.js` | 5 | Log polling, argument sanitization, backoff resilience |
| `test/monitoring/TreasuryMonitor.test.js` | 3 | Real-time balance queries and inflow/outflow deltas |
| `test/monitoring/FraudEngine.test.js` | 7 | Deterministic evaluation of all 5 fraud detection rules |
| `test/royalty/RoyaltyEngine.test.js` | 36 | Multi-party BPS splits, remainder dust absorption, anti-replay |
| `test/registry/ProvenanceRegistry.test.js` | 36 | DAG edge creation, composite keys, on-chain verification |
| `test/registry/ModelRegistry.test.js` | 41 | Model identity, version history, SHA-256 verification |
| `test/governance/Treasury.test.js` | 14 | SafeERC20 deposits, native ETH, owner withdrawals |
| `test/licensing/LicenseRegistry.test.js` | 32 | Fixed/royalty pricing, boolean permissions, expiration |
| `test/marketplace/PurchaseEngine.test.js` | 30 | Atomic purchases, fee routing, access grants, exclusivity |
| `test/registry/DatasetRegistry.test.js` | 26 | IPFS CID storage, incremental IDs, ownership handoff |
| `test/tokens/AIXToken.test.js` | 15 | ERC-20 transfers, owner minting, public burning |
| `test/utils/wallet.test.js` | 13 | EIP-191 signatures, address derivation, nonce hashing |
| **Total** | **279** | **100% Pass Rate** |

---

## 🚀 7. Deployment & Management Scripts

### Hardhat Ignition Master Modules
Deploy the complete contract graph deterministically:
```bash
# Deploy complete platform stack through Phase 10
npx hardhat ignition deploy ignition/modules/Phase10.js --network localhost
```

### Standalone Deployment Scripts
Located in `blockchain/scripts/`:
```bash
# 1. Run full gas benchmark & deploy core stack
npx hardhat run scripts/runGasBenchmark.js --network localhost

# 2. Deploy individual contracts
npx hardhat run scripts/deploy.js --network localhost                 # AIXToken & Treasury
npx hardhat run scripts/deployDatasetRegistry.js --network localhost  # DatasetRegistry
npx hardhat run scripts/deployLicenseRegistry.js --network localhost  # LicenseRegistry
npx hardhat run scripts/deployPurchaseEngine.js --network localhost   # PurchaseEngine
npx hardhat run scripts/deployModelRegistry.js --network localhost    # ModelRegistry
npx hardhat run scripts/deployProvenanceRegistry.js --network localhost # ProvenanceRegistry
npx hardhat run scripts/deployRoyaltyEngine.js --network localhost    # RoyaltyEngine

# 3. Token utilities
npx hardhat run scripts/mint.js --network localhost      # Mint tokens to address
npx hardhat run scripts/transfer.js --network localhost  # Transfer tokens between test accounts
npx hardhat run scripts/balance.js --network localhost   # Check AIX & ETH balance of address
```

### Deploying to Sepolia Testnet
1. Ensure `blockchain/.env` contains your `SEPOLIA_RPC_URL` and `PRIVATE_KEY`.
2. Ensure the deploying wallet has sufficient Sepolia ETH.
3. Execute deployment:
   ```bash
   npx hardhat ignition deploy ignition/modules/Phase10.js --network sepolia
   ```

---

## 🔒 8. Security Invariants & Developer Guidelines

1. **Checks-Effects-Interactions (CEI)**: All state-modifying functions (e.g. `PurchaseEngine.purchaseDataset`, `RoyaltyEngine.distributeRoyalty`) update internal storage variables before executing external token transfers.
2. **Safe Token Handling**: All token interactions utilize OpenZeppelin's `SafeERC20` wrapper (`safeTransfer`, `safeTransferFrom`), preventing silent revert failures with non-standard ERC-20 implementations.
3. **Reentrancy Protection**: All external settlement functions are shielded by OpenZeppelin `ReentrancyGuard`.
4. **Strict Integer Arithmetic**: Basis points are calculated using integer arithmetic with standard denominator `10000`. Floating-point operations do not exist in the EVM. Any rounding truncation remainders are absorbed by the `Treasury` to ensure strict conservation of value.
5. **No Secret Storage**: Private keys, database credentials, and raw datasets must never be committed to smart contract storage or bytecode.
6. **Non-Invasive Monitoring**: The fraud monitoring module only inspects and flags suspicious behavior; it does not freeze user funds or alter on-chain state without governance action.

---

## 🛠️ 9. Troubleshooting & FAQ

### Hardhat Network "Nonce Too High"
- **Issue**: MetaMask reports transaction nonce mismatch when submitting transactions.
- **Fix**: Open MetaMask -> Settings -> Advanced -> Click **Clear activity and nonce data**.

### Error: `Transaction reverted without a reason string`
- **Issue**: A custom Solidity error was triggered, but the caller did not decode it.
- **Fix**: Check `contracts/libraries/Errors.sol`. In Ethers.js, inspect `error.data` or catch `contract.interface.parseError(error.data)` to inspect custom error arguments.

### Ethers.js BigInt Serialization Error
- **Issue**: `TypeError: Do not know how to serialize a BigInt` when converting contract call results to JSON.
- **Fix**: BigInt values must be converted to strings using `.toString()` before calling `JSON.stringify()`.

---

## 📄 License

Developed as part of the **AIXchange** project. All rights reserved under the MIT License.