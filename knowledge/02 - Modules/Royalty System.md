# Royalty System

## Overview

The **Royalty System** provides automated, atomic, multi-party royalty distributions to original data creators, co-authors, and stakeholders whenever datasets or derived models generate commercial revenue.

> [!NOTE]
> **Implementation State: 100% Implemented (Phase 10 Complete)**
> Full end-to-end integration is operational across smart contracts (`RoyaltyEngine.sol`), MongoDB projection schemas (`RoyaltyDistribution`), zero-custody transaction preparation, real-time event indexing (`royalty-event-indexer.js`), and authoritative on-chain reconciliation.

---

## 1. Architectural Model

```text
RoyaltyEngine.sol (Smart Contract)
      │
      ├── Emits: DistributionCreated, RecipientPaid, TreasuryPaid, DistributionCompleted
      ▼
Royalty Event Indexer (Node.js Background Worker)
      │
      ├── Deduplicates via BlockchainEvent (chainId:contractAddress:txHash:logIndex)
      ├── Single-document aggregation in MongoDB (RoyaltyDistribution)
      ▼
Royalty Service & Repository
      │
      ├── Read operations served directly from MongoDB cache
      ├── Write operations use zero-custody calldata encoding
      ├── Reconcile verifies on-chain contract state matches database
      ▼
REST APIs (/api/v1/royalties)
```

---

## 2. Smart Contract Mechanics (`RoyaltyEngine.sol`)

- **Token Standard**: Operates strictly with ERC-20 `AIXToken` base units (wei, $10^{18}$).
- **Precision Accounting**: All basis point allocations are scaled to $10,000$ ($1\text{ BPS} = 0.01\%$).
- **Zero-Leakage Invariant**:
  $$\text{treasuryAmount} + \sum \text{recipientAmounts} = \text{totalRevenue}$$
  Integer rounding remainders are absorbed into the platform Treasury fee, guaranteeing that not a single wei is lost or locked in the contract.
- **Idempotency Safeguard**: `isSourceDistributed(sourceType, sourceId)` ensures that downstream purchase or dataset distributions cannot be double-paid.
- **Gas Optimized Multi-Party Splits**: Supports up to 50 distinct recipients in a single atomic transaction.

---

## 3. Backend Integration Layer

### Data Model (`RoyaltyDistribution`)
- **Exact String Representations**: `totalRevenue`, `treasuryAmount`, and recipient `amount` stored as exact decimal strings (e.g. `"1000000000000000000000"`). No JavaScript floating-point numbers in persistent storage.
- **Multi-Event Single Distribution Projection**: A single distribution emits `DistributionCreated`, multiple `RecipientPaid`, `TreasuryPaid`, and `DistributionCompleted`. The backend projects all events into a unified document with an embedded `recipients` array.
- **Lifecycle Statuses**:
  - `status`: `"PENDING"`, `"DISTRIBUTED"`, `"CANCELLED"`
  - `transactionStatus`: `"PREPARED"`, `"PENDING"`, `"CONFIRMED"`, `"FAILED"`
  - `reconciled`: `Boolean` (defaults to `false`, flipped to `true` only upon successful on-chain reconciliation).

### Background Indexer (`royalty-event-indexer.js`)
- Continuously polls block range `[lastBlock + 1, currentBlock]` with configurable confirmation depth (`BLOCKCHAIN_CONFIRMATIONS`).
- Tracks checkpoint block in `IndexerState` collection.
- Records raw logs in `BlockchainEvent` with unique composite key `chainId:contractAddress:transactionHash:logIndex` to prevent replay duplication.

### Authoritative Reconciliation (`POST /api/v1/royalties/reconcile`)
- Queries on-chain `RoyaltyEngine.getDistribution(distributionId)` and `getDistributionAllocations(distributionId)`.
- Cross-verifies:
  1. `totalRevenue` (string vs wei)
  2. `treasuryAmount` (string vs wei)
  3. Recipient count and individual amounts
  4. Status (`DISTRIBUTED`)
- Sets `reconciled = true` and records `reconciledAt` timestamp.

---

## 4. REST API Endpoints

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/distributions/:distributionId` | Public | Retrieve distribution details from MongoDB |
| `GET` | `/distributions/:distributionId/allocations` | Public | Retrieve recipient allocation breakdown |
| `GET` | `/recipients/:address` | Public | Total claimed earnings and payout records |
| `GET` | `/source/:sourceType/:sourceId` | Public | Check if dataset or model has distributed |
| `GET` | `/history` | Public | Paginated history with filtering |
| `GET` | `/summary` | Public | Platform-wide financial metrics and recipient stats |
| `GET` | `/reports` | Public | Multi-attribute aggregation by recipient/source |
| `POST` | `/calculate-split` | Public | Off-chain simulation preview |
| `POST` | `/prepare` | JWT | Zero-custody calldata encoding |
| `POST` | `/sync` | JWT | Verify transaction receipt and index |
| `POST` | `/reconcile` | JWT | Batch reconciliation |
| `POST` | `/reconcile/:distributionId` | JWT | Single distribution reconciliation |
