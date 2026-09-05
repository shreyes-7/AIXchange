# AIXchange

**AIXchange** is a decentralized, blockchain-powered marketplace and execution substrate for AI datasets, machine learning models, and AI workflows. It establishes verifiable on-chain ownership, trustless licensing, atomic token-based settlement, automated royalty distribution, secure authentication, decentralized storage, and containerized AI sandboxes for training, Jupyter development, and model inference.

---

## 🚀 Implemented Phases & System Architecture

AIXchange is engineered as a modular multi-service platform. Below is the complete status of all implemented phases across the **Blockchain**, **Backend**, **Frontend**, and **AI Services** layers.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          AIXchange Platform                            │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│  1. Foundation  │ 2. Auth & Web3  │ 3. Token Economy │ 4. Marketplace  │
│  5. Licensing   │ 6. Purchase Eng │ 7. AI Sandbox    │ 8. Model Reg    │
│  9. Provenance  │ 10. Royalty Eng │ 11. BC Analytics │ 12. Monitoring  │
│  13. API Test   │                 │                  │                 │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

---

### Phase 1 — Foundation & Multi-Service Architecture
- **Repository Architecture**: Clean separation between `blockchain/`, `client/`, `server/`, `python-services/`, `database/`, and `shared/`.
- **Backend Setup (`server/`)**:
  - Express.js application architecture (`app.js`, `server.js`) with structured middleware pipeline.
  - MongoDB connection management with Mongoose (`config/database.js`).
  - Centralized error handling (`ApiError.js`, `ApiResponse.js`, `error.middleware.js`).
  - Request logging with Morgan and Winston (`logger.js`, `requestLogger.middleware.js`).
  - Swagger OpenAPI documentation endpoint (`config/swagger.js`).
  - Health check endpoint (`/api/v1/health`).
- **Frontend Foundation (`client/`)**:
  - Vite + React + Tailwind CSS modern SPA setup.
  - React Router DOM configuration for page routing.
- **Blockchain Foundation (`blockchain/`)**:
  - Hardhat development environment with Solidity `^0.8.28`.
  - Shared smart contract libraries (`Structs.sol`, `Errors.sol`, `Events.sol`).
  - Access control and base interfaces.

---

### Phase 2 — Authentication & Web3 Wallet Integration
- **Backend Auth & Wallet Services (`server/src/`)**:
  - **Traditional Auth**: User registration, bcrypt password hashing, login, and JWT token issuance (`auth.service.js`, `auth.controller.js`).
  - **Web3 Wallet Auth**: Nonce generation and cryptographic signature verification for Ethereum addresses (`wallet.service.js`, `wallet.controller.js`).
  - **Data Models**: User model (`user.model.js`) and Session tracking model (`session.model.js`).
  - **Middleware & Security**: JWT verification (`auth.middleware.js`), role-based access control (`role.middleware.js`), and Joi request validators (`auth.validator.js`, `wallet.validator.js`).
  - **Endpoints**:
    - `POST /api/v1/auth/register` — Register new user
    - `POST /api/v1/auth/login` — Authenticate and receive JWT
    - `GET  /api/v1/auth/wallet/nonce` — Generate wallet login nonce
    - `POST /api/v1/auth/wallet/verify` — Verify signature and authenticate wallet
- **Frontend Wallet Integration (`client/src/`)**:
  - Web3 wallet services using `ethers.js` v6 (`wallet.service.js`, `network.service.js`).
  - MetaMask connection, network switching (Chain ID `31337` / `11155111`), and address synchronization.
  - **Developer Wallet Dashboard (`/wallet-test`)**: Interactive UI for testing wallet authentication, signing messages, verifying nonces, and reading token balances.

---

### Phase 3 — AIX Token Economy
- **Blockchain Contracts (`blockchain/contracts/`)**:
  - `AIXToken.sol`: Native ERC-20 utility token ("AIXchange Token" / `AIX`, 18 decimals, 1 Billion initial supply, burnable, ownable minting).
  - `Treasury.sol`: Platform vault for holding AIX tokens and native ETH with access-controlled withdrawals.
  - `IAIXToken.sol`, `ITreasury.sol`: Standard contract interfaces.
- **Deployment & Tooling**:
  - Ignition modules (`AIXToken.js`, `Treasury.js`, `Phase3.js`).
  - Management scripts: `deploy.js`, `mint.js`, `transfer.js`, `balance.js`.
- **Frontend Token Service (`client/src/services/blockchain/token/`)**:
  - Ethers.js v6 wrapper for balance lookups, allowances, token transfers, and burning.

---

### Phase 4 — Dataset Marketplace Registry
- **Blockchain Contracts (`blockchain/contracts/registry/`)**:
  - `DatasetRegistry.sol`: On-chain dataset registry managing verifiable IPFS Content Identifiers (CID), incremental dataset IDs, ownership mappings, metadata updates, active status toggles, and ownership transfers with $O(1)$ index tracking.
  - `IDatasetRegistry.sol`: Full interface specification.
- **Frontend Marketplace UI (`client/src/pages/`)**:
  - **Marketplace Catalog (`/datasets` / `/`)**: Live on-chain catalog, metrics stats bar, search filter, license filter, IPFS preview modal, and gateway links.
  - **Dataset Details & Creator Controls (`/datasets/:id`)**: Comprehensive on-chain provenance record, IPFS link, active status badge, and an owner management panel (edit metadata, toggle active status, transfer ownership).
  - **Register Dataset (`/datasets/register`)**: Multi-step registration form with live marketplace card preview and interactive multi-stage transaction lifecycle modal.
  - `dataset.service.js`: Frontend blockchain service for DatasetRegistry.
  - `datasetApi.service.js`: Integration boundary for backend REST endpoints.

---

### Phase 5 — Licensing System
- **Blockchain Contracts (`blockchain/contracts/licensing/`)**:
  - `LicenseRegistry.sol`: Authoritative on-chain licensing registry supporting:
    - **License Types**: `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`.
    - **Pricing Models**: `FIXED` (AIX token units) and `ROYALTY` (basis points 0–10000 BPS, where 1000 = 10.00%).
    - **Rights & Restrictions**: Explicit boolean permissions (`canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, `canSublicense`) and restriction descriptions.
    - **Lifecycle & Validity**: Start/expiration timestamps (`validFrom`, `validUntil`), active validity checks (`isLicenseActive`), and revocation.
    - **Ownership Verification**: Direct integration with Phase 4's `DatasetRegistry.getDatasetOwner(assetId)`.
  - `ILicenseRegistry.sol`: Interface with queries for purchase and royalty calculations (`getLicensePricing`, `getLicenseRights`, `getLicensesByAsset`).

---

### Phase 6 — Purchase Engine
- **Blockchain Contracts (`blockchain/contracts/marketplace/`)**:
  - `PurchaseEngine.sol`: Decentralized on-chain purchase settlement engine:
    - **Atomic Purchases**: Executes `purchaseDataset(datasetId, licenseId)` using AIX tokens.
    - **Authoritative Pricing**: Reads price directly from `LicenseRegistry.getLicensePricing(licenseId)`.
    - **Fee & Royalty Splits**: Deducts platform fee (default 2.50% / 250 BPS) to `Treasury` and sends creator share to the licensor via OpenZeppelin `SafeERC20`.
    - **Entitlement Tracking**: Grants usage rights via `hasAccess(buyer, datasetId, licenseId)` without transferring underlying dataset ownership.
    - **Exclusivity Enforcement**: Auto-locks `EXCLUSIVE` licenses upon first purchase to reject subsequent buyers.
    - **Duplicate Prevention**: Blocks redundant purchases of active unexpired licenses.
    - **Security**: Built with OpenZeppelin `ReentrancyGuard`, `Pausable`, and checks-effects-interactions.
  - `IPurchaseEngine.sol`: Interface with access checks, purchase getters, and platform fee management.
- **Events**: `DatasetPurchased` and `RoyaltyTriggered` for backend indexers and royalty accounting.

---

### Phase 7 — Docker Sandbox & AI Execution Substrate
- **Backend Sandbox Orchestration (`server/`)**:
  - **Entitlement Access Gate**: Enforces Phase 6 license validity checks (`accessControl.authorize`) before allowing sandbox instance creation.
  - **Isolated Lifecycle State Machine**: Full `CREATING` -> `READY` -> `RUNNING` -> `COMPLETED`/`FAILED`/`TIMEOUT` lifecycle management with rollback on dispatch failure.
  - **Secure File Upload & Staging**: Multer upload pipeline with SHA-256 checksum verification, MIME filtering, path traversal protection, and automated staging into workspace layout directories (`code/`, `data/`, `input/`).
  - **AI Substrate Client Service**: Robust HTTP client wrapper with error translation, timeout controls, and structured error responses.
  - **Structured Log Synthesis**: Extracts epoch metrics history, validation metrics, and lifecycle events into structured log outputs.
  - **Live State Synchronization Job**: Background worker (`sandbox-monitor.job.js`) polling active executions and synchronizing final model artifacts and SHA-256 hashes.
  - **JupyterLab Management**: Programmatic start, stop, and status retrieval with token authentication.
- **Sandbox SDK (`sandbox/`)**:
  - ES module package `@aixchange/sandbox` exporting `SandboxClient`, `WorkspaceLayout`, `validateContainedPath`, and `stageWorkspaceFiles`.
- **AI Infrastructure & Container Sandbox (`docker/sandbox/`, `python-services/`)**:
  - **Docker Sandbox Image**: Reproducible Linux container running under unprivileged user `aixuser` (UID 1000) with CPU limits, memory limits, and PID limits.
  - **Interactive JupyterLab**: Hardened JupyterLab server locked to `/workspace` with token authentication.
  - **PyTorch Training Runtime**: Structured training loop with `DynamicMLP`, mini-batch loaders, optimizers (Adam, AdamW, SGD, RMSprop), StepLR decay, gradient clipping, live metrics logging, and timeout enforcement.
  - **Atomic Checkpoint Manager**: Atomic `.pt` checkpoint persistence and automatic top-$k$ lowest loss rotation.
  - **Model Exporter & Phase 9 Provenance**: Exports to Hugging Face `.safetensors` and PyTorch `.pt` formats with SHA-256 checksums and `model_metadata.json` capturing execution lineage.
  - **Model Artifact Validator**: Verifies file existence, SHA-256 checksums, safe weight deserialization (`weights_only=True`), and forward-pass smoke testing on dummy tensors.
  - **Decoupled Inference Engine**: Standalone prediction engine for single and batch feature vectors with probability scoring and latency measurement.
  - **AI Execution Contract REST API**: FastAPI server exposing endpoints for training, status polling, model validation, inference, and Jupyter lifecycle.

---

### Phase 8 — Blockchain Model Registry (Blockchain Portion Complete)
- **Scope Boundary**: **Blockchain layer implemented and verified**. Backend CRUD/APIs are owned by a teammate; Frontend marketplace UI is deferred.
- **Blockchain Contracts (`blockchain/contracts/registry/`)**:
  - `ModelRegistry.sol`: Decentralized registry anchoring trained machine learning models:
    - **Model Identity**: Sequential on-chain identifier generation (`modelId = 1, 2, ...`).
    - **Model Ownership**: On-chain cryptographic ownership and access control for version additions and status toggles.
    - **Cryptographic Model Hash**: Anchors SHA-256 artifact digests (generated during Phase 7 training/export) on-chain. Model weights (`.pt`, `.safetensors`) remain strictly off-chain.
    - **Model Versioning**: Immutable append-only version history (`ModelVersion` v1, v2, v3...) tracking metadata URIs and artifact hashes.
    - **On-Chain Hash Verification**: `verifyModelHash(modelId, versionNumber, expectedHash)` executes on-chain equality checks against stored digests.
    - **Duplicate Protection**: Per-owner model name uniqueness and duplicate consecutive hash rejection.
    - **Ownership Transfer**: $O(1)$ swap-and-pop index management with name reservation handoff.
  - `IModelRegistry.sol`: Public interface with comprehensive NatSpec, error definitions, and view methods for backend integration.
- **Verification**: 41 dedicated automated tests (`blockchain/test/registry/ModelRegistry.test.js`), 156/156 full blockchain suite passing, deployed and verified on local Hardhat network.

---

### Phase 9 — Blockchain Provenance Engine (Blockchain Portion Complete)
- **Scope Boundary**: **Blockchain lineage relationship layer implemented and verified**. Backend graph/timeline APIs belong to Prabhu; Frontend visualization is deferred.
- **Blockchain Contracts (`blockchain/contracts/registry/`)**:
  - `ProvenanceRegistry.sol`: Immutable on-chain lineage and verification engine:
    - **Lineage Linkage**: Binds source dataset (`datasetId` from Phase 4 `DatasetRegistry`), training execution (`executionId` from Phase 7), resulting model (`modelId`), and version (`modelVersion` from Phase 8).
    - **Zero Data Duplication**: Reuses existing `DatasetRegistry` and `ModelRegistry` as canonical sources of entity identity; stores zero weights or execution logs on-chain.
    - **Integrity Anchor**: Anchors cryptographic commitments (`metadataHash` = SHA-256 / keccak256 of `model_metadata.json`).
    - **Composite Key Duplicate Protection**: Enforces uniqueness via $\text{keccak256}(datasetId, executionId, modelId, modelVersion)$ to prevent duplicate lineage claims.
    - **Multi-Dataset Support**: Models multi-dataset training runs as distinct atomic provenance edges forming a directed acyclic property graph (DAG).
    - **On-Chain Verification Engine**: `verifyProvenance(...)` enables deterministic, read-only verification of dataset, execution, model, version, and metadata commitments without off-chain trust.
    - **Authorization & Auditable Revocation**: Registration is restricted to the model creator/owner. Records are immutable append-only with auditable status toggling (`setProvenanceStatus`).
  - `IProvenanceRegistry.sol`: Public interface exposing all getters, verifications, and event signatures for backend integration.
- **Deployment & Tooling**:
  - Hardhat Ignition modules (`ignition/modules/ProvenanceRegistry.js`, `ignition/modules/Phase9.js`).
  - Standalone deployment and verification script (`scripts/deployProvenanceRegistry.js`).
- **Verification**: 36 dedicated automated tests (`blockchain/test/registry/ProvenanceRegistry.test.js`), 192/192 full blockchain suite passing, deployed and smoke-tested on-chain.

---

### Phase 10 — Blockchain Royalty Engine (Blockchain Portion Complete)
- **Scope Boundary**: **On-chain revenue splitting, treasury allocation, and token distribution engine implemented and verified**. Backend royalty APIs, history, and reporting belong to Prabhu.
- **Blockchain Contracts (`blockchain/contracts/royalty/`)**:
  - `RoyaltyEngine.sol`: Decentralized multi-party revenue settlement engine:
    - **Multi-Party Revenue Split**: Distributes AIX token revenue across arbitrary recipient lists (up to 50 recipients per batch) using basis points (`BPS_DENOMINATOR = 10000`).
    - **Platform Treasury Integration**: Deducts platform fee (default 2.50% / 250 BPS, max 20.00% / 2000 BPS) routed directly into the platform `Treasury` vault.
    - **Strict Accounting Invariant**: Deterministic remainder handling absorbs all integer division rounding dust into the Treasury:
      $$\sum \text{recipientAmounts} + \text{treasuryAmount} \equiv \text{totalRevenue}$$
    - **Anti-Replay & Double-Distribution Protection**: Enforces uniqueness per `keccak256(sourceType, sourceId)` to prevent duplicate distributions of the same purchase or revenue source.
    - **PurchaseEngine Integration**: Dedicated helper `distributePurchaseRoyalty(purchaseId, recipients)` to split licensor earnings from verified Phase 6 dataset purchases.
    - **Circuit Breaker**: OpenZeppelin `Pausable` emergency stop controls and `ReentrancyGuard` protection on all external token transfers.
  - `IRoyaltyEngine.sol`: Public interface exposing all read, write, preview (`calculateSplit`), and accounting functions.
- **Deployment & Tooling**:
  - Hardhat Ignition modules (`ignition/modules/RoyaltyEngine.js`, `ignition/modules/Phase10.js`).
  - Standalone deployment and verification script (`scripts/deployRoyaltyEngine.js`).
- **Verification**: 36 dedicated unit tests (`blockchain/test/royalty/RoyaltyEngine.test.js`), 228/228 full blockchain suite passing, deployed and smoke-tested on-chain.

---

### Phase 11 — Blockchain Analytics (Shreyes — Blockchain Portion Complete)
- **Scope Boundary**: **Blockchain event indexing, AIX token usage analytics, gas metrics, and analytics REST APIs implemented and verified**. Backend user/download/API-call analytics belong to Prabhu; Frontend dashboard is deferred to Phase 14.
- **Event Indexer & Checkpointing (`server/src/jobs/`, `server/src/models/`)**:
  - `BlockchainAnalyticsIndexer`: Background daemon querying logs across all 8 contracts (`AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, `PurchaseEngine`, `ModelRegistry`, `ProvenanceRegistry`, `RoyaltyEngine`).
  - **Replay Idempotency**: Strict unique compound index `{ transactionHash: 1, logIndex: 1 }` on `BlockchainEvent` and unique `{ transactionHash: 1 }` on `BlockchainGasTx`. Replaying blocks produces zero duplicate records.
  - **State Checkpointing**: Persistent `IndexerState` tracking `lastIndexedBlock`, `lastSuccessfulSync`, and `status`. Checkpoints only advance upon successful processing.
  - **Confirmation Depth & Reorg Safety**: Integrates configurable `BLOCKCHAIN_CONFIRMATIONS` depth, retaining block hashes, numbers, log indices, and authoritative block timestamps.
- **AIX Token Analytics**:
  - Full 18-decimal precision math using native `BigInt` (zero JavaScript floating-point arithmetic on token base units).
  - Metrics: Transfer counts, total token volume, unique senders, unique receivers, and total unique participants.
  - Categorized spending: Identifies dataset purchase expenditure, royalty distribution volume, and platform treasury fee inflows.
  - Authoritative time-based activity aggregation (`day`, `week`, `month`) using block timestamps.
- **Gas Usage Analytics**:
  - Captures `gasUsed`, `effectiveGasPrice`, and computes $\text{gasCost} = \text{gasUsed} \times \text{effectiveGasPrice}$ using integer-safe `BigInt` multiplication.
  - Aggregations: Total gas used, min/max/average gas used, total gas cost in wei & ETH, average gas cost, and transaction counts.
  - Contract breakdown & time activity: Grouping by contract address/name and time interval (`day`, `week`, `month`).
- **Blockchain Analytics REST APIs (`server/src/routes/`)**:
  - `GET /api/v1/analytics/blockchain/events` (and `/api/analytics/blockchain/events`) — Paginated & filtered event explorer (`page`, `limit`, `contract`, `eventName`, `address`, `fromBlock`, `toBlock`, `startDate`, `endDate`).
  - `GET /api/v1/analytics/blockchain/token` — AIX volume, participant statistics, categorized spending, and time buckets.
  - `GET /api/v1/analytics/blockchain/gas` — Gas usage, cost metrics, contract breakdown, and time aggregation.
  - `GET /api/v1/analytics/blockchain/overview` — High-level network transaction count, event count, token volume, royalty volume, and gas cost.
- **Verification**: 29/29 server tests passing including 7 dedicated Phase 11 unit & HTTP API integration tests.

---

### Phase 12 — Blockchain Monitoring, Treasury & Fraud Detection (Shreyes — Blockchain Portion Complete)
- **Scope Boundary**: **Blockchain Treasury enhancements, real-time Event & Treasury monitoring engine, deterministic Fraud Detection engine, and 15 automated test suites implemented and verified**. Backend user/dataset/model moderation and reports belong to Prabhu; strictly zero files modified in `server/`.
- **Treasury Smart Contract Enhancements (`blockchain/contracts/governance/`, `interfaces/`)**:
  - `depositToken(address token, uint256 amount)`: Enables direct ERC20 token deposits into the platform Treasury vault utilizing OpenZeppelin `SafeERC20.safeTransferFrom`.
  - Emits `Events.TokenDeposited(token, msg.sender, amount)` and enforces `Errors.ZeroAddress` and `Errors.ZeroAmount` boundary validations.
- **Blockchain Monitoring Engine (`blockchain/monitoring/`)**:
  - `EventMonitor`: Connects to Ethereum JSON-RPC providers, monitors events across all 8 contracts (`AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, `PurchaseEngine`, `ModelRegistry`, `ProvenanceRegistry`, `RoyaltyEngine`), filters by block range or specific contract/events, stringifies `BigInt` values safely, deduplicates multi-contract logs, and handles RPC timeouts with exponential backoff resilience.
  - `TreasuryMonitor`: Queries live native ETH and ERC20 token balances on-chain, tracks inflows (`ETHDeposited`, `TokenDeposited`, platform fees) and outflows (`ETHWithdrawn`, `TokenWithdrawn`), and aggregates net financial activity summaries.
  - `config.js`: Centralized, environment-overridable detection thresholds for high-value transfers, rapid transaction bursts, abnormal treasury outflows, and failed transaction probing.
- **Deterministic Fraud Detection Engine (`blockchain/monitoring/fraudEngine.js`)**:
  - **Explainable Rule Engine**: Evaluates incoming on-chain transactions and event streams against 5 transparent detection rules:
    - `RAPID_TRANSACTIONS`: Detects rapid transaction bursts ($\ge 5$ within 60s) from a single address.
    - `ABNORMAL_LARGE_TRANSFER`: Flags single token transfers exceeding configured threshold (default $50{,}000$ tokens).
    - `SUSPICIOUS_TREASURY_ACTIVITY`: Flags unauthorized or abnormal Treasury withdrawals ($\ge 100{,}000$ tokens or $\ge 10$ ETH).
    - `UNUSUAL_ROYALTY_PATTERN`: Flags anomalous royalty distributions exceeding single-transaction caps ($\ge 25{,}000$ tokens).
    - `REPEATED_FAILED_TRANSACTIONS`: Flags repeated consecutive failed transaction attempts ($\ge 3$) indicating contract probing.
  - **Flag & Evidence Structure**: Generates standardized, structured flags (`ruleId`, `severity`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`, `entity`, `evidence`, `timestamp`, `recommendedAction`) for consumption by backend moderation pipelines.
  - **Non-Invasive Architecture**: Strictly observation, analysis, and alerting; zero automated account freezing or state alteration on-chain.
- **Verification**: 245/245 blockchain tests passing (15 dedicated monitoring/fraud tests + 14 Treasury tests), 0 modifications to `server/`.

---

### Phase 13 — Blockchain API Testing & Gas Benchmarks (Shreyes — Blockchain Portion Complete)
- **Scope Boundary**: **Blockchain API integration test suites, gas consumption benchmarks, and OpenAPI/Swagger schema validation implemented and verified**. Backend API testing and Postman collections belong to Prabhu; strictly zero files modified in `server/`.
- **End-to-End Multi-Contract Integration (`blockchain/test/integration/BlockchainApiIntegration.test.js`)**:
  - Exercises the complete simulated user lifecycle: EIP-191 personal sign wallet authentication, AIX token transfers & allowances, SafeERC20 Treasury deposits/withdrawals, Dataset registration with IPFS CIDs, Fixed/Royalty license issuance, atomic PurchaseEngine purchases with 2.50% fee split, Model registration with SHA-256 digests, append-only Model versioning, Provenance DAG lineage anchoring, and secondary multi-party RoyaltyEngine distributions with remainder absorption.
  - Validates exact state transitions, balance diffs, event emissions, and receipt statuses (`status: 1`).
  - Asserts strict compliance with Swagger/OpenAPI schema patterns: transaction hashes (`^0x[a-fA-F0-9]{64}$`), Ethereum addresses (`^0x[a-fA-F0-9]{40}$`), basis points limits ($0 \le \text{bps} \le 10000$), and BigInt precision-safe string representations.
- **Gas Benchmarking Suite (`blockchain/test/integration/GasBenchmarking.test.js`, `scripts/runGasBenchmark.js`)**:
  - Benchmarks and bounds gas consumption across all 12 core operations on a local Hardhat node:
    - `AIXToken.transfer`: **51,610 gas** (limit: < 70,000)
    - `AIXToken.approve`: **46,394 gas** (limit: < 60,000)
    - `Treasury.depositToken`: **57,594 gas** (limit: < 100,000)
    - `Treasury.withdrawToken`: **43,254 gas** (limit: < 70,000)
    - `DatasetRegistry.registerDataset`: **280,498 gas** (limit: < 350,000)
    - `DatasetRegistry.updateDataset`: **47,612 gas** (limit: < 90,000)
    - `LicenseRegistry.createLicense`: **386,427 gas** (limit: < 450,000)
    - `ModelRegistry.registerModel`: **443,495 gas** (limit: < 500,000)
    - `ModelRegistry.addModelVersion`: **208,402 gas** (limit: < 250,000)
    - `PurchaseEngine.purchaseDataset`: **482,112 gas** (limit: < 600,000)
    - `RoyaltyEngine.distributeRoyalty`: **641,770 gas** (limit: < 750,000)
    - `ProvenanceRegistry.registerProvenance`: **483,396 gas** (limit: < 600,000)
- **Documentation & Verification**: Comprehensive master report and backend issue log for Prabhu created at `knowledge/06 - Blockchain/Phase 13 Blockchain API Testing and Gas Benchmarks.md`. Full blockchain test suite expanded to **279/279 passing tests** (100% pass rate).

---

## 🛠️ Repository Structure

```text
AIXchange/
├── blockchain/          # Solidity smart contracts, Hardhat tests, and deployment scripts
│   ├── contracts/
│   │   ├── governance/  # Treasury.sol
│   │   ├── interfaces/  # IAIXToken, IDatasetRegistry, ILicenseRegistry, IModelRegistry, IProvenanceRegistry, IPurchaseEngine, IRoyaltyEngine, ITreasury
│   │   ├── libraries/   # Structs.sol, Errors.sol, Events.sol
│   │   ├── licensing/   # LicenseRegistry.sol
│   │   ├── marketplace/ # PurchaseEngine.sol
│   │   ├── registry/    # DatasetRegistry.sol, ModelRegistry.sol, ProvenanceRegistry.sol
│   │   ├── royalty/     # RoyaltyEngine.sol
│   │   ├── tokens/      # AIXToken.sol
│   │   └── utils/       # AccessControl.sol
│   ├── ignition/        # Hardhat Ignition deployment modules (Phases 3-10)
│   ├── monitoring/      # Blockchain EventMonitor, TreasuryMonitor, FraudEngine, and thresholds
│   ├── scripts/         # Standalone deployment and benchmarking CLI scripts (runGasBenchmark.js, deployRoyaltyEngine.js, etc.)
│   └── test/            # 279 automated unit, integration, and gas benchmark tests across all contract modules
├── client/              # React 19 + Vite frontend application
│   ├── src/
│   │   ├── components/  # Navbar, IPFS preview modal, UI components
│   │   ├── pages/       # DatasetMarketplace, DatasetDetails, RegisterDataset, WalletTest
│   │   ├── services/    # Blockchain services (Ethers.js v6) and API clients
│   │   └── types/       # JSDoc type definitions and constants
├── sandbox/             # @aixchange/sandbox SDK and workspace staging package
│   ├── src/             # SandboxClient, WorkspaceLayout, stageWorkspaceFiles, types
│   └── tests/           # 10 automated unit tests (workspace and client)
├── server/              # Node.js 22 + Express 5 backend API services
│   ├── src/
│   │   ├── config/      # Database, environment, contracts metadata, logger, swagger
│   │   ├── controllers/ # Auth, blockchain analytics, dataset, license, purchase, sandbox, token, wallet
│   │   ├── jobs/        # Blockchain event indexers (analytics, license, purchase, token) and sandbox-monitor
│   │   ├── middlewares/ # Auth, error, role, validation middlewares
│   │   ├── models/      # BlockchainEvent, BlockchainGasTx, IndexerState, Sandbox, SandboxFile, User, Dataset, License, Purchase
│   │   ├── repositories/# Blockchain analytics, Sandbox, SandboxFile, User, License, Purchase repos
│   │   ├── routes/      # REST API route handlers (/api/v1/analytics/blockchain, /sandboxes, /datasets, etc.)
│   │   ├── services/    # Blockchain analytics, Sandbox, AIExecution, FileUpload, TrainingLog, Monitoring
│   │   └── validators/  # Joi schema validators (blockchain-analytics, dataset, license, purchase, sandbox)
│   └── tests/           # 29 automated backend unit, e2e, and blockchain analytics test suites
├── python-services/     # Python 3.12 AI Execution Substrate & Sandbox Services
│   ├── app/
│   │   ├── api/         # FastAPI execution endpoints (train, infer, validate-model, jupyter)
│   │   ├── core/        # SandboxManager, JupyterManager, DockerRunner, settings
│   │   ├── inference/   # SafeModelLoader, InferenceEngine
│   │   ├── models/      # ModelExporter, ModelValidator
│   │   ├── schemas/     # Pydantic schemas (training, inference, execution)
│   │   └── training/    # PyTorchTrainer, CheckpointManager, TrainingPipeline
│   ├── tests/           # Automated pytest suite (22 passing tests)
│   └── main.py          # FastAPI application entrypoint
├── docker/              # Docker configurations (sandbox, ipfs, mongodb, nginx)
│   └── sandbox/         # Dockerfile and jupyter_server_config.py
├── knowledge/           # Complete Obsidian Knowledge Vault
└── README.md            # Master documentation
```

---

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Python**: `v3.12` or higher (for AI services)
- **Docker Desktop**: Installed and running (for containerized AI execution)
- **MetaMask**: Browser extension installed
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`)

---

## ⚙️ Installation Guide

```bash
# 1. Clone the repository
git clone https://github.com/shreyes-7/AIXchange.git
cd AIXchange

# 2. Install Blockchain dependencies
cd blockchain
npm install

# 3. Install Client dependencies
cd ../client
npm install

# 4. Install Server dependencies
cd ../server
npm install

# 5. Setup Python AI Services
cd ../python-services
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

## 🧪 Comprehensive Automated Test Suites

### 1. Smart Contract & Integration Test Suite (279 Tests)
```bash
cd blockchain
npx hardhat test
```
```text
  Blockchain API Integration: 9 passing
  Gas Benchmarking Suite: 12 passing
  Blockchain Monitoring & Fraud Detection: 15 passing
    - EventMonitor: 5 passing
    - TreasuryMonitor: 3 passing
    - FraudEngine: 7 passing
  RoyaltyEngine Smart Contract: 36 passing
  ProvenanceRegistry Smart Contract: 36 passing
  ModelRegistry Smart Contract: 41 passing
  Treasury Smart Contract: 14 passing
  LicenseRegistry Smart Contract: 32 passing
  PurchaseEngine Smart Contract: 30 passing
  DatasetRegistry Smart Contract: 26 passing
  AIXToken Smart Contract: 15 passing
  Wallet & Signature Utilities: 13 passing

  279 passing (8s)
```

### 2. Backend Server & Blockchain Analytics Test Suite (29 Tests)
```bash
cd server
node --test (Get-ChildItem tests/*.test.js).FullName
```
```text
  Blockchain Analytics HTTP API routes, controllers, and error handling: passing
  Contract configurations contain authoritative event ABIs for all 8 contracts: passing
  Event argument sanitizer converts BigInt values to precision-safe strings: passing
  Event normalizer correctly extracts domain fields across different contract events: passing
  Mongoose models enforce required uniqueness and checkpoint tracking indexes: passing
  Gas cost arithmetic preserves precision using integer BigInt calculations: passing
  Blockchain Analytics Joi validators accept valid requests and reject malformed input: passing
  Dataset & Review Validation (3 tests): passing
  Licensing System (6 tests): passing
  Purchase Engine (3 tests): passing
  Docker Sandbox Backend Orchestration (10 tests): passing

  29 passing (1.7s)
```

### 3. Python AI Execution & Sandbox Test Suite (22 Tests)
```bash
cd python-services
.\venv\Scripts\pytest tests/ -v
```
```text
  tests/test_api_execution.py::test_health_check_endpoint PASSED
  tests/test_api_execution.py::test_api_training_and_inference_flow PASSED
  tests/test_container_isolation.py::test_dockerfile_security_hardening PASSED
  tests/test_container_isolation.py::test_docker_security_spec_flags PASSED
  tests/test_container_isolation.py::test_container_to_container_workspace_isolation PASSED
  tests/test_docker_sandbox.py::test_workspace_provisioning PASSED
  tests/test_docker_sandbox.py::test_path_traversal_prevention PASSED
  tests/test_docker_sandbox.py::test_deterministic_cleanup PASSED
  tests/test_e2e_workflow.py::test_full_ai_sandbox_lifecycle PASSED
  tests/test_inference.py::test_safe_model_loader PASSED
  tests/test_inference.py::test_inference_prediction_single PASSED
  tests/test_inference.py::test_inference_prediction_batch PASSED
  tests/test_jupyter_runtime.py::test_jupyter_manager_lifecycle PASSED
  tests/test_model_export.py::test_model_export PASSED
  tests/test_model_export.py::test_model_validator_success PASSED
  tests/test_model_export.py::test_model_validator_corrupted_file PASSED
  tests/test_resource_limits.py::test_training_timeout_enforcement PASSED
  tests/test_resource_limits.py::test_resource_settings_bounds PASSED
  tests/test_training.py::test_dynamic_mlp_construction PASSED
  tests/test_training.py::test_pytorch_training_loop PASSED
  tests/test_training.py::test_checkpoint_rotation PASSED
  tests/test_training.py::test_training_cancellation PASSED

  22 passed in 4.5s
```

---

## 🚀 How to Run the Complete Platform Locally

### Terminal 1: Start Local Blockchain Node
```bash
cd blockchain
npx hardhat node
```
*Starts local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Terminal 2: Deploy Smart Contracts (Phases 3–10)
```bash
cd blockchain
# Option A: Deploy full platform stack through Phase 10 via Ignition
npx hardhat ignition deploy ignition/modules/Phase10.js --network localhost

# Option B: Deploy standalone RoyaltyEngine with on-chain smoke verification
npx hardhat run scripts/deployRoyaltyEngine.js --network localhost
```

### Terminal 3: Start the Backend Server
```bash
cd server
npm run dev
```
*Express API runs at `http://localhost:5000`. Swagger docs at `http://localhost:5000/api-docs`.*

### Terminal 4: Start the Frontend Client
```bash
cd client
npm run dev
```
*React marketplace launches at `http://localhost:5173`.*

### Terminal 5: Start the AI Sandbox Container
```bash
# Option A: Run via Docker Compose
docker compose -f docker/docker-compose.sandbox.yml up -d

# Option B: Run locally via Python
cd python-services
.\venv\Scripts\python.exe main.py
```
*AI Execution API runs at `http://localhost:8000/docs`, JupyterLab runs at `http://localhost:8888/lab?token=aixchange_sandbox_token`.*

---

## 📑 Service Ports & Endpoints

| Service | URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend Marketplace** | `http://localhost:5173` | React 19 UI (Catalog, Details, Registration) |
| **Backend REST API** | `http://localhost:5000/api/v1` | Express 5 Backend |
| **Backend Swagger Docs** | `http://localhost:5000/api-docs` | OpenAPI 3.0 Backend Documentation |
| **AI Execution API** | `http://localhost:8000/docs` | FastAPI AI Execution Contract Swagger |
| **AI Sandbox JupyterLab** | `http://localhost:8888/lab` | Isolated Interactive Jupyter Workspace |
| **Blockchain Node** | `http://127.0.0.1:8545` | Hardhat Local JSON-RPC Node (Chain ID `31337`) |

---

## 📄 License

This project is licensed under the MIT License. Developed as part of the **AIXchange** project.
