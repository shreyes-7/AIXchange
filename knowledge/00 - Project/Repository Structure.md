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
- `src/controllers/`: `auth.controller.js`, `wallet.controller.js`, `dataset.controller.js`, `license.controller.js`, `purchase.controller.js`, `token.controller.js`, `sandbox.controller.js`.
- `src/models/`: `user.model.js`, `session.model.js`, `dataset.model.js`, `license.model.js`, `purchase.model.js`, `transaction.model.js`, `indexer-state.model.js`, `sandbox.model.js`, `sandbox-file.model.js`, `execution-event.model.js`.
- `src/repositories/`: Repository layer abstracting database queries (`user.repository.js`, `session.repository.js`, `license.repository.js`, `purchase.repository.js`, `transaction.repository.js`, `indexer-state.repository.js`, `sandbox.repository.js`, `sandbox-file.repository.js`, `execution-event.repository.js`).
- `src/routes/`: `index.js`, `auth.routes.js`, `wallet.route.js`, `dataset.route.js`, `license.route.js`, `purchase.route.js`, `token.route.js`, `sandbox.route.js`, `health.routes.js`, `dashboard.route.js`, `treasury.route.js`.
- `src/services/`: Business logic services (`auth.service.js`, `wallet.service.js`, `dataset.service.js`, `license.service.js`, `licenseBlockchain.service.js`, `purchase.service.js`, `purchaseBlockchain.service.js`, `token.service.js`, `access-control.service.js`, `download.service.js`, `email.service.js`, `sandbox.service.js`, `aiExecution.service.js`, `fileUpload.service.js`, `trainingLog.service.js`, `monitoring.service.js`).
- `src/jobs/`: Event indexers and background monitors (`license-event-indexer.js`, `purchase-event-indexer.js`, `token-event-indexer.js`, `sandbox-monitor.job.js`).
- `src/middlewares/`: `auth.middleware.js`, `role.middleware.js`, `validation.middleware.js`, `error.middleware.js`, `requestLogger.middleware.js`, `notFound.middleware.js`, `dataset-access.middleware.js`.
- `src/validators/`: Joi payload validation schemas (`auth.validator.js`, `wallet.validator.js`, `dataset.validator.js`, `license.validator.js`, `purchase.validator.js`, `token.validator.js`, `sandbox.validator.js`).

### 4. `sandbox/`
The Sandbox SDK and integration layer package (`@aixchange/sandbox`).
- `src/index.js`: SDK entrypoint.
- `src/client.js`: `SandboxClient` communicating with `python-services` via HTTP.
- `src/workspace.js`: `WorkspaceLayout`, path containment validation, execution ID sanitization, and `stageWorkspaceFiles`.
- `src/types.js`: ExecutionState, FrameworkType, OptimizerType, LossFunctionType, ExportFormat, FileCategory.
- `src/config.js`: Default configuration.
- `tests/`: SDK unit tests (`client.test.js`, `workspace.test.js`).

### 5. `python-services/`
Python 3.12 AI execution substrate.
- `app/api/execution.py`: FastAPI AI Execution Contract endpoints (train, status, infer, validate-model, jupyter start/stop/status).
- `app/core/`: `sandbox.py` (SandboxManager), `jupyter.py` (JupyterManager), `docker_runner.py`, `config.py`.
- `app/training/`: `pytorch_trainer.py`, `pipeline.py`, `checkpoints.py`, `base.py`.
- `app/models/`: `exporter.py` (Safetensors / Phase 9 Provenance export), `validator.py` (Model checksum and forward-pass smoke test).
- `app/inference/`: `engine.py`, `loader.py`.
- `app/schemas/`: `training.py`, `execution.py`, `inference.py`.
- `tests/`: 22 automated pytest suites.

### 6. Auxiliary Directories
- `database/`: Contains `.gitkeep` placeholders in `migrations/`, `schemas/`, `seeders/`.
- `docker/`: Contains `sandbox/Dockerfile`, `sandbox/jupyter_server_config.py`, `docker-compose.sandbox.yml`.
- `docs/`: Contains project architecture documentation.
- `scripts/`: Contains `.gitkeep`.
- `shared/`: Contains `.gitkeep` in `constants/`, `types/`, `utils/`.
