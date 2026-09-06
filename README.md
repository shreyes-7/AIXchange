# AIXchange

**AIXchange** is a decentralized, blockchain-powered marketplace and execution substrate for artificial intelligence (AI) datasets, machine learning models, and automated AI workflows. It establishes verifiable on-chain asset ownership, trustless licensing, atomic cryptocurrency settlement using the native **AIX token**, decentralized IPFS storage, verifiable AI provenance, automated multi-party royalty distribution, real-time blockchain analytics, and containerized Docker execution sandboxes for secure model training, Jupyter development, and inference.

---

## 📖 Table of Contents

1. [Project Overview](#-1-project-overview)
   - [The Problem AIXchange Solves](#the-problem-aixchange-solves)
   - [Why AIXchange Exists](#why-aixchange-exists)
   - [Target Users & Value Proposition](#target-users--value-proposition)
   - [Core Concepts & Platform Economy](#core-concepts--platform-economy)
   - [What Makes AIXchange Different?](#what-makes-aixchange-different)
2. [Core Project Workflow](#-2-core-project-workflow)
   - [End-to-End System Lifecycle](#end-to-end-system-lifecycle)
   - [Execution Substrate Architecture: On-Chain vs. Off-Chain](#execution-substrate-architecture-on-chain-vs-off-chain)
3. [Architecture & Component Breakdown](#-3-architecture--component-breakdown)
   - [Directory Structure Matrix](#directory-structure-matrix)
   - [Component Catalog](#component-catalog)
4. [Environment Configuration](#-4-environment-configuration)
   - [Root Environment Template](#root-environment-template)
   - [Server Environment Configuration](#server-environment-configuration)
   - [Blockchain Environment Configuration](#blockchain-environment-configuration)
   - [AI Sandbox Environment Configuration](#ai-sandbox-environment-configuration)
5. [Local Setup & Execution Guide](#-5-local-setup--execution-guide)
   - [Prerequisites](#prerequisites)
   - [Step-by-Step Multi-Terminal Launch](#step-by-step-multi-terminal-launch)
6. [Automated Testing Suites](#-6-automated-testing-suites)
   - [1. Blockchain Smart Contracts & Integration (279 Tests)](#1-blockchain-smart-contracts--integration-279-tests)
   - [2. Backend Server & Engine Integrations (89 Tests)](#2-backend-server--engine-integrations-89-tests)
   - [3. Python AI Execution Substrate (22 Tests)](#3-python-ai-execution-substrate-22-tests)
   - [4. Sandbox Client SDK (10 Tests)](#4-sandbox-client-sdk-10-tests)
   - [On-Chain Gas Benchmarks](#on-chain-gas-benchmarks)
7. [Service Ports & API Reference](#-7-service-ports--api-reference)
   - [Service Port Matrix](#service-port-matrix)
   - [Core REST Endpoints](#core-rest-endpoints)
8. [Troubleshooting & Frequently Asked Questions](#-8-troubleshooting--frequently-asked-questions)

---

## 🌟 1. Project Overview

### The Problem AIXchange Solves
Modern artificial intelligence depends heavily on high-quality datasets and pre-trained weights. However, today's AI ecosystem suffers from deep structural issues:
1. **Lack of Verifiable Provenance**: Model developers rarely have cryptographic proof of the exact datasets, pipeline code, and hyperparameter environments used to train a model artifact.
2. **Centralized Data Exploitation**: Dataset creators and domain specialists upload proprietary data to centralized platforms without ongoing licensing controls, attribution, or guaranteed compensation.
3. **Opaque and Disconnected Royalty Flows**: When downstream models generate revenue or are commercialized, upstream data contributors receive zero residual royalties due to the absence of auditable lineage.
4. **Security Risks in AI Code Execution**: Executing user-submitted training scripts, Jupyter notebooks, or model pipelines exposes local infrastructure to malware, data exfiltration, and resource starvation.

### Why AIXchange Exists
AIXchange bridges the gap between decentralized finance (DeFi), smart contract registries, decentralized file storage (IPFS), and containerized AI execution environments. It guarantees that:
- Every dataset and model version has an **immutable, cryptographically verifiable identity**.
- Access rights and commercial licenses are enforced directly by **smart contracts** without intermediary platform lock-in.
- Payment settlements occur **atomically in AIX tokens**, with automated platform fee deductions and direct creator compensation.
- Upstream contributors can receive automated **multi-party royalty distributions** whenever derivative assets or downstream purchases transact.
- Model training and inference execute inside **hardened, unprivileged container sandboxes** that isolate compute and cryptographically hash all outputs.

### Target Users & Value Proposition

| User Role | Problems Faced | AIXchange Solution |
| :--- | :--- | :--- |
| **Dataset Creators** | Uncompensated data scraping, no license enforcement, lack of attribution. | Retain ownership on-chain, anchor metadata on IPFS, define granular licensing rights (Academic, Commercial, Exclusive), and earn automated royalties. |
| **AI Model Developers** | Untrusted data quality, difficulty proving model originality, complex monetization. | Purchase verified datasets via atomic token swaps, train models in isolated sandboxes, anchor artifact SHA-256 hashes on-chain, and register immutable provenance DAGs. |
| **AI Consumers & Businesses** | Opaque model lineage, legal uncertainty around training data copyright, unreliable inference. | Verify on-chain cryptographic provenance before purchasing or consuming models; run certified inference on verified model weights. |
| **Platform Operators & Auditors** | Fraudulent transfers, opaque treasury flows, platform abuse, financial manipulation. | Monitor on-chain events via real-time indexers, query gas and token analytics, and flag suspicious activities using a deterministic 5-rule fraud engine. |

### Core Concepts & Platform Economy

- **The Marketplace Concept**: AIXchange operates a two-sided decentralized marketplace. Creators register datasets with verifiable IPFS Content Identifiers (CIDs) and bind them to customizable licensing agreements. Buyers acquire non-custodial usage entitlements without transferring underlying dataset copyright.
- **The AIX Utility Token**: The economic engine of AIXchange is the **AIX Token** (`AIX`), an ERC-20 token built with OpenZeppelin standards. It features 18 decimals and a fixed initial supply of 1,000,000,000 AIX. All marketplace purchases, license grants, and royalty settlements are transacted in AIX.
- **Platform Treasury Vault**: Platform fees (default 2.50% / 250 basis points) from dataset sales and secondary distributions are automatically routed to the platform `Treasury` contract. The Treasury supports native ETH and ERC-20 token storage with strict owner-restricted withdrawals.
- **Blockchain-Backed Ownership**: Dataset and Model ownership is enforced by smart contract mappings. Creators can transfer ownership, update metadata URIs, or toggle active status with guaranteed $O(1)$ state lookups.
- **IPFS & Decentralized Storage**: Large dataset archives, training payloads, and model metadata are stored off-chain on IPFS (or local IPFS gateways). Only cryptographic content hashes (CIDs) and SHA-256 digests are stored on-chain, eliminating prohibitive gas costs while maintaining byte-for-byte data integrity.
- **AI Provenance DAG**: The `ProvenanceRegistry` establishes a Directed Acyclic Graph (DAG) linking a dataset (`datasetId`), execution environment (`executionId`), resulting model (`modelId`), model version (`modelVersion`), and metadata cryptographic commitment (`metadataHash`).
- **Automated Royalty Distribution**: The `RoyaltyEngine` contract allows creators to define multi-party revenue splits across up to 50 recipients using basis point allocations ($1 \text{ BPS} = 0.01\%$). Platform fees are deducted first, recipients are paid atomically, and integer rounding remainders are absorbed by the Treasury to guarantee strict zero-leakage accounting.
- **Blockchain Analytics & Event Indexing**: A robust indexing pipeline polls on-chain contract events across all 8 contracts, storing normalized logs in MongoDB with unique compound indexes for replay idempotency, tracking gas metrics and token velocity.
- **Monitoring & Fraud Detection**: The blockchain layer incorporates a deterministic 5-rule fraud engine that continuously evaluates on-chain transaction flows, identifying rapid bursts, whale transfers, treasury drains, anomalous royalties, and repeated execution failures.

### What Makes AIXchange Different?

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AIXchange Unique Value Matrix                         │
├──────────────────────────┬──────────────────────────────────────────────────────┤
│ Dual-Layer Architecture  │ Blockchain for trust/ownership + Containers for AI   │
├──────────────────────────┼──────────────────────────────────────────────────────┤
│ Zero-Weight On-Chain     │ Heavy weights (.safetensors/.pt) stay off-chain;     │
│ Integrity Anchoring      │ only SHA-256 hashes and metadata commitments live on │
│                          │ Ethereum to guarantee zero byte forgery.             │
├──────────────────────────┼──────────────────────────────────────────────────────┤
│ Atomic Settlement        │ Payment, 2.5% treasury fee deduction, and licensor   │
│                          │ payout occur in a single atomic transaction.         │
├──────────────────────────┼──────────────────────────────────────────────────────┤
│ Cryptographic Provenance │ Full pipeline lineage DAG (Data -> Code -> Model)    │
│                          │ queryable and verifiable directly on-chain.          │
├──────────────────────────┼──────────────────────────────────────────────────────┤
│ Hardened Sandboxes       │ Docker execution substrate enforces unprivileged     │
│                          │ user UID 1000, no-new-privileges, and tmpfs locks.   │
├──────────────────────────┼──────────────────────────────────────────────────────┤
│ Deterministic Fraud Rules│ Zero black-box ML; 5 transparent, explainable on-     │
│                          │ chain monitoring rules protect the Treasury.         │
└──────────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 🔄 2. Core Project Workflow

### End-to-End System Lifecycle

```text
[1. User & Wallet]
  │  Register account (MongoDB) & authenticate via EIP-191 personal_sign nonce
  ▼
[2. AIX Token Economy]
  │  Receive or transfer AIX utility tokens (ERC-20, 18 decimals)
  ▼
[3. Dataset Creation & Staging]
  │  Upload dataset files -> Calculate SHA-256 -> Pin to IPFS (obtain CID)
  ▼
[4. Dataset On-Chain Registration]
  │  Call DatasetRegistry.registerDataset(cid, license, royaltyBps) -> Get datasetId
  ▼
[5. Licensing Definition]
  │  Call LicenseRegistry.createLicense(datasetId, licenseType, pricingModel, rights, price, royaltyRate)
  ▼
[6. Atomic Marketplace Purchase]
  │  Buyer approves AIXToken -> Calls PurchaseEngine.purchaseDataset(datasetId, licenseId)
  │  ├── 2.50% Fee routed to Treasury.sol
  │  ├── 97.5% Payout routed to Dataset Licensor
  │  └── Immutable Access Entitlement recorded (hasAccess = true)
  ▼
[7. Sandbox AI Execution Substrate]
  │  Backend verifies hasAccess -> Stages code & data into /workspace (code/, data/, input/)
  │  FastAPI /train runs DynamicMLP under unprivileged aixuser (UID 1000)
  │  Generates checkpoints, exports model.safetensors / model.pt + model_metadata.json
  │  Computes SHA-256 artifact digest
  ▼
[8. Model On-Chain Registration]
  │  Call ModelRegistry.registerModel(name, metadataUri, modelHash) -> Get modelId
  │  Append new versions via addModelVersion(modelId, metadataUri, modelHash)
  ▼
[9. Provenance DAG Linkage]
  │  Call ProvenanceRegistry.registerProvenance(datasetId, executionId, modelId, version, metadataHash)
  │  On-chain composite key validation: keccak256(datasetId, executionId, modelId, version)
  ▼
[10. Model Inference]
  │  FastAPI /infer executes standalone predictions against verified model weights
  ▼
[11. Secondary Royalty Distribution]
  │  Call RoyaltyEngine.distributeRoyalty(...) or distributePurchaseRoyalty(purchaseId, recipients)
  │  Multi-recipient BPS splits settled in AIX; remainder rounding dust sent to Treasury
  ▼
[12. Continuous Indexing, Analytics & Fraud Detection]
  │  BlockchainAnalyticsIndexer saves normalized events & gas costs into MongoDB
  │  EventMonitor, TreasuryMonitor & FraudEngine evaluate 5 deterministic security rules
```

### Execution Substrate Architecture: On-Chain vs. Off-Chain

| Operation / Asset | Execution Substrate | Primary Storage / Engine | Cryptographic Guarantees |
| :--- | :--- | :--- | :--- |
| **User Identity & Auth** | Off-Chain & On-Chain | MongoDB + Node.js Express + Ethers.js | Web3 cryptographic signature verification (EIP-191) against server nonce |
| **Token Transfers & Treasury** | On-Chain | Ethereum Virtual Machine (EVM) | ERC-20 SafeERC20 balances, hardhat-tested access control |
| **Dataset Raw Files** | Off-Chain | Decentralized IPFS Storage | Immutable content addressing (CIDv0 / CIDv1) |
| **Dataset Ownership & Metadata** | On-Chain | `DatasetRegistry.sol` | Incremental IDs, $O(1)$ owner lookup, on-chain CID anchor |
| **License Terms & Rights** | On-Chain | `LicenseRegistry.sol` | Verifiable pricing (AIX tokens or BPS), boolean rights bitmask, expiration timestamps |
| **Payment Clearing & Entitlement** | On-Chain | `PurchaseEngine.sol` | Atomic checks-effects-interactions, reentrancy guards, exclusivity locks |
| **Training & Jupyter Execution** | Off-Chain Isolated Substrate | Docker Sandbox Container (`python-services`) | Non-root `aixuser` UID 1000, 4 CPU / 8GB RAM cgroups, tmpfs `/tmp:noexec`, zero network egress |
| **Model Weights (`.safetensors`, `.pt`)**| Off-Chain Storage | Local Workspace / S3 / IPFS | Byte-for-byte SHA-256 artifact checksum verification |
| **Model Version Identity** | On-Chain | `ModelRegistry.sol` | Append-only version history, on-chain hash verification (`verifyModelHash`) |
| **Lineage Relationship (DAG)** | On-Chain | `ProvenanceRegistry.sol` | Composite key duplicate prevention, on-chain `verifyProvenance` |
| **Model Inference API** | Off-Chain Server | FastAPI (`/api/v1/execution/infer`) | `SafeModelLoader` with `weights_only=True` execution protection |
| **Royalty Settlement** | On-Chain | `RoyaltyEngine.sol` | Immutable basis point accounting, zero dust loss, anti-replay hash checks |
| **Event Indexing & History** | Off-Chain Ingestion | MongoDB (`server/src/jobs`) | Compound unique index `{ transactionHash, logIndex }` ensuring idempotent replays |
| **Monitoring & Fraud Detection** | Off-Chain Engine | Node.js (`blockchain/monitoring`) | Deterministic mathematical rule evaluation across on-chain event streams |

---

## 🏛️ 3. Architecture & Component Breakdown

### Directory Structure Matrix

```text
AIXchange/
├── blockchain/          # Hardhat environment, Solidity ^0.8.28 contracts, deployment scripts & monitoring
├── client/              # React 19, Vite, Tailwind CSS SPA web frontend
├── database/            # Database migration scripts, Mongoose schemas, and seeders
├── docker/              # Docker configurations, sandbox images, and compose services
├── docs/                # Architectural diagrams, API specs, UML, meeting notes, and research papers
├── knowledge/           # Obsidian knowledge base documenting design decisions and technical specifications
├── python-services/     # Python 3.12 FastAPI execution substrate, PyTorch training, and inference
├── sandbox/             # @aixchange/sandbox client SDK and workspace staging package
├── scripts/             # System integration and live verification scripts
├── server/              # Node.js 22 + Express 5 REST API, Web3 controllers, models, and background indexers
├── shared/              # Shared cross-service constants, TypeScript/JSDoc types, and utilities
├── .env.example         # Master environment variables template
└── package.json         # Root package file for workspace linting and formatting
```

### Component Catalog

#### 1. Blockchain Layer (`blockchain/`)
Built with Solidity `^0.8.28`, Hardhat, OpenZeppelin Contracts, and Ethers.js v6.
- **`contracts/tokens/AIXToken.sol`**: ERC-20 utility token with 18 decimals, 1 Billion initial supply, burning, and owner-only minting.
- **`contracts/governance/Treasury.sol`**: Vault holding native ETH and ERC-20 tokens with `depositToken` (SafeERC20) and owner withdrawals.
- **`contracts/registry/DatasetRegistry.sol`**: Decentralized dataset catalog tracking IPFS CIDs, ownership, and active statuses.
- **`contracts/licensing/LicenseRegistry.sol`**: Flexible legal and economic terms registry (Academic, Commercial, Exclusive, Custom) with Fixed or Royalty pricing.
- **`contracts/marketplace/PurchaseEngine.sol`**: Atomic settlement engine splitting 2.50% platform fee to Treasury and 97.50% to licensors.
- **`contracts/registry/ModelRegistry.sol`**: Model identity and append-only version history anchoring SHA-256 weight digests on-chain.
- **`contracts/registry/ProvenanceRegistry.sol`**: Directed Acyclic Graph (DAG) tying datasets, executions, models, and metadata commitments on-chain.
- **`contracts/royalty/RoyaltyEngine.sol`**: Secondary multi-party revenue splitting engine with anti-replay hash protection and remainder dust absorption.
- **`monitoring/`**: Real-time Node.js event observation (`EventMonitor.js`), balance tracking (`TreasuryMonitor.js`), and deterministic fraud detection (`FraudEngine.js`).
- **`ignition/modules/`**: Hardhat Ignition declarative deployment modules for all contracts.
- **`test/`**: 279 automated tests across unit, integration, monitoring, and gas benchmarking suites.

#### 2. Backend Server (`server/`)
Built with Node.js 22, Express 5, Mongoose 9, Ethers.js v6, Joi, and Winston.
- **Authentication (`routes/auth.routes.js`, `routes/wallet.route.js`)**: Traditional bcrypt + JWT authentication alongside Web3 cryptographic nonce verification (EIP-191).
- **Marketplace & Registry APIs (`routes/dataset.route.js`, `routes/license.route.js`, `routes/purchase.route.js`)**: Endpoints managing off-chain dataset metadata, license attachments, purchase transaction synchronization, and file uploads via Multer.
- **Sandbox Orchestration (`routes/sandbox.route.js`)**: Verifies buyer access entitlements before provisioning local sandbox workspaces and dispatching tasks to FastAPI.
- **Blockchain Analytics (`routes/blockchain-analytics.routes.js`)**: Serves historical on-chain events, token transfer volumes, unique participant metrics, and gas consumption costs.
- **Background Jobs (`jobs/`)**: `blockchain-analytics.job.js` queries JSON-RPC logs across all 8 contracts, storing events in MongoDB with idempotent compound keys. `sandbox-monitor.job.js` synchronizes container execution progress.
- **Swagger Documentation (`config/swagger.js`)**: Interactive OpenAPI 3.0 UI mounted at `/api-docs` and `/api/v1/docs`.

#### 3. Web Client (`client/`)
Built with React 19, Vite, Tailwind CSS, and Ethers.js v6.
- **Dataset Marketplace (`pages/DatasetMarketplace.jsx`)**: Live catalog displaying datasets, licensing terms, pricing filters, search, and IPFS preview modals.
- **Dataset Details (`pages/DatasetDetails.jsx`)**: Deep-dive view showing dataset metadata, creator controls, active status toggles, and purchase triggers.
- **Register Dataset (`pages/RegisterDataset.jsx`)**: Multi-step creator onboarding wizard for uploading files, specifying licensing, and executing on-chain registration.
- **Wallet Developer Dashboard (`pages/WalletTest.jsx`)**: Interactive sandbox for testing MetaMask connections, network switching, nonce signing, and AIX token transfers.
- **Blockchain Services (`services/blockchain/`)**: Client-side Ethers.js wrappers interfacing with `AIXToken`, `DatasetRegistry`, `LicenseRegistry`, and `PurchaseEngine`.

#### 4. Python AI Services & Execution Substrate (`python-services/`)
Built with Python 3.12, FastAPI, PyTorch, Safetensors, and Pydantic.
- **API Router (`app/api/execution.py`)**: Endpoints implementing the AI Execution Contract (`/train`, `/infer`, `/validate-model`, `/jupyter/*`, `/{execution_id}/status`).
- **PyTorch Training Loop (`app/training/trainer.py`)**: Implements `DynamicMLP` neural network training with Adam/AdamW/SGD/RMSprop optimizers, StepLR schedulers, gradient clipping, and live metrics emission.
- **Checkpoint Manager (`app/training/checkpoint.py`)**: Top-$k$ lowest-loss atomic model checkpoint persistence.
- **Model Exporter (`app/models/exporter.py`)**: Exports weights to Hugging Face `.safetensors` and PyTorch `.pt` formats while generating `model_metadata.json` with execution lineage.
- **Model Validator (`app/models/validator.py`)**: Validates SHA-256 checksums, enforces safe weight loading (`weights_only=True`), and performs dummy tensor forward-pass smoke tests.
- **Inference Engine (`app/inference/engine.py`)**: Standalone, low-latency prediction engine with probability scoring.
- **JupyterLab Manager (`app/core/jupyter.py`)**: Programmatically spins up and tears down token-authenticated JupyterLab instances locked to `/workspace`.

#### 5. Sandbox Client SDK (`sandbox/`)
ES module npm package (`@aixchange/sandbox`) that provides an interface between the Express backend and the Python execution engine.
- **`SandboxClient`**: Typed HTTP client for dispatching training, fetching status, and controlling JupyterLab.
- **`WorkspaceLayout`**: Deterministic directory hierarchy generator creating `code/`, `data/`, `input/`, `output/`, and `checkpoints/`.
- **`stageWorkspaceFiles`**: Secure file copy utility with strict path-traversal prevention (`validateContainedPath`).

#### 6. Docker & Infrastructure (`docker/`)
- **`docker/sandbox/Dockerfile`**: Hardened container running Python 3.12, PyTorch, JupyterLab, and the execution API under non-root user `aixuser` (UID 1000).
- **`docker/docker-compose.sandbox.yml`**: Resource-capped service definition enforcing limits: 4 CPUs, 8GB RAM, 100 PIDs, `no-new-privileges:true`, and `tmpfs` `/tmp:noexec,nosuid,size=512m`.

#### 7. Shared Libraries, Database & Documentation (`shared/`, `database/`, `docs/`, `knowledge/`)
- **`shared/`**: Common status enums, execution states, error constants, and TypeScript/JSDoc types.
- **`database/`**: Mongoose schemas and seed scripts for initial deployment.
- **`docs/` & `knowledge/`**: Comprehensive system documentation, sequence diagrams, and architecture specifications.

---

## ⚙️ 4. Environment Configuration

### Root Environment Template
Create a master `.env` file in the project root:

```bash
cp .env.example .env
```

```ini
# Environment
NODE_ENV=development

# Express Backend Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/aixchange
JWT_SECRET=replace-with-a-secure-secret-32-chars-minimum
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Blockchain & RPC
ETH_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your-wallet-private-key
ETH_NETWORK=localhost
BLOCKCHAIN_CONFIRMATIONS=1

# IPFS & Storage
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=https://ipfs.io/ipfs

# AI Services & Sandboxes
MODEL_API_URL=http://localhost:8000
WORKSPACE_ROOT_DIR=./workspaces
```

### Server Environment Configuration (`server/.env`)
Ensure `server/.env` contains the required database, JWT, and contract addresses (populated after contract deployment):

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aixchange
ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337
AIX_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TREASURY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
DATASET_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
MODEL_REGISTRY_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
PROVENANCE_REGISTRY_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
ROYALTY_ENGINE_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
BLOCKCHAIN_CONFIRMATIONS=1
BLOCKCHAIN_START_BLOCK=0
```

### Blockchain Environment Configuration (`blockchain/.env`)
```ini
HARDHAT_NETWORK=localhost
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
SEPOLIA_PRIVATE_KEY=your-private-key-without-0x
REPORT_GAS=true
```

### AI Sandbox Environment Configuration (`python-services/.env`)
```ini
AI_SERVICE_PORT=8000
JUPYTER_PORT=8888
JUPYTER_TOKEN=aixchange_sandbox_token
WORKSPACE_DIR=./workspaces
LOG_LEVEL=INFO
MAX_TRAINING_EPOCHS=1000
DEFAULT_TIMEOUT_SECONDS=3600
```

---

## 🚀 5. Local Setup & Execution Guide

### Prerequisites
Before running AIXchange, verify that your machine has the following tools installed:
- **Node.js**: `v20.0.0` or higher (Node 22 recommended)
- **npm**: `v10.0.0` or higher
- **Python**: `v3.12` or higher
- **MongoDB**: `v6.0` or higher (running locally on port `27017`)
- **Docker Desktop**: Running with WSL2 or native Linux containers (for sandbox execution)
- **MetaMask Browser Extension**: Configured for local development

### Step-by-Step Multi-Terminal Launch

Follow this sequence across separate terminal windows to launch the entire AIXchange platform:

```text
Terminal 1: Blockchain Node  ──►  Terminal 2: Contract Deployment
                                          │
    ┌─────────────────────────────────────┴─────────────────────────────────────┐
    ▼                                     ▼                                     ▼
Terminal 3: Express Server           Terminal 4: React Client             Terminal 5: AI Sandbox
```

#### Terminal 1: Start the Local Blockchain Node
```bash
cd blockchain
npx hardhat node
```
*Starts a local Ethereum JSON-RPC node at `http://127.0.0.1:8545` (Chain ID `31337`) with 20 pre-funded accounts (10,000 ETH each).*

#### Terminal 2: Deploy All Smart Contracts
In a new terminal, compile and deploy the smart contracts to the local network:
```bash
cd blockchain

# Option A: Deploy complete stack through Phase 10 via Hardhat Ignition
npx hardhat ignition deploy ignition/modules/Phase10.js --network localhost

# Option B: Run gas benchmarks and deploy standalone contracts
npx hardhat run scripts/runGasBenchmark.js --network localhost
```
*Take note of the deployed contract addresses printed to the console and ensure they match your configuration in `server/src/config/contracts.config.js`.*

#### Terminal 3: Start the Backend Express Server
```bash
cd server
npm install
npm run dev
```
*Express API initializes at `http://localhost:5000`. Connects to MongoDB, starts background indexers, and serves OpenAPI Swagger docs at `http://localhost:5000/api-docs`.*

#### Terminal 4: Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*Vite compiles and serves the React application at `http://localhost:5173`. Open your browser and navigate to the UI.*

#### Terminal 5: Start the AI Execution Substrate
You can run the AI execution environment using Docker Compose (recommended) or as a native Python service:

```bash
# Option A: Run via Docker Compose (Isolated Container)
docker compose -f docker/docker-compose.sandbox.yml up -d

# Option B: Run Native Python FastAPI Service
cd python-services
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*FastAPI AI execution endpoints are available at `http://localhost:8000/docs`. The JupyterLab workspace is accessible at `http://localhost:8888/lab?token=aixchange_sandbox_token`.*

---

## 🧪 6. Automated Testing Suites

AIXchange maintains rigorous automated test suites across all layers of the architecture, spanning Solidity contracts, Express services, FastAPI controllers, and client SDKs.

### 1. Blockchain Smart Contracts & Integration (279 Tests)
```bash
cd blockchain
npx hardhat test
```
```text
  Blockchain API Integration
    ✔ Should complete end-to-end user lifecycle from wallet to royalty distribution
    ✔ Should enforce OpenAPI/Swagger schema patterns on on-chain values
    ✔ (7 additional integration test scenarios)

  Gas Benchmarking Suite
    ✔ AIXToken.transfer gas consumption within budget
    ✔ AIXToken.approve gas consumption within budget
    ✔ Treasury.depositToken gas consumption within budget
    ✔ Treasury.withdrawToken gas consumption within budget
    ✔ DatasetRegistry.registerDataset gas consumption within budget
    ✔ DatasetRegistry.updateDataset gas consumption within budget
    ✔ LicenseRegistry.createLicense gas consumption within budget
    ✔ ModelRegistry.registerModel gas consumption within budget
    ✔ ModelRegistry.addModelVersion gas consumption within budget
    ✔ PurchaseEngine.purchaseDataset gas consumption within budget
    ✔ RoyaltyEngine.distributeRoyalty gas consumption within budget
    ✔ ProvenanceRegistry.registerProvenance gas consumption within budget

  Blockchain Monitoring & Fraud Detection (15 Tests)
    EventMonitor: 5 passing
    TreasuryMonitor: 3 passing
    FraudEngine: 7 passing (Rapid Txs, Whale Transfers, Treasury Outflows, Anomalies, Probing)

  Smart Contract Unit Suites
    RoyaltyEngine Smart Contract: 36 passing
    ProvenanceRegistry Smart Contract: 36 passing
    ModelRegistry Smart Contract: 41 passing
    Treasury Smart Contract: 14 passing
    LicenseRegistry Smart Contract: 32 passing
    PurchaseEngine Smart Contract: 30 passing
    DatasetRegistry Smart Contract: 26 passing
    AIXToken Smart Contract: 15 passing
    Wallet & Signature Utilities: 13 passing

  279 passing (9s)
```

### 2. Backend Server & Engine Integrations (89 Tests)
```bash
cd server
npm test
```
```text
  ✔ Blockchain Analytics HTTP API routes, controllers, and error handling (7 tests)
  ✔ Dataset & Review Validation (3 tests)
  ✔ Licensing System (6 tests)
  ✔ Purchase Engine & Indexer (3 tests)
  ✔ Docker Sandbox Backend Orchestration (10 tests)
  ✔ Model Marketplace & Blockchain Integration (10 tests)
  ✔ Provenance Engine, DAG, Timelines & Verification (10 tests)
  ✔ Royalty Engine Accounting, Calldata & Reconciliation (16 tests)
  ✔ Backend Analytics Unit Tests: Validators, ISO-8601 Week, Sanitized Errors (7 tests)
  ✔ Backend Analytics HTTP REST APIs: Auth, Validation, Contracts (8 tests)
  ✔ Backend Analytics E2E Repository & Aggregation Battery (6 tests)
  ✔ Full regression battery across all previous phases (3 tests)

  89 passing (21.7s)
```

### 3. Python AI Execution Substrate (22 Tests)
```bash
cd python-services
pytest tests/ -v
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

### 4. Sandbox Client SDK (10 Tests)
```bash
cd sandbox
node --test tests/client.test.js tests/workspace.test.js
```
```text
  ✔ SandboxClient.train sends POST request and returns ExecutionResponse
  ✔ SandboxClient.getStatus retrieves execution status
  ✔ SandboxClient handles AI service errors with AIExecutionError
  ✔ SandboxClient wraps network connection drops in ConnectionError
  ✔ SandboxClient Jupyter start, stop, and status lifecycle
  ✔ WorkspaceLayout generates complete directory hierarchy paths
  ✔ sanitizeExecutionId accepts valid IDs and rejects unsafe inputs
  ✔ validateContainedPath strictly blocks path traversal escapes
  ✔ getWorkspaceDestinationForCategory routes to appropriate workspace directories
  ✔ stageWorkspaceFiles creates workspace and copies files to correct subdirectories

  10 passing (110ms)
```

### On-Chain Gas Benchmarks
Gas usage measured across 12 core operations on a local Hardhat node via `scripts/runGasBenchmark.js`:

| Contract & Operation | Actual Gas Used | Safety Budget Limit | Status |
| :--- | :--- | :--- | :--- |
| `AIXToken.transfer` | **51,610** | < 70,000 | PASS |
| `AIXToken.approve` | **46,394** | < 60,000 | PASS |
| `Treasury.depositToken` | **57,594** | < 100,000 | PASS |
| `Treasury.withdrawToken` | **43,254** | < 70,000 | PASS |
| `DatasetRegistry.registerDataset` | **280,498** | < 350,000 | PASS |
| `DatasetRegistry.updateDataset` | **47,612** | < 90,000 | PASS |
| `LicenseRegistry.createLicense` | **386,427** | < 450,000 | PASS |
| `ModelRegistry.registerModel` | **443,495** | < 500,000 | PASS |
| `ModelRegistry.addModelVersion` | **208,402** | < 250,000 | PASS |
| `PurchaseEngine.purchaseDataset` | **482,112** | < 600,000 | PASS |
| `RoyaltyEngine.distributeRoyalty` | **641,770** | < 750,000 | PASS |
| `ProvenanceRegistry.registerProvenance` | **483,396** | < 600,000 | PASS |

---

## 📑 7. Service Ports & API Reference

### Service Port Matrix

| Service | Port / Base URL | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React 19 + Vite | Marketplace catalog, creator tools, wallet tester |
| **Backend REST API** | `http://localhost:5000/api/v1` | Express 5 + Node.js 22 | Main API gateway, authentication, and indexers |
| **OpenAPI / Swagger** | `http://localhost:5000/api-docs` | Swagger UI Express | Interactive API testing documentation |
| **AI Execution Substrate** | `http://localhost:8000` | FastAPI + Python 3.12 | PyTorch training, model inference, validation |
| **FastAPI Swagger Docs** | `http://localhost:8000/docs` | Swagger UI | Execution contract API specification |
| **JupyterLab Workspace** | `http://localhost:8888/lab` | JupyterLab | Isolated interactive data science sandbox |
| **Local Blockchain Node** | `http://127.0.0.1:8545` | Hardhat Network | EVM JSON-RPC provider (Chain ID `31337`) |
| **MongoDB Database** | `mongodb://localhost:27017`| MongoDB 6.0+ | Document database storing users, jobs, & event logs |

### Core REST Endpoints

#### Authentication & Wallet (`/api/v1/auth`, `/api/v1/wallet`)
- `POST /api/v1/auth/register` — Register email/password user account.
- `POST /api/v1/auth/login` — Authenticate user and receive JWT.
- `GET  /api/v1/auth/wallet/nonce?address=0x...` — Generate cryptographic nonce for EIP-191 personal sign.
- `POST /api/v1/auth/wallet/verify` — Verify signature and link Ethereum wallet.

#### Dataset & Marketplace APIs (`/api/v1/datasets`, `/api/v1/licenses`, `/api/v1/purchases`)
- `GET  /api/v1/datasets` — Paginated catalog of public datasets with IPFS CIDs.
- `POST /api/v1/datasets` — Register off-chain dataset metadata and upload files.
- `GET  /api/v1/datasets/:id` — Detailed dataset information and owner records.
- `POST /api/v1/licenses` — Attach commercial or academic licensing terms to a dataset.
- `POST /api/v1/purchases` — Record on-chain purchase transaction receipt and verify entitlement.
- `GET  /api/v1/purchases/status/:txHash` — Check purchase status by transaction hash.

#### AI Sandbox Execution (`/api/v1/sandboxes`)
- `POST /api/v1/sandboxes` — Provision a sandbox execution workspace (requires verified license access).
- `POST /api/v1/sandboxes/:id/train` — Dispatch PyTorch training pipeline configuration.
- `GET  /api/v1/sandboxes/:id/status` — Query training epoch metrics, loss curves, and artifact paths.
- `POST /api/v1/sandboxes/:id/jupyter/start` — Spin up a secured JupyterLab instance.

#### Blockchain Analytics (`/api/v1/analytics/blockchain`)
- `GET /api/v1/analytics/blockchain/overview` — High-level network transaction count, event volume, AIX velocity, and gas costs.
- `GET /api/v1/analytics/blockchain/events` — Paginated log explorer with filtering by contract, event name, block range, and sender.
- `GET /api/v1/analytics/blockchain/token` — AIX token transfer volume, unique participant metrics, and categorized spending.
- `GET /api/v1/analytics/blockchain/gas` — Gas usage, cost in wei/ETH, contract breakdown, and time aggregation.

#### Model Marketplace (`/api/v1/models`)
- `GET  /api/v1/models` — Paginated catalog of public models with framework/task filters.
- `POST /api/v1/models` — Register off-chain model metadata and generate preparation calldata.
- `GET  /api/v1/models/:id` — Detailed model information and version history.
- `POST /api/v1/models/:id/versions` — Register additional model version with weights hash.
- `POST /api/v1/models/:id/verify-hash` — Cryptographic hash verification against on-chain anchor.

#### Provenance Engine (`/api/v1/provenance`)
- `POST /api/v1/provenance` — Prepare zero-custody transaction for registering dataset-to-model lineage.
- `POST /api/v1/provenance/sync` — Verify on-chain registration receipt and project into database.
- `GET  /api/v1/provenance/:id` — Retrieve single provenance record with optional timeline enrichment.
- `GET  /api/v1/provenance/graph/:modelId` — Directed Acyclic Graph (DAG) showing nodes and edges.
- `GET  /api/v1/provenance/timeline/:modelId` — Chronological milestone timeline from dataset to deployment.
- `POST /api/v1/provenance/:id/verify` — Cryptographically verify dataset, model, and metadata integrity.

#### Royalty Engine (`/api/v1/royalties`)
- `GET  /api/v1/royalties/distributions/:distributionId` — Retrieve single distribution record from MongoDB.
- `GET  /api/v1/royalties/distributions/:distributionId/allocations` — Retrieve recipient allocations with percentage splits.
- `GET  /api/v1/royalties/recipients/:address` — Retrieve total claimed earnings and distribution history for a recipient.
- `GET  /api/v1/royalties/source/:sourceType/:sourceId` — Check if a dataset or model has distributed royalties.
- `GET  /api/v1/royalties/history` — Paginated distribution history with filters (`recipient`, `sourceType`, `status`, `dateRange`).
- `GET  /api/v1/royalties/summary` — Aggregate financial metrics (total distributed, platform treasury share, active recipients).
- `GET  /api/v1/royalties/reports` — Multi-dimensional reporting grouped by recipient, source, or time interval.
- `POST /api/v1/royalties/calculate-split` — Preview revenue split calculations without modifying on-chain state.
- `POST /api/v1/royalties/prepare` — Zero-custody calldata encoding for `distributeRoyalty` (JWT authenticated).
#### Backend Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/overview` — High-performance single-pass executive KPI summary across all 5 dimensions.
- `GET /api/v1/analytics/revenue` — Off-chain confirmed marketplace revenue, platform fees, creator splits, and ISO-8601 UTC time-series.
- `GET /api/v1/analytics/transactions` — Marketplace purchase transaction volume, status breakdown (CONFIRMED/PENDING/FAILED), and audit log.
- `GET /api/v1/analytics/downloads` — Dataset download volume, failure status, unique downloaders, top datasets, and trends.
- `GET /api/v1/analytics/api-calls` — AI model inference execution metrics, average latency, sanitized error categorization, and trends.
- `GET /api/v1/analytics/users` — User lifecycle, registration growth, verification statistics, and historically verifiable active users.

---

## 🛠️ 8. Troubleshooting & Frequently Asked Questions

### 1. MetaMask "Nonce Too High" or "Nonce Mismatch" Error
- **Cause**: Restarting `npx hardhat node` resets the local blockchain's transaction count to 0, while MetaMask remembers the higher nonce from your previous session.
- **Solution**: In MetaMask, go to **Settings** -> **Advanced** -> Click **Clear activity and nonce data** (or **Reset Account**). This resets the transaction history cache for the local network without affecting your private keys.

### 2. MetaMask Fails to Connect to Localhost
- **Cause**: Network settings in MetaMask do not match the Hardhat RPC parameters.
- **Solution**: Configure the custom network manually in MetaMask:
  - **Network Name**: Hardhat Localhost
  - **RPC URL**: `http://127.0.0.1:8545`
  - **Chain ID**: `31337`
  - **Currency Symbol**: `ETH`

### 3. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause**: Local MongoDB service is stopped or not listening on port 27017.
- **Solution**:
  - **Windows**: Open `services.msc`, locate **MongoDB Server**, and click **Start**. Alternatively, run `mongod --dbpath <data-path>` in PowerShell.
  - **Linux / macOS**: Run `sudo systemctl start mongod` or `brew services start mongodb-community`.

### 4. Docker Sandbox Permission Denied / Path Mounting Issues
- **Cause**: Windows file permissions or Docker Desktop file-sharing settings prevent mounting the workspace directory.
- **Solution**:
  - In Docker Desktop, open **Settings** -> **Resources** -> **File Sharing** -> Ensure your project drive (e.g., `D:\`) is enabled.
  - The container runs under user `aixuser` (UID 1000). If running on Linux, ensure local permissions allow UID 1000 read/write access:
    ```bash
    chmod -R 775 workspaces/
    ```

### 5. Python Virtual Environment Activation Policy on Windows
- **Cause**: PowerShell restricts executing scripts by default (`PSSecurityException`).
- **Solution**: In an elevated PowerShell terminal, update the execution policy for your current user:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 6. Integer Arithmetic & BigInt Precision in JavaScript
- **Cause**: JavaScript's native `Number` type loses precision above $2^{53} - 1$, causing rounding corruption on 18-decimal token base units (e.g., $10^{18}$).
- **Solution**: AIXchange strictly uses native `BigInt` for all token, wei, and basis point calculations across the server, blockchain scripts, and indexers. BigInt values are converted to precision-safe decimal strings before JSON serialization in REST responses.

---

## 📄 License & Attribution

This project is licensed under the **MIT License**. Developed as part of the **AIXchange** decentralized AI infrastructure platform.
