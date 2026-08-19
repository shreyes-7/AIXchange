# API Integration

## Overview

The AIXchange frontend integrates with two distinct backends:
1. **Direct JSON-RPC Blockchain Connection**: Uses Ethers.js v6 to interact directly with Solidity smart contracts via `window.ethereum` (or local JSON-RPC provider).
2. **Backend REST API**: Uses Axios to query off-chain indexed metadata, user profiles, and search endpoints on `http://localhost:5000/api/v1`.

---

## 1. Blockchain Service Clients (`src/services/blockchain/`)

### `dataset.service.js` (DatasetRegistry)
- `getDataset(datasetId)`: Queries `DatasetRegistry.getDataset(datasetId)`.
- `getDatasetsByOwner(address)`: Queries `DatasetRegistry.getDatasetsByOwner(address)`.
- `getTotalDatasets()`: Queries `DatasetRegistry.getTotalDatasets()`.
- `registerDataset(...)`: Submits transaction calling `DatasetRegistry.registerDataset()`.
- `updateDatasetMetadata(...)`: Submits transaction calling `DatasetRegistry.updateDatasetMetadata()`.
- `toggleDatasetStatus(datasetId)`: Submits transaction calling `DatasetRegistry.toggleDatasetStatus()`.
- `transferDatasetOwnership(datasetId, newOwner)`: Submits transaction calling `DatasetRegistry.transferDatasetOwnership()`.

### `token.service.js` (AIXToken)
- `getBalance(address)`: Queries `AIXToken.balanceOf(address)`.
- `getAllowance(owner, spender)`: Queries `AIXToken.allowance(owner, spender)`.
- `approve(spender, amount)`: Submits transaction calling `AIXToken.approve()`.
- `transfer(recipient, amount)`: Submits transaction calling `AIXToken.transfer()`.
- `burn(amount)`: Submits transaction calling `AIXToken.burn()`.

---

## 2. REST API Client (`src/services/api/datasetApi.service.js`)

- **Base URL**: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'`
- **Methods**:
  - `fetchDatasets(params)`: `GET /datasets` with query filters (`page`, `limit`, `category`, `search`, `license`).
  - `fetchDatasetById(id)`: `GET /datasets/:id`.
  - `createDataset(data)`: `POST /datasets` (Authenticated).
  - `updateDataset(id, data)`: `PUT /datasets/:id` (Authenticated).
  - `fetchFeaturedDatasets()`: `GET /datasets/featured`.
