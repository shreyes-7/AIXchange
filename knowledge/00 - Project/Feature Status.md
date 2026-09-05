# Feature Status

This document provides an itemized matrix of all platform features, their exact implementation status, and verification evidence directly from the codebase.

---

## Status Classification

- **Implemented**: Feature is coded, functional, and verified by tests or working execution.
- **Partially Implemented**: Substantial code exists but lacks full integration or complementary UI/backend services.
- **Placeholder / Stub**: Skeleton files or mock interfaces with minimal or no logic.
- **Planned / Not Found**: Feature is discussed in documentation or roadmap but has no concrete codebase implementation.

---

## Comprehensive Feature Matrix

| Feature Domain | Specific Feature | Status | Evidence in Codebase |
| :--- | :--- | :---: | :--- |
| **Authentication** | Email & Password Registration/Login | **Implemented** | `server/src/controllers/auth.controller.js`, `server/src/models/user.model.js` |
| **Authentication** | JWT Token Issuance & Verification | **Implemented** | `server/src/utils/jwt.js`, `server/src/middlewares/auth.middleware.js` |
| **Authentication** | Web3 Wallet Nonce Generation | **Implemented** | `server/src/controllers/wallet.controller.js`, `server/src/services/wallet.service.js` |
| **Authentication** | EIP-191 Cryptographic Signature Verification | **Implemented** | `server/src/services/wallet.service.js`, `client/src/services/blockchain/wallet/verifier.service.js` |
| **Token Economy** | ERC-20 Native AIX Token | **Implemented** | `blockchain/contracts/tokens/AIXToken.sol`, `blockchain/test/tokens/AIXToken.test.js` |
| **Token Economy** | Platform Treasury Vault (ETH & ERC20) | **Implemented** | `blockchain/contracts/governance/Treasury.sol`, `blockchain/test/governance/Treasury.test.js` |
| **Token Economy** | Frontend Token Balance & Allowance Hook | **Implemented** | `client/src/services/blockchain/token/token.service.js` |
| **Dataset Registry** | On-Chain Dataset Registration & CIDs | **Implemented** | `blockchain/contracts/registry/DatasetRegistry.sol`, `blockchain/test/registry/DatasetRegistry.test.js` |
| **Dataset Registry** | Dataset Ownership Transfer & Indexing | **Implemented** | `blockchain/contracts/registry/DatasetRegistry.sol` (`transferDatasetOwnership`) |
| **Dataset Registry** | Active Status Toggling | **Implemented** | `blockchain/contracts/registry/DatasetRegistry.sol` (`toggleDatasetStatus`) |
| **Dataset Registry** | Metadata & Royalty Updates | **Implemented** | `blockchain/contracts/registry/DatasetRegistry.sol` (`updateDatasetMetadata`) |
| **Marketplace Client**| Dataset Marketplace Catalog & Search | **Implemented** | `client/src/pages/DatasetMarketplace.jsx` |
| **Marketplace Client**| Dataset Details & Provenance View | **Implemented** | `client/src/pages/DatasetDetails.jsx` |
| **Marketplace Client**| Creator Management Controls | **Implemented** | `client/src/pages/DatasetDetails.jsx` (Edit modal, status switch, transfer form) |
| **Marketplace Client**| Multi-Step Dataset Registration Wizard | **Implemented** | `client/src/pages/RegisterDataset.jsx` |
| **Marketplace Client**| Developer Wallet Diagnostic Testbed | **Implemented** | `client/src/pages/WalletTest.jsx` |
| **Licensing System** | Multi-Tier License Types (`ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`) | **Implemented** | `blockchain/contracts/licensing/LicenseRegistry.sol`, `blockchain/test/licensing/LicenseRegistry.test.js` |
| **Licensing System** | Dual Pricing Models (`FIXED` & `ROYALTY`) | **Implemented** | `blockchain/contracts/licensing/LicenseRegistry.sol` |
| **Licensing System** | Granular Rights & Validity Timestamps | **Implemented** | `blockchain/contracts/licensing/LicenseRegistry.sol` (`LicenseRights`, `isLicenseActive`) |
| **Licensing System** | Backend License Indexer & API | **Implemented** | `server/src/jobs/license-event-indexer.js`, `server/src/routes/license.route.js` |
| **Purchase Engine** | Atomic AIX Token Purchase Settlement | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol`, `blockchain/test/marketplace/PurchaseEngine.test.js` |
| **Purchase Engine** | Platform Fee Split (2.50% to Treasury) | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol` (`_platformFeeBps`) |
| **Purchase Engine** | Creator Revenue Transfer | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol` (`safeTransferFrom`) |
| **Purchase Engine** | Exclusive License Single-Buyer Locking | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol` (`_exclusiveLicensesSold`) |
| **Purchase Engine** | Duplicate Purchase Prevention | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol` (`AlreadyPurchased`) |
| **Purchase Engine** | Access Entitlement Validation | **Implemented** | `blockchain/contracts/marketplace/PurchaseEngine.sol` (`hasAccess`) |
| **Purchase Engine** | Backend Purchase Event Indexer | **Implemented** | `server/src/jobs/purchase-event-indexer.js`, `server/src/routes/purchase.route.js` |
| **Execution Sandbox** | Docker Sandbox Execution Environment | **Implemented** | `docker/sandbox/Dockerfile`, `docker/docker-compose.sandbox.yml`, `python-services/app/core/sandbox.py` |
| **Execution Sandbox** | JupyterLab Interactive Session Manager | **Implemented** | `docker/sandbox/jupyter_server_config.py`, `python-services/app/core/jupyter.py` |
| **Execution Sandbox** | Sandbox SDK & Workspace Staging | **Implemented** | `sandbox/src/index.js`, `sandbox/src/client.js`, `sandbox/src/workspace.js` |
| **Backend Sandbox** | Application Sandbox CRUD & State Machine | **Implemented** | `server/src/models/sandbox.model.js`, `server/src/services/sandbox.service.js`, `server/src/controllers/sandbox.controller.js` |
| **Backend Sandbox** | Sandbox File Upload & Security Validation | **Implemented** | `server/src/models/sandbox-file.model.js`, `server/src/services/fileUpload.service.js` |
| **Backend Sandbox** | Training Log Retrieval & Structured Metrics | **Implemented** | `server/src/services/trainingLog.service.js`, `server/src/routes/sandbox.route.js` |
| **Backend Sandbox** | Live Execution Monitoring & State Sync Job | **Implemented** | `server/src/services/monitoring.service.js`, `server/src/jobs/sandbox-monitor.job.js` |
| **AI Training** | Structured PyTorch Training Pipeline | **Implemented** | `python-services/app/training/pytorch_trainer.py`, `python-services/app/training/pipeline.py` |
| **AI Training** | Checkpoint Management & Top-k Rotation | **Implemented** | `python-services/app/training/checkpoints.py` |
| **Model Export** | Multi-Format Serialization (.safetensors, .pt)| **Implemented** | `python-services/app/models/exporter.py` |
| **Model Validation** | SHA-256 Checksum & Smoke Test Forward Pass | **Implemented** | `python-services/app/models/validator.py` |
| **AI Inference** | Decoupled Safe Deserialization & Prediction Engine | **Implemented** | `python-services/app/inference/loader.py`, `python-services/app/inference/engine.py` |
| **AI Execution API** | AI Execution Contract REST API | **Implemented** | `python-services/app/api/execution.py`, `python-services/main.py` |
| **Model Marketplace**| Model Registry Smart Contract | **Implemented** | `blockchain/contracts/registry/ModelRegistry.sol`, `blockchain/test/registry/ModelRegistry.test.js` |
| **Model Marketplace**| Backend Model Catalog & APIs | **In Progress** | Owned by teammate (deferred for blockchain sub-phase) |
| **Model Marketplace**| Marketplace Frontend UI | **Planned** | Frontend deferred |

| **Model Marketplace**| Model Listing & Trading Frontend | **Planned / Not Found** | No files found in `client/` |
| **AI Provenance** | Lineage Relationship Smart Contract | **Implemented** | `blockchain/contracts/registry/ProvenanceRegistry.sol`, `blockchain/test/registry/ProvenanceRegistry.test.js` |
| **AI Provenance** | Backend Provenance Graph & Timeline APIs | **In Progress** | Owned by Prabhu (deferred for blockchain sub-phase) |
| **AI Provenance** | Frontend Provenance Visualization | **Planned** | Frontend deferred |
| **Royalty System** | Multi-Party Royalty Split & Settlement Smart Contract | **Implemented** | `blockchain/contracts/royalty/RoyaltyEngine.sol`, `blockchain/test/royalty/RoyaltyEngine.test.js` |
| **Royalty System** | Backend Royalty History & Reporting APIs | **In Progress** | Owned by Prabhu (deferred for blockchain sub-phase) |

