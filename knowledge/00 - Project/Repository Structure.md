# Repository Structure

This document outlines the directory structure of the **AIXchange** repository, detailing the purpose and actual contents of each folder.

```text
AIXchange/
├── blockchain/          # Smart contracts, Hardhat test suite, and Ignition modules
├── client/              # React 19 + Vite + Tailwind CSS frontend application
├── database/            # Database schema & migration placeholders
├── docker/              # Docker service configurations
├── docs/                # Project documentation and architectural records
├── knowledge/           # Obsidian Knowledge Base vault (Root documentation)
├── python-services/     # Python AI workflows and requirements
├── sandbox/             # Development scratchpad
├── scripts/             # Root utility scripts
├── server/              # Node.js + Express 5 backend API & Mongoose models
├── shared/              # Shared types and constants
├── docker-compose.yml   # Multi-container orchestration (Empty 0 bytes)
├── package.json         # Workspace dev dependencies (ESLint, Prettier, Husky)
├── README.md            # Master repository README
└── .env.example         # Root environment variables template
```

---

## Directory Breakdown

### 1. `blockchain/`
The core decentralized settlement layer.
- `contracts/`: Solidity source files (`^0.8.28`):
  - `governance/`: [[Token Economy|Treasury.sol]]
  - `interfaces/`: `IAIXToken.sol`, `IDatasetRegistry.sol`, `ILicenseRegistry.sol`, `IPurchaseEngine.sol`, `ITreasury.sol`, `IMarketplace.sol` (stub), `IModelRegistry.sol` (stub), `IRoyaltyEngine.sol` (stub).
  - `libraries/`: `Structs.sol`, `Errors.sol`, `Events.sol`.
  - `licensing/`: [[Licensing System|LicenseRegistry.sol]].
  - `marketplace/`: [[Purchase Engine|PurchaseEngine.sol]], `Marketplace.sol` (stub).
  - `registry/`: [[Dataset Marketplace|DatasetRegistry.sol]], `ModelRegistry.sol` (stub).
  - `tokens/`: [[Token Economy|AIXToken.sol]].
  - `utils/`: `AccessControl.sol`.
- `ignition/modules/`: Hardhat Ignition deployment modules (`AIXToken.js`, `Treasury.js`, `DatasetRegistry.js`, `LicenseRegistry.js`, `PurchaseEngine.js`, `Phase3.js`, `Phase4.js`, `Phase5.js`, `Phase6.js`).
- `scripts/`: Standalone scripts (`deploy.js`, `deployDatasetRegistry.js`, `deployLicenseRegistry.js`, `deployPurchaseEngine.js`, `mint.js`, `transfer.js`, `balance.js`).
- `test/`: 115 automated unit tests across 5 test suites.
- `hardhat.config.js`: Hardhat configuration with Solidity compiler settings, networks, and optimizer.

### 2. `client/`
The user interface layer built with Vite and React 19.
- `src/pages/`:
  - `DatasetMarketplace.jsx`: Dataset catalog, search, license filters, and IPFS preview modal.
  - `DatasetDetails.jsx`: Full provenance card, IPFS link, creator controls (metadata update, status toggle, ownership transfer).
  - `RegisterDataset.jsx`: Multi-step dataset registration wizard and transaction progress modal.
  - `WalletTest.jsx`: Developer wallet diagnostic testbed.
- `src/components/`: `Navbar.jsx` (Navigation bar with wallet connection state).
- `src/services/`:
  - `api/datasetApi.service.js`: REST API client for backend dataset routes.
  - `blockchain/dataset/`: Ethers v6 service and ABI for DatasetRegistry.
  - `blockchain/token/`: Ethers v6 service and ABI for AIXToken.
  - `blockchain/wallet/`: MetaMask provider, signer, network switching, nonce generator, and verifier services.
- `src/types/`: `dataset.types.js` (JSDoc schema definitions).

### 3. `server/`
The backend API server built with Express 5 and Mongoose.
- `src/config/`: `database.js` (MongoDB connection), `env.js` (Env validation), `logger.js` (Winston), `swagger.js` (OpenAPI specs), `blockchain.js`, `purchase-abi.js`.
- `src/controllers/`: `auth.controller.js`, `wallet.controller.js`, `dataset.controller.js`, `license.controller.js`, `purchase.controller.js`, `token.controller.js`.
- `src/models/`: `user.model.js`, `session.model.js`, `dataset.model.js`, `license.model.js`, `purchase.model.js`, `transaction.model.js`, `indexer-state.model.js`.
- `src/repositories/`: Repository layer abstracting database queries (`user.repository.js`, `session.repository.js`, `license.repository.js`, `purchase.repository.js`, `transaction.repository.js`, `indexer-state.repository.js`).
- `src/routes/`: `index.js`, `auth.routes.js`, `wallet.route.js`, `dataset.route.js`, `license.route.js`, `purchase.route.js`, `token.route.js`, `health.routes.js`, `dashboard.route.js`, `treasury.route.js`.
- `src/services/`: Business logic services (`auth.service.js`, `wallet.service.js`, `dataset.service.js`, `license.service.js`, `licenseBlockchain.service.js`, `purchase.service.js`, `purchaseBlockchain.service.js`, `token.service.js`, `access-control.service.js`, `download.service.js`, `email.service.js`).
- `src/jobs/`: Blockchain event indexers (`license-event-indexer.js`, `purchase-event-indexer.js`, `token-event-indexer.js`).
- `src/middlewares/`: `auth.middleware.js`, `role.middleware.js`, `validation.middleware.js`, `error.middleware.js`, `requestLogger.middleware.js`, `notFound.middleware.js`, `dataset-access.middleware.js`.
- `src/validators/`: Joi payload validation schemas (`auth.validator.js`, `wallet.validator.js`, `dataset.validator.js`, `license.validator.js`, `purchase.validator.js`, `token.validator.js`).

### 4. `python-services/`
Python AI services workspace.
- `requirements.txt`: 130 pinned Python dependencies (PyTorch, Uvicorn, NumPy, etc.).
- `app/`: Scaffolded package directories (`api`, `core`, `evaluation`, `inference`, `models`, `pipelines`, `schemas`, `training`, `utils`) containing `.gitkeep` files.
- `tests/`: Test directory containing `.gitkeep`.

### 5. Auxiliary Directories
- `database/`: Contains `.gitkeep` placeholders in `migrations/`, `schemas/`, `seeders/`.
- `docker/`: Contains `.gitkeep` placeholders in `ipfs/`, `mongodb/`, `nginx/`.
- `docs/`: Contains `README.md` and `.gitkeep` in subfolders (`api/`, `architecture/`, `contracts/`, `database/`, etc.).
- `sandbox/`: Contains `.gitkeep`.
- `scripts/`: Contains `.gitkeep`.
- `shared/`: Contains `.gitkeep` in `constants/`, `types/`, `utils/`.
