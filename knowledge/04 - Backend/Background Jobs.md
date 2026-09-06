# Background Jobs

## Overview

The AIXchange backend runs persistent background event indexers in `server/src/jobs/` that listen to smart contract events on the Ethereum blockchain and synchronize state into MongoDB collections.

---

## Implemented Indexers

### 1. `purchase-event-indexer.js`
- **Target Contract**: `PurchaseEngine.sol`
- **Tracked Events**:
  - `DatasetPurchased`: Captures `purchaseId`, `datasetId`, `buyer`, `licenseId`, `price`, `platformFee`, `licensorShare`, and `timestamp`.
  - `RoyaltyTriggered`: Captures secondary royalty payout events.
- **Actions**:
  1. Queries historical events starting from `lastProcessedBlock` stored in `IndexerState`.
  2. Inserts purchase record into `purchases` collection.
  3. Increments `purchaseCount` on the corresponding dataset in `datasets` collection.
  4. Records ledger entry in `transactions` collection.
  5. Updates block cursor in `indexer-state.repository.js`.

### 2. `license-event-indexer.js`
- **Target Contract**: `LicenseRegistry.sol`
- **Tracked Events**:
  - `LicenseCreated`: Captures `licenseId`, `assetId`, `licensor`, `licenseType`, `pricingModel`, `fixedPrice`, `royaltyBps`, `rights`, `restrictions`, `validFrom`, `validUntil`.
  - `LicenseUpdated`: Updates price, metadata, or rights and increments version.
  - `LicenseRevoked`: Sets `isRevoked: true` and `isActive: false`.
- **Actions**:
  - Upserts license document into MongoDB `licenses` collection.

### 3. `token-event-indexer.js`
- **Target Contract**: `AIXToken.sol`
- **Tracked Events**:
  - `Transfer(from, to, value)`: Tracks token velocity, burns, and large balance transfers.
  - `Approval(owner, spender, value)`: Tracks spending approvals.

### 4. `model-event-indexer.js` (Phase 8)
- **Target Contract**: `ModelRegistry.sol`
- **Tracked Events**:
  - `ModelRegistered`: Upserts model document with on-chain model ID, name, creator, metadata URI, and initial version.
  - `ModelVersionAdded`: Pushes new version entry, updates current version, and records model SHA-256 weight hash.
  - `ModelStatusChanged`: Toggles active status off-chain.
  - `ModelOwnershipTransferred`: Updates model owner address.

### 5. `provenance-event-indexer.js` (Phase 9)
- **Target Contract**: `ProvenanceRegistry.sol`
- **Tracked Events**:
  - `ProvenanceRegistered`: Upserts provenance projection document with deterministic composite event identity (`chainId:contractAddress:transactionHash:logIndex`), canonical timestamp, and indexed lineage links (`datasetId`, `modelId`, `modelVersion`, `executionId`).
  - `ProvenanceStatusChanged`: Updates active flag on provenance record.

### 6. `blockchain-analytics.indexer.js` (Phase 11)
- **Target Contracts**: Unified polling for `AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, `PurchaseEngine`, `ModelRegistry`, `ProvenanceRegistry`, `RoyaltyEngine`.
- **Tracked Data**: Captures cross-contract normalized event logs, gas usage, transaction fees, and ETH values into `blockchain_events` and `blockchain_gas_txes`.

---

### 7. `sandbox-monitor.job.js` (Phase 7)
- **Purpose**: Polling and synchronization background worker for active Docker Sandbox training executions.
- **Interval**: Configurable via `SANDBOX_MONITOR_INTERVAL_MS` (default `10000ms`).
- **Actions**:
  1. Scans `sandboxes` collection for active executions (`status: RUNNING` or `CREATING`).
  2. Queries AI Execution Substrate via `aiExecutionService.getStatus(executionId)`.
  3. Updates epoch metrics history, validation score, and artifact metadata.
  4. Automatically detects `COMPLETED`, `FAILED`, and `TIMEOUT` state transitions and updates `completedAt` and `lastSyncedAt`.

