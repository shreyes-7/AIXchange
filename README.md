# AIXchange

**AIXchange** is a decentralized, blockchain-powered marketplace for AI datasets, machine learning models, and AI workflows. It establishes verifiable on-chain ownership, trustless licensing, atomic token-based settlement, automated royalty distribution, secure authentication, and decentralized storage for artificial intelligence assets.

---

## 🚀 Implemented Phases & System Architecture

AIXchange is engineered as a modular multi-service platform. Below is the complete status of all implemented phases across the **Blockchain**, **Backend**, **Frontend**, and **AI Services** layers.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          AIXchange Platform                            │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│  1. Foundation  │ 2. Auth & Web3  │ 3. Token Economy │ 4. Marketplace  │
│  5. Licensing   │ 6. Purchase Eng │ 7. Sandbox (WIP) │ 8. Models (WIP) │
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
- **Docker Orchestration**: `docker-compose.yml` for unified local containerized execution.

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
  - **Register Dataset (`/datasets/register`)**: Multi-step registration form with live marketplace card preview and interactive multi-stage transaction lifecycle modal (`CHECKING_WALLET` -> `WAITING_FOR_SIGNATURE` -> `SUBMITTED` -> `CONFIRMED`).
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
    - **Fee & Royalty Splits**: Deducts configurable platform fees (default 2.50% / 250 BPS) to `Treasury` and sends creator share to the licensor via OpenZeppelin `SafeERC20`.
    - **Entitlement Tracking**: Grants usage rights via `hasAccess(buyer, datasetId, licenseId)` without transferring underlying dataset ownership.
    - **Exclusivity Enforcement**: Auto-locks `EXCLUSIVE` licenses upon first purchase to reject subsequent buyers.
    - **Duplicate Prevention**: Blocks redundant purchases of active unexpired licenses.
    - **Security**: Built with OpenZeppelin `ReentrancyGuard`, `Pausable`, and checks-effects-interactions.
  - `IPurchaseEngine.sol`: Interface with access checks, purchase getters, and platform fee management.
- **Events**: `DatasetPurchased` and `RoyaltyTriggered` for backend indexers and royalty accounting.

---

## 🛠️ Repository Structure

```text
AIXchange/
├── blockchain/          # Solidity smart contracts, Hardhat tests, and deployment scripts
│   ├── contracts/
│   │   ├── governance/  # Treasury.sol
│   │   ├── interfaces/  # IAIXToken, IDatasetRegistry, ILicenseRegistry, IPurchaseEngine, ITreasury
│   │   ├── libraries/   # Structs.sol, Errors.sol, Events.sol
│   │   ├── licensing/   # LicenseRegistry.sol
│   │   ├── marketplace/ # PurchaseEngine.sol
│   │   ├── registry/    # DatasetRegistry.sol, ModelRegistry.sol
│   │   ├── tokens/      # AIXToken.sol
│   │   └── utils/       # AccessControl.sol
│   ├── ignition/        # Hardhat Ignition deployment modules (Phases 3-6)
│   ├── scripts/         # Standalone deployment and CLI scripts
│   └── test/            # 115 automated unit tests across all contract modules
├── client/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/  # Navbar, UI components
│   │   ├── pages/       # DatasetMarketplace, DatasetDetails, RegisterDataset, WalletTest
│   │   ├── services/    # Blockchain services (Ethers.js v6) and API clients
│   │   └── types/       # JSDoc type definitions and constants
├── server/              # Node.js + Express backend API services
│   └── src/
│       ├── config/      # Database, environment, logger, swagger
│       ├── controllers/ # Auth, wallet controllers
│       ├── middlewares/ # Auth, error, role, validation middlewares
│       ├── models/      # User, session models
│       ├── routes/      # Auth, wallet, health routes
│       └── services/    # Auth, wallet, email services
├── python-services/     # Python AI inference & evaluation services
├── database/            # Database schemas and seed data
├── docker-compose.yml   # Multi-service local orchestration
└── README.md            # Master documentation
```

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher (for AI services)
- **MetaMask**: Browser extension installed
- **MongoDB**: Local MongoDB instance or Docker-based MongoDB (`mongodb://localhost:27017`)
- **Git**: Installed and configured
- **Docker Desktop** (Optional, for containerized multi-service deployment)

---

## ⚙️ Installation Guide

Clone the repository and install dependencies for all subsystems:

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

# 5. Setup Python AI Services virtual environment
cd ../python-services
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

## 🔑 Environment Configuration

Each subsystem contains an `.env.example` template. Copy them to `.env`:

### 1. Blockchain (`blockchain/.env`)
```bash
cp blockchain/.env.example blockchain/.env
```
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_key
CHAIN_ID=31337
TOKEN_NAME=AIX Token
TOKEN_SYMBOL=AIX

AIX_TOKEN_ADDRESS=
TREASURY_ADDRESS=
DATASET_REGISTRY_ADDRESS=
LICENSE_REGISTRY_ADDRESS=
PURCHASE_ENGINE_ADDRESS=
```

### 2. Client (`client/.env`)
```bash
cp client/.env.example client/.env
```
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
VITE_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io

VITE_AIX_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_TREASURY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_DATASET_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_LICENSE_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
VITE_PURCHASE_ENGINE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
```

### 3. Server (`server/.env`)
```bash
cp server/.env.example server/.env
```
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/aixchange
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 🧪 Testing Smart Contracts

Run the complete automated unit test suite inside the `blockchain/` directory:

```bash
cd blockchain

# Compile all smart contracts
npx hardhat compile

# Run all 115 unit tests
npx hardhat test
```

### Expected Test Output:
```text
  Treasury Smart Contract: 12 passing
  LicenseRegistry Smart Contract: 32 passing
  PurchaseEngine Smart Contract: 30 passing
  DatasetRegistry Smart Contract: 26 passing
  AIXToken Smart Contract: 15 passing

  115 passing (4s)
```

---

## 🚀 How to Run the Project Locally

Follow these steps to run the complete local environment across all services:

### Terminal 1: Start Local Blockchain Node
```bash
cd blockchain
npx hardhat node
```
*Starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts (10,000 ETH each).*

### Terminal 2: Deploy Smart Contracts (Phases 3–6)
Deploy all contracts to the running local node:
```bash
cd blockchain

# Option A: Deploy via Hardhat Ignition Master Module (Phases 3, 4, 5, 6)
npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost

# Option B: Or run the standalone Phase 6 deployment script
npx hardhat run scripts/deployPurchaseEngine.js --network localhost
```

### Terminal 3: Start the Backend Server
```bash
cd server
npm run dev
```
*Express API runs at `http://localhost:5000`. Swagger API docs available at `http://localhost:5000/api-docs`.*

### Terminal 4: Start the Frontend Client
```bash
cd client
npm run dev
```
*React application launches at `http://localhost:5173`.*

### Terminal 5: Start Python AI Services (Optional)
```bash
cd python-services
# Activate virtual environment
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # Linux / macOS
python main.py
```
*FastAPI service runs at `http://localhost:8000`.*

---

## 🦊 Configuring MetaMask for Local Testing

1. Open your browser with MetaMask installed and navigate to `http://localhost:5173`.
2. Add a new custom network in MetaMask:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Import one of the private keys printed in **Terminal 1** (e.g. Account #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
4. Click **"Connect Wallet"** on the navbar to interact with the marketplace, register datasets, and test purchases!

---

## 📑 Command Cheat-Sheet

| Task | Command | Directory |
| --- | --- | --- |
| **Compile Contracts** | `npx hardhat compile` | `blockchain/` |
| **Run Blockchain Tests** | `npx hardhat test` | `blockchain/` |
| **Start Local Blockchain** | `npx hardhat node` | `blockchain/` |
| **Deploy All Contracts** | `npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost` | `blockchain/` |
| **Deploy Purchase Engine** | `npx hardhat run scripts/deployPurchaseEngine.js --network localhost` | `blockchain/` |
| **Start Frontend** | `npm run dev` | `client/` |
| **Build Frontend** | `npm run build` | `client/` |
| **Start Backend** | `npm run dev` | `server/` |
| **Start AI Service** | `python main.py` | `python-services/` |
| **Docker Multi-service** | `docker-compose up --build` | Root |

---

## 📄 License

This project is licensed under the MIT License. Developed as part of the **AIXchange** project.
