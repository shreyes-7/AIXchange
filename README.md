# AIXchange

**AIXchange** is a decentralized, blockchain-powered marketplace for AI datasets, machine learning models, and AI workflows. It establishes verifiable on-chain ownership, trustless licensing, atomic token-based settlement, automated royalty distribution, and decentralized storage for artificial intelligence assets.

---

## 🚀 What Has Been Built (Implemented Phases)

### 1. Blockchain Layer (`blockchain/`) — 100% Tested (115/115 Unit Tests)
- **Phase 3 — AIX Token Economy**:
  - `AIXToken.sol`: Native ERC-20 utility token ("AIXchange Token" / `AIX`, 18 decimals, 1 Billion supply, burnable, ownable minting).
  - `Treasury.sol`: Secure platform vault for holding AIX tokens and native ETH with access-controlled administrative withdrawals.
- **Phase 4 — Dataset Marketplace Registry**:
  - `DatasetRegistry.sol`: On-chain dataset registry managing verifiable IPFS Content Identifiers (CID), incremental dataset IDs, ownership mappings, metadata updates, active status toggling, and ownership transfers with $O(1)$ index tracking.
- **Phase 5 — Licensing System**:
  - `LicenseRegistry.sol`: Authoritative on-chain licensing registry supporting:
    - **License Types**: `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`.
    - **Pricing Models**: `FIXED` (AIX token units) and `ROYALTY` (basis points 0–10000 BPS, where 1000 = 10.00%).
    - **Rights & Restrictions**: Explicit boolean permissions (`canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, `canSublicense`) and restriction descriptions.
    - **Lifecycle & Validity**: Start/expiration timestamps (`validFrom`, `validUntil`), active validity checks (`isLicenseActive`), and revocation.
    - **Ownership Verification**: Direct integration with Phase 4's `DatasetRegistry.getDatasetOwner(assetId)`.
- **Phase 6 — Purchase Engine**:
  - `PurchaseEngine.sol`: Decentralized on-chain purchase settlement engine:
    - **Atomic Purchases**: Executes `purchaseDataset(datasetId, licenseId)` using AIX tokens.
    - **Authoritative Pricing**: Reads price directly from `LicenseRegistry.getLicensePricing(licenseId)`.
    - **Fee & Royalty Splits**: Deducts configurable platform fees (default 2.50% / 250 BPS) to `Treasury` and sends creator share to the licensor via OpenZeppelin `SafeERC20`.
    - **Entitlement Tracking**: Grants usage rights via `hasAccess(buyer, datasetId, licenseId)` without transferring underlying dataset ownership.
    - **Exclusivity Enforcement**: Auto-locks `EXCLUSIVE` licenses upon first purchase to reject subsequent buyers.
    - **Duplicate Prevention**: Blocks redundant purchases of active unexpired licenses.
    - **Security**: Built with OpenZeppelin `ReentrancyGuard`, `Pausable`, and checks-effects-interactions.
- **Hardhat Ignition & Deployment Modules**:
  - Standalone modules: `AIXToken.js`, `Treasury.js`, `DatasetRegistry.js`, `LicenseRegistry.js`, `PurchaseEngine.js`.
  - Master modules: `Phase3.js`, `Phase4.js`, `Phase5.js`, `Phase6.js`.
  - Deployment scripts: `deploy.js`, `deployDatasetRegistry.js`, `deployLicenseRegistry.js`, `deployPurchaseEngine.js`.

### 2. Frontend Client (`client/`)
- **Modern Web3 Application**: Built with React, Vite, and Tailwind CSS.
- **Blockchain Integration**: Integrated with `ethers.js` v6 for MetaMask wallet connection, network switching, and smart contract interaction.
- **Interactive UI Pages**:
  - **Dataset Marketplace (`/datasets` / `/`)**: Live on-chain catalog, metrics stats bar, search filter, license filter, IPFS preview modal, and gateway links.
  - **Dataset Details & Creator Controls (`/datasets/:id`)**: Comprehensive on-chain provenance record, IPFS link, active status badge, and an owner management panel (edit metadata, toggle active status, transfer ownership).
  - **Register Dataset (`/datasets/register`)**: Multi-step registration form with live marketplace card preview and interactive multi-stage transaction lifecycle modal (`CHECKING_WALLET` -> `WAITING_FOR_SIGNATURE` -> `SUBMITTED` -> `CONFIRMED`).
  - **Developer Wallet Dashboard (`/wallet-test`)**: Wallet authentication, signature verification, balance checks, and contract read tests.
  - **Navbar (`Navbar.jsx`)**: Sticky header with wallet connection state and navigation.

### 3. Backend & AI Services (In Progress)
- `server/`: Node.js + Express API layer for dataset indexing, authentication, and off-chain access token management.
- `python-services/`: Python FastAPI service for AI model inference and dataset evaluation workflows.

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
│   └── test/            # 115 automated unit tests
├── client/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/  # Navbar, UI components
│   │   ├── pages/       # DatasetMarketplace, DatasetDetails, RegisterDataset, WalletTest
│   │   ├── services/    # Blockchain services (Ethers.js v6) and API clients
│   │   └── types/       # JSDoc type definitions and constants
├── server/              # Node.js + Express backend API services
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

---

## 🧪 Testing Smart Contracts

Run the complete automated unit test suite inside the `blockchain/` directory:

```bash
cd blockchain

# Compile contracts
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

Follow these steps to run the complete local environment:

### Terminal 1: Start Local Hardhat Blockchain Node
```bash
cd blockchain
npx hardhat node
```
*This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Terminal 2: Deploy Smart Contracts (Phases 3–6)
Deploy all contracts to the running local node:
```bash
cd blockchain

# Option A: Deploy via Hardhat Ignition Master Module (Phases 3, 4, 5, 6)
npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost

# Option B: Or run the standalone Phase 6 deployment script
npx hardhat run scripts/deployPurchaseEngine.js --network localhost
```

### Terminal 3: Start the Frontend Client
```bash
cd client
npm run dev
```
*The React application will launch at `http://localhost:5173`.*

### Terminal 4: Start the Backend Server (Optional)
```bash
cd server
npm run dev
```
*The Express API will run at `http://localhost:5000`.*

### Terminal 5: Start Python AI Services (Optional)
```bash
cd python-services
# Activate virtual environment first
.\venv\Scripts\Activate.ps1
python main.py
```
*FastAPI services will run at `http://localhost:8000`.*

---

## 🦊 Configuring MetaMask for Local Testing

1. Open your browser with MetaMask installed and go to `http://localhost:5173`.
2. Add a new network in MetaMask:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Import one of the private keys printed in **Terminal 1** (e.g. Account #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
4. Click **"Connect Wallet"** on the AIXchange navbar to interact with the marketplace!

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
