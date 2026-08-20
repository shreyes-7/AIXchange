# Collections

This document lists each MongoDB collection in AIXchange and its active database indexes.

---

## 1. `users` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `username_1`: Unique index on `username`.
  - `email_1`: Unique index on `email`.
  - `walletAddress_1`: Unique sparse index on `walletAddress`.

---

## 2. `datasets` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `datasetId_1`: Unique sparse index on on-chain integer `datasetId`.
  - `title_text`: Text search index on `title`.
  - `ownerAddress_1`: Index for creator-specific queries.
  - `tags_1`: Multi-key index for tag-based filtering.
  - `category_1`: Category filter index.
  - `price_1`: Price range sorting index.

---

## 3. `licenses` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `licenseId_1`: Unique index on on-chain integer `licenseId`.
  - `assetId_1`: Query index for listing all licenses of an asset.
  - `licensorAddress_1`: Query index for creator-specific licenses.

---

## 4. `purchases` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `purchaseId_1`: Unique index on on-chain integer `purchaseId`.
  - `buyerAddress_1`: Query index for buyer purchase history.
  - `datasetId_1`: Query index for dataset transaction receipts.
  - `txHash_1`: Unique index on Ethereum transaction hash.

---

## 5. `transactions` & `indexer_state` Collections
- **`transactions`**:
  - `txHash_1`: Unique index on transaction hash.
  - `from_1`, `to_1`: Address activity indexes.
- **`indexer_state`**:
  - `indexerName_1`: Unique index on background worker name.

---

## 6. `sandboxes` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `sandboxId_1`: Unique UUID index.
  - `executionId_1`: Sparse unique index matching AI execution identifier.
  - `userId_1_status_1_createdAt_-1`: Compound index for user sandbox list queries.
  - `datasetId_1_status_1`: Compound index for dataset-specific executions.
  - `status_1_lastSyncedAt_1`: Query index for active background monitoring.

---

## 7. `sandboxfiles` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `fileId_1`: Unique UUID index.
  - `sandboxId_1_category_1`: Sandbox-scoped category index.
  - `userId_1_createdAt_-1`: User audit index.

---

## 8. `executionevents` Collection
- **Indexes**:
  - `_id_`: Primary key index.
  - `eventId_1`: Unique UUID index.
  - `sandboxId_1_timestamp_1`: Ordered sandbox event stream index.
  - `executionId_1_timestamp_1`: Execution trace index.

