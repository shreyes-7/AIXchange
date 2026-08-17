# AIXchange Frontend Client

The **AIXchange Client** is a modern React + Vite web application for the AIXchange decentralized AI dataset and model marketplace.

It provides Web3 wallet integration, smart contract interaction, dataset browsing, registration, and management.

---

## 🚀 Phase 4 – Dataset Marketplace Integration

### Features
1. **Dataset Marketplace Catalog (`/datasets`)**:
   - Browse on-chain registered datasets.
   - Search by ID, CID, owner, or license.
   - Filter by license type.
   - View IPFS gateway links, creator royalties, and active status badges.
2. **Dataset Details & Management (`/datasets/:id`)**:
   - In-depth dataset provenance view.
   - Owner management panel: edit CID/license/royalty, toggle active status, transfer ownership.
3. **Dataset Registration (`/datasets/register`)**:
   - Form for publishing dataset references to the blockchain.
   - Live marketplace card preview.
   - Multi-step transaction lifecycle modal (`CHECKING_WALLET` -> `WAITING_FOR_SIGNATURE` -> `SUBMITTED` -> `CONFIRMED`).
4. **Developer Wallet Testing (`/wallet-test`)**:
   - Comprehensive wallet integration dashboard for authentication, signing, and verification.

---

## 🏗️ Architecture & Services

```text
React Page / Component
          │
          ▼
client/src/services/blockchain/dataset/
          │
   ethers.js v6
          │
          ▼
DatasetRegistry.sol (Smart Contract)
```

- **`dataset.service.js`**: Methods: `getDataset`, `getDatasetOwner`, `getDatasetsByOwner`, `getAllDatasets`, `getTotalDatasets`, `registerDataset`, `updateDataset`, `setDatasetStatus`, `transferDatasetOwnership`.
- **`dataset.abi.js`**: Human-readable ABI for `DatasetRegistry`.
- **`datasetApi.service.js`**: Integration boundary for backend REST API endpoints.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend REST API endpoint (e.g. `http://localhost:5000/api/v1`) |
| `VITE_BLOCKCHAIN_RPC_URL` | Local or testnet RPC URL (e.g. `http://127.0.0.1:8545`) |
| `VITE_CHAIN_ID` | Active chain ID (`31337` for Hardhat, `11155111` for Sepolia) |
| `VITE_DATASET_REGISTRY_ADDRESS` | Deployed `DatasetRegistry` contract address |
| `VITE_AIX_TOKEN_ADDRESS` | Deployed `AIXToken` contract address |
| `VITE_TREASURY_ADDRESS` | Deployed `Treasury` contract address |
| `VITE_IPFS_GATEWAY_URL` | Public IPFS gateway for read-only preview |

> [!CAUTION]
> `VITE_*` variables are bundled into browser assets. Never store private keys, Pinata JWTs, or database credentials here.

---

## 💻 Available Scripts

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview build
npm run preview
```
