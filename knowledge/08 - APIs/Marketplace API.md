# Marketplace API

## Overview

The Marketplace API routes under `/api/v1/datasets`, `/api/v1/licenses`, and `/api/v1/purchases` provide off-chain access to marketplace listings, search, and receipts.

---

## 1. Datasets (`/api/v1/datasets`)

### `GET /api/v1/datasets`
- **Query Parameters**:
  - `page`: Page number (default: `1`).
  - `limit`: Items per page (default: `10`).
  - `category`: Category filter (`computer-vision`, `nlp`, `audio`, `tabular`, `multimodal`).
  - `license`: License type filter (`ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`).
  - `search`: Full-text search term.
  - `minPrice`, `maxPrice`: Price range filters.
- **Response (`200 OK`)**: Paginated list of dataset objects.

### `GET /api/v1/datasets/:id`
- **Description**: Retrieves full metadata for a specific dataset and increments view counter.

### `POST /api/v1/datasets`
- **Auth**: JWT required.
- **Description**: Indexes a new dataset registered on `DatasetRegistry.sol`.
- **Request Body**:
  ```json
  {
    "datasetId": 1,
    "title": "Medical Imaging CT Scans",
    "description": "Annotated 3D CT scan dataset for anomaly detection",
    "category": "computer-vision",
    "tags": ["medical", "ct", "vision"],
    "ownerAddress": "0x71C...",
    "ipfsCid": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    "metadataUri": "ipfs://QmMeta...",
    "format": "parquet",
    "sizeBytes": 524288000,
    "price": 100,
    "royaltyBps": 500
  }
  ```

---

## 2. Licenses (`/api/v1/licenses`)

### `GET /api/v1/licenses/asset/:assetId`
- **Description**: Fetches all active licenses for a dataset ID.

### `POST /api/v1/licenses`
- **Auth**: JWT required (Asset Owner).
- **Description**: Indexes a license created on `LicenseRegistry.sol`.

---

## 3. Purchases (`/api/v1/purchases`)

### `POST /api/v1/purchases`
- **Auth**: JWT required.
- **Description**: Records an on-chain purchase receipt from `PurchaseEngine.sol`.

### `GET /api/v1/purchases/my-purchases`
- **Auth**: JWT required.
- **Description**: Lists all datasets and licenses purchased by the authenticated user.

### `GET /api/v1/purchases/check-access/:datasetId`
- **Auth**: JWT required.
- **Description**: Verifies if the authenticated caller has active viewing or downloading entitlement for the dataset.
