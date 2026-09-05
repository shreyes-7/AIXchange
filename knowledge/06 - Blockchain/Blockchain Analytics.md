# Phase 11 — Blockchain Analytics

## 1. Overview

Phase 11 Blockchain Analytics delivers an event-indexing, normalization, and analytical query engine for the AIXchange platform. It ingests all on-chain events emitted across the 8 smart contracts (Phases 3–10), tracks gas consumption and costs using exact integer math, and aggregates AIX token activity with full 18-decimal precision.

---

## 2. Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────┐
│              EVM Blockchain / JSON-RPC                  │
│       (AIXToken, Treasury, Registries, Engines)         │
└───────────────────────────┬─────────────────────────────┘
                            │ getLogs & getTransactionReceipt
                            ▼
┌─────────────────────────────────────────────────────────┐
│            BlockchainAnalyticsIndexer                   │
│  - Checkpoint tracking (IndexerState)                   │
│  - Confirmation depth (BLOCKCHAIN_CONFIRMATIONS)        │
│  - Batch block processing (INDEXER_BATCH_SIZE)          │
└───────────────────────────┬─────────────────────────────┘
                            │ Raw log & parsed ethers event
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Event Normalizer                       │
│  - BigInt sanitization to decimal strings               │
│  - Domain field extraction (dataset, model, amount, gas)│
└───────────────────────────┬─────────────────────────────┘
                            │ Idempotent upsert
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Persistent MongoDB Storage                 │
│  • BlockchainEvent (unique: txHash + logIndex)          │
│  • BlockchainGasTx (unique: txHash)                     │
│  • IndexerState (lastIndexedBlock, lastSync, status)    │
└───────────────────────────┬─────────────────────────────┘
                            │ BigInt Aggregations
                            ▼
┌─────────────────────────────────────────────────────────┐
│             Blockchain Analytics Service                │
│  • Events query & filters                               │
│  • AIX Token volume, participants, categories           │
│  • Gas usage, costs, contract breakdowns                │
│  • High-level network overview                          │
└───────────────────────────┬─────────────────────────────┘
                            │ REST JSON APIs
                            ▼
┌─────────────────────────────────────────────────────────┐
│   /api/v1/analytics/blockchain/* & /api/analytics/...   │
│   • /events    • /token    • /gas    • /overview        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Indexed Event Inventory (24 Events Across 8 Contracts)

| Contract | Event Name | Key Indexed Parameters | Analytics Purpose |
| :--- | :--- | :--- | :--- |
| **`AIXToken`** | `Transfer` | `from`, `to`, `value` | Token volume, transfer counts, participant tracking |
| **`AIXToken`** | `TokensMinted` | `to`, `amount` | Supply expansion tracking |
| **`AIXToken`** | `TokensBurned` | `from`, `amount` | Deflationary burn tracking |
| **`AIXToken`** | `Approval` | `owner`, `spender`, `value` | Allowance activity audit |
| **`Treasury`** | `ETHDeposited` | `sender`, `amount` | Protocol treasury inflow (ETH) |
| **`Treasury`** | `ETHWithdrawn` | `recipient`, `amount` | Protocol treasury outflow (ETH) |
| **`Treasury`** | `TokenDeposited` | `token`, `sender`, `amount` | Token deposits to vault |
| **`Treasury`** | `TokenWithdrawn` | `token`, `recipient`, `amount` | Token disbursements |
| **`Treasury`** | `OwnershipTransferred` | `previousOwner`, `newOwner` | Governance administration |
| **`DatasetRegistry`** | `DatasetRegistered` | `datasetId`, `owner`, `royalty` | Dataset inventory creation |
| **`DatasetRegistry`** | `DatasetUpdated` | `datasetId`, `newRoyalty` | Dataset metadata updates |
| **`DatasetRegistry`** | `DatasetStatusChanged` | `datasetId`, `active` | Active/deactivated tracking |
| **`DatasetRegistry`** | `DatasetOwnershipTransferred` | `datasetId`, `previousOwner`, `newOwner` | Secondary asset transfers |
| **`LicenseRegistry`** | `LicenseCreated` | `licenseId`, `assetId`, `pricingModel`, `fixedPrice`, `royaltyRate` | Licensing activity & pricing trends |
| **`LicenseRegistry`** | `LicenseUpdated` | `licenseId`, `fixedPrice`, `royaltyRate` | Terms adjustments |
| **`LicenseRegistry`** | `LicenseRevoked` | `licenseId`, `licensor` | Revocation telemetry |
| **`LicenseRegistry`** | `LicenseStatusChanged` | `licenseId`, `status` | State transitions |
| **`PurchaseEngine`** | `DatasetPurchased` | `purchaseId`, `datasetId`, `buyer`, `price`, `feeAmount`, `licensorAmount` | Marketplace GMV & fee generation |
| **`PurchaseEngine`** | `RoyaltyTriggered` | `purchaseId`, `assetId`, `licensorAmount`, `feeAmount` | Royalty triggers from purchase settlements |
| **`PurchaseEngine`** | `PlatformFeeUpdated` | `oldFeeBps`, `newFeeBps` | Protocol take-rate changes |
| **`ModelRegistry`** | `ModelRegistered` | `modelId`, `owner`, `name`, `modelHash` | AI model inventory |
| **`ModelRegistry`** | `ModelVersionAdded` | `modelId`, `versionNumber`, `modelHash` | Model versioning lifecycle |
| **`ModelRegistry`** | `ModelStatusChanged` | `modelId`, `active` | Model availability |
| **`ModelRegistry`** | `ModelOwnershipTransferred` | `modelId`, `previousOwner`, `newOwner` | Model asset transfers |
| **`ProvenanceRegistry`**| `ProvenanceRegistered` | `provenanceId`, `datasetId`, `modelId`, `modelVersion`, `executionId` | Lineage verification & audit |
| **`ProvenanceRegistry`**| `ProvenanceStatusChanged` | `provenanceId`, `active` | Provenance revocation |
| **`RoyaltyEngine`** | `DistributionCreated` | `distributionId`, `sourceKey`, `totalRevenue` | Multi-party royalty operations |
| **`RoyaltyEngine`** | `RecipientPaid` | `distributionId`, `recipient`, `amount`, `shareBps` | Creator revenue payouts |
| **`RoyaltyEngine`** | `TreasuryPaid` | `distributionId`, `treasury`, `amount`, `feeBps` | Protocol royalty fee accrual |
| **`RoyaltyEngine`** | `DistributionCompleted`| `distributionId`, `totalDistributed`, `recipientCount` | Settlement completion |
| **`RoyaltyEngine`** | `TreasuryUpdated` | `oldTreasury`, `newTreasury` | Treasury routing configuration |
| **`RoyaltyEngine`** | `TreasuryFeeUpdated` | `oldFeeBps`, `newFeeBps` | Platform fee rate modifications |

---

## 4. Idempotency & Checkpointing

### Unique Event Identity
To guarantee zero duplicate records during replay or restart:
- **BlockchainEvent**: Indexed uniquely on compound key:
  ```javascript
  { transactionHash: 1, logIndex: 1 } // unique: true
  ```
- **BlockchainGasTx**: Indexed uniquely on:
  ```javascript
  { transactionHash: 1 } // unique: true
  ```

### Checkpointing Mechanism
State synchronization is managed in `IndexerState`:
- `chainId`: Active EVM network ID.
- `contractAddress`: Lowercased contract address.
- `indexer`: Identifier (`"blockchain-analytics"`).
- `lastIndexedBlock`: Authoritative last indexed block number.
- `lastSuccessfulSync`: Timestamp of last clean batch execution.
- `status`: `"synced" | "error" | "idle"`.

Checkpoint state advances **only** after all events and gas receipts in the batch are successfully written. If an RPC or DB error occurs, the checkpoint is not advanced, ensuring automatic resume from the last known good block on server restart.

---

## 5. Token & Gas Precision Rules

### 18-Decimal Token Precision
- JavaScript floating-point numbers (`Number`) lose precision above $2^{53}-1$ (approx. 9 AIX tokens in 18-decimal wei).
- All base units (`amount`, `royaltyAmount`, `feeAmount`) are strictly processed using `BigInt` and stored as base-10 strings in MongoDB.
- Aggregations compute sums using native `BigInt` arithmetic before converting to human-readable strings via `ethers.formatEther()`.

### Integer-Safe Gas Cost
- Gas calculation:
  $$\text{gasCost} = \text{gasUsed} \times \text{effectiveGasPrice}$$
- Computed using integer `BigInt` multiplication.
- Both raw wei and ETH representations are persisted for querying and statistical display.

---

## 6. REST API Endpoints

All endpoints are mounted at `/api/v1/analytics/blockchain` and aliased at `/api/analytics/blockchain`.

### 1. `GET /events`
Retrieve indexed blockchain events with pagination and filters.

**Query Parameters:**
- `page`: Page number (default `1`).
- `limit`: Items per page (default `20`, max `100`).
- `contract`: Filter by contract name (e.g. `"AIXToken"`, `"PurchaseEngine"`) or address.
- `eventName`: Filter by event (e.g. `"Transfer"`, `"DatasetPurchased"`).
- `address`: Filter by participant address (`from` or `to`).
- `fromBlock` / `toBlock`: Block number range.
- `startDate` / `endDate`: ISO timestamp range.
- `datasetId` / `modelId`: Filter by asset identifier.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "chainId": 31337,
        "contractAddress": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
        "contractName": "AIXToken",
        "eventName": "Transfer",
        "transactionHash": "0x...",
        "blockNumber": 45,
        "blockHash": "0x...",
        "blockTimestamp": "2026-09-05T12:00:00.000Z",
        "logIndex": 0,
        "amount": "100000000000000000000",
        "amountFormatted": 100,
        "from": "0x...",
        "to": "0x..."
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 2. `GET /token`
Retrieve AIX token volume, unique participants, categorized spending, and time activity.

**Query Parameters:**
- `startDate` / `endDate`: ISO timestamp range.
- `interval`: Time grouping (`"day" | "week" | "month"`, default `"day"`).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "transferCount": 120,
      "totalVolumeRaw": "5000000000000000000000",
      "totalVolumeFormatted": 5000,
      "uniqueSendersCount": 24,
      "uniqueReceiversCount": 38,
      "uniqueParticipantsCount": 45
    },
    "categorizedSpending": {
      "spentOnDatasetsRaw": "3500000000000000000000",
      "spentOnDatasetsFormatted": 3500,
      "distributedAsRoyaltiesRaw": "750000000000000000000",
      "distributedAsRoyaltiesFormatted": 750,
      "transferredToTreasuryRaw": "175000000000000000000",
      "transferredToTreasuryFormatted": 175
    },
    "timeActivity": [
      {
        "period": "2026-09-05",
        "transferCount": 15,
        "volumeRaw": "450000000000000000000",
        "volumeFormatted": 450
      }
    ]
  }
}
```

### 3. `GET /gas`
Retrieve gas usage metrics, contract breakdown, and time aggregation.

**Query Parameters:**
- `contract`: Filter by contract name or address.
- `startDate` / `endDate`: ISO timestamp range.
- `interval`: Time grouping (`"day" | "week" | "month"`).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "transactionCount": 85,
      "totalGasUsed": "6850000",
      "averageGasUsed": 80588,
      "minGasUsed": "21000",
      "maxGasUsed": "285000",
      "totalGasCostWei": "137000000000000000",
      "totalGasCostEth": 0.137,
      "averageGasCostWei": "1611764705882352",
      "averageGasCostEth": 0.00161
    },
    "byContract": [
      {
        "contractName": "PurchaseEngine",
        "contractAddress": "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9",
        "transactionCount": 25,
        "totalGasUsedRaw": "3125000",
        "totalGasUsedNum": 3125000,
        "totalGasCostWei": "62500000000000000",
        "totalGasCostEth": 0.0625
      }
    ],
    "timeActivity": [
      {
        "period": "2026-09-05",
        "transactionCount": 20,
        "gasUsedRaw": "1800000",
        "gasUsedNum": 1800000,
        "gasCostWei": "36000000000000000",
        "gasCostEth": 0.036
      }
    ]
  }
}
```

### 4. `GET /overview`
High-level summary of network transactions, events, token volume, and gas.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactionCount": 85,
    "eventCount": 142,
    "tokenVolume": {
      "raw": "5000000000000000000000",
      "formatted": 5000
    },
    "royaltyVolume": {
      "raw": "750000000000000000000",
      "formatted": 750
    },
    "gasUsed": {
      "raw": "6850000",
      "average": 80588
    },
    "gasCost": {
      "wei": "137000000000000000",
      "eth": 0.137
    }
  }
}
```
