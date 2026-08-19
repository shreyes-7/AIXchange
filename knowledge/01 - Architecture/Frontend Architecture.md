# Frontend Architecture

## Overview

The AIXchange frontend is a Single Page Application (SPA) built with **React 19**, **Vite 8**, and **Tailwind CSS 4**. It communicates directly with EVM smart contracts via **Ethers.js v6** and the backend REST API via Axios.

```text
client/src/
├── App.jsx                     # Top-level application shell & router
├── main.jsx                    # React root initialization
├── index.css                   # Tailwind CSS root imports
├── components/
│   └── Navbar.jsx              # Navigation header with wallet connection trigger
├── pages/
│   ├── DatasetMarketplace.jsx  # Dataset catalog, filters, stats, preview modal
│   ├── DatasetDetails.jsx      # Dataset provenance, on-chain verification, creator controls
│   ├── RegisterDataset.jsx     # Registration form with live preview & multi-stage modal
│   └── WalletTest.jsx          # Developer testbed for Web3 wallet diagnostic actions
├── services/
│   ├── api/
│   │   ├── datasetApi.service.js # Backend REST client for datasets
│   │   └── index.js
│   └── blockchain/
│       ├── dataset/            # DatasetRegistry contract client & ABI
│       ├── token/              # AIXToken contract client & ABI
│       └── wallet/             # MetaMask provider, signer, network switcher, nonce verifier
└── types/
    └── dataset.types.js        # JSDoc dataset schemas
```

---

## Key Frontend Modules & Responsibilities

### 1. Web3 Wallet Management (`src/services/blockchain/wallet/`)
- `metamask.service.js`: Manages `window.ethereum` detection, user connection requests, account change listeners, and provider instantiation.
- `network.service.js`: Detects current chain ID (`getChainId()`), validates against supported chains (Hardhat Local `31337`, Sepolia `11155111`), triggers network switching (`wallet_switchEthereumChain`), and prompts network additions.
- `signer.service.js`: Extracts the active signer from the browser provider to sign transactions and personal messages.
- `nonce.service.js`: Generates cryptographic random nonces for testing.
- `verifier.service.js`: Verifies signatures against expected wallet addresses in the browser.
- `constants.js`: Supported chain definitions, RPC endpoints, and block explorer URLs.

### 2. Smart Contract Services (`src/services/blockchain/`)
- `dataset.service.js`: Wrapper around `DatasetRegistry.sol` providing helper functions:
  - `getDataset(datasetId)`
  - `getDatasetsByOwner(ownerAddress)`
  - `getTotalDatasets()`
  - `registerDataset(cid, name, description, metadataUri, license, royaltyBps)`
  - `updateDatasetMetadata(...)`, `toggleDatasetStatus(datasetId)`, `transferDatasetOwnership(...)`
- `token.service.js`: Wrapper around `AIXToken.sol` providing helper functions:
  - `getBalance(address)`
  - `getAllowance(owner, spender)`
  - `approve(spender, amount)`
  - `transfer(recipient, amount)`
  - `burn(amount)`

### 3. Page Implementations (`src/pages/`)
- **`DatasetMarketplace.jsx`**: Renders dynamic marketplace metrics, live search filtering by name/tag, license type dropdown filters, dataset card grid, and an interactive IPFS metadata preview modal.
- **`DatasetDetails.jsx`**: Fetches authoritative dataset state from `DatasetRegistry.sol`, renders on-chain provenance parameters (CID, creator, royalty BPS, creation block/timestamp), and renders owner-only administrative forms (metadata edit, status toggle, ownership transfer).
- **`RegisterDataset.jsx`**: 3-step registration wizard (Basic Info, IPFS & Licensing, Review & Register) with live card preview and a transaction lifecycle modal tracking states: `CHECKING_WALLET` $\to$ `WAITING_FOR_SIGNATURE` $\to$ `SUBMITTED` $\to$ `CONFIRMED`.
- **`WalletTest.jsx`**: Comprehensive developer diagnostics UI providing automated checks for MetaMask availability, network switching, nonce signing, signature verification, and AIX token read calls.
