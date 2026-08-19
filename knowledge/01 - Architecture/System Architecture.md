# System Architecture

## Architecture Overview

**AIXchange** implements a hybrid Web2/Web3 multi-tier architecture. It separates decentralized trustless state management from performant off-chain indexing and web presentation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER / METAMASK CLIENT                          │
│                                                                        │
│  [ React 19 SPA (Vite + Tailwind) ]  <--->  [ MetaMask EIP-1193/191 ]  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
         HTTP/REST │ (Port 5000)            JSON-RPC │ (Port 8545)
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│            EXPRESS 5 API             │  │   ETHEREUM / HARDHAT NODE    │
│                                      │  │                              │
│  • Auth / Wallet Verification        │  │  • AIXToken.sol (ERC-20)     │
│  • Dataset & License REST Endpoints  │  │  • Treasury.sol              │
│  • Purchase & Entitlement APIs       │  │  • DatasetRegistry.sol       │
│  • Background Event Indexers         │  │  • LicenseRegistry.sol       │
└──────────────────┬───────────────────┘  │  • PurchaseEngine.sol        │
                   │                      └──────────────────────────────┘
          Mongoose │ ODM                                     ▲
                   ▼                                         │ Event Sync
┌──────────────────────────────────────┐                     │
│               MONGODB                │─────────────────────┘
│                                      │
│  • Users, Sessions                   │
│  • Datasets, Licenses, Purchases     │
│  • Transactions, IndexerState        │
└──────────────────────────────────────┘
```

---

## Architectural Tiers & Responsibilities

### 1. Presentation Tier (`client/`)
- **Technology**: React 19, Vite, Tailwind CSS 4, React Router DOM 7.
- **Role**: Renders responsive UI for dataset discovery, decentralized publishing, account management, and developer wallet diagnostics.
- **Web3 Interface**: Direct JSON-RPC connection to EVM blockchain via Ethers.js v6 and `window.ethereum`.
- **API Interface**: Axios client communication with Express backend on `http://localhost:5000/api/v1`.

### 2. Application & API Tier (`server/`)
- **Technology**: Node.js 22+, Express 5, Ethers 6, Winston, Joi.
- **Role**: Coordinates user authentication, metadata caching, query filtering, and event indexing.
- **Security**: Rate limiting, Helmet HTTP headers, CORS whitelisting, and centralized error handling.
- **Blockchain Synchronization**: Background event indexer jobs (`jobs/license-event-indexer.js`, `jobs/purchase-event-indexer.js`, `jobs/token-event-indexer.js`) continuously listen to EVM contract events and update MongoDB collections.

### 3. Decentralized Settlement Tier (`blockchain/`)
- **Technology**: Solidity 0.8.28, Hardhat, OpenZeppelin v5.
- **Role**: Authoritative ledger for dataset ownership, licensing terms, token economics, platform fees, and purchase receipts.
- **Contracts**:
  - [[Token Economy|AIXToken.sol]]: ERC-20 payment currency.
  - [[Token Economy|Treasury.sol]]: Protocol vault.
  - [[Dataset Marketplace|DatasetRegistry.sol]]: Dataset metadata and ownership mapping.
  - [[Licensing System|LicenseRegistry.sol]]: License terms, rights, and pricing.
  - [[Purchase Engine|PurchaseEngine.sol]]: Atomic payment settlement and access validation.

### 4. Persistence Tier (`database/` & MongoDB)
- **Technology**: MongoDB Atlas / Local MongoDB instance managed via Mongoose 9.
- **Role**: Off-chain index for low-latency searching, user profile management, session tracking, and transaction history.

### 5. Storage Tier (IPFS / Pinata)
- **Technology**: InterPlanetary File System (IPFS).
- **Role**: Content-addressed decentralized file storage. Raw dataset payloads and file archives reside on IPFS; only cryptographic hashes (CIDs) are pinned on-chain.
