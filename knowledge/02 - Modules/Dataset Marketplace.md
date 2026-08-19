# Dataset Marketplace

## Overview

The **Dataset Marketplace** is the primary decentralized exchange module in AIXchange. It enables AI researchers, data engineers, and creators to publish datasets to IPFS, anchor verifiable metadata and ownership on Ethereum, discover datasets through an interactive web catalog, and manage dataset lifecycles.

```text
                               DATASET MARKETPLACE
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
 [ Frontend Catalog ]          [ DatasetRegistry.sol ]         [ Backend Indexer ]
 - Search & Category Filters   - On-Chain CID Reference        - REST Search API
 - IPFS Metadata Modal         - Ownership Transfer ($O(1)$)   - Download Counts
 - Multi-step Register Wizard  - Active Status Toggle          - Category Metadata
```

---

## 1. On-Chain Registry (`DatasetRegistry.sol`)

- **File**: `blockchain/contracts/registry/DatasetRegistry.sol`
- **Data Structure**:
  ```solidity
  struct Dataset {
      uint256 id;
      address owner;
      string cid;
      string name;
      string description;
      string metadataUri;
      string defaultLicense;
      uint256 defaultRoyaltyBps;
      bool isActive;
      uint256 createdAt;
      uint256 updatedAt;
  }
  ```
- **Key Operations**:
  - `registerDataset(cid, name, description, metadataUri, defaultLicense, defaultRoyaltyBps)`: Validates CID and royalty rate (max 10000 BPS = 100%), increments `_totalDatasets`, maps ownership, and emits `DatasetRegistered`.
  - `updateDatasetMetadata(datasetId, name, description, metadataUri)`: Owner-only update of descriptive metadata.
  - `updateDatasetCID(datasetId, newCid)`: Owner-only update of IPFS CID for dataset version upgrades.
  - `toggleDatasetStatus(datasetId)`: Toggles active/delisted status (`DatasetStatusChanged`).
  - `transferDatasetOwnership(datasetId, newOwner)`: Updates owner pointer and swaps user dataset array indices.

---

## 2. Frontend User Interface (`client/src/pages/`)

- **`DatasetMarketplace.jsx`**:
  - Real-time catalog grid with live search query filtering.
  - Category and license type filters.
  - Metrics banner tracking total listed datasets, creators, and data volume.
  - Interactive IPFS Metadata Preview modal rendering JSON attributes and IPFS gateway links.
- **`DatasetDetails.jsx`**:
  - Full provenance overview, displaying dataset creator, IPFS CID, creation block/timestamp, and royalty BPS.
  - Verification badge confirming on-chain authenticity against `DatasetRegistry.sol`.
  - Owner Management Control Panel:
    - Edit metadata modal (title, description, URI).
    - One-click active status toggle.
    - Ownership transfer form.
- **`RegisterDataset.jsx`**:
  - 3-step registration wizard:
    1. *Basic Info*: Title, description, category, tags.
    2. *Storage & Terms*: IPFS CID, file format, sample size, default license, royalty BPS.
    3. *Review & Confirm*: Live card preview and fee summary.
  - Transaction progress modal displaying live blockchain submission status (`CHECKING_WALLET` $\to$ `WAITING_FOR_SIGNATURE` $\to$ `SUBMITTED` $\to$ `CONFIRMED`).

---

## 3. Backend REST APIs (`server/src/routes/dataset.route.js`)

- `GET /api/v1/datasets`: Search and paginated list with filter parameters (`category`, `license`, `minPrice`, `maxPrice`, `search`).
- `GET /api/v1/datasets/featured`: Retrieve top-rated or highlighted datasets.
- `GET /api/v1/datasets/:id`: Detailed dataset document with view counter increment.
- `POST /api/v1/datasets`: Create new dataset off-chain index record.
- `PUT /api/v1/datasets/:id`: Update dataset metadata.
- `DELETE /api/v1/datasets/:id`: Soft-delete / deactivate dataset record.
