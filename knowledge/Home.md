# AIXchange Knowledge Base

Welcome to the **AIXchange Knowledge Base**, an Obsidian-compatible documentation vault reflecting the actual implementation, architecture, and current state of the AIXchange codebase.

> [!NOTE]
> **Source of Truth**: All documentation in this vault is generated strictly from the verified contents of the repository. Planned features, placeholders, and partial implementations are explicitly labeled as such.

---

## 🧭 Vault Navigation

### 00 — Project & Overview
- [[Project Overview]] — Platform mission, problems solved, and scope.
- [[Current Implementation Status]] — Phase-by-phase implementation progress (Phases 1–6 implemented).
- [[Technology Stack]] — Detected languages, frameworks, libraries, and tools.
- [[Repository Structure]] — Directory organization, package boundaries, and file roles.
- [[Feature Status]] — Granular feature breakdown with verified implementation evidence.

### 01 — Architecture
- [[System Architecture]] — Multi-tier topology across Frontend, Backend, Database, and Blockchain.
- [[Application Flow]] — End-to-end data, transaction, and state lifecycle flows.
- [[Frontend Architecture]] — React 19, Vite, and Web3 integration structure.
- [[Backend Architecture]] — Express.js 5 layered architecture, services, and repositories.
- [[Database Architecture]] — MongoDB / Mongoose document schemas and relationships.
- [[Blockchain Architecture]] — Smart contract system, token economy, registries, and settlement engine.
- [[AI Architecture]] — Current Python AI services scaffolding and planned capabilities.

### 02 — Modules
- [[Dataset Marketplace]] — Decentralized dataset publishing, IPFS referencing, and catalog discovery.
- [[Licensing System]] — Multi-tier licensing models, terms, validity windows, and rights management.
- [[Purchase Engine]] — Atomic token payments, treasury fee deductions, creator earnings, and access checks.
- [[Token Economy]] — AIX utility token, minting, burning, and treasury vault.
- [[Model Marketplace]] — AI model registry and trading (Current status: Placeholder / Stub).
- [[AI Services]] — Python services and AI inference (Current status: Scaffold / Planned).
- [[AI Provenance]] — Lineage and training tracking (Current status: Planned / Not Implemented).
- [[Royalty System]] — Secondary royalty distribution engine (Current status: Planned / Phase 10).
- [[Trust and Reputation]] — Creator rating and reputation tracking (Current status: Partially Implemented in DB model).
- [[Analytics]] — Marketplace analytics and activity aggregation (Current status: Partially Implemented).

### 03 — Frontend
- [[Frontend Overview]] — Client architecture, UI stack, and build tooling.
- [[Pages]] — Implemented views (`DatasetMarketplace`, `DatasetDetails`, `RegisterDataset`, `WalletTest`).
- [[Components]] — Navigation, modals, previews, and UI elements.
- [[State Management]] — Local component state and Web3 provider hooks.
- [[API Integration]] — Ethers.js blockchain services and backend Axios / Fetch clients.
- [[Routing]] — React Router DOM route tree and layout hierarchy.

### 04 — Backend
- [[Backend Overview]] — Node.js & Express 5 API server setup.
- [[API Endpoints]] — Complete catalog of implemented REST endpoints.
- [[Routes]] — Route definitions across auth, wallet, datasets, licenses, purchases, tokens, and health.
- [[Controllers]] — Request handlers and HTTP response orchestration.
- [[Services]] — Business logic layer for auth, datasets, licenses, blockchain, and purchases.
- [[Models]] — Mongoose schemas for Users, Sessions, Datasets, Licenses, Purchases, and Transactions.
- [[Repositories]] — Data access layer abstraction over MongoDB models.
- [[Authentication]] — JWT authentication, bcrypt hashing, and Web3 wallet signature verification.
- [[Background Jobs]] — Blockchain event indexers for licenses, purchases, and tokens.
- [[Error Handling]] — Centralized `ApiError`, `ApiResponse`, and error middlewares.

### 05 — Database
- [[Database Overview]] — MongoDB Atlas / Local instance configuration.
- [[Database Schema]] — Mongoose document definitions and field validation.
- [[Collections]] — Schema details for all 7 database collections.
- [[Relationships]] — References between Users, Datasets, Licenses, and Purchases.
- [[Data Flow]] — Ingestion, indexing, caching, and querying pipelines.

### 06 — Blockchain
- [[Blockchain Overview]] — Hardhat Ethereum environment and network configuration.
- [[Smart Contracts]] — `AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, `PurchaseEngine`.
- [[Contract Functions]] — Exhaustive inventory of contract functions, visibility, modifiers, and returns.
- [[Contract Events]] — Emitted EVM events for backend indexing and frontend listening.
- [[Token Implementation]] — ERC-20 `AIXToken` utility token specifications.
- [[Ownership]] — Asset ownership verification and transfer semantics.
- [[Blockchain Integration]] — Hardhat Ignition modules, deployment scripts, and Ethers v6 bindings.

### 07 — AI & ML Services
- [[AI Overview]] — Python services directory layout and setup.
- [[Models]] — AI model hosting and weights (Current status: Scaffold / Planned).
- [[AI Pipeline]] — Data processing and inference pipeline scaffolding.
- [[Embeddings]] — Semantic vector search (Current status: Planned).
- [[RAG]] — Retrieval-augmented generation (Current status: Planned).
- [[LLM Integration]] — LLM inference orchestration (Current status: Planned).

### 08 — APIs
- [[API Overview]] — REST API conventions, status codes, and Swagger docs.
- [[Authentication API]] — Registration, login, JWT refresh, and wallet nonce verification.
- [[Dataset API]] — Dataset CRUD, search, filtering, and featured listings.
- [[License API]] — License creation, asset license lookups, and revocation.
- [[Purchase API]] — Purchase recording, user purchases, receipt lookups, and access entitlement checks.
- [[Token API]] — Token balance, allowance, faucet, and stats endpoints.
- [[Health and Utility API]] — Server health check and system diagnostics.

### 09 — Configuration & Dependencies
- [[Environment Variables]] — Complete reference for root, server, client, and blockchain `.env` variables.
- [[Dependencies]] — Package inventory for Node.js, React, Python, and Solidity.
- [[Configuration Files]] — Tooling configs (`hardhat.config.js`, `vite.config.js`, `eslint.config.js`, etc.).
- [[External Services]] — Pinata / IPFS, MongoDB, MetaMask, and Ethereum JSON-RPC providers.

### 10 — Development & Operations
- [[Setup Guide]] — Prerequisites, installation, and multi-terminal startup guide.
- [[Development Workflow]] — Branching model, code quality, and testing standards.
- [[Scripts]] — Hardhat scripts, deployment helpers, and npm scripts.
- [[Testing]] — Hardhat test suite (115 passing tests) and frontend test status.
- [[Known Issues]] — Known warnings, empty directories, and edge cases.
- [[TODOs and Planned Work]] — Roadmap phases (Docker Sandbox, Model Marketplace, Provenance, Royalties).

### 11 — Research & Decisions
- [[Existing Documentation]] — Summary of repo READMEs and architecture notes.
- [[Technical Concepts]] — Core Web3, IPFS, and licensing mechanics explained.
- [[Project Terminology]] — Glossary of terms (AIX, CID, BPS, SafeERC20, ReentrancyGuard, etc.).
- [[Architecture Decisions]] — Documented architecture and design rationale.

---

## 📊 High-Level Implementation Summary

| Subsystem | Implemented / Verified | Status |
| :--- | :--- | :---: |
| **Smart Contracts** | `AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, `PurchaseEngine` (115 unit tests passing) | ✅ **100% Implemented (Phases 3–6)** |
| **Backend API** | Auth, Wallet, Datasets, Licenses, Purchases, Docker Sandbox Orchestration, Monitoring Jobs (22 unit & E2E tests passing) | ✅ **100% Implemented (Phases 1–7)** |
| **Database** | MongoDB Models: User, Session, Dataset, License, Purchase, Transaction, IndexerState, Sandbox, SandboxFile, ExecutionEvent | ✅ **Implemented (10 Models)** |
| **Frontend Client** | React 19 SPA: Marketplace, Dataset Details, Register Wizard, Wallet Testbed, Ethers v6 services | ✅ **Implemented (Phases 2–6)** |
| **Sandbox SDK** | `@aixchange/sandbox` SDK, WorkspaceLayout, stageWorkspaceFiles, SandboxClient (10 unit tests passing) | ✅ **100% Implemented (Phase 7)** |
| **Python AI Services** | FastAPI AI Execution Substrate, PyTorchTrainer, ModelExporter (.safetensors), Validator, Decoupled Inference, JupyterLab (22 tests passing) | ✅ **100% Implemented (Phase 7)** |
| **Docker / Infra** | `docker/sandbox/Dockerfile`, `docker/docker-compose.sandbox.yml`, `jupyter_server_config.py` | ✅ **Implemented (Phase 7)** |
