# AIXchange Backend Server Application

The **AIXchange Server** is the core backend API and off-chain orchestration engine for the AIXchange platform. Built on **Node.js (>=22.0.0)**, **Express 5**, **MongoDB (Mongoose 9)**, and **Ethers.js v6**, it coordinates dataset marketplace operations, cryptographic licensing, zero-custody Web3 wallet authentication, Docker training sandboxes, AI model metadata registration, on-chain provenance DAG verification, automated royalty reconciliation, and asynchronous blockchain event indexing.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Installation & Local Execution](#installation--local-execution)
6. [API Route Catalog & Swagger Documentation](#api-route-catalog--swagger-documentation)
7. [Database Architecture & Mongoose Models](#database-architecture--mongoose-models)
8. [Blockchain Event Indexers & Background Workers](#blockchain-event-indexers--background-workers)
9. [Docker Sandbox & AI Substrate Integration](#docker-sandbox--ai-substrate-integration)
10. [Testing & Quality Verification](#testing--quality-verification)
11. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architectural Overview

The server acts as the authoritative coordination layer between off-chain client applications, containerized AI training execution environments, and EVM smart contracts:

```text
 ┌─────────────────────────┐               ┌─────────────────────────┐
 │  AIXchange React Client │               │ Python AI Substrate API │
 │  http://localhost:5173  │               │  http://localhost:8000  │
 └───────────┬─────────────┘               └───────────┬─────────────┘
             │ HTTP REST / JWT                         │ HTTP REST Execution
             ▼                                         ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │                       Express 5 Server                            │
 │                    http://localhost:5000                          │
 │  (Auth, Routing, Joi Validation, Controllers, Encryption Services)│
 └───────────┬─────────────────────────────────────────┬─────────────┘
             │ Mongoose ODM                            │ Ethers.js v6
             ▼                                         ▼
 ┌─────────────────────────┐               ┌─────────────────────────┐
 │   MongoDB Database      │               │ Local Hardhat Node      │
 │  mongodb://localhost:   │               │  http://127.0.0.1:8545  │
 │     27017/aixchange     │               │   (Chain ID: 31337)     │
 └─────────────────────────┘               └─────────────────────────┘
```

### Key Responsibilities

1. **Authentication & Identity**: Dual-mode authentication supporting traditional JWT (access + refresh tokens with HTTP-only cookies) and Web3 cryptographic signature verification (EIP-191 `personal_sign` challenges).
2. **Encrypted Storage Management**: AES-256-GCM symmetric encryption of uploaded dataset archives before local disk storage or decentralized Pinata IPFS pinning.
3. **AI Execution Orchestration**: Dispatches isolated training jobs to `python-services`, validates workspace paths, logs progress metrics, and monitors container health.
4. **Blockchain State Indexing**: Persistent background workers query smart contract logs to synchronize on-chain purchases, license grants, model registrations, provenance links, and royalty payouts into MongoDB queryable collections.

---

## Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>=22.0.0` | Server-side JavaScript runtime with native test runner |
| **Web Framework** | Express | `^5.2.1` | REST API routing and middleware pipeline |
| **Database** | MongoDB / Mongoose | `^9.7.4` | Document-oriented object data modeling (ODM) |
| **Blockchain** | Ethers.js | `^6.17.0` | JSON-RPC contract querying, event decoding, and signature verification |
| **API Documentation** | Swagger UI / JSDoc | `^5.0.1` / `^6.3.0` | Interactive OpenAPI 3.0.3 documentation viewer |
| **Validation** | Joi | `^18.2.3` | Schema-based payload and query parameter sanitization |
| **Security** | Helmet / CORS | `^8.3.0` / `^2.8.6` | HTTP header hardening and origin protection |
| **Logging** | Winston / Morgan | `^3.19.0` / `^1.11.0` | Structured JSON log generation and HTTP request telemetry |

---

## Prerequisites

1. **Node.js**: Version `>=22.0.0`
2. **MongoDB**: Local MongoDB community edition running on `localhost:27017` or MongoDB Atlas cloud connection string
3. **Local Blockchain**: Hardhat node running on `http://127.0.0.1:8545` (Terminal 3)
4. **Smart Contracts Deployed**: Contracts deployed via Phase10 Ignition module (Terminal 4)
5. **Python AI Services** *(Optional for core marketplace, required for training/sandbox)*: FastAPI server on port `8000`

---

## Environment Configuration

Configuration is loaded from `server/.env`. Additionally, the server automatically reads `blockchain/.env` if present to load contract addresses.

Create the environment file:

```powershell
# Working Directory: D:\AIXchange\server
Copy-Item .env.example .env
```

### Environment Variables Reference

| Variable | Type | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | Number | No | `5000` | Port for the Express server to listen on |
| `MONGODB_URI` | String | **Yes** | `mongodb://localhost:27017/aixchange` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | String | **Yes** | *[32+ char secret string]* | Secret key for signing short-lived JWT access tokens |
| `REFRESH_TOKEN_SECRET` | String | **Yes** | *[32+ char secret string]* | Secret key for signing long-lived JWT refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | String | No | `15m` | Lifetime of JWT access token |
| `REFRESH_TOKEN_EXPIRY` | String | No | `7d` | Lifetime of JWT refresh token |
| `CLIENT_URL` | String (URL) | No | `http://localhost:5173` | Allowed frontend origin for CORS policies |
| `API_PREFIX` | String | No | `/api/v1` | URL prefix for REST endpoints |
| `BLOCKCHAIN_RPC_URL` | String (URL) | **Yes** | `http://127.0.0.1:8545` | EVM JSON-RPC endpoint (must be configured) |
| `BLOCKCHAIN_CHAIN_ID` | Number | **Yes** | `31337` | EVM Chain ID (`31337` for Hardhat, `11155111` for Sepolia) |
| `AIX_TOKEN_ADDRESS` | String (Hex) | **Yes** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Deployed address of AIXToken |
| `TREASURY_ADDRESS` | String (Hex) | **Yes** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Deployed address of Treasury vault |
| `DATASET_REGISTRY_ADDRESS`| String (Hex) | **Yes** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Deployed address of DatasetRegistry |
| `PURCHASE_ENGINE_ADDRESS` | String (Hex) | **Yes** | `0x0165878A594ca255338adfa4d48449f69242Eb8F` | Deployed address of PurchaseEngine |
| `LICENSE_REGISTRY_ADDRESS`| String (Hex) | **Yes** | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` | Deployed address of LicenseRegistry |
| `MODEL_REGISTRY_ADDRESS` | String (Hex) | **Yes** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Deployed address of ModelRegistry |
| `PROVENANCE_REGISTRY_ADDRESS`| String (Hex) | **Yes** | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` | Deployed address of ProvenanceRegistry |
| `ROYALTY_ENGINE_ADDRESS` | String (Hex) | **Yes** | `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853` | Deployed address of RoyaltyEngine |
| `DATASET_ENCRYPTION_KEY` | String | No | *[Base64 32-byte key]* | Symmetric AES-256-GCM encryption key for dataset files |
| `PINATA_JWT` | String | No | *[Pinata JWT]* | Authentication token for IPFS pinning services |
| `AI_SERVICE_URL` | String (URL) | No | `http://localhost:8000` | Endpoint of the Python execution service |
| `WORKSPACE_DIR` | String (Path) | No | `../python-services/workspace` | Base filesystem path for training sandbox staging |

> **Startup Guard:** If `BLOCKCHAIN_RPC_URL` or `BLOCKCHAIN_CHAIN_ID` are missing, the server deliberately throws an error on boot to prevent serving desynchronized data.

---

## Installation & Local Execution

### 1. Install Dependencies

```powershell
# Working Directory: D:\AIXchange\server
npm install
```

### 2. Verify Database Accessibility

Ensure your MongoDB instance is running before launching the server:

```powershell
# Check MongoDB status on Windows
Get-Service -Name MongoDB -ErrorAction SilentlyContinue
```

### 3. Start Development Server

```powershell
# Working Directory: D:\AIXchange\server
npm run dev
```

Expected startup logs:

```text
info: Database connected: localhost:27017/aixchange
info: Server is running in development mode on port 5000
info: [TokenEventIndexer] Started successfully. Interval: 15000ms
info: [PurchaseEventIndexer] Started successfully. Interval: 15000ms
info: [RoyaltyEventIndexer] Started successfully. Interval: 15000ms
```

---

## API Route Catalog & Swagger Documentation

### Interactive Swagger UI

Once the server is running, explore and execute live API requests at:
- **Swagger UI**: `http://localhost:5000/api-docs` or `http://localhost:5000/api/v1/docs`

### Route Catalog Summary

All application routes are mounted under `/api/v1` (configured via `API_PREFIX`):

| Mount Path | Controller / Route | Primary Endpoints | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `health.routes.js` | `GET /` | Health check endpoint returning status and ISO timestamp |
| `/api/v1/auth` | `auth.routes.js` | `POST /register`, `POST /login`, `POST /logout`, `GET /me` | JWT user registration, credential login, token refresh |
| `/api/v1/wallet` | `wallet.route.js` | `POST /nonce`, `POST /verify`, `GET /status` | EIP-191 challenge nonces and cryptographic signature verification |
| `/api/v1/token` | `token.route.js` | `GET /balance/:address`, `GET /allowance` | AIX ERC-20 balance checks and spender allowance tracking |
| `/api/v1/treasury` | `treasury.route.js` | `GET /balance`, `GET /fees` | Platform Treasury vault metrics and protocol fee audit |
| `/api/v1/datasets` | `dataset.route.js` | `GET /`, `POST /`, `GET /:id`, `PUT /:id` | Dataset marketplace catalog, metadata indexing, and file uploads |
| `/api/v1/models` | `model.route.js` | `GET /`, `POST /`, `GET /:id`, `POST /:id/verify` | AI model catalog, weights SHA-256 verification, and licensing |
| `/api/v1/licenses` | `license.route.js` | `GET /`, `POST /grant`, `GET /verify` | Cryptographic license issuance and rights verification |
| `/api/v1/purchases`| `purchase.route.js` | `POST /prepare`, `POST /confirm`, `GET /receipts` | Asset purchase lifecycle and atomic payment preparation |
| `/api/v1/provenance`| `provenance.route.js` | `GET /graph/:modelId`, `POST /anchor` | Lineage DAG queries and on-chain provenance anchoring |
| `/api/v1/royalties`| `royalty.route.js` | `GET /splits/:id`, `GET /payouts/:address` | Multi-party split trees, secondary royalty distribution logs |
| `/api/v1/sandboxes`| `sandbox.route.js` | `POST /launch`, `GET /:id/status`, `POST /:id/train` | Docker sandbox staging, training dispatch, and logs |
| `/api/v1/analytics`| `analytics.routes.js` | `GET /overview`, `GET /gas` | High-level platform KPIs, transaction counts, and gas telemetry |
| `/api/v1/admin` | `admin.routes.js` | `GET /users`, `GET /fraud-flags`, `PUT /moderation` | Administrative mission control and fraud review audit |

---

## Database Architecture & Mongoose Models

Models reside in `src/models/` and manage persistent MongoDB collections:

- `User`: Registered accounts, password hashes (bcrypt), roles (`user`, `creator`, `admin`), and linked Ethereum wallet addresses.
- `Dataset`: On-chain dataset registry ID, creator address, IPFS CID, title, description, tags, price, and license terms.
- `Model`: AI model weights metadata, framework (`pytorch`, `safetensors`), SHA-256 digest, parameters, and parent dataset references.
- `Provenance`: Directed Acyclic Graph (DAG) records linking model IDs to training dataset hashes and execution environments.
- `License`: Issued commercial and research licenses, buyer address, expiration dates, and permitted usage limits.
- `Purchase`: Transaction records, buyer/seller addresses, token amount, fee deductions, and block receipts.
- `RoyaltyDistribution`: Log of secondary market revenue splits, creator payouts, and platform fee deductions.
- `Sandbox`: Container training runs, execution IDs, current status (`PENDING`, `TRAINING`, `COMPLETED`, `FAILED`), and metrics.
- `BlockchainEvent`: Audit log of raw smart contract events processed by background indexers to guarantee idempotency.
- `IndexerState`: Cursor tracking the last processed block height for each contract to allow resume on restart.

---

## Blockchain Event Indexers & Background Workers

The server includes 8 background workers configured in `src/jobs/` that start automatically on server boot:

- `token-event-indexer.js`: Ingests `Transfer` and `Approval` events from `AIXToken.sol`.
- `purchase-event-indexer.js`: Ingests `PurchaseCompleted` events from `PurchaseEngine.sol`.
- `license-event-indexer.js`: Ingests `LicenseGranted` and `LicenseRevoked` events from `LicenseRegistry.sol`.
- `model-event-indexer.js`: Ingests `ModelRegistered` events from `ModelRegistry.sol`.
- `provenance-event-indexer.js`: Ingests `LineageAnchored` events from `ProvenanceRegistry.sol`.
- `royalty-event-indexer.js`: Ingests `RoyaltyDistributed` events from `RoyaltyEngine.sol`.
- `sandbox-monitor.job.js`: Polls active training containers for CPU/memory utilization and timeout enforcement.
- `blockchain-analytics.indexer.js`: Aggregates gas usage and transaction frequencies into hourly and daily metric rollups.

Workers execute every `INDEXER_INTERVAL_MS` (default: `15000ms`) and query in batches of `INDEXER_BATCH_SIZE` (default: `1000` blocks).

---

## Docker Sandbox & AI Substrate Integration

The server integrates with the Python execution substrate via `@aixchange/sandbox` (`sandbox/` directory):

1. **Workspace Staging**: When a user registers a model training run, the server invokes `stageWorkspaceFiles(...)` to copy dataset files and Python training scripts into the structured directory:
   - `python-services/workspace/{execution_id}/input/`
   - `python-services/workspace/{execution_id}/code/`
2. **Path Containment Validation**: `validateContainedPath` ensures user-provided filenames cannot traverse (`../`) outside the isolated execution directory.
3. **Training Dispatch**: The server sends a POST request to `AI_SERVICE_URL/api/v1/execution/train` with hyperparameters and resource constraints.
4. **Log Streaming**: Training progress and validation loss are polled from the Python substrate and surfaced to the user interface.

---

## Testing & Quality Verification

```powershell
# Working Directory: D:\AIXchange\server

# Run all backend unit and integration tests
npm test

# Run ESLint code quality checks
npm run lint

# Format code with Prettier
npm run format
```

The test suite uses Node's native test runner (`node --test`) and validates authentication controllers, dataset uploads, purchase state transitions, and blockchain indexer projections.

---

## Troubleshooting & FAQ

### Issue: "BLOCKCHAIN_RPC_URL and BLOCKCHAIN_CHAIN_ID must be configured"
- **Cause**: Missing or empty values in `server/.env`.
- **Fix**: Open `server/.env` and verify both lines are populated:
  ```env
  BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
  BLOCKCHAIN_CHAIN_ID=31337
  ```

### Issue: "MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017"
- **Cause**: The local MongoDB service is not running.
- **Fix**: Start the MongoDB service via Windows PowerShell:
  ```powershell
  Start-Service -Name MongoDB
  ```
  Or verify your `MONGODB_URI` points to a reachable MongoDB Atlas connection string.

### Issue: "Port 5000 is already in use"
- **Cause**: An existing Node.js server process is still bound to port 5000.
- **Fix**: Terminate the existing process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  npm run dev
  ```
