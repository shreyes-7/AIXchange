# Data Flow

## Overview

This document outlines how data flows between the user client, the Express backend, MongoDB collections, and the Ethereum blockchain.

---

## 1. Dataset Publishing & Indexing Data Flow

```text
1. User submits metadata in RegisterDataset.jsx
2. Client invokes DatasetRegistry.registerDataset() via MetaMask
3. Hardhat/Ethereum miners mine transaction and emit DatasetRegistered event
4. Client sends POST /api/v1/datasets with on-chain datasetId, title, CID, tags
5. Backend validates payload with Joi schema (dataset.validator.js)
6. DatasetRepository inserts new document into MongoDB 'datasets' collection
7. Dataset becomes instantly searchable in DatasetMarketplace.jsx
```

---

## 2. Purchase Settlement & Event Indexing Flow

```text
1. Buyer executes PurchaseEngine.purchaseDataset(datasetId, licenseId)
2. Smart contract completes atomic SafeERC20 transfers and emits DatasetPurchased
3. Backend worker purchase-event-indexer.js detects event on blockchain
4. Worker parses purchaseId, datasetId, licenseId, buyer, price, and fee
5. Worker inserts Purchase record into 'purchases' collection
6. Worker increments dataset.purchaseCount in 'datasets' collection
7. Worker logs transaction in 'transactions' collection
8. Worker updates lastProcessedBlock in 'indexer_state' collection
```

---

## 3. Access Verification & Protected Downloads

```text
1. Buyer clicks "Download / Access Dataset" on client
2. Client sends GET /api/v1/purchases/check-access/:datasetId (with JWT)
3. Backend extracts buyer address from JWT session
4. AccessControlService checks if buyer is Dataset Creator:
   - If true: Grant immediate access.
   - If false: Query PurchaseRepository for active, unexpired purchase record.
5. If valid purchase exists: DownloadService returns signed IPFS gateway URL.
6. If no valid purchase: Revert with ApiError(403, 'Forbidden: Purchase required').
```
