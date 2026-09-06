# AIXchange — Master Frontend Roadmap & Single Source of Truth
**Document Version:** 1.0.0-PROD  
**Target Repository:** `AIXchange` (Root Directory: `FRONTEND_ROADMAP.md`)  
**Project Architect / Lead:** Shreyes Jaiswal  
**Last Verified Audit:** September 2026  
**Scope:** Complete End-to-End Frontend Architecture, Route Map, Page Inventory, Design System, Web3 & AI Integrations, and Phase Execution Plan (Phase 0 → Phase 17)

---

## 📑 Table of Contents

1. [Document Purpose & Operational Directives](#1-document-purpose--operational-directives)
2. [Status Legend & Tracking Taxonomy](#2-status-legend--tracking-taxonomy)
3. [Frontend Vision & Core Product Identity](#3-frontend-vision--core-product-identity)
4. [Complete Repository Audit & Baseline Classification](#4-complete-repository-audit--baseline-classification)
   - 4.1 Existing Frontend Audit (`client/`)
   - 4.2 Backend REST API Audit (`server/`)
   - 4.3 Smart Contracts Audit (`blockchain/`)
   - 4.4 Python AI Substrate & Sandbox Audit (`python-services/`, `sandbox/`)
   - 4.5 Component Treatment Classification (Keep / Refactor / Expand / Missing)
5. [Master Phase Matrix (Phase 0 → Phase 17)](#5-master-phase-matrix-phase-0--phase-17)
6. [Frontend Information Architecture & Navigation Tree](#6-frontend-information-architecture--navigation-tree)
7. [Comprehensive Application Route Map](#7-comprehensive-application-route-map)
8. [Comprehensive Page Inventory & Specifications](#8-comprehensive-page-inventory--specifications)
   - 8.1 Landing & Value Proposition Page (`/`)
   - 8.2 Authentication: Sign In (`/login`)
   - 8.3 Authentication: Register Account (`/register`)
   - 8.4 Authentication: Password Recovery (`/forgot-password`, `/reset-password`)
   - 8.5 Authentication: Email Verification (`/verify-email`)
   - 8.6 Dataset Marketplace Catalog (`/datasets`)
   - 8.7 Dataset Details & Access Portal (`/datasets/:id`)
   - 8.8 Multi-Step Dataset Registration Wizard (`/datasets/register`)
   - 8.9 License Management & Template Explorer (`/licenses`, `/licenses/templates`)
   - 8.10 Purchase Settlement & Entitlement Modal Flow
   - 8.11 Web3 AIX Wallet & Treasury Terminal (`/wallet`, `/wallet-test`)
   - 8.12 Model Marketplace Catalog (`/models`)
   - 8.13 Model Details & Verified Weights Portal (`/models/:id`)
   - 8.14 Model Registration & Checksum Anchoring Wizard (`/models/register`)
   - 8.15 AI Inference Playground (`/inference`, `/models/:id/infer`)
   - 8.16 Docker Training Sandbox Dashboard (`/sandboxes`)
   - 8.17 Active Training Console & Live Logs (`/sandboxes/:id`)
   - 8.18 Embedded JupyterLab Interactive Studio (`/sandboxes/:id/jupyter`)
   - 8.19 AI Provenance Lineage Explorer & DAG Visualizer (`/provenance`, `/provenance/graph/:modelId`)
   - 8.20 Provenance Verification Terminal (`/provenance/:id/verify`)
   - 8.21 Secondary Royalty Engine & Split Dashboard (`/royalties`)
   - 8.22 Multi-Dimensional Analytics Dashboard (`/analytics`)
   - 8.23 User & Creator Trust & Reputation Center (`/reputation`, `/reviews`)
   - 8.24 User Asset Portfolio & Downloads Hub (`/my-assets`)
   - 8.25 User Profile & Security Settings (`/profile`, `/settings`)
   - 8.26 Administrative Control Deck (`/admin`)
   - 8.27 Admin Asset & User Moderation Queue (`/admin/moderation`)
   - 8.28 Platform Treasury & Fee Vault Terminal (`/admin/treasury`)
   - 8.29 Blockchain Real-Time Monitoring Center (`/admin/blockchain`)
   - 8.30 Deterministic Fraud Review & Security Flags Deck (`/admin/fraud`)
   - 8.31 Content Violation Reporting Flow
9. [Dataset Marketplace & Discovery Specification](#9-dataset-marketplace--discovery-specification)
10. [Multi-Step Dataset Registration Wizard (10-Stage Pipeline)](#10-multi-step-dataset-registration-wizard-10-stage-pipeline)
11. [Licensing System UI & Rights Matrix](#11-licensing-system-ui--rights-matrix)
12. [Purchase Engine & Atomic Settlement Experience](#12-purchase-engine--atomic-settlement-experience)
13. [AIX Token Economy & Web3 Wallet Architecture](#13-aix-token-economy--web3-wallet-architecture)
14. [Model Marketplace Specification](#14-model-marketplace-specification)
15. [Model Registration & Checksum Anchoring UX](#15-model-registration--checksum-anchoring-ux)
16. [Interactive AI Inference Playground UX](#16-interactive-ai-inference-playground-ux)
17. [Docker Sandbox & Isolated Training Studio](#17-docker-sandbox--isolated-training-studio)
18. [Real-Time Telemetry & Live Polling Strategy](#18-real-time-telemetry--live-polling-strategy)
19. [AI Provenance Engine: Interactive Lineage DAG & Timeline](#19-ai-provenance-engine-interactive-lineage-dag--timeline)
20. [Automated Royalty Engine: Multi-Party Split Visualization](#20-automated-royalty-engine-multi-party-split-visualization)
21. [Multi-Dimensional Analytics Engine & Visualization Suite](#21-multi-dimensional-analytics-engine--visualization-suite)
22. [Trust, Reputation & Decentralized Rating System](#22-trust-reputation--decentralized-rating-system)
23. [Global Notification Architecture](#23-global-notification-architecture)
24. [User Profile & Web3 Security Settings](#24-user-profile--web3-security-settings)
25. [Role-Based Access Control (RBAC) & Navigation Boundaries](#25-role-based-access-control-rbac--navigation-boundaries)
26. [Visual Identity & Design System Token Architecture](#26-visual-identity--design-system-token-architecture)
27. [Reusable Component Inventory & Atomic Hierarchy](#27-reusable-component-inventory--atomic-hierarchy)
28. [Animation & Micro-Interaction System](#28-animation--micro-interaction-system)
29. [Signature Interaction Designs](#29-signature-interaction-designs)
30. [Responsive Design & Breakpoint Specifications](#30-responsive-design--breakpoint-specifications)
31. [Accessibility (a11y) & WCAG 2.1 AA Compliance Standards](#31-accessibility-a11y--wcag-21-aa-compliance-standards)
32. [Standardized UI/UX States: Loading, Empty, Error & Pending](#32-standardized-uiux-states-loading-empty-error--pending)
33. [Frontend State Management Architecture](#33-frontend-state-management-architecture)
34. [Backend API Integration Architecture Matrix](#34-backend-api-integration-architecture-matrix)
35. [Smart Contract Blockchain Integration Matrix](#35-smart-contract-blockchain-integration-matrix)
36. [Decentralized Storage & Client IPFS Protocol](#36-decentralized-storage--client-ipfs-protocol)
37. [Defensive Client Security Architecture](#37-defensive-client-security-architecture)
38. [Client-Side Performance Optimization Strategy](#38-client-side-performance-optimization-strategy)
39. [Comprehensive Frontend Testing Strategy](#39-comprehensive-frontend-testing-strategy)
40. [Phase 14 Master Execution Plan (Workstreams 14.1 → 14.27)](#40-phase-14-master-execution-plan-workstreams-141--1427)
41. [Phase 15 End-to-End Integration Testing Strategy](#41-phase-15-end-to-end-integration-testing-strategy)
42. [Phase 16 Production Deployment & Client Infrastructure](#42-phase-16-production-deployment--client-infrastructure)
43. [Phase 17 Research Demonstration & Presentation Suite](#43-phase-17-research-demonstration--presentation-suite)
44. [Frontend Definition of Done (DoD)](#44-frontend-definition-of-done-dod)
45. [Full-Lifecycle Traceability Matrix (Requirements → Code → Tests)](#45-full-lifecycle-traceability-matrix-requirements--code--tests)
46. [Master Frontend Implementation Checklist](#46-master-frontend-implementation-checklist)
47. [Future Enhancements & Post-v1 Substrate Roadmap](#47-future-enhancements--post-v1-substrate-roadmap)

---

## 1. Document Purpose & Operational Directives

This document is the **authoritative, single source of truth for all frontend engineering** in the AIXchange ecosystem. It establishes every route, screen, state, design token, blockchain contract hook, API integration, interactive visualizer, and test suite required to deliver the user-facing application for the AIXchange decentralized marketplace and AI execution substrate.

### Core Directives for Developers
1. **Repository Authority**: All frontend features documented here are grounded strictly in the verified backend REST APIs (`server/src/routes`), smart contracts (`blockchain/contracts/`), Python AI services (`python-services/app/`), and Docker sandbox specifications (`docker/sandbox/`). No fictitious or unanchored capabilities are specified.
2. **Phase Continuity**: While major visual development centers on **Phase 14 (Frontend Development)**, frontend requirements originate from and directly expose functionality created across **Phase 0 through Phase 17**.
3. **Defense-in-Depth Presentation**: The frontend client is an unprivileged presentation tier. It executes Web3 signing and initiates zero-custody transactions, but **authorization, rate-limiting, and financial settlement boundaries reside exclusively on-chain and within the backend server**.
4. **Maintenance of Status**: As frontend components, pages, and hooks are developed, engineers must update the tracking checkboxes in [Section 46](#46-master-frontend-implementation-checklist) and the status badges in [Section 5](#5-master-phase-matrix-phase-0--phase-17).

---

## 2. Status Legend & Tracking Taxonomy

Every feature, page, route, and component in this roadmap is tagged with one of the following deterministic status states:

| Badge | State | Meaning |
| :--- | :--- | :--- |
| 🟢 `COMPLETE` | Fully Implemented & Tested | Code exists in `client/src/`, responsive, accessible, unit/integration tested, and zero console errors. |
| 🟡 `IN PROGRESS` | Partially Implemented | Component or page draft exists, but requires styling polish, error boundary handling, or test coverage. |
| 🔵 `BACKEND READY` | Backend Ready / UI Missing | Express REST endpoint, repository, and service are verified and tested; client service/UI must be built. |
| 🟣 `BLOCKCHAIN READY`| Smart Contract Ready / UI Missing | Solidity contract, events, and Hardhat tests verified; client ethers.js service and UI must be wired. |
| 🟠 `AI READY` | AI Substrate Ready / UI Missing | Python FastAPI training/inference/Jupyter verified; frontend workspace controls must be connected. |
| ⬜ `NOT STARTED` | Planned / Unstarted | Architecture and requirements fully specified; execution scheduled within Phase 14 workstreams. |
| 🔴 `BLOCKED` | Dependency Blocked | Cannot proceed until an external infrastructure or upstream prerequisite is fulfilled. |

---

## 3. Frontend Vision & Core Product Identity

AIXchange is not a standard e-commerce dashboard, nor is it a generic Web3 NFT exchange. It is a **mission-critical scientific platform and decentralized execution substrate** that bridges high-performance machine learning with trustless blockchain governance.

### The Five Aesthetic & Functional Pillars
1. **High-Velocity AI Engineering**: Dark-mode-first aesthetic with high-density data tables, real-time streaming logs, loss curve visualizations, and terminal consoles that feel native to machine learning engineers.
2. **Zero-Custody Web3 Sophistication**: Polished, multi-step transaction lifecycles (`Preparing` → `Awaiting Signature` → `Broadcasting` → `Mining` → `Indexed`), gas fee estimations, and on-chain verification badges that eliminate crypto UX anxiety.
3. **Scientific Provenance Transparency**: Interactive, GPU-accelerated Directed Acyclic Graph (DAG) visualizations that dynamically demonstrate the complete immutable lineage linking datasets to training runs, model checkpoints, and inference calls.
4. **Automated Economic Fairness**: Clear, node-based revenue tree diagrams illustrating atomic 2.50% platform treasury fee deductions and basis-point secondary royalty distributions.
5. **Rock-Solid Reliability**: Comprehensive state handling for every view: zero unhandled promise rejections, zero layout thrashing, accessible WCAG 2.1 AA contrast, and deterministic fallback components for offline RPC nodes or unreachable IPFS gateways.

---

## 4. Complete Repository Audit & Baseline Classification

A comprehensive audit of the AIXchange codebase confirms the operational readiness of the platform's foundational layers and establishes what already exists in the frontend client.

### 4.1 Existing Frontend Audit (`client/src/`)
The current frontend client is built on **Vite 8, React 19, Tailwind CSS v4, Redux Toolkit 2.12, TanStack React Query v5, React Router v7, and Ethers.js v6**.

#### Existing Pages (`client/src/pages/`)
- `DatasetMarketplace.jsx` (375 lines): Functional dataset catalog querying on-chain `DatasetRegistry.sol` via ethers.js. Features category filtering, keyword search, IPFS preview modal, and stat counters.
- `DatasetDetails.jsx` (420 lines): Comprehensive asset overview rendering CID, on-chain owner, active toggle, metadata editor, ownership transfer dialog, and purchase simulation.
- `RegisterDataset.jsx` (380 lines): Form for uploading dataset files, computing SHA-256 digests, pinning to IPFS via backend, and executing `DatasetRegistry.registerDataset()` on-chain.
- `WalletTest.jsx` (580 lines): Rich developer testbed for MetaMask connection, chain switching, EIP-191 nonce signing, server verification, and AIX token balance/transfer/mint/burn testing.

#### Existing Services & Infrastructure
- `services/blockchain/wallet/`: Complete Ethers.js v6 modular wallet suite (`metamask.service.js`, `signer.service.js`, `nonce.service.js`, `network.service.js`, `verifier.service.js`, `wallet.service.js`). Handles account change events, chain shifts, and backend nonce verification.
- `services/blockchain/dataset/`: Interacts with `DatasetRegistry.sol` (`registerDataset`, `updateMetadata`, `setDatasetActive`, `getAllDatasets`, `transferOwnership`).
- `services/blockchain/token/`: Interacts with `AIXToken.sol` (`balanceOf`, `transfer`, `approve`, `allowance`, `mint`, `burn`).
- `services/api/datasetApi.service.js`: Axios-based client for backend dataset routes (`/datasets`, `/datasets/upload`, `/datasets/sync`).
- `components/Navbar.jsx`: Global header displaying branding, network status badge, active wallet indicator with truncate formatting, and direct navigation links.

### 4.2 Backend REST API Audit (`server/src/`) — 110 / 110 Tests Passing
The backend provides 18 verified route modules mounted at `/api/v1`:
- `/auth`: User registration, bcrypt login, JWT refresh/revocation, email verification, password reset (`auth.routes.js`).
- `/wallet`: Nonce generation, EIP-191 personal sign verification, wallet linking/unlinking (`wallet.route.js`).
- `/token`: AIX balance check, metadata, total supply, indexed transaction history (`token.route.js`).
- `/treasury`: Platform fee balance inspection (`treasury.route.js`).
- `/dashboard`: Consolidated user wallet dashboard (`dashboard.route.js`).
- `/datasets`: File upload to IPFS, metadata CRUD, categories, reviews, versions, download authorization (`dataset.route.js`).
- `/licenses`: License templates (Academic, Commercial, Exclusive, Custom), asset licenses, licensor licenses, on-chain verification, revocation (`license.route.js`).
- `/purchases`: Purchase initiation calldata preparation, on-chain purchase indexing, entitlement status check, buyer purchase history (`purchase.route.js`).
- `/sandboxes`: Isolated sandbox creation, workspace file staging, PyTorch training trigger, structured live logs, JupyterLab startup/teardown (`sandbox.route.js`).
- `/models`: AI model discovery, client-signed registration draft, versioning, SHA-256 hash verification, ownership transfer, inference proxying (`model.route.js`).
- `/provenance`: Lineage registration, sync, dataset lineage, execution lineage, model DAG graph generation, chronological timeline, on-chain claim verification (`provenance.route.js`).
- `/royalties`: Multi-party royalty distributions, revenue split preview (`calculate-split`), zero-custody distribution preparation, indexed history, reports, on-chain reconciliation (`royalty.route.js`).
- `/analytics`: Off-chain revenue analytics, purchase metrics, downloads, inference API calls, user growth, single-pass unified overview (`analytics.routes.js`).
- `/analytics/blockchain`: Indexed on-chain events, AIX token velocity, gas consumption metrics (`blockchain-analytics.routes.js`).
- `/admin`: Role-protected moderation of users, datasets, models, reports, fraud flag reviews, audit logs, and treasury telemetry (`admin.routes.js`).
- `/reports`: User-facing platform abuse and violation submission (`report.routes.js`).
- `/health`: Service liveness, database, and RPC heartbeat checks (`health.routes.js`).

### 4.3 Smart Contracts Audit (`blockchain/contracts/`) — 279 / 279 Tests Passing
Eight production smart contracts compiled under Solidity `^0.8.28` with Hardhat Ignition deployment modules:
1. `AIXToken.sol`: ERC-20 utility token (1,000,000,000 initial supply, 18 decimals, mint, burn, permit-ready).
2. `Treasury.sol`: Platform vault supporting ETH and ERC-20 tokens, `depositToken`, and owner withdrawals.
3. `DatasetRegistry.sol`: On-chain catalog mapping auto-incrementing `datasetId` to IPFS CIDs, owners, and active flags.
4. `LicenseRegistry.sol`: Legal rights registry enforcing tiers (Academic, Commercial, Exclusive, Custom), pricing models (Fixed, Royalty), and bitmask permissions.
5. `PurchaseEngine.sol`: Atomic purchase engine routing 2.50% fee to Treasury and 97.50% to creator, recording `hasAccess`.
6. `ModelRegistry.sol`: AI model registry anchoring SHA-256 artifact digests, append-only versions, and ownership transfer.
7. `ProvenanceRegistry.sol`: Lineage registry linking `(datasetId, executionId, modelId, modelVersion)` with duplicate prevention.
8. `RoyaltyEngine.sol`: Secondary revenue distributor supporting up to 50 recipients in basis points with zero-leakage remainder absorption.

### 4.4 Python AI Substrate & Sandbox Audit (`python-services/`, `sandbox/`) — 32 / 32 Tests Passing
- `FastAPI Substrate`: `/api/v1/execution/train` (DynamicMLP PyTorch trainer), `/infer` (safe weight tensor prediction), `/validate-model` (SHA-256 digest validation), `/jupyter/start` & `/jupyter/stop`.
- `Docker Sandbox Container`: Capped at 4 CPUs, 8GB RAM, unprivileged `aixuser` (UID 1000), `no-new-privileges`, `tmpfs` `/tmp:noexec`.
- `@aixchange/sandbox` SDK: ES module client providing `SandboxClient`, `WorkspaceLayout`, and safe file staging.

### 4.5 Component Treatment Classification

```text
┌──────────────────────────────────────┬───────────────────────┬────────────────────────────────────────────────────────┐
│ Existing Component / Page            │ Classification        │ Action Required                                        │
├──────────────────────────────────────┼───────────────────────┼────────────────────────────────────────────────────────┤
│ client/src/components/Navbar.jsx     │ EXISTING / REFACTOR   │ Expand with complete role-aware navigation links,      │
│                                      │                       │ notification bell, profile dropdown, and AIX balance. │
│ client/src/pages/DatasetMarketplace  │ EXISTING / EXPAND     │ Connect to backend REST API /api/v1/datasets with      │
│                                      │                       │ blockchain fallback, add pagination & sorting.         │
│ client/src/pages/DatasetDetails.jsx  │ EXISTING / EXPAND     │ Integrate Phase 5 licensing selector, real purchase    │
│                                      │                       │ modal, and tabbed provenance lineage view.             │
│ client/src/pages/RegisterDataset.jsx │ EXISTING / REFACTOR   │ Upgrade from basic form to 10-step guided wizard with  │
│                                      │                       │ licensing selection and royalty BPS split config.      │
│ client/src/pages/WalletTest.jsx      │ EXISTING / KEEP       │ Retain as dedicated Developer Sandbox testbed view     │
│                                      │                       │ accessible under developer route /wallet-test.         │
│ client/src/services/blockchain/      │ EXISTING / EXPAND     │ Add service wrappers for LicenseRegistry, Purchase-   │
│                                      │                       │ Engine, ModelRegistry, Provenance, and RoyaltyEngine.  │
│ client/src/services/api/             │ EXISTING / EXPAND     │ Implement API service modules for auth, models,        │
│                                      │                       │ licenses, purchases, sandboxes, analytics, admin.      │
│ Redux Store (client/src/store/)      │ MISSING / TO CREATE   │ Initialize Redux Toolkit root store with auth, wallet, │
│                                      │                       │ notification, and marketplace slices.                  │
│ Design System Components             │ MISSING / TO CREATE   │ Build reusable atomic library (Button, Modal, Card,    │
│                                      │                       │ Table, Badge, Tabs, Stepper, Toast, Graph).            │
└──────────────────────────────────────┴───────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 5. Master Phase Matrix (Phase 0 → Phase 17)

The following matrix maps the entirety of AIXchange development to its direct frontend scope, dependencies, status, and major deliverables:

| Phase | Phase Name | Frontend Scope & Responsibilities | Upstream Dependencies | Frontend Status | Major UI Deliverables |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **0** | Research & Planning | Define information architecture, user journeys, design tokens, and wireframes. | Project Proposal | 🟢 `COMPLETE` | Master Roadmap (`FRONTEND_ROADMAP.md`), UI wireframe specs. |
| **1** | Project Foundation | Project scaffolding, Vite 8, React 19, Tailwind v4 setup, base layout shells. | Node.js, Vite | 🟢 `COMPLETE` | Application shell, root layout, responsive grid containers. |
| **2** | Database & Authentication | Login/register forms, JWT session storage, EIP-191 Web3 signature verification. | Backend `/auth`, `/wallet` | 🔵 `BACKEND READY` | Auth modals, Login/Register pages, Wallet linking modal. |
| **3** | AIX Token Economy | AIX balance display, transfer dialogs, token allowance approvals, tx status. | `AIXToken.sol`, Backend `/token` | 🟡 `IN PROGRESS` | TokenBalance badge, TransferModal, ApprovalStepper. |
| **4** | Dataset Marketplace | Dataset catalog discovery, keyword/tag filtering, IPFS preview modals, metadata. | `DatasetRegistry.sol`, Backend `/datasets` | 🟢 `COMPLETE` | `DatasetMarketplace.jsx`, `DatasetDetails.jsx`, `RegisterDataset.jsx`. |
| **5** | Licensing System | License template explorer, terms creator, rights bitmask toggles, verify badge. | `LicenseRegistry.sol`, Backend `/licenses` | 🔵 `BACKEND READY` | LicenseSelector, LicenseCard, RightsMatrix, CreateLicenseModal. |
| **6** | Purchase Engine | Multi-step purchase flow, balance verification, allowance approval, access proof. | `PurchaseEngine.sol`, Backend `/purchases` | 🔵 `BACKEND READY` | PurchaseModal, PurchaseReceipt, EntitlementGate, MyPurchases. |
| **7** | Docker Sandbox | Sandbox creator, file upload dropzone, PyTorch training console, live logs. | Backend `/sandboxes`, Python Substrate | 🟠 `AI READY` | SandboxDashboard, TrainingConsole, LiveLogViewer, JupyterEmbed. |
| **8** | Model Marketplace | Model catalog, framework filters, version history, SHA-256 weight hash check. | `ModelRegistry.sol`, Backend `/models` | 🟣 `BLOCKCHAIN READY` | ModelMarketplace, ModelDetails, ModelRegisterWizard, HashCheck. |
| **9** | Provenance Engine | Interactive lineage DAG graph, chronological event timeline, on-chain verifier. | `ProvenanceRegistry.sol`, Backend `/provenance` | 🟣 `BLOCKCHAIN READY` | ProvenanceGraph, LineageTimeline, VerifyProvenanceModal. |
| **10**| Royalty Engine | Multi-party split visualization, basis-point allocation builder, payout history. | `RoyaltyEngine.sol`, Backend `/royalties` | 🟣 `BLOCKCHAIN READY` | RoyaltyDashboard, SplitVisualizer, RecipientHistoryTable. |
| **11**| Analytics | Off-chain revenue/download charts, on-chain token velocity and gas heatmaps. | Backend `/analytics`, `/analytics/blockchain` | 🔵 `BACKEND READY` | AnalyticsDashboard, GasCostChart, RevenueTimeline, KPICards. |
| **12**| Admin Backend | Admin dashboard, user suspension, asset moderation, fraud review, audit log. | Backend `/admin`, Treasury telemetry | 🔵 `BACKEND READY` | AdminDashboard, ModerationQueue, FraudFlagDeck, AuditLogTable. |
| **13**| API Testing | Validate mock API integrations, edge-case error simulation, client error states. | Postman/Swagger suites, 110 tests | 🟢 `COMPLETE` | Verified API contracts, contract mock utilities, error testbed. |
| **14**| Frontend Development | Full production UI implementation across all 27 dedicated workstreams. | Phases 1–13 APIs & Contracts | 🟡 `IN PROGRESS` | Production single-page application (SPA), complete page inventory. |
| **15**| Integration Testing | End-to-end Cypress/Playwright suites validating complete user journeys. | Full system deployment | ⬜ `NOT STARTED` | E2E test scripts, wallet mock tests, purchase verification tests. |
| **16**| Production Deployment | Production Vite bundle optimization, Docker static container, CDN caching. | Cloud / Docker infrastructure | ⬜ `NOT STARTED` | Production build artifacts, Nginx SPA config, Lighthouse 95+ score. |
| **17**| Research Presentation | Live interactive demo flow, provenance visualization slides, benchmarks. | Fully operational deployment | ⬜ `NOT STARTED` | Presentation demo mode, guided walkthrough scripts, poster UI. |

---

## 6. Frontend Information Architecture & Navigation Tree

The frontend navigation architecture organizes the platform's multi-faceted capabilities into intuitive operational zones:

```text
AIXchange Platform Architecture
│
├── 🌐 Public Zone
│   ├── Landing Page (/)
│   ├── Dataset Catalog (/datasets)
│   ├── Dataset Details (/datasets/:id)
│   ├── Model Catalog (/models)
│   ├── Model Details (/models/:id)
│   ├── License Templates (/licenses/templates)
│   └── Public Provenance Explorer (/provenance/:modelId)
│
├── 🔐 Authentication Zone
│   ├── Login (/login)
│   ├── Register (/register)
│   ├── Forgot Password (/forgot-password)
│   ├── Reset Password (/reset-password)
│   └── Verify Email (/verify-email)
│
├── 👤 Authenticated Consumer Zone
│   ├── My Assets & Downloads (/my-assets)
│   ├── My Purchase History (/my-purchases)
│   ├── Interactive AI Inference (/inference)
│   ├── Web3 Wallet & AIX Portal (/wallet)
│   ├── User Profile & Settings (/profile, /settings)
│   └── Trust & Reviews Hub (/reputation)
│
├── 🛠️ Creator & Developer Zone
│   ├── Dataset Registration Wizard (/datasets/register)
│   ├── License Management & Builder (/licenses/manage)
│   ├── Model Registration Wizard (/models/register)
│   ├── Training Sandbox Studio (/sandboxes)
│   │   ├── Active Sandbox Console (/sandboxes/:id)
│   │   └── Embedded JupyterLab (/sandboxes/:id/jupyter)
│   ├── Secondary Royalty Dashboard (/royalties)
│   ├── Creator Analytics (/analytics/creator)
│   └── Developer Web3 Testbed (/wallet-test)
│
└── 🛡️ Platform Administration Zone (Role: admin)
    ├── Admin Executive Overview (/admin)
    ├── User Moderation (/admin/users)
    ├── Asset Moderation Queue (/admin/moderation)
    ├── Platform Abuse Reports (/admin/reports)
    ├── Blockchain Real-Time Monitor (/admin/blockchain)
    ├── Platform Treasury Vault (/admin/treasury)
    ├── Deterministic Fraud Review (/admin/fraud)
    └── Append-Only Audit Logs (/admin/audits)
```

---

## 7. Comprehensive Application Route Map

The following authoritative route table defines every screen, access rule, dependency, and status:

| Route Path | View / Component | Auth Level | Role Required | Project Phase | API Endpoint Dependency | Smart Contract Dependency | Frontend Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| `/` | `LandingPage.jsx` | Public | None | Phase 1 | `/api/v1/analytics/overview` | `DatasetRegistry.sol` | ⬜ `NOT STARTED` |
| `/login` | `LoginPage.jsx` | Public | Guest Only | Phase 2 | `/api/v1/auth/login` | None | 🔵 `BACKEND READY` |
| `/register` | `RegisterPage.jsx` | Public | Guest Only | Phase 2 | `/api/v1/auth/register` | None | 🔵 `BACKEND READY` |
| `/forgot-password` | `ForgotPassword.jsx` | Public | Guest Only | Phase 2 | `/api/v1/auth/forgot-password` | None | 🔵 `BACKEND READY` |
| `/reset-password` | `ResetPassword.jsx` | Public | Guest Only | Phase 2 | `/api/v1/auth/reset-password` | None | 🔵 `BACKEND READY` |
| `/verify-email` | `VerifyEmail.jsx` | Public | Any | Phase 2 | `/api/v1/auth/verify-email` | None | 🔵 `BACKEND READY` |
| `/datasets` | `DatasetMarketplace.jsx` | Public | Any | Phase 4 | `/api/v1/datasets` | `DatasetRegistry.sol` | 🟢 `COMPLETE` |
| `/datasets/register` | `RegisterDataset.jsx` | Protected | User / Creator | Phase 4 | `/api/v1/datasets/upload`, `/sync`| `DatasetRegistry.sol` | 🟢 `COMPLETE` |
| `/datasets/:id` | `DatasetDetails.jsx` | Public | Any | Phase 4 | `/api/v1/datasets/:id` | `DatasetRegistry.sol` | 🟢 `COMPLETE` |
| `/models` | `ModelMarketplace.jsx` | Public | Any | Phase 8 | `/api/v1/models` | `ModelRegistry.sol` | 🟣 `BLOCKCHAIN READY` |
| `/models/register` | `RegisterModel.jsx` | Protected | Creator / Dev | Phase 8 | `/api/v1/models`, `/models/sync` | `ModelRegistry.sol` | 🟣 `BLOCKCHAIN READY` |
| `/models/:id` | `ModelDetails.jsx` | Public | Any | Phase 8 | `/api/v1/models/:id` | `ModelRegistry.sol` | 🟣 `BLOCKCHAIN READY` |
| `/inference` | `InferencePlayground.jsx` | Protected | Any | Phase 8 | `/api/v1/models/:id/infer` | None (Off-Chain AI) | 🟠 `AI READY` |
| `/licenses/templates`| `LicenseTemplates.jsx` | Public | Any | Phase 5 | `/api/v1/licenses/templates` | `LicenseRegistry.sol` | 🔵 `BACKEND READY` |
| `/licenses/manage` | `LicenseManager.jsx` | Protected | Creator / Dev | Phase 5 | `/api/v1/licenses`, `/sync` | `LicenseRegistry.sol` | 🔵 `BACKEND READY` |
| `/my-assets` | `MyAssets.jsx` | Protected | Any | Phase 6 | `/api/v1/purchases`, `/download` | `PurchaseEngine.sol` | 🔵 `BACKEND READY` |
| `/sandboxes` | `SandboxDashboard.jsx` | Protected | Consumer / Dev | Phase 7 | `/api/v1/sandboxes` | `PurchaseEngine.sol` | 🟠 `AI READY` |
| `/sandboxes/:id` | `TrainingConsole.jsx` | Protected | Owner | Phase 7 | `/api/v1/sandboxes/:id/logs` | None (Off-Chain AI) | 🟠 `AI READY` |
| `/sandboxes/:id/jupyter` | `JupyterView.jsx` | Protected | Owner | Phase 7 | `/api/v1/sandboxes/:id/jupyter/*`| None (Container Substrate)| 🟠 `AI READY` |
| `/provenance` | `ProvenanceExplorer.jsx`| Public | Any | Phase 9 | `/api/v1/provenance` | `ProvenanceRegistry.sol`| 🟣 `BLOCKCHAIN READY` |
| `/provenance/graph/:modelId` | `LineageGraphView.jsx` | Public | Any | Phase 9 | `/api/v1/provenance/graph/:id` | `ProvenanceRegistry.sol`| 🟣 `BLOCKCHAIN READY` |
| `/royalties` | `RoyaltyDashboard.jsx` | Protected | Creator / Dev | Phase 10| `/api/v1/royalties/history` | `RoyaltyEngine.sol` | 🟣 `BLOCKCHAIN READY` |
| `/analytics` | `AnalyticsDashboard.jsx`| Protected | Any | Phase 11| `/api/v1/analytics/overview` | Indexed Event Store | 🔵 `BACKEND READY` |
| `/wallet` | `WalletDashboard.jsx` | Protected | Any | Phase 3 | `/api/v1/dashboard/wallet` | `AIXToken.sol`, `Treasury`| 🟡 `IN PROGRESS` |
| `/wallet-test` | `WalletTest.jsx` | Public | Any (Dev) | Phase 2–3 | `/api/v1/wallet/*` | `AIXToken.sol` | 🟢 `COMPLETE` |
| `/profile` | `ProfilePage.jsx` | Protected | Any | Phase 2 | `/api/v1/auth/profile` | None | 🔵 `BACKEND READY` |
| `/settings` | `SettingsPage.jsx` | Protected | Any | Phase 2 | `/api/v1/auth/*` | None | 🔵 `BACKEND READY` |
| `/reputation` | `ReputationPage.jsx` | Public | Any | Phase 4 | `/api/v1/datasets/:id/reviews` | None | 🔵 `BACKEND READY` |
| `/admin` | `AdminOverview.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/audits` | All 8 Contracts | 🔵 `BACKEND READY` |
| `/admin/users` | `UserModeration.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/users` | None | 🔵 `BACKEND READY` |
| `/admin/moderation` | `AssetModeration.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/datasets`, `/models`| `DatasetRegistry`, `Model` | 🔵 `BACKEND READY` |
| `/admin/reports` | `ReportQueue.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/reports` | None | 🔵 `BACKEND READY` |
| `/admin/treasury` | `TreasuryDeck.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/treasury` | `Treasury.sol` | 🔵 `BACKEND READY` |
| `/admin/blockchain` | `ChainMonitor.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/analytics/blockchain/*`| Blockchain Event Store | 🔵 `BACKEND READY` |
| `/admin/fraud` | `FraudReviewDeck.jsx` | Admin | Role: `admin` | Phase 12| `/api/v1/admin/fraud-flags` | Fraud Engine | 🔵 `BACKEND READY` |

---

## 8. Comprehensive Page Inventory & Specifications

Every major page in AIXchange is specified according to a standardized architectural template to eliminate ambiguity during implementation.

```markdown
### Architectural Specification Template
- **Route**: Canonical URL path with route parameters.
- **Purpose**: Business and technical objective of the view.
- **Target Users**: Consumer, Creator, Developer, Platform Auditor, Administrator.
- **Authentication**: Public, Authenticated, Creator, or Admin.
- **Dependencies**: Upstream contracts, backend APIs, and services.
- **Layout**: Structural layout shell (AppLayout, AuthLayout, DashboardLayout, AdminLayout).
- **Components**: Composite component hierarchy.
- **Data Requirements**: Required payloads and query shapes.
- **User Actions**: Primary and secondary interactions.
- **States**: Loading, Empty, Error, Success behaviors.
- **Non-Functional Requirements**: Responsive design, Accessibility (WCAG 2.1 AA), Animations, Security.
- **Completion Criteria**: Objective verification checklist.
```

---

### 8.1 Page: Landing & Value Proposition (`/`)
- **Route**: `/`
- **Purpose**: Introduces AIXchange, communicates the value proposition of blockchain-anchored AI assets, displays live platform metrics, and routes users into the catalog.
- **Target Users**: Prospective dataset buyers, model creators, ML researchers, enterprise teams.
- **Authentication**: Public (No authentication required).
- **Phase**: Phase 1 & Phase 14.
- **Dependencies**: Backend `/api/v1/analytics/overview`, Smart contract total counters.
- **Layout**: `PublicShell` with sticky `Navbar` and comprehensive `Footer`.
- **Components**: `HeroSection`, `LiveStatsBanner`, `FeatureMatrix`, `ProvenanceTeaser`, `RecentDatasetsCarousel`, `CallToActionCard`.
- **Data Requirements**: Total datasets count, total models count, confirmed marketplace volume in AIX, recent additions.
- **API Calls**: `GET /api/v1/analytics/overview`.
- **Blockchain Calls**: `DatasetRegistry.totalDatasets()`, `ModelRegistry.totalModels()`.
- **User Actions**:
  - Primary: Click "Explore Datasets" → navigates to `/datasets`.
  - Secondary: Click "Connect Wallet" → triggers Web3 connection modal.
- **Loading State**: Animated gradient skeleton cards across recent assets and numeric placeholders.
- **Empty State**: Fallback informational hero if backend analytics are temporarily cold-starting.
- **Error State**: Graceful degradation to hardcoded network metadata if backend is offline.
- **Success State**: Hero renders with glowing cyan/indigo mesh background and real-time live tickers.
- **Responsive Requirements**: Full-width on desktop; stacked feature cards on tablet; vertical CTA stack on mobile.
- **Accessibility Requirements**: Semantic `<header>`, `<main>`, `<section>`, `<footer>`. High-contrast text (>4.5:1).
- **Animation Requirements**: Smooth entrance fade-in on mount; subtle hover translateY(-4px) on cards.
- **Security Considerations**: Zero user input execution; static content sanitized.
- **Testing Requirements**: Render test, CTA navigation assertions, mobile responsive viewport snapshots.
- **Completion Criteria**: Page renders with 95+ Lighthouse performance, verified responsive breakpoints, and working CTAs.

---

### 8.2 Page: Authentication — Sign In (`/login`)
- **Route**: `/login`
- **Purpose**: Authenticates users using email/password or Web3 cryptographic signature (EIP-191).
- **Target Users**: All registered users and Web3 wallet holders.
- **Authentication**: Public (Redirects to `/datasets` if already authenticated).
- **Phase**: Phase 2.
- **Dependencies**: Backend `/api/v1/auth/login`, `/api/v1/wallet/nonce`, `/api/v1/wallet/verify`.
- **Layout**: `AuthShell` (centered glass card with subtle animated gradient backdrop).
- **Components**: `LoginForm`, `WalletConnectButton`, `SocialProofBadge`, `FormInput`, `AuthDivider`.
- **Data Requirements**: User email, password, wallet address, nonce, EIP-191 signature.
- **API Calls**:
  - `POST /api/v1/auth/login` (email/password).
  - `POST /api/v1/wallet/nonce` (request challenge nonce).
  - `POST /api/v1/wallet/verify` (submit signed challenge).
- **Blockchain Calls**: `signer.signMessage(challengeMessage)`.
- **User Actions**:
  - Primary: Enter email & password → Click "Sign In" → Receive JWT & redirect.
  - Secondary: Click "Sign in with Ethereum" → Sign challenge via MetaMask → Redirect.
- **Loading State**: Button spinner with disabled inputs; status text "Verifying signature on-chain...".
- **Empty State**: Clean, pre-validated form inputs.
- **Error State**: Inline red-400 alert on invalid credentials; modal alert if MetaMask is rejected or uninstalled.
- **Success State**: Toast notification "Welcome back, {name}" followed by route transition.
- **Responsive Requirements**: Centered 420px card on desktop/tablet; edge-to-edge padded card on mobile.
- **Accessibility Requirements**: ARIA `role="form"`, explicit `<label>` tags with `htmlFor`, keyboard tab navigation.
- **Animation Requirements**: Card scale entrance (0.98 → 1.0); shake animation on validation failure.
- **Security Considerations**: Passwords never logged; tokens stored in secure cookie / memory; brute-force rate-limiting displayed.
- **Testing Requirements**: Successful password login, rejected password, Web3 signing flow, MetaMask rejection.
- **Completion Criteria**: Form validates all edge cases, stores auth tokens, and updates Redux auth state.

---

### 8.3 Page: Dataset Marketplace Catalog (`/datasets`)
- **Route**: `/datasets`
- **Purpose**: The primary discovery catalog for all public datasets registered on-chain and indexed in MongoDB.
- **Target Users**: AI researchers, data engineers, model developers.
- **Authentication**: Public (Read-only); Authenticated for purchases and uploads.
- **Phase**: Phase 4.
- **Dependencies**: `DatasetRegistry.sol`, Backend `GET /api/v1/datasets`, IPFS Gateway.
- **Layout**: `AppLayout` (Sticky header, sidebar filters, responsive catalog grid).
- **Components**: `MarketplaceHeader`, `SearchFilterBar`, `CategoryPills`, `DatasetCardGrid`, `DatasetCard`, `IPFSPreviewModal`, `PaginationBar`.
- **Data Requirements**: Dataset ID, title, description, category, tags, license type, pricing, quality rating, downloads, CID.
- **API Calls**: `GET /api/v1/datasets?page=1&limit=20&search={q}&category={c}&tags={t}&sort={s}`.
- **Blockchain Calls**: Fallback to `DatasetRegistry.getAllDatasets()` if backend catalog is unavailable.
- **User Actions**:
  - Search by keyword, tag, or creator address.
  - Filter by category (NLP, Vision, Audio, Tabular, Multimodal).
  - Filter by license tier (Academic, Commercial, Exclusive, Custom).
  - Click dataset card → Navigate to `/datasets/:id`.
  - Click "Quick Preview" → Open `IPFSPreviewModal` to inspect sanitized sample rows.
- **Loading State**: 8 skeleton grid cards with shimmering gradient effect.
- **Empty State**: `EmptyState` component: "No datasets found matching your filter criteria" with "Reset Filters" button.
- **Error State**: Alert banner with "Smart contract connection error. Click to retry." and manual refresh button.
- **Success State**: High-density responsive card grid with active hover states and verified provenance badges.
- **Responsive Requirements**: 4 columns on 2K displays; 3 columns on desktop; 2 columns on tablet; 1 column on mobile.
- **Accessibility Requirements**: Keyboard navigation across cards (`tabindex="0"`, Enter to open); ARIA live regions on filter change.
- **Animation Requirements**: Filter transitions using cross-fade; card hover elevation and border glow.
- **Security Considerations**: Sanitize all search strings; ensure IPFS preview files never execute scripts.
- **Testing Requirements**: Search debounce testing, category filter assertion, blockchain fallback verification.
- **Completion Criteria**: Verified catalog rendering from backend MongoDB with seamless smart contract fallback.

---

### 8.4 Page: Dataset Details & Access Portal (`/datasets/:id`)
- **Route**: `/datasets/:id`
- **Purpose**: Displays exhaustive metadata, cryptographic hashes, licensing terms, version history, and purchase triggers for a specific dataset.
- **Target Users**: Buyers inspecting dataset quality and licensors managing their assets.
- **Authentication**: Public to view; Authenticated to purchase, review, or download.
- **Phase**: Phase 4 & Phase 6.
- **Dependencies**: `DatasetRegistry.sol`, `LicenseRegistry.sol`, `PurchaseEngine.sol`, Backend `GET /api/v1/datasets/:id`.
- **Layout**: `AppLayout` with hero metadata banner, two-column detail split, and tabbed deep-dive section.
- **Components**: `AssetHeroBanner`, `MetadataSidebar`, `LicenseOptionCard`, `PurchaseTriggerButton`, `DatasetTabPanel` (Overview, Sample Data, Versions, Provenance Lineage, Reviews), `CreatorControlsPanel`.
- **Data Requirements**: Canonical dataset record, CID, SHA-256 hash, owner address, versions, active licenses, user entitlement status (`hasAccess`).
- **API Calls**:
  - `GET /api/v1/datasets/:id`
  - `GET /api/v1/licenses/asset/:id`
  - `GET /api/v1/datasets/:id/preview`
  - `GET /api/v1/datasets/:id/reviews`
- **Blockchain Calls**:
  - `DatasetRegistry.getDataset(id)`
  - `PurchaseEngine.hasAccess(buyer, id)`
- **User Actions**:
  - Switch license tier (Academic vs. Commercial vs. Exclusive).
  - Click "Purchase Dataset License" → Opens `PurchaseModal`.
  - If owned/purchased: Click "Download Encrypted Archive" or "Launch Sandbox".
  - If owner: Click "Edit Metadata", "Update CID", "Toggle Active Status", or "Transfer Ownership".
- **Loading State**: Large hero skeleton with tab placeholder animations.
- **Empty State**: "Dataset version history empty" or "No customer reviews yet".
- **Error State**: 404 screen if dataset ID does not exist on-chain or in database.
- **Success State**: Complete technical datasheet with active Web3 verification chip and interactive sample explorer.
- **Responsive Requirements**: Two-column desktop layout collapses into single column on mobile with sticky bottom purchase bar.
- **Accessibility Requirements**: Semantic heading structure (`<h1>` for title, `<h2>` for sections), accessible tab roles (`role="tablist"`).
- **Animation Requirements**: Smooth tab content sliding transitions; interactive copy button feedback on CID hash.
- **Security Considerations**: Never expose encrypted file bytes on preview endpoint; download tokens bound to short expiration.
- **Testing Requirements**: Entitlement toggle test (verified vs unverified buyer), license selection state, purchase trigger.
- **Completion Criteria**: Complete display of dataset attributes, live blockchain verification, and functional purchase trigger.

---

### 8.5 Page: Multi-Step Dataset Registration Wizard (`/datasets/register`)
- **Route**: `/datasets/register`
- **Purpose**: A guided 10-step wizard for creators to upload dataset files, generate cryptographic commitments, configure licensing and royalties, and anchor the asset on Ethereum.
- **Target Users**: Data creators, ML researchers, enterprise data providers.
- **Authentication**: Protected (Role: User / Creator).
- **Phase**: Phase 4 & Phase 5.
- **Dependencies**: Backend `/api/v1/datasets/upload`, `/api/v1/datasets/sync`, `DatasetRegistry.sol`.
- **Layout**: `WizardShell` with top progress stepper and centered interactive step container.
- **Components**: `RegistrationStepper`, `Step1_BasicInfo`, `Step2_Metadata`, `Step3_TagsCategories`, `Step4_FileUploadIPFS`, `Step5_LicensingRules`, `Step6_PricingConfig`, `Step7_RoyaltySplits`, `Step8_ReviewSummary`, `Step9_BlockchainBroadcast`, `Step10_SuccessCelebration`.
- **Data Requirements**: Title, description, format, tags, file buffer, license types, price in AIX, royalty recipient addresses & BPS splits.
- **API Calls**:
  - `POST /api/v1/datasets/upload` (multipart file upload).
  - `POST /api/v1/datasets` (metadata draft).
  - `POST /api/v1/datasets/:id/blockchain` (sync on-chain registration).
- **Blockchain Calls**: `DatasetRegistry.registerDataset(cid, license, royaltyBps)`.
- **User Actions**:
  - Drag-and-drop file → Progress bar computes SHA-256 and streams upload to IPFS.
  - Configure multi-tier licensing and royalty percentages.
  - Click "Register On-Chain" → MetaMask prompts transaction confirmation.
- **Loading State**: Real-time upload progress percentage followed by Web3 transaction lifecycle indicator.
- **Empty State**: Pre-populated default licensing templates (Academic 0 AIX, Commercial 100 AIX).
- **Error State**: File size rejection (>500MB), invalid Ethereum recipient address, or transaction rejection modal.
- **Success State**: Confirmed transaction hash with Etherscan link, assigned `datasetId`, and button "View in Marketplace".
- **Responsive Requirements**: Stepper collapses to numeric pill indicator on mobile (`Step 4 of 10`); forms full-width.
- **Accessibility Requirements**: Stepper announces current step via `aria-live`; form fields have clear error descriptions.
- **Animation Requirements**: Step slide animation (forward left, backward right); confetti effect on step 10 completion.
- **Security Considerations**: Client file validation (MIME type and size); zero private key exposure.
- **Testing Requirements**: Multi-step navigation validation, file upload mock, transaction receipt synchronization.
- **Completion Criteria**: End-to-end dataset registration from file drag to on-chain ID allocation and catalog indexing.

---

### 8.6 Page: Model Marketplace Catalog (`/models`)
- **Route**: `/models`
- **Purpose**: Marketplace catalog for pre-trained AI models and neural network weights anchored by SHA-256 cryptographic digests on `ModelRegistry.sol`.
- **Target Users**: AI developers seeking verified models, enterprise teams integrating pre-trained solutions.
- **Authentication**: Public.
- **Phase**: Phase 8.
- **Dependencies**: `ModelRegistry.sol`, Backend `GET /api/v1/models`.
- **Layout**: `AppLayout` with framework filters, category selector, and responsive model card grid.
- **Components**: `ModelCatalogHeader`, `FrameworkFilterPills` (PyTorch, TensorFlow, Scikit-Learn, ONNX, Safetensors), `ModelCardGrid`, `ModelCard`, `ModelSearchBar`.
- **Data Requirements**: Model ID, title, description, category, framework, architecture, modelHash (SHA-256), latest version, owner, active status.
- **API Calls**: `GET /api/v1/models?page=1&limit=20&framework={f}&category={c}&search={q}`.
- **Blockchain Calls**: `ModelRegistry.totalModels()`, `ModelRegistry.getModel(id)`.
- **User Actions**: Filter by framework, search by name or hash, sort by popular/newest, navigate to `/models/:id`.
- **Loading State**: 8 shimmering skeleton cards with framework icon placeholders.
- **Empty State**: "No models found matching framework filter" with reset action.
- **Error State**: Alert notification with retry handler.
- **Success State**: Rich model cards displaying framework badges, version pills, and cryptographic hash verification badges.
- **Responsive Requirements**: 3 columns desktop, 2 columns tablet, 1 column mobile.
- **Accessibility Requirements**: Framework filters operate as accessible radio groups.
- **Animation Requirements**: Card hover elevation and subtle gradient border highlights.
- **Security Considerations**: Sanitized query parameters.
- **Testing Requirements**: Framework filter tests, search query debounce tests.
- **Completion Criteria**: Accurate display of models indexed from `ModelRegistry.sol`.

---

### 8.7 Page: Model Details & Verified Weights Portal (`/models/:id`)
- **Route**: `/models/:id`
- **Purpose**: Deep inspection of AI model architecture, on-chain SHA-256 weight hash verification, input/output schemas, lineage provenance, and direct inference triggers.
- **Target Users**: ML engineers reviewing model specifications and verifying weight integrity before deployment.
- **Authentication**: Public to view; Authenticated to run inference or download weights.
- **Phase**: Phase 8 & Phase 9.
- **Dependencies**: `ModelRegistry.sol`, `ProvenanceRegistry.sol`, Backend `GET /api/v1/models/:id`.
- **Layout**: `AppLayout` with technical spec header, hash verification card, version selector, and inference playground link.
- **Components**: `ModelHeaderBanner`, `SHA256VerificationCard`, `VersionHistoryTable`, `InputOutputSchemaViewer`, `LineageDAGPreview`, `RunInferenceCTA`.
- **Data Requirements**: Name, framework, modelType, metadataURI, modelHash, versions list, owner address, provenance DAG reference.
- **API Calls**:
  - `GET /api/v1/models/:id`
  - `GET /api/v1/models/:id/versions`
  - `POST /api/v1/models/:id/verify-hash`
- **Blockchain Calls**:
  - `ModelRegistry.verifyModelHash(modelId, version, hash)`
  - `ModelRegistry.getModel(modelId)`
- **User Actions**:
  - Verify artifact hash: User selects a local `.safetensors` file → client computes SHA-256 → compares against on-chain hash.
  - Switch model version: Inspect previous versions and changelog.
  - Click "Launch Inference Playground" → Navigate to `/models/:id/infer`.
- **Loading State**: Technical spec skeleton loaders.
- **Empty State**: "No previous versions recorded; this is version 1.0.0".
- **Error State**: Red banner if local weight hash does NOT match on-chain record ("Integrity Check Failed: Potential Tampering!").
- **Success State**: Bright emerald badge "Cryptographically Verified On-Chain (Block #{blockNumber})".
- **Responsive Requirements**: Collapsible side panels on mobile; responsive schema code blocks.
- **Accessibility Requirements**: Code snippets wrapped in accessible `<pre><code>` with copy button aria-labels.
- **Animation Requirements**: Pulse animation on cryptographic verification success.
- **Security Considerations**: Local hash calculation performed in browser Web Worker without uploading file bytes.
- **Testing Requirements**: Hash match verification test, hash mismatch rejection test, version selector test.
- **Completion Criteria**: Complete rendering of model metadata, working on-chain hash verification tool, and inference link.

---

### 8.8 Page: Interactive AI Inference Playground (`/inference`, `/models/:id/infer`)
- **Route**: `/inference` or `/models/:id/infer`
- **Purpose**: An interactive, browser-based AI execution playground allowing users to invoke pre-trained models hosted in the AI execution substrate.
- **Target Users**: Developers testing model predictions, consumers validating model capabilities before purchase.
- **Authentication**: Protected (Role: User / Consumer / Developer).
- **Phase**: Phase 8 & Phase 14.
- **Dependencies**: Backend `POST /api/v1/models/:id/infer`, Python AI Execution Substrate.
- **Layout**: `PlaygroundLayout` (Dual-pane IDE style: Left input form/JSON editor, Right output console and latency metrics).
- **Components**: `ModelSelectorDropdown`, `DynamicInputForm`, `RawJSONEditor`, `InferenceTriggerButton`, `PredictionConsole`, `ProbabilityChart`, `LatencyBadge`, `ExecutionCostTracker`.
- **Data Requirements**: Model input schema, test features, prediction output tensor, confidence probability, execution latency in milliseconds.
- **API Calls**: `POST /api/v1/models/:id/infer` with payload `{ inputs: [...], versionNumber: 1, return_probabilities: true }`.
- **Blockchain Calls**: Optional deduction check against AIX balance if inference is metered.
- **User Actions**:
  - Select model and version from dropdown.
  - Toggle between Schema Form inputs and Raw JSON feature vectors.
  - Click "Run Inference" → Dispatch request → View live output, latency, and probability scores.
- **Loading State**: Animated radar/tensor pulse animation in output panel with execution timer.
- **Empty State**: "Enter input parameters on the left and click 'Run Inference' to test the model."
- **Error State**: Inline red alert showing backend error (e.g., feature shape mismatch, dimension error).
- **Success State**: Formatted JSON output with confidence bar charts and latency readout (e.g., `42ms`).
- **Responsive Requirements**: Side-by-side on desktop (>1024px); stacked top/bottom on mobile and tablet.
- **Accessibility Requirements**: Live region announces "Inference completed in 42 milliseconds with prediction class 1".
- **Animation Requirements**: Smooth bar chart fill animations for class probabilities.
- **Security Considerations**: Strict JSON validation before dispatch; rate-limiting feedback displayed if 120 req/min exceeded.
- **Testing Requirements**: Form generation from schema test, raw JSON execution test, error handling on malformed input.
- **Completion Criteria**: Fully interactive inference execution returning predictions from the FastAPI substrate.

---

### 8.9 Page: Docker Training Sandbox Studio (`/sandboxes`)
- **Route**: `/sandboxes`
- **Purpose**: Manages isolated, containerized Docker sandboxes for training models on licensed datasets and launching JupyterLab development environments.
- **Target Users**: ML researchers, model developers.
- **Authentication**: Protected (Role: User / Developer / Creator).
- **Phase**: Phase 7.
- **Dependencies**: Backend `/api/v1/sandboxes`, Docker Execution Substrate (`python-services/`).
- **Layout**: `DashboardLayout` with top metric cards, active sandbox table, and "Create Sandbox" trigger.
- **Components**: `SandboxHeader`, `ResourceQuotaCard`, `ActiveSandboxGrid`, `SandboxCard`, `CreateSandboxModal`, `LifecycleBadge`.
- **Data Requirements**: List of user sandboxes, sandbox ID, name, bound datasetId, licenseId, lifecycle status (`READY`, `RUNNING`, `COMPLETED`, `FAILED`), resource usage.
- **API Calls**:
  - `GET /api/v1/sandboxes`
  - `POST /api/v1/sandboxes` (create new sandbox)
- **Blockchain Calls**: `PurchaseEngine.hasAccess(buyer, datasetId)` to verify access entitlement.
- **User Actions**:
  - Click "New Sandbox" → Select licensed dataset → Enter experiment name → Provision container.
  - Click on active sandbox → Open `TrainingConsole` (`/sandboxes/:id`).
  - Click "Launch JupyterLab" → Starts isolated Jupyter server and opens development environment.
- **Loading State**: Skeleton cards for sandbox resources.
- **Empty State**: `EmptyState` component: "You have no active sandboxes. Provision an isolated container to train models on your licensed datasets."
- **Error State**: Modal alert if user attempts to create a sandbox for an unlicensed dataset ("Access Denied: Please purchase a dataset license first").
- **Success State**: Sandbox card transitions from `CREATING` to `READY` with green pulsing status indicator.
- **Responsive Requirements**: Table transforms to card view on mobile screens.
- **Accessibility Requirements**: Lifecycle status changes announced via ARIA live regions.
- **Animation Requirements**: Status pulse animation for active running jobs.
- **Security Considerations**: Confirms user entitlement before exposing container controls; zero container root exposure.
- **Testing Requirements**: Entitlement verification check, sandbox creation workflow, lifecycle transition assertions.
- **Completion Criteria**: Complete listing and creation of isolated execution sandboxes backed by backend Docker manager.

---

### 8.10 Page: Active Training Console & Live Logs (`/sandboxes/:id`)
- **Route**: `/sandboxes/:id`
- **Purpose**: Real-time training control room displaying live loss/accuracy curves, epoch progress, streaming console logs, and checkpoint management.
- **Target Users**: ML engineers training neural networks inside isolated sandboxes.
- **Authentication**: Protected (Restricted to sandbox owner).
- **Phase**: Phase 7 & Phase 14.
- **Dependencies**: Backend `/api/v1/sandboxes/:id/train`, `/logs`, `/monitor`, Python PyTorch Trainer.
- **Layout**: `WorkspaceLayout` (Split view: Left metrics and loss chart, Right dark-theme live terminal console).
- **Components**: `TrainingControlBar` (Start, Stop, Cancel), `EpochProgressBar`, `LossAccuracyChart`, `StreamingTerminalLogs`, `CheckpointList`, `ExportModelModal`.
- **Data Requirements**: Sandbox details, training status, current epoch, total epochs, train loss, validation loss, metric history, console log lines.
- **API Calls**:
  - `GET /api/v1/sandboxes/:id`
  - `POST /api/v1/sandboxes/:id/train` (dispatch training pipeline)
  - `GET /api/v1/sandboxes/:id/logs` (polled every 2 seconds during execution)
  - `GET /api/v1/sandboxes/:id/monitor` (live telemetry sync)
- **Blockchain Calls**: None during active training; anchors to `ModelRegistry` upon completion.
- **User Actions**:
  - Configure training hyperparameters (epochs, learning rate, batch size, optimizer).
  - Click "Start Training" → Watch live epoch progress and streaming loss curves.
  - Click "Stop Training" → Safely interrupts training and saves latest checkpoint.
  - Click "Export & Register Model" → Prepares model artifact for `ModelRegistry.sol`.
- **Loading State**: Terminal renders "Connecting to sandbox container telemetry stream...".
- **Empty State**: Terminal waiting for start signal: "Sandbox ready. Press 'Start Training' to begin execution."
- **Error State**: Terminal displays stack trace in red monospace font if PyTorch process encounters an exception.
- **Success State**: Victory banner "Training Completed Successfully! Final Loss: 0.0412. Checkpoints saved to /output."
- **Responsive Requirements**: Full-width stacked layout on tablet/mobile with toggle between Logs and Charts.
- **Accessibility Requirements**: Terminal console marked with `role="log"` and `aria-live="polite"`.
- **Animation Requirements**: Chart smoothly appends new data points per epoch without re-rendering entire canvas.
- **Security Considerations**: Terminal logs sanitized to prevent ANSI injection attacks; commands locked to configured Python script.
- **Testing Requirements**: Polling interval test, start/stop trigger test, chart update assertion, export trigger.
- **Completion Criteria**: Verified live training execution with real-time log streaming, live loss plotting, and checkpoint export.

---

### 8.11 Page: Embedded JupyterLab Interactive Studio (`/sandboxes/:id/jupyter`)
- **Route**: `/sandboxes/:id/jupyter`
- **Purpose**: Provides a full-screen, token-authenticated interactive JupyterLab development environment running inside the user's isolated Docker container.
- **Target Users**: Data scientists exploring licensed datasets, writing exploratory code, and prototyping models.
- **Authentication**: Protected (Restricted to sandbox owner).
- **Phase**: Phase 7.
- **Dependencies**: Backend `/api/v1/sandboxes/:id/jupyter/start`, `/status`, `/stop`, Container JupyterLab server.
- **Layout**: `FullScreenLayout` with top thin toolbar and full-height embedded iframe / direct connection portal.
- **Components**: `JupyterToolbar` (Status badge, Kernel restart, Open in new tab, Terminate server), `IframeContainer`, `ConnectionErrorModal`.
- **Data Requirements**: Sandbox ID, JupyterLab connection URL, authentication token, server status (`STOPPED`, `STARTING`, `RUNNING`).
- **API Calls**:
  - `POST /api/v1/sandboxes/:id/jupyter/start`
  - `GET /api/v1/sandboxes/:id/jupyter/status`
  - `POST /api/v1/sandboxes/:id/jupyter/stop`
- **Blockchain Calls**: None.
- **User Actions**:
  - Click "Start JupyterLab" → Provisions server inside sandbox.
  - Interact with Jupyter notebooks, edit files in `/workspace`, run Python cells.
  - Click "Stop Server" → Gracefully stops JupyterLab to conserve container memory.
- **Loading State**: Circular progress indicator: "Spawning isolated JupyterLab kernel inside container...".
- **Empty State**: Informational splash screen: "JupyterLab is currently stopped. Click below to start your private studio."
- **Error State**: Connection timeout alert with troubleshooting recommendations and restart button.
- **Success State**: Crisp, responsive JupyterLab workspace embedded with full keyboard shortcut pass-through.
- **Responsive Requirements**: Desktop and large tablet recommended; displays warning banner on small mobile devices.
- **Accessibility Requirements**: External link option provided for native browser tab accessibility.
- **Animation Requirements**: Smooth fade-in of iframe upon `onload` event.
- **Security Considerations**: Iframe secured with strict `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` attributes; token authenticated.
- **Testing Requirements**: Lifecycle test (start server → verify status → stop server), iframe load event test.
- **Completion Criteria**: Fully functional embedded or linked JupyterLab development environment locked to container workspace.

---

### 8.12 Page: AI Provenance Lineage Explorer & DAG Visualizer (`/provenance`, `/provenance/graph/:modelId`)
- **Route**: `/provenance` or `/provenance/graph/:modelId`
- **Purpose**: The hallmark scientific feature of AIXchange: an interactive Directed Acyclic Graph (DAG) and timeline proving the exact lineage of datasets, execution sandboxes, models, and cryptographic hashes.
- **Target Users**: AI auditors, compliance officers, enterprise buyers, model creators.
- **Authentication**: Public.
- **Phase**: Phase 9 & Phase 14.
- **Dependencies**: `ProvenanceRegistry.sol`, Backend `GET /api/v1/provenance/graph/:modelId`, `/timeline/:modelId`.
- **Layout**: `CanvasLayout` (Full-screen interactive graph canvas with floating detail card and zoom controls).
- **Components**: `DAGCanvas` (HTML5 Canvas / SVG graph), `LineageNode` (Dataset, Execution, Model, Hash), `LineageEdge`, `NodeInspectorDrawer`, `TimelineSlider`, `OnChainVerifyButton`.
- **Data Requirements**: Graph nodes array (id, label, type, metadata, hash), edges array (source, target, relationship), timeline events.
- **API Calls**:
  - `GET /api/v1/provenance/graph/:modelId`
  - `GET /api/v1/provenance/timeline/:modelId`
  - `GET /api/v1/provenance/:id/verify`
- **Blockchain Calls**: `ProvenanceRegistry.verifyProvenance(datasetId, executionId, modelId, version)`.
- **User Actions**:
  - Pan and zoom across lineage DAG.
  - Click node (Dataset, Training Run, Model Version) → Open `NodeInspectorDrawer` with byte hashes and transaction IDs.
  - Click "Verify On-Chain" → Triggers live call to `ProvenanceRegistry.sol` to prove mathematical authenticity.
  - Drag timeline slider to view evolution of model across versions.
- **Loading State**: Shimmering graph skeleton with connecting animated SVG dotted lines.
- **Empty State**: "No provenance records registered for this asset yet."
- **Error State**: Graph rendering error boundary with fallback chronological list view.
- **Success State**: GPU-accelerated interactive DAG with glowing cyan/purple edges and verified green shield icons.
- **Responsive Requirements**: Graph pan/pinch-to-zoom on touch devices; collapsible inspector bottom sheet on mobile.
- **Accessibility Requirements**: Full alternative accessible tabular view (`/provenance/table/:modelId`) for screen readers.
- **Animation Requirements**: Edge pulse animation indicating directional data flow from Dataset → Training → Model.
- **Security Considerations**: Sanitize all metadata strings displayed in node inspector.
- **Testing Requirements**: Graph node parsing test, click selection assertion, on-chain verification trigger test.
- **Completion Criteria**: Flawless, performant visualization of multi-stage AI provenance DAG with verified on-chain confirmation.

---

### 8.13 Page: Secondary Royalty Engine & Split Dashboard (`/royalties`)
- **Route**: `/royalties`
- **Purpose**: Displays automated revenue distributions, secondary market splits, and historical earnings for creators and upstream data contributors.
- **Target Users**: Dataset creators, derivative model contributors, platform treasury auditors.
- **Authentication**: Protected (Role: Creator / Developer / User).
- **Phase**: Phase 10.
- **Dependencies**: `RoyaltyEngine.sol`, Backend `/api/v1/royalties/*`.
- **Layout**: `DashboardLayout` with KPI metric cards, revenue split visualizer, and historical distribution table.
- **Components**: `RoyaltyKPICards` (Total Earned, Pending Splits, Platform Fees Paid, Active Distributions), `RevenueSplitTree`, `CalculateSplitSimulator`, `DistributionHistoryTable`, `ReconciliationAuditModal`.
- **Data Requirements**: Aggregated royalty metrics, distribution records list, recipient addresses, basis-point shares, AIX amounts.
- **API Calls**:
  - `GET /api/v1/royalties/summary`
  - `GET /api/v1/royalties/history?page=1&limit=20`
  - `POST /api/v1/royalties/calculate-split`
- **Blockchain Calls**: `RoyaltyEngine.getDistribution(distributionId)`.
- **User Actions**:
  - Filter earnings by asset, date range, or transaction status.
  - Open "Split Simulator": Enter 1000 AIX and recipient basis points → view exact breakdown down to zero-leakage treasury dust.
  - Click "Reconcile On-Chain": Audits database records against canonical `RoyaltyEngine.sol` smart contract.
- **Loading State**: KPI card skeletons and shimmering table rows.
- **Empty State**: "No royalty distributions recorded for your account yet."
- **Error State**: Alert banner if backend synchronization with blockchain is delayed.
- **Success State**: Clear, high-contrast revenue tree showing exact flow: `Gross Payment (100%)` → `Treasury (2.50%)` → `Creator (60%)` → `Upstream Contributor (37.50%)`.
- **Responsive Requirements**: Tree diagram scales horizontally with touch scrolling on mobile; table stacks.
- **Accessibility Requirements**: Visual tree accompanied by accessible hierarchical table with percentage summaries.
- **Animation Requirements**: Tree node connection animations illustrating money flow.
- **Security Considerations**: Exact string BigInt calculations to prevent JavaScript floating-point precision loss.
- **Testing Requirements**: Split calculation simulator test, reconciliation trigger assertion, pagination test.
- **Completion Criteria**: Complete financial transparency of multi-party royalty splits matching on-chain accounting.

---

### 8.14 Page: Multi-Dimensional Analytics Dashboard (`/analytics`)
- **Route**: `/analytics`
- **Purpose**: Enterprise-grade business intelligence dashboard aggregating off-chain platform metrics (revenue, downloads, API calls) and on-chain blockchain telemetry (gas consumption, token velocity).
- **Target Users**: Creators evaluating asset sales, enterprise users tracking spending, platform administrators.
- **Authentication**: Protected.
- **Phase**: Phase 11.
- **Dependencies**: Backend `/api/v1/analytics/*`, `/api/v1/analytics/blockchain/*`.
- **Layout**: `DashboardLayout` with date-range picker, domain selector tabs, KPI summary cards, and responsive chart grid.
- **Components**: `AnalyticsDateRangePicker`, `DomainTabs` (Overview, Revenue, Transactions, Downloads, Inference API, Blockchain & Gas), `KPISummaryRow`, `RevenueLineChart`, `TransactionStatusDonut`, `GasConsumptionBarChart`, `TopAssetsTable`.
- **Data Requirements**: Time-series datasets, summary totals, ISO-week aggregations, gas costs in Gwei, active user counts.
- **API Calls**:
  - `GET /api/v1/analytics/overview?startDate={s}&endDate={e}`
  - `GET /api/v1/analytics/revenue?interval=day`
  - `GET /api/v1/analytics/blockchain/gas`
  - `GET /api/v1/analytics/blockchain/token`
- **Blockchain Calls**: None directly (consumed from indexed backend database projection).
- **User Actions**:
  - Select date range: Today, Last 7 Days, Last 30 Days, Year to Date, Custom Range.
  - Toggle interval: Day, Week, Month.
  - Drill down into specific asset performance.
  - Export CSV analytics report.
- **Loading State**: Coordinated skeleton chart containers with loading spinners.
- **Empty State**: "No transaction activity recorded during the selected date range."
- **Error State**: Error boundary card allowing independent chart retry without breaking page.
- **Success State**: Interactive charts with hover tooltips, crosshairs, and synchronized legend toggles.
- **Responsive Requirements**: 2-column chart grid on desktop collapses into single-column vertical layout on mobile.
- **Accessibility Requirements**: Charts utilize color-blind friendly palettes with distinct patterns; data tables provided for all charts.
- **Animation Requirements**: Smooth chart entrance animation on date range change.
- **Security Considerations**: Access controls verify user only views their own creator revenue or public aggregates.
- **Testing Requirements**: Date-range query parameter test, chart render assertion, CSV export test.
- **Completion Criteria**: Comprehensive BI dashboard operating across all 5 off-chain and 3 on-chain telemetry domains.

---

### 8.15 Page: Web3 AIX Wallet & Treasury Terminal (`/wallet`)
- **Route**: `/wallet`
- **Purpose**: Manages the user's on-chain AIX token balance, approvals, transfer transactions, and wallet verification state.
- **Target Users**: All platform users engaging in marketplace commerce.
- **Authentication**: Protected.
- **Phase**: Phase 3.
- **Dependencies**: `AIXToken.sol`, `Treasury.sol`, Backend `/api/v1/dashboard/wallet`, `/api/v1/token/*`.
- **Layout**: `DashboardLayout` with hero wallet balance card, quick actions, and transaction history feed.
- **Components**: `WalletHeroCard` (Native ETH, AIX Balance, USD Estimate), `NetworkBadge`, `QuickActionButtons` (Transfer, Approve, Faucet/Mint for dev), `TransferTokenModal`, `ApprovalManagerModal`, `TransactionHistoryTable`, `ExplorerLink`.
- **Data Requirements**: Connected wallet address, ETH balance, AIX balance, allowance for `PurchaseEngine`, indexed transaction list.
- **API Calls**:
  - `GET /api/v1/dashboard/wallet`
  - `GET /api/v1/token/history?page=1&limit=20`
- **Blockchain Calls**:
  - `AIXToken.balanceOf(address)`
  - `AIXToken.allowance(owner, spender)`
  - `AIXToken.transfer(to, amount)`
  - `AIXToken.approve(spender, amount)`
- **User Actions**:
  - Connect or switch MetaMask wallet.
  - Click "Send AIX" → Enter recipient address & amount → Confirm on MetaMask.
  - Manage contract allowances (revoke or increase approval for `PurchaseEngine`).
  - View paginated transfer and purchase history with links to local block explorer.
- **Loading State**: Shimmering card balances with skeleton table.
- **Empty State**: "No token transactions found for this wallet address."
- **Error State**: Red alert banner if connected to unsupported chain (e.g., Wrong Network: Please switch to Localhost 31337 or Sepolia).
- **Success State**: Real-time balance updates with toast notification on confirmed transfer.
- **Responsive Requirements**: Full-width wallet card on mobile with quick action icon buttons.
- **Accessibility Requirements**: Form inputs include explicit currency labels; transaction status announced.
- **Animation Requirements**: Balance counter rolls up on initial load.
- **Security Considerations**: Recipient address checksum verification; display warning when approving unlimited allowance.
- **Testing Requirements**: Balance fetch test, transfer validation, allowance approval test, network switch handler.
- **Completion Criteria**: Complete Web3 wallet management terminal interfacing with `AIXToken.sol`.

---

### 8.16 Page: Administrative Control Deck (`/admin`)
- **Route**: `/admin`
- **Purpose**: The mission control deck for platform operators to monitor system health, oversee moderation queues, inspect fraud flags, and audit the treasury.
- **Target Users**: Platform administrators and governance operators.
- **Authentication**: Admin Only (Enforces `requireAdmin` role check).
- **Phase**: Phase 12.
- **Dependencies**: Backend `/api/v1/admin/*`, Smart Contract Event Indexers.
- **Layout**: `AdminLayout` (Dark tactical dashboard with dedicated sidebar navigation and real-time status tickers).
- **Components**: `AdminMetricGrid`, `SystemHealthTicker`, `PendingReviewAlerts`, `RecentAuditLogFeed`, `TreasuryTelemetryWidget`, `QuickModerationActions`.
- **Data Requirements**: Total users count, active/suspended users, total datasets/models, pending reports count, unreviewed fraud flags count, treasury balances.
- **API Calls**:
  - `GET /api/v1/admin/treasury`
  - `GET /api/v1/admin/audits?limit=10`
  - `GET /api/v1/admin/reports?status=PENDING`
  - `GET /api/v1/admin/fraud-flags?status=UNREVIEWED`
- **Blockchain Calls**: `Treasury.getETHBalance()`, `Treasury.getTokenBalance(AIXToken)`.
- **User Actions**:
  - View high-level operational health of the platform.
  - Click on alert pills to jump directly into Moderation, Reports, or Fraud review queues.
  - Perform quick emergency pause checks or inspect recent admin actions.
- **Loading State**: Tactical grid skeleton with pulse loaders.
- **Empty State**: "All moderation queues clear. System running at 100% nominal health."
- **Error State**: 403 Forbidden screen for non-admin users with redirect to `/datasets`.
- **Success State**: Complete operational overview with live status indicators and real-time event tickers.
- **Responsive Requirements**: Desktop-first design; tablet responsive; mobile renders critical alert summaries.
- **Accessibility Requirements**: High-contrast dark theme with distinct status colors; fully navigable via keyboard.
- **Animation Requirements**: Subtle pulse animations on unreviewed security alert badges.
- **Security Considerations**: Absolute role enforcement on client and verified server session; self-moderation blocked.
- **Testing Requirements**: Role guard enforcement test, admin metric aggregation test, quick navigation assertion.
- **Completion Criteria**: Fully functional executive administrative deck unifying all Phase 12 subsystems.

---

### 8.17 Page: Admin Asset & User Moderation Queue (`/admin/moderation`, `/admin/users`)
- **Route**: `/admin/moderation` & `/admin/users`
- **Purpose**: Operational queues for reviewing, approving, suspending, or deactivating user accounts, datasets, and models with mandatory audit logging.
- **Target Users**: Platform moderators and compliance personnel.
- **Authentication**: Admin Only.
- **Phase**: Phase 12.
- **Dependencies**: Backend `/api/v1/admin/users`, `/datasets`, `/models`.
- **Layout**: `AdminLayout` with filterable data tables, quick action drawers, and confirmation modals.
- **Components**: `ModerationTable`, `StatusFilterTabs`, `UserActionDrawer`, `AssetInspectionModal`, `SuspensionReasonModal`, `AuditLogConfirmation`.
- **Data Requirements**: Paginated lists of users and assets with statuses, metadata, report counts, and violation histories.
- **API Calls**:
  - `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/:id/status`
  - `GET /api/v1/admin/datasets`, `PATCH /api/v1/admin/datasets/:id/status`
  - `GET /api/v1/admin/models`, `PATCH /api/v1/admin/models/:id/status`
- **Blockchain Calls**: None directly (syncs database state with indexer projection).
- **User Actions**:
  - Search users or assets by name, ID, or wallet.
  - Toggle user status: `ACTIVE` ↔ `SUSPENDED` (with mandatory reason prompt).
  - Toggle asset status: `ACTIVE` ↔ `DEACTIVATED` (instantly removes from marketplace catalog).
  - Inspect IPFS files and model metadata in safe sandboxed viewer.
- **Loading State**: Shimmering table rows with disabled action buttons.
- **Empty State**: "No assets pending moderation."
- **Error State**: Error alert if moderator attempts to suspend their own account ("Forbidden: Self-moderation blocked").
- **Success State**: Instant optimistic status update with success toast and automatic append to audit log.
- **Responsive Requirements**: Horizontal table scrolling on smaller screens with sticky action column.
- **Accessibility Requirements**: Modal dialogs trap focus; status changes announced via ARIA live region.
- **Animation Requirements**: Drawer slide-in from right edge; subtle row fade on deactivation.
- **Security Considerations**: Mandatory suspension reason logged for legal compliance; CSRF token protected.
- **Testing Requirements**: User suspension test, self-suspension blocking test, asset deactivation catalog removal test.
- **Completion Criteria**: Complete moderation workflow for users, datasets, and models with append-only audit tracking.

---

### 8.18 Page: Deterministic Fraud Review & Security Flags Deck (`/admin/fraud`)
- **Route**: `/admin/fraud`
- **Purpose**: Human-in-the-loop review interface for evaluating suspicious on-chain transactions flagged by the 5 deterministic blockchain fraud detection rules.
- **Target Users**: Security officers, platform auditors, financial compliance teams.
- **Authentication**: Admin Only.
- **Phase**: Phase 12.
- **Dependencies**: Backend `/api/v1/admin/fraud-flags`, Node.js Blockchain Fraud Engine.
- **Layout**: `AdminLayout` with severity filter tabs, flag queue table, and evidence deep-dive drawer.
- **Components**: `FraudRuleFilterTabs` (Rapid Burst, Whale Transfer, Treasury Drain, Anomalous Royalty, Repeated Failures), `FraudFlagTable`, `RiskScoreBadge`, `EvidenceDeepDivePanel`, `ReviewActionModal`.
- **Data Requirements**: Flagged entity ID, rule triggered, risk score (0–100), transaction hash, block number, evidence metadata, review status (`UNREVIEWED`, `CONFIRMED_FRAUD`, `FALSE_POSITIVE`, `RESOLVED`).
- **API Calls**:
  - `GET /api/v1/admin/fraud-flags`
  - `GET /api/v1/admin/fraud-flags/:id`
  - `PATCH /api/v1/admin/fraud-flags/:id/status`
- **Blockchain Calls**: Link to on-chain transaction hash on block explorer.
- **User Actions**:
  - Filter by fraud rule type and risk severity.
  - Click flag → Open `EvidenceDeepDivePanel` displaying raw transaction inputs, block delta, and heuristic trigger math.
  - Click "Confirm Fraud" or "Dismiss as False Positive" → Enter reviewer notes → Submit resolution.
- **Loading State**: Table skeleton loaders.
- **Empty State**: "Zero unreviewed fraud flags. On-chain transaction streams are normal."
- **Error State**: Alert if review submission fails.
- **Success State**: Flag status updates with green/red badge and reviewer audit timestamp.
- **Responsive Requirements**: Evidence drawer expands to full width on mobile devices.
- **Accessibility Requirements**: Risk score badges feature distinct iconography in addition to color coding.
- **Animation Requirements**: Subtle pulse animation on critical risk scores (>80).
- **Security Considerations**: Zero automated punishment: all enforcement actions require human review and confirmation.
- **Testing Requirements**: Flag listing test, evidence drawer render test, review status update test.
- **Completion Criteria**: Operational human-in-the-loop fraud review deck covering all 5 deterministic blockchain rules.

---

## 9. Dataset Marketplace & Discovery Specification

The dataset marketplace is the core commercial gateway of AIXchange. It must deliver an uncompromised discovery experience combining high-speed client-side filtering with robust server-side indexing.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Dataset Marketplace Layout                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Search datasets by keyword, tag, or creator...]              [Sort: Popular / Newest] │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ Categories              │  ┌────────────────────────┐  ┌────────────────────────┐      │
│  [x] All Categories     │  │ Medical Imaging CT     │  │ Autonomous Driving LiD │      │
│  [ ] Computer Vision    │  │ Category: Vision       │  │ Category: Multimodal   │      │
│  [ ] NLP & Text         │  │ License: Commercial    │  │ License: Academic      │      │
│  [ ] Audio & Speech     │  │ Price: 250 AIX         │  │ Price: Free (0 AIX)    │      │
│  [ ] Tabular & Financial│  │ Rating: 4.9 ★ (32)     │  │ Rating: 4.8 ★ (18)     │      │
│                         │  │ [Provenance Verified]  │  │ [Provenance Verified]  │      │
│ License Tier            │  │ [Quick Preview] [View] │  │ [Quick Preview] [View] │      │
│  [ ] Academic Only      │  └────────────────────────┘  └────────────────────────┘      │
│  [ ] Commercial Allowed │  ┌────────────────────────┐  ┌────────────────────────┐      │
│  [ ] Exclusive Rights   │  │ Financial Time Series  │  │ Multi-Lingual Speech   │      │
│                         │  │ Category: Tabular      │  │ Category: Audio        │      │
│ Price Range             │  │ License: Custom        │  │ License: Commercial    │      │
│  [0] ---------- [1000]  │  │ Price: 500 AIX         │  │ Price: 120 AIX         │      │
└─────────────────────────┴──────────────────────────┴──────────────────────────┴──────┘
```

### Key Functional Requirements
1. **Catalog Querying**: Default catalog consumes `GET /api/v1/datasets`. If the backend server is unreachable, the client automatically falls back to invoking `DatasetRegistry.getAllDatasets()` over the JSON-RPC provider.
2. **Dataset Cards**: Every card displays:
   - Asset title and creator address (formatted with ENS/truncate).
   - Category badge with color-coded theme.
   - Primary license tier and price formatted in AIX.
   - Quality score & review count.
   - Provenance verification shield indicator.
   - Quick IPFS preview modal trigger.
3. **IPFS Preview Modal**: Fetches sanitized preview rows via `GET /api/v1/datasets/:id/preview`. For tabular data, renders an accessible data table; for images, renders a thumbnail grid with watermark; for text, renders syntax-highlighted excerpts. Protected archive bytes are never exposed.

---

## 10. Multi-Step Dataset Registration Wizard (10-Stage Pipeline)

To onboard creators without error, dataset registration is structured as an immutable 10-stage guided pipeline:

```text
[Step 1: Basic Info]      -> Title, subtitle, high-level summary
[Step 2: Metadata]        -> Domain, modality, file format, schema details
[Step 3: Categorization]  -> Primary category, search tags, keywords
[Step 4: File & IPFS]     -> Drag & drop file, client SHA-256 calculation, encrypted IPFS pin
[Step 5: Licensing Rules] -> Select Academic, Commercial, Exclusive, or Custom templates
[Step 6: Pricing Setup]   -> Set fixed price in AIX tokens or royalty rate
[Step 7: Royalty Splits]  -> Configure upstream recipient addresses & basis-point shares
[Step 8: Review & Audit]  -> Full summary datasheet, checksum verification check
[Step 9: On-Chain Anchor] -> MetaMask transaction broadcast to DatasetRegistry.registerDataset()
[Step 10: Celebration]    -> Assigned on-chain datasetId, Etherscan link, marketplace redirection
```

### Stage-by-Stage Implementation Details
- **Step 4 (File & IPFS Upload)**: Uses HTML5 File API. Reads file in chunks via `FileReader` to compute a deterministic SHA-256 digest in the browser. Streams the payload to `POST /api/v1/datasets/upload` where the server performs AES-256 encryption and pins the encrypted blob to IPFS, returning the immutable CID.
- **Step 7 (Royalty Splits)**: Creators can allocate up to 50 upstream contributors using basis points ($100 \text{ BPS} = 1.0\%$). Real-time validation ensures $\sum \text{BPS} \le 10,000$ and all addresses are valid Ethereum checksum format.
- **Step 9 (Blockchain Broadcast)**: Client calls `datasetService.registerDataset(cid, licenseType, royaltyBps)`. The UI displays a live transaction lifecycle stepper (`Awaiting Signature` → `Submitted` → `Mining Block` → `Indexed`).

---

## 11. Licensing System UI & Rights Matrix

Phase 5 introduces legal and economic licensing on `LicenseRegistry.sol`. The frontend provides a clear, transparent rights matrix that maps legal permissions directly to smart contract state:

### Supported Licensing Tiers & Pricing Models
- **`ACADEMIC`**: Restricted to educational and non-commercial research; commercial use prohibited.
- **`COMMERCIAL`**: Grants commercial exploitation, model training, and deployment rights.
- **`EXCLUSIVE`**: One-time purchase that locks out all subsequent buyers; ownership privileges apply.
- **`CUSTOM`**: Bespoke rights configuration defined by the creator.
- **Pricing**: `FIXED` (flat payment in AIX) or `ROYALTY` (percentage of downstream revenue in BPS).

### The Rights Bitmask Matrix Component (`RightsMatrix.jsx`)
The frontend renders a visual comparison table detailing the 8 atomic rights enforced by `LicenseRegistry`:

| Permission Flag | Contract Property | Academic | Commercial | Exclusive | Custom |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **View Metadata** | `canView` | ✅ | ✅ | ✅ | Configurable |
| **Download Data** | `canDownload` | ✅ | ✅ | ✅ | Configurable |
| **Modify Content**| `canModify` | ❌ | ✅ | ✅ | Configurable |
| **Train AI Model**| `canTrain` | ✅ | ✅ | ✅ | Configurable |
| **Run Inference** | `canInfer` | ✅ | ✅ | ✅ | Configurable |
| **Commercialize** | `canCommercialUse` | ❌ | ✅ | ✅ | Configurable |
| **Distribute** | `canDistribute` | ❌ | ❌ | ✅ | Configurable |
| **Sublicense** | `canSublicense` | ❌ | ❌ | ✅ | Configurable |

---

## 12. Purchase Engine & Atomic Settlement Experience

The purchase experience provides an atomic, anxiety-free transaction flow that guides the user through token allowance approval and contract execution.

```text
Purchase Lifecycle Sequence:
[1. Select Asset & License]
       │
[2. Verify AIX Balance]  ──(Insufficient)──> [Prompt AIX Faucet / Transfer Modal]
       │ (Sufficient)
[3. Check AIX Allowance] ──(Allowance < Price)──> [Prompt AIXToken.approve() Stepper]
       │ (Approved)
[4. Broadcast PurchaseEngine.purchaseDataset(datasetId, licenseId)]
       │
[5. Awaiting Block Confirmation] (Mining Block...)
       │
[6. Synchronize Backend MongoDB Projection via /api/v1/purchases/sync]
       │
[7. Grant Instant Entitlement (hasAccess = true) & Render Purchase Receipt]
```

### Edge Cases Handled by Purchase UI
1. **Insufficient Balance**: The purchase button is disabled, displaying "Insufficient AIX Balance" with a button to "Get AIX Tokens".
2. **Zero Allowance**: If the current allowance on `AIXToken` for `PurchaseEngine` is lower than the asset price, the modal executes an inline two-step stepper: Step 1 "Approve AIX", Step 2 "Confirm Purchase".
3. **Exclusive License Sold**: If an exclusive license has already been purchased, the UI disables selection and renders a red badge: "Exclusive License Claimed".
4. **Network Rejection**: If the user cancels the transaction in MetaMask, the modal returns gracefully to Step 1 without resetting form selections.

---

## 13. AIX Token Economy & Web3 Wallet Architecture

The native **AIX Token** (`AIX`) is the utility engine powering payments, licensing, and royalties across AIXchange.

### Core Token Specifications
- **Contract**: `AIXToken.sol` (OpenZeppelin ERC-20).
- **Decimals**: 18.
- **Initial Supply**: 1,000,000,000 AIX (`10^27` wei).
- **Platform Fee**: 2.50% (250 BPS) automatically routed to `Treasury.sol`.

### Reusable Wallet Component Hierarchy
```text
client/src/components/wallet/
├── WalletButton.jsx          # Header button displaying address or connect CTA
├── WalletModal.jsx           # Connection dialog supporting MetaMask & injected providers
├── NetworkSwitcher.jsx       # Alert banner & switcher for chain ID 31337 / 11155111
├── WalletBalance.jsx         # Compact badge rendering native ETH & AIX balances
├── TokenTransferModal.jsx    # Dialog for sending AIX tokens to another address
├── TokenApprovalModal.jsx    # Dialog for managing contract allowances
├── TransactionStatus.jsx     # Visual multi-step mining lifecycle stepper
└── TransactionHistory.jsx    # Paginated feed of token events with explorer links
```

---

## 14. Model Marketplace Specification

Phase 8 elevates AIXchange from a dataset exchange into a comprehensive **AI Model Registry and Marketplace**.

### Model Card Specification (`ModelCard.jsx`)
- **Framework Pill**: PyTorch (orange), TensorFlow (amber), Scikit-Learn (blue), ONNX (indigo), Safetensors (emerald).
- **Model Identity**: Model title, creator address, version badge (`v1.0.0`), and model type (Classification, Generation, Regression).
- **Cryptographic Anchor**: Truncated SHA-256 weight hash with quick-copy and on-chain verification shield.
- **Actions**: "View Details", "Inspect Provenance", "Run Inference".

---

## 15. Model Registration & Checksum Anchoring UX

The model registration workflow allows developers to anchor machine learning models on `ModelRegistry.sol`:

1. **Model Metadata**: Input title, description, category, tags, and neural network framework.
2. **Artifact Checksum**: The developer drops their `.safetensors` or `.pt` weight file into the browser. A Web Worker hashes the file using SHA-256 to guarantee zero byte tampering.
3. **Input / Output Schema Definition**: Define feature shapes, types, and expected output classes (used to generate the dynamic inference playground).
4. **Blockchain Transaction**: Calls `ModelRegistry.registerModel(name, metadataUri, modelHash)`.
5. **Sync with MongoDB**: Calls `POST /api/v1/models/sync` to index the registered model for full-text catalog search.

---

## 16. Interactive AI Inference Playground UX

The inference playground (`/models/:id/infer`) functions like a specialized AI developer IDE:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI Inference Playground                                  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ Model: ResNet-50 Classifier (v1.0)       │ Latency: 38ms | Device: CPU | Status: 200 OK│
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Input Mode: [Form View] [Raw JSON]       │ Prediction Output                           │
│                                          │ {                                           │
│ Feature Inputs (Shape: [1, 4])           │   "predicted_class": "Cardiomegaly",        │
│   [Feature 0: Age]        [ 0.45 ]       │   "confidence": 0.9421,                     │
│   [Feature 1: Cardiothor] [ 1.82 ]       │   "probabilities": {                        │
│   [Feature 2: Density]    [ 0.12 ]       │     "Normal": 0.0579,                       │
│   [Feature 3: Contrast]   [ 0.98 ]       │     "Cardiomegaly": 0.9421                  │
│                                          │   }                                         │
│ Device: [CPU (Default)] [CUDA]           │ }                                           │
│ Return Probabilities: [x] Yes [ ] No     │                                             │
│                                          │ Confidence Chart                            │
│ [  Execute Model Inference (0.5 AIX)  ]  │ Cardiomegaly [========================] 94% │
│                                          │ Normal       [==                      ]  6% │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 17. Docker Sandbox & Isolated Training Studio

Phase 7 provides containerized, unprivileged execution environments for training PyTorch models on licensed data:

### Sandbox Lifecycle States
- 🟡 `CREATING`: Container environment and workspace layout being provisioned.
- 🟢 `READY`: Container active, workspace staged (`code/`, `data/`, `input/`), awaiting execution.
- 🔵 `RUNNING`: PyTorch training loop active, streaming live telemetry to backend.
- 🟣 `COMPLETED`: Training finished successfully, model exported (`model.safetensors`), SHA-256 generated.
- 🔴 `FAILED`: Python execution error, stack trace captured in logs.
- ⚫ `TIMEOUT`: Container exceeded resource or execution time limits.

### Live Training Control Console
During active training, the console executes a 2-second polling loop against `GET /api/v1/sandboxes/:id/logs`. The UI streams:
- Epoch progress bar with estimated time remaining ($T_{\text{remaining}}$).
- Dynamic canvas plotting Training Loss vs. Validation Loss curves.
- Monospace terminal window rendering `stdout` and `stderr` logs.
- Top-$k$ model checkpoints saved in `/workspace/checkpoints/`.

---

## 18. Real-Time Telemetry & Live Polling Strategy

To ensure dependable real-time responsiveness without inventing unsupported protocols, the frontend adopts a tailored communication matrix:

| Feature / Subsystem | Preferred Communication Transport | Fallback Protocol | Polling Interval / Trigger |
| :--- | :--- | :--- | :--- |
| **Sandbox Training Logs** | HTTP Short Polling | Manual Refresh | 2,000 ms during `RUNNING` status |
| **Sandbox Container Status** | HTTP Polling via TanStack Query | Manual Refresh | 5,000 ms during active lifecycle |
| **Blockchain Tx Confirmation** | Ethers.js `tx.wait(1)` | Backend `/sync` Poll | Event-driven promise resolution |
| **On-Chain Event Indexing** | Backend REST Polling | RPC Log Query | 10,000 ms in Background Indexer |
| **Wallet Account & Chain** | EIP-1193 MetaMask Events | Window Focus Poll | Native `accountsChanged`, `chainChanged` |
| **Admin Fraud & Security Queue** | TanStack Query Cache Invalidation | HTTP Polling | 15,000 ms interval |
| **Global User Notifications** | TanStack Query Window Focus | Manual Polling | Route transitions / 30,000 ms |

---

## 19. AI Provenance Engine: Interactive Lineage DAG & Timeline

Phase 9 implements an end-to-end provenance verification system:

```text
       [Dataset v1.0] (CID: QmData...)
              │
              ▼
   [Training Run #exec-001] (Loss: 0.041)
              │
              ▼
    [Model v1.0] (SHA-256: 0xe3b0...)
              │
              ▼
    [Inference Request #inf-892]
```

### Provenance Components
- **`LineageDAGGraph.jsx`**: GPU-accelerated canvas rendering nodes (Datasets, Executions, Models) with curved bezier connecting lines.
- **`LineageTimeline.jsx`**: Chronological event list ordered deterministically by block number and transaction index.
- **`VerifyProvenanceModal.jsx`**: Calls `ProvenanceRegistry.verifyProvenance()` directly on-chain and presents an immutable cryptographic receipt.

---

## 20. Automated Royalty Engine: Multi-Party Split Visualization

Phase 10 provides decentralized secondary revenue sharing:

```text
                       [Gross Revenue: 1,000 AIX]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [Platform Treasury]                  [Net Creator Revenue]
          2.50% (25 AIX)                        97.50% (975 AIX)
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
             [Primary Model Creator]                                       [Upstream Dataset Licensor]
                 60% (585 AIX)                                                   40% (390 AIX)
```

### Visual Features
- **Interactive Split Visualizer**: Node diagram dynamically scales branch widths proportional to BPS allocations.
- **Zero-Leakage Dust Calculator**: Confirms that any remainder rounding wei is securely absorbed by the Treasury contract without financial loss.

---

## 21. Multi-Dimensional Analytics Engine & Visualization Suite

The analytics portal aggregates platform intelligence across 8 distinct dimensions:

```text
client/src/pages/analytics/
├── AnalyticsDashboard.jsx          # Root container with date range picker & domain tabs
├── components/
│   ├── OverviewTab.jsx             # Single-pass unified summary KPI cards
│   ├── RevenueAnalyticsTab.jsx     # Time-series revenue, average transaction value
│   ├── TransactionAnalyticsTab.jsx # Confirmed vs Pending vs Failed transaction distributions
│   ├── DownloadAnalyticsTab.jsx    # Dataset download activity & top accessed assets
│   ├── ApiCallAnalyticsTab.jsx     # Model inference invocation metrics & latency trends
│   ├── UserGrowthAnalyticsTab.jsx  # New registrations & verified active Web3 users
│   └── BlockchainAnalyticsTab.jsx  # AIX token transfer volume & gas consumption trends
```

---

## 22. Trust, Reputation & Decentralized Rating System

Trust is established through verified on-chain actions and peer reviews:
- **Verified Buyer Badge**: Reviews can only be submitted by accounts verified to have purchased a license via `PurchaseEngine.hasAccess()`.
- **Quality Score Calculation**: Dynamic 1–5 star rating combined with on-chain download velocity and provenance verification status.
- **Moderated Content**: Any review flagged for abuse can be inspected and removed through the Admin Moderation Queue.

---

## 23. Global Notification Architecture

A centralized Redux-backed notification system manages transient toasts and persistent activity logs:

### Notification Categories
1. **`WALLET`**: Wallet connected, disconnected, or unsupported network detected.
2. **`TRANSACTION`**: On-chain transaction submitted, mined, or failed.
3. **`PURCHASE`**: License purchased, access entitlement confirmed.
4. **`TRAINING`**: Docker sandbox created, training started, epoch milestone, training completed.
5. **`ROYALTY`**: Secondary royalty payment received in AIX.
6. **`SECURITY`**: Account status alert, administrative moderation action.

---

## 24. User Profile & Web3 Security Settings

The user profile settings area (`/profile`, `/settings`) provides comprehensive account sovereignty:
- **Profile Overview**: Display name, email address, avatar, role badge (`user`, `creator`, `admin`), and linked Ethereum wallet address.
- **Security Tab**: Password change, active JWT session management (with "Log out all other devices" action).
- **Web3 Wallet Tab**: Cryptographic wallet linking and unlinking via EIP-191 challenge nonces.
- **Preferences Tab**: Theme preferences, default gas limit settings, notification subscriptions.

---

## 25. Role-Based Access Control (RBAC) & Navigation Boundaries

The frontend strictly enforces role-aware view presentation, while acknowledging that **the server and smart contracts remain the authoritative security boundaries**.

### Cumulative Role Inheritance Model
AIXchange employs a **hierarchical, cumulative role model**. A **Creator is also a User/Consumer**, and an **Administrator inherits all User and Creator capabilities**:

```text
[Guest / Public] ──▶ [User / Consumer] ──▶ [Creator / Developer] ──▶ [Administrator]
```

> [!NOTE]
> **Creators Have Full Consumer Privileges**: A Creator is never restricted from acting as a Consumer. Creators can browse the marketplace, purchase licenses from other creators using AIX tokens, download encrypted dataset archives, test models in the inference playground, maintain their personal `/my-assets` library, and rate/review purchased assets.

| User Role | Accessible Route Zones | Navigation Privileges | Action Permissions |
| :--- | :--- | :--- | :--- |
| **Guest / Public** | `/`, `/datasets`, `/models`, `/licenses/templates`, `/login`, `/register` | Public navigation links, connect wallet button. | View catalogs, read previews, inspect provenance. |
| **Consumer (User)**| All Public + `/my-assets`, `/wallet`, `/inference`, `/sandboxes`, `/profile` | User dashboard, asset library, wallet balance. | Purchase licenses, download datasets, run inference. |
| **Creator / Dev**  | **Inherits ALL Consumer Zones** + `/datasets/register`, `/models/register`, `/royalties` | **All Consumer Privileges** + Creator onboarding wizards, royalty dashboard. | **Can purchase & download any asset**, upload datasets, anchor models, configure royalties. |
| **Administrator**  | **Inherits ALL Consumer & Creator Zones** + `/admin/*` (Moderation, Treasury, Fraud, Blockchain) | **All User & Creator Privileges** + Dedicated Admin sidebar and security alert badges. | Moderate users/assets, review fraud, audit treasury. |

---

## 26. Visual Identity & Design System Token Architecture

AIXchange features a bespoke **Cyber-Scientific / Web3** aesthetic built on Tailwind CSS v4 design tokens:

### Color Token Palette
- **Backgrounds**:
  - `bg-slate-950`: Core viewport background (`#020617`).
  - `bg-slate-900`: Surface cards, drawers, and modals (`#0f172a`).
  - `bg-slate-800/80`: Elevated interactive elements and table headers (`#1e293b`).
- **Accent & Primary Brands**:
  - `cyan-500` / `cyan-400`: Web3 token accents, links, and focus rings (`#06b6d4`).
  - `indigo-600` / `indigo-500`: Primary buttons and brand gradients (`#6366f1`).
  - `purple-600`: AI execution and machine learning accents (`#9333ea`).
- **Semantic Status**:
  - `emerald-400` / `emerald-500`: Verified provenance, active status, confirmed tx (`#10b981`).
  - `amber-400` / `amber-500`: Warning, pending mining, unreviewed fraud (`#f59e0b`).
  - `rose-500` / `rose-400`: Error, transaction reverted, suspended user (`#f43f5e`).

### Typography Standards
- **Headings & Display**: `Inter`, `system-ui`, sans-serif (Font weights: 700 Bold, 800 ExtraBold).
- **Body & Controls**: `Inter`, sans-serif (Font weights: 400 Regular, 500 Medium, 600 SemiBold).
- **Code, Hashes & Addresses**: `JetBrains Mono`, `Fira Code`, monospace (`font-mono`).

---

## 27. Reusable Component Inventory & Atomic Hierarchy

To guarantee maximum reusability and avoid duplicate UI logic, all frontend components are organized within an atomic component hierarchy:

```text
client/src/components/
├── common/
│   ├── Button.jsx             # Primary, secondary, danger, ghost, loading states
│   ├── Input.jsx              # Form text input with label, error, and icon support
│   ├── Textarea.jsx           # Monospace or standard multi-line input
│   ├── Select.jsx             # Styled select dropdown with keyboard navigation
│   ├── Badge.jsx              # Status badge (success, warning, error, info, neutral)
│   ├── Modal.jsx              # Accessible modal dialog with backdrop blur & focus trap
│   ├── Drawer.jsx             # Slide-over inspector panel
│   ├── Tabs.jsx               # Tab container with animated underline indicator
│   ├── Table.jsx              # Sortable, responsive data table
│   ├── Pagination.jsx         # Accessible pagination bar with page jumper
│   ├── Skeleton.jsx           # Shimmer loading skeleton placeholder
│   └── Tooltip.jsx            # Micro-interaction tooltip
├── feedback/
│   ├── Toast.jsx              # Floating notification toast
│   ├── Alert.jsx              # Inline callout alert banner
│   ├── EmptyState.jsx         # Descriptive empty container with illustration & action
│   ├── ErrorBoundary.jsx      # React error boundary catching component crashes
│   └── ConfirmDialog.jsx      # Destructive action verification dialog
├── web3/
│   ├── AddressBadge.jsx       # Formatted Ethereum address with copy & blockie icon
│   ├── TxLifecycleModal.jsx   # Preparing -> Mining -> Confirmed stepper
│   ├── NetworkBadge.jsx       # Connected network indicator with pulse dot
│   └── GasEstimateBadge.jsx   # Estimated Gwei cost display
└── charts/
    ├── LineChart.jsx          # Responsive SVG/Canvas time-series line chart
    ├── BarChart.jsx           # Grouped or stacked bar chart
    ├── DonutChart.jsx         # Circular distribution chart
    └── DAGViewer.jsx          # Interactive node-link graph renderer
```

---

## 28. Animation & Micro-Interaction System

Animations in AIXchange are functional and purposeful—they communicate state transitions, financial causality, and system health without distracting the user.

### Standard Animation Parameters
- **Modal & Drawer Entrance**: `duration-200 ease-out` (`opacity: 0 → 1`, `scale: 0.98 → 1.0`).
- **Card Hover Elevation**: `duration-150 ease-in-out` (`transform: translateY(-2px)`, shadow glow).
- **Tab Content Transition**: `duration-200 ease-in-out` (`opacity: 0 → 1`).
- **Reduced Motion**: All animations wrapped in `@media (prefers-reduced-motion: reduce)` rules that automatically disable movement transitions for accessibility compliance.

---

## 29. Signature Interaction Designs

1. **The Web3 Mining Stepper**: When a transaction is signed, the UI transitions into a multi-stage radial progress card: `Wallet Signed` → `Broadcast to Mempool` → `Awaiting Block Ingestion` → `Indexed in Database`.
2. **The Provenance Lineage Explorer**: Users can click any node in an AI model's lineage DAG to illuminate connecting data paths, showing the origin dataset and exact training hyperparameters.
3. **The Royalty Split Simulator**: When entering token amounts, animated node branches illustrate the precise fee diversion to the Treasury and creator payout shares.

---

## 30. Responsive Design & Breakpoint Specifications

The application layout dynamically adapts across all device classes:

| Breakpoint Name | Viewport Width | Layout Behavior & Modifications |
| :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Single-column stacked cards; hamburger menu; bottom sticky action bars for purchase/run; horizontal scroll tables. |
| **Tablet (`md`)** | `640px – 1023px` | Two-column catalog grids; simplified sidebar navigation; collapsible terminal drawers. |
| **Desktop (`lg`)** | `1024px – 1439px`| Standard two-column detail splits; full persistent sidebar navigation; multi-pane playground. |
| **Widescreen (`2xl`)**| `≥ 1440px` | 4-column marketplace catalog; expansive DAG visualization canvas; high-density admin tables. |

---

## 31. Accessibility (a11y) & WCAG 2.1 AA Compliance Standards

Every view and component adheres strictly to accessibility benchmarks:
1. **Contrast Ratio**: All text maintains a minimum contrast ratio of 4.5:1 against dark backgrounds.
2. **Keyboard Navigation**: All interactive buttons, modals, tabs, and inputs are fully navigable via `Tab`, `Space`, `Enter`, and `Escape`.
3. **Focus Rings**: Distinct, high-visibility focus indicators (`focus:ring-2 focus:ring-cyan-400 focus:outline-none`).
4. **Screen Reader Support**: Complex SVG visualizations (DAG graph, revenue tree) are accompanied by hidden accessible tables with identical data.

---

## 32. Standardized UI/UX States: Loading, Empty, Error & Pending

Every view must explicitly implement the complete spectrum of UI states:

```text
┌─────────────────────────┬──────────────────────────────────────────────────────────────┐
│ UI State                │ Required Visual Treatment & Component Behavior               │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 1. Loading State        │ Shimmering Skeleton loaders matching exact content layout.   │
│ 2. Empty State          │ Centered EmptyState with descriptive copy and CTA button.    │
│ 3. API Error State      │ Inline Alert banner with specific error message & retry.     │
│ 4. Success State        │ Clean render with optional toast notification.               │
│ 5. Unauthorized (401)   │ Redirect to /login with returnUrl preservation.              │
│ 6. Forbidden (403)      │ Clean "Access Denied" view explaining missing permissions.   │
│ 7. Not Found (404)      │ "Asset or Route Not Found" with link back to /datasets.      │
│ 8. Network Failure      │ "Backend Server Unreachable: Attempting blockchain RPC..."   │
│ 9. Wallet Disconnected  │ "Connect your Web3 wallet to interact with this feature."    │
│ 10. Wrong Network       │ "Unsupported Chain: Please switch to Localhost or Sepolia." │
│ 11. Transaction Pending │ Mining spinner stepper with block explorer link.             │
│ 12. Transaction Failed  │ Clear decode of revert reason (e.g., "Insufficient balance").│
│ 13. Backend Sync Delay  │ "Transaction confirmed on-chain. Syncing database record..."  │
│ 14. IPFS Fallback State │ "Gateway busy: Retrying alternative decentralized gateway..."│
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 33. Frontend State Management Architecture

The client manages state cleanly across dedicated layers to avoid unnecessary global re-renders:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Frontend State Architecture                        │
├──────────────────────┬──────────────────────────────────────────────────┤
│ Local State          │ React useState, useReducer for form inputs,      │
│                      │ drawer toggles, and modal states.                │
├──────────────────────┼──────────────────────────────────────────────────┤
│ URL / Route State    │ React Router v7 useParams, useSearchParams for   │
│                      │ search queries, categories, and active tabs.     │
├──────────────────────┼──────────────────────────────────────────────────┤
│ Server Cache State   │ TanStack React Query v5 for API fetching, query  │
│                      │ caching, background refetching, and mutations.   │
├──────────────────────┼──────────────────────────────────────────────────┤
│ Global App State     │ Redux Toolkit for authentication session, user   │
│                      │ role, active theme, and toast notifications.     │
├──────────────────────┼──────────────────────────────────────────────────┤
│ Web3 Wallet State    │ Ethers.js v6 reactive wallet service tracking    │
│                      │ account address, chain ID, and token balances.   │
└──────────────────────┴──────────────────────────────────────────────────┘
```

---

## 34. Backend API Integration Architecture Matrix

Every frontend feature is mapped directly to its verified Express REST endpoint:

| Feature / UI Action | HTTP Method | Server Route Endpoint | Auth Required | Request Body / Query | Frontend Service File |
| :--- | :---: | :--- | :---: | :--- | :--- |
| User Registration | `POST` | `/api/v1/auth/register` | No | `{ name, email, password }` | `services/api/authApi.js` |
| User Login | `POST` | `/api/v1/auth/login` | No | `{ email, password }` | `services/api/authApi.js` |
| Request Nonce | `POST` | `/api/v1/wallet/nonce` | Bearer | `{ address, chainId }` | `services/blockchain/wallet/` |
| Verify Wallet | `POST` | `/api/v1/wallet/verify` | Bearer | `{ address, signature }` | `services/blockchain/wallet/` |
| Catalog Search | `GET` | `/api/v1/datasets` | No | `?page&limit&search&category` | `services/api/datasetApi.js` |
| Upload Dataset File | `POST` | `/api/v1/datasets/upload` | Bearer | `multipart/form-data (file)` | `services/api/datasetApi.js` |
| Sync Dataset Tx | `POST` | `/api/v1/datasets/:id/blockchain`| Bearer | `{ transactionHash }` | `services/api/datasetApi.js` |
| Get Dataset Details | `GET` | `/api/v1/datasets/:id` | No | None | `services/api/datasetApi.js` |
| Download Dataset | `GET` | `/api/v1/datasets/:id/download` | Bearer | `?licenseId` | `services/api/purchaseApi.js`|
| List Licenses | `GET` | `/api/v1/licenses/asset/:id` | No | None | `services/api/licenseApi.js` |
| Sync Purchase Tx | `POST` | `/api/v1/purchases/sync` | Bearer | `{ txHash }` | `services/api/purchaseApi.js`|
| Check Entitlement | `GET` | `/api/v1/purchases/:id/status` | Bearer | None | `services/api/purchaseApi.js`|
| Create Sandbox | `POST` | `/api/v1/sandboxes` | Bearer | `{ datasetId, licenseId, name }`| `services/api/sandboxApi.js` |
| Start Training | `POST` | `/api/v1/sandboxes/:id/train` | Bearer | `{ epochs, lr, batch_size }` | `services/api/sandboxApi.js` |
| Get Training Logs | `GET` | `/api/v1/sandboxes/:id/logs` | Bearer | None | `services/api/sandboxApi.js` |
| Start JupyterLab | `POST` | `/api/v1/sandboxes/:id/jupyter/start` | Bearer | None | `services/api/sandboxApi.js` |
| Model Discovery | `GET` | `/api/v1/models` | No | `?page&framework&search` | `services/api/modelApi.js` |
| Execute Inference | `POST` | `/api/v1/models/:id/infer` | Bearer | `{ inputs, versionNumber }` | `services/api/modelApi.js` |
| Get Provenance DAG | `GET` | `/api/v1/provenance/graph/:id` | No | None | `services/api/provenanceApi.js`|
| Royalty Summary | `GET` | `/api/v1/royalties/summary` | Bearer | None | `services/api/royaltyApi.js` |
| Reconcile Royalty | `POST` | `/api/v1/royalties/reconcile` | Bearer | None | `services/api/royaltyApi.js` |
| Analytics Overview | `GET` | `/api/v1/analytics/overview` | Bearer | `?startDate&endDate` | `services/api/analyticsApi.js`|
| Blockchain Gas Stats| `GET` | `/api/v1/analytics/blockchain/gas`| Bearer| None | `services/api/analyticsApi.js`|
| Admin List Users | `GET` | `/api/v1/admin/users` | Admin | `?page&limit&status` | `services/api/adminApi.js` |
| Update User Status | `PATCH` | `/api/v1/admin/users/:id/status`| Admin | `{ status, reason }` | `services/api/adminApi.js` |
| Admin Fraud Flags | `GET` | `/api/v1/admin/fraud-flags` | Admin | `?status&severity` | `services/api/adminApi.js` |

---

## 35. Smart Contract Blockchain Integration Matrix

The following matrix documents all on-chain interactions executed by the frontend client:

| Smart Contract | Target Function / Event | Read / Write | Signer Required | Transaction Lifecycle UI State | Error Handling & Reverts |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `AIXToken.sol` | `balanceOf(account)` | Read | No | Instant read | Returns zero on RPC failure. |
| `AIXToken.sol` | `approve(spender, amount)` | Write | Yes | `ApprovalStepper` modal | User rejected, gas price spike. |
| `AIXToken.sol` | `transfer(to, amount)` | Write | Yes | `TxLifecycleModal` | Insufficient balance revert. |
| `DatasetRegistry.sol` | `registerDataset(cid, lic, roy)` | Write | Yes | `RegistrationStepper` Step 9 | Duplicate CID or empty URI revert. |
| `DatasetRegistry.sol` | `setDatasetActive(id, active)` | Write | Yes | Inline button spinner | Only on-chain owner authorized. |
| `LicenseRegistry.sol` | `createLicense(assetId, ...)` | Write | Yes | `CreateLicenseModal` | Asset not found, invalid pricing. |
| `PurchaseEngine.sol` | `purchaseDataset(id, licId)` | Write | Yes | `PurchaseModal` 2-step flow | Insufficient allowance / balance. |
| `PurchaseEngine.sol` | `hasAccess(buyer, datasetId)` | Read | No | Instant entitlement gate | Defaults false on RPC timeout. |
| `ModelRegistry.sol` | `registerModel(name, uri, hash)`| Write | Yes | `ModelRegisterWizard` | Model name taken, invalid hash. |
| `ModelRegistry.sol` | `verifyModelHash(id, ver, hash)`| Read | No | Instant verification chip | Returns boolean false on mismatch. |
| `ProvenanceRegistry` | `verifyProvenance(...)` | Read | No | `VerifyProvenanceModal` | On-chain claim verification boolean. |
| `RoyaltyEngine.sol` | `distributeRoyalty(...)` | Write | Yes | `RoyaltySplitVisualizer` | Basis points exceed 10,000 revert. |

---

## 36. Decentralized Storage & Client IPFS Protocol

1. **Upload Pipeline**: The frontend client never interfaces with private IPFS credentials or Pinata API keys. All file uploads are streamed directly via `multipart/form-data` to the backend endpoint `POST /api/v1/datasets/upload`.
2. **CID Representation**: Content Identifiers (`CIDv0` / `CIDv1`) are formatted as verified IPFS links: `${VITE_IPFS_GATEWAY_URL}/${cid}`.
3. **Gateway Fallbacks**: If the primary IPFS gateway fails or times out, the client automatically cycles through fallback gateways (`https://ipfs.io/ipfs/`, `https://gateway.pinata.cloud/ipfs/`, `https://cloudflare-ipfs.com/ipfs/`).

---

## 37. Defensive Client Security Architecture

1. **XSS & Content Injection**: Zero usage of `dangerouslySetInnerHTML`. All dynamic text and markdown descriptions are sanitized via `DOMPurify` before rendering.
2. **Zero Client Secret Storage**: Zero private keys, Pinata JWTs, or server secrets are bundled into the Vite build. All configuration is strictly restricted to public environment variables (`VITE_API_BASE_URL`, `VITE_BLOCKCHAIN_RPC_URL`, `VITE_DATASET_REGISTRY_ADDRESS`).
3. **Phishing & Transaction Simulation**: Before any state-changing write transaction is broadcast to MetaMask, the client validates the active network `chainId` to prevent cross-chain transaction replay attacks.
4. **Defensive BigInt Handling**: All token values and basis-point fractions are parsed and formatted using Ethers.js `ethers.formatUnits` and `ethers.parseUnits` to prevent JavaScript numeric precision exploits.

---

## 38. Client-Side Performance Optimization Strategy

1. **Route-Based Code Splitting**: All major pages are loaded lazily via `React.lazy()` and wrapped in suspense boundaries with shimmering skeleton fallbacks.
2. **TanStack Query Caching**: Server responses are cached with a 60-second stale time and automatic window refetching, eliminating redundant HTTP round-trips.
3. **Large List Virtualization**: Tables containing over 100 rows (such as historical blockchain events or audit logs) utilize `@tanstack/react-virtual` to maintain 60 FPS scrolling.
4. **Optimized Asset Bundling**: Vite code splitting splits vendor chunks (`ethers`, `react`, `@reduxjs/toolkit`, `@tanstack/react-query`) into independent cacheable browser assets.

---

## 39. Comprehensive Frontend Testing Strategy

To ensure zero regressions throughout development, the frontend test suite encompasses unit, component, integration, and wallet mock testing:

```text
client/tests/
├── unit/
│   ├── utils/formatters.test.js     # Currency, address truncate, date formatters
│   ├── hooks/useWallet.test.js      # Ethers wallet connection hook
│   └── services/datasetApi.test.js  # API request serialization
├── components/
│   ├── DatasetCard.test.jsx         # Card rendering, price badge, preview trigger
│   ├── PurchaseModal.test.jsx       # Multi-step purchase state transitions
│   └── RightsMatrix.test.jsx        # License rights bitmask flags
├── integration/
│   ├── auth-flow.test.jsx           # Login -> Token store -> Protected route redirect
│   ├── catalog-filter.test.jsx      # Keyword search + Category filter interaction
│   └── purchase-flow.test.jsx       # Balance check -> Allowance approve -> Purchase sync
└── e2e/
    ├── marketplace-discovery.cy.js  # Browse, search, preview, open details
    ├── dataset-registration.cy.js   # 10-step wizard completion
    └── admin-moderation.cy.js       # Admin suspension and audit log assertion
```

---

## 40. Phase 14 Master Execution Plan (Workstreams 14.1 → 14.27)

Phase 14 represents the comprehensive implementation of the AIXchange user interface. It is organized into 27 modular, highly-focused execution workstreams:

### Workstream 14.1: Architecture & Tooling Hardening
- **Objective**: Establish production tooling, Redux store, TanStack Query client, and route guards.
- **Tasks**: Configure `store/index.js`, initialize `authSlice`, `walletSlice`, `notificationSlice`, create `ProtectedRoute` and `AdminRoute` wrappers.
- **Status**: 🟡 `IN PROGRESS`

### Workstream 14.2: Atomic Design System Library
- **Objective**: Implement the complete atomic component library in `components/common/` and `components/feedback/`.
- **Tasks**: Build `Button`, `Input`, `Select`, `Modal`, `Drawer`, `Table`, `Badge`, `Tabs`, `Skeleton`, `Toast`.
- **Status**: ⬜ `NOT STARTED`

### Workstream 14.3: Application Shell & Responsive Layouts
- **Objective**: Construct the structural shells for public, authenticated, and admin views.
- **Tasks**: Build `AppLayout`, `PublicShell`, `DashboardLayout`, `AdminLayout`, and expand `Navbar.jsx` with full role-aware navigation.
- **Status**: 🟡 `IN PROGRESS`

### Workstream 14.4: Authentication & Session Management
- **Objective**: Deliver complete authentication flows across email/password and Web3 signatures.
- **Tasks**: Implement `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.5: Web3 Wallet Integration & EIP-191 Signing
- **Objective**: Provide reliable MetaMask connection, network switching, and challenge nonce verification.
- **Tasks**: Refactor `services/blockchain/wallet/`, build `WalletModal`, `NetworkBadge`, and `AddressBadge`.
- **Status**: 🟢 `COMPLETE`

### Workstream 14.6: AIX Token Management & Allowances
- **Objective**: Connect the wallet interface to `AIXToken.sol` for balance queries and allowance approvals.
- **Tasks**: Build `WalletDashboard.jsx` (`/wallet`), `TokenTransferModal`, and `ApprovalStepper`.
- **Status**: 🟡 `IN PROGRESS`

### Workstream 14.7: Dataset Marketplace & Discovery Engine
- **Objective**: Polish the main catalog view with full-text search, multi-category filters, and sorting.
- **Tasks**: Connect `DatasetMarketplace.jsx` to `/api/v1/datasets`, implement pagination and sorting controls.
- **Status**: 🟢 `COMPLETE`

### Workstream 14.8: Dataset Details & IPFS Preview Portal
- **Objective**: Provide exhaustive asset inspection and sanitized preview capabilities.
- **Tasks**: Enhance `DatasetDetails.jsx` with license selection tabs and `IPFSPreviewModal`.
- **Status**: 🟢 `COMPLETE`

### Workstream 14.9: 10-Step Dataset Registration Wizard
- **Objective**: Guide creators through file upload, IPFS pinning, licensing, and on-chain registration.
- **Tasks**: Upgrade `RegisterDataset.jsx` to the full 10-step wizard with client-side SHA-256 computation.
- **Status**: 🟢 `COMPLETE`

### Workstream 14.10: Licensing System & Rights Matrix
- **Objective**: Implement Phase 5 legal licensing templates and terms creator.
- **Tasks**: Build `LicenseTemplates.jsx`, `LicenseSelector.jsx`, and `RightsMatrix.jsx`.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.11: Purchase Engine & Atomic Settlement Flow
- **Objective**: Deliver the seamless purchase modal with balance validation and allowance approval.
- **Tasks**: Implement `PurchaseModal.jsx`, `PurchaseReceipt.jsx`, and connect to `PurchaseEngine.sol`.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.12: Consumer Asset Portfolio & Downloads Hub
- **Objective**: Provide users with a centralized portal to access purchased datasets and licenses.
- **Tasks**: Implement `/my-assets` with verified download triggers and sandbox launching buttons.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.13: Docker Sandbox Dashboard
- **Objective**: Provide container lifecycle management for isolated training environments.
- **Tasks**: Implement `/sandboxes` listing container status and resource allocations.
- **Status**: 🟠 `AI READY`

### Workstream 14.14: Active Training Console & Telemetry
- **Objective**: Build the live control room displaying PyTorch loss curves and streaming terminal logs.
- **Tasks**: Implement `/sandboxes/:id` with 2-second log polling and dynamic chart rendering.
- **Status**: 🟠 `AI READY`

### Workstream 14.15: Embedded JupyterLab Interactive Studio
- **Objective**: Embed token-authenticated JupyterLab development environments inside the web client.
- **Tasks**: Implement `/sandboxes/:id/jupyter` with full-screen iframe integration and server controls.
- **Status**: 🟠 `AI READY`

### Workstream 14.16: Model Marketplace Catalog
- **Objective**: Create the discovery marketplace for neural network weights anchored by SHA-256 hashes.
- **Tasks**: Implement `/models` with framework pills (PyTorch, TensorFlow, ONNX, Safetensors).
- **Status**: 🟣 `BLOCKCHAIN READY`

### Workstream 14.17: Model Details & Checksum Verification
- **Objective**: Enable cryptographic artifact verification and version inspection.
- **Tasks**: Implement `/models/:id` with client-side drag-and-drop SHA-256 weight hash validation.
- **Status**: 🟣 `BLOCKCHAIN READY`

### Workstream 14.18: Interactive AI Inference Playground
- **Objective**: Build the dynamic prediction testing studio for hosted models.
- **Tasks**: Implement `/inference` with schema-driven input forms, JSON mode, and latency meters.
- **Status**: 🟠 `AI READY`

### Workstream 14.19: AI Provenance Lineage DAG & Timeline
- **Objective**: Construct the hallmark interactive Directed Acyclic Graph visualizer.
- **Tasks**: Implement `/provenance/graph/:modelId` and `/provenance/timeline/:modelId` with on-chain verification.
- **Status**: 🟣 `BLOCKCHAIN READY`

### Workstream 14.20: Secondary Royalty Engine & Split Dashboard
- **Objective**: Visualize multi-party revenue splits and basis-point payout distributions.
- **Tasks**: Implement `/royalties` with the interactive tree visualizer and split simulator.
- **Status**: 🟣 `BLOCKCHAIN READY`

### Workstream 14.21: Multi-Dimensional Analytics Dashboard
- **Objective**: Build enterprise business intelligence across off-chain metrics and on-chain telemetry.
- **Tasks**: Implement `/analytics` with revenue charts, transaction donuts, and gas consumption bars.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.22: Decentralized Trust & Reputation Center
- **Objective**: Display verified buyer reviews, star ratings, and creator reputation scores.
- **Tasks**: Implement review submission modals and reputation badges across marketplace cards.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.23: Global Notification Center
- **Objective**: Manage toast notifications and persistent activity feeds for user actions.
- **Tasks**: Build `ToastContainer.jsx` and `NotificationCenter.jsx` in the global header.
- **Status**: ⬜ `NOT STARTED`

### Workstream 14.24: Administrative Overview & Moderation Deck
- **Objective**: Deliver mission control for administrators to suspend users and deactivate assets.
- **Tasks**: Implement `/admin`, `/admin/users`, and `/admin/moderation`.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.25: Blockchain Real-Time Monitoring Center
- **Objective**: Provide administrators with real-time on-chain event streams and gas telemetry.
- **Tasks**: Implement `/admin/blockchain` connected to the indexed blockchain event store.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.26: Deterministic Fraud Detection Review Queue
- **Objective**: Build the human-in-the-loop review deck for flags raised by the 5 fraud rules.
- **Tasks**: Implement `/admin/fraud` with evidence deep-dive panels and confirmation actions.
- **Status**: 🔵 `BACKEND READY`

### Workstream 14.27: Client Hardening, Performance & a11y Audit
- **Objective**: Conduct comprehensive WCAG 2.1 AA audits, Lighthouse optimizations, and E2E test runs.
- **Tasks**: Eliminate all console warnings, verify keyboard navigation, and achieve 95+ performance scores.
- **Status**: ⬜ `NOT STARTED`

---

## 41. Phase 15 End-to-End Integration Testing Strategy

Phase 15 validates complete multi-service user journeys across frontend, backend, smart contracts, and Docker execution sandboxes:

```text
User Journey 1: Consumer Discovery to Dataset Access
Browse Catalog -> View Dataset -> Connect Wallet -> Purchase via PurchaseEngine -> Access Granted -> Download Encrypted Archive

User Journey 2: Creator Onboarding to Revenue Settlement
Register Dataset (10-step wizard) -> IPFS Pinning -> Smart Contract Anchor -> Buyer Purchases -> Creator Receives 97.5% Payout in AIX

User Journey 3: Sandbox Training to Provenance Lineage
Provision Sandbox -> Stage Workspace -> Execute PyTorch Training -> Export Safetensors -> Anchor ModelRegistry -> Verify Provenance DAG

User Journey 4: Governance & Security Audit
Simulate High-Velocity Transfers -> Trigger Deterministic Fraud Flag -> Admin Inspects Flag in /admin/fraud -> Confirms Flag & Suspends User
```

---

## 42. Phase 16 Production Deployment & Client Infrastructure

1. **Vite Production Optimization**: Assets compiled using Rollup with Gzip and Brotli compression, generating sourcemaps for production monitoring.
2. **Containerized Nginx SPA Host**: Packaged into a lightweight Alpine Linux Docker container serving static files with HTML5 pushState routing rules (`try_files $uri $uri/ /index.html;`).
3. **HTTP Security Headers**: Enforces `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

---

## 43. Phase 17 Research Demonstration & Presentation Suite

For academic conferences, defense presentations, and research papers, the frontend incorporates a specialized **Demo Mode**:
- **One-Click Pre-Seeded Datasets**: Pre-populates catalog with medical imaging, autonomous driving, and NLP benchmark datasets.
- **Interactive Provenance Showcase**: Guided step-by-step walkthrough highlighting cryptographic verification on the Ethereum testnet.
- **Live Sandbox Demo**: Pre-configured 3-epoch training execution demonstrating dynamic loss reduction in under 60 seconds.

---

## 44. Frontend Definition of Done (DoD)

A frontend page, component, or workstream is officially marked 🟢 `COMPLETE` if and only if all 14 criteria are satisfied:
1. **Functional UI**: Page or component fully implemented and renders correctly.
2. **Design Fidelity**: Matches Cyber-Scientific visual tokens without ad-hoc styling.
3. **Backend Integration**: All dynamic data bound to active `/api/v1` REST endpoints.
4. **Blockchain Integration**: All on-chain reads and writes wired through ethers.js v6.
5. **State Handling**: Explicit visual states implemented for Loading, Empty, Error, and Success.
6. **Responsive Support**: Verified across Desktop (1440px), Laptop (1024px), Tablet (768px), and Mobile (375px).
7. **Accessibility**: Meets WCAG 2.1 AA benchmarks, passes keyboard navigation, includes ARIA labels.
8. **Animation**: Purposeful, non-distracting micro-interactions honoring reduced-motion.
9. **Defensive Security**: Input sanitized via DOMPurify; zero exposed secrets; safe BigInt arithmetic.
10. **Zero Console Errors**: Free of uncaught promise rejections, React key warnings, or layout errors.
11. **Test Coverage**: Accompanied by unit and component integration tests.
12. **Route Guarding**: Enforces authentication and role boundaries (Guest, User, Creator, Admin).
13. **Documentation**: Route, API dependencies, and contract hooks recorded in this roadmap.
14. **Status Updated**: Corresponding checkboxes in Section 46 marked complete.

---

## 45. Full-Lifecycle Traceability Matrix (Requirements → Code → Tests)

The following matrix guarantees full-lifecycle traceability across all platform requirements:

| Req ID | Requirement Description | Phase | Backend Route | Smart Contract | Frontend Page / Component | Test Suite |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **FR-001** | User Registration & Web3 Auth | Phase 2 | `/api/v1/auth/*`, `/wallet/*` | None | `/login`, `/register`, `WalletModal` | `auth-flow.test.jsx` |
| **FR-002** | AIX Token Transfers & Balances | Phase 3 | `/api/v1/token/*` | `AIXToken.sol` | `/wallet`, `TokenTransferModal` | `useWallet.test.js` |
| **FR-003** | Dataset IPFS Upload & Staging | Phase 4 | `/api/v1/datasets/upload` | None (IPFS) | `/datasets/register` (Step 4) | `dataset-registration.cy.js`|
| **FR-004** | On-Chain Dataset Registration | Phase 4 | `/api/v1/datasets/:id/sync` | `DatasetRegistry.sol` | `/datasets/register` (Step 9) | `dataset-registration.cy.js`|
| **FR-005** | Dataset Catalog Discovery | Phase 4 | `/api/v1/datasets` | `DatasetRegistry.sol` | `/datasets`, `DatasetMarketplace` | `catalog-filter.test.jsx` |
| **FR-006** | Legal Licensing Rights Definition | Phase 5 | `/api/v1/licenses/*` | `LicenseRegistry.sol` | `/licenses/manage`, `RightsMatrix` | `RightsMatrix.test.jsx` |
| **FR-007** | Atomic License Purchase | Phase 6 | `/api/v1/purchases/sync` | `PurchaseEngine.sol` | `PurchaseModal`, `PurchaseReceipt` | `purchase-flow.test.jsx` |
| **FR-008** | Isolated Docker Training Sandbox | Phase 7 | `/api/v1/sandboxes/*` | None (Docker) | `/sandboxes`, `/sandboxes/:id` | `sandbox-training.test.jsx` |
| **FR-009** | Embedded JupyterLab Studio | Phase 7 | `/api/v1/sandboxes/:id/jupyter`| None (Jupyter) | `/sandboxes/:id/jupyter` | `jupyter-embed.test.jsx` |
| **FR-010** | AI Model Registry & Checksums | Phase 8 | `/api/v1/models/*` | `ModelRegistry.sol` | `/models`, `/models/:id` | `model-hash-check.test.jsx` |
| **FR-011** | Standalone AI Model Inference | Phase 8 | `/api/v1/models/:id/infer` | None (AI Engine) | `/inference`, `InferencePlayground` | `inference-exec.test.jsx` |
| **FR-012** | AI Provenance DAG Visualization | Phase 9 | `/api/v1/provenance/graph/:id` | `ProvenanceRegistry` | `/provenance/graph/:modelId` | `provenance-dag.test.jsx` |
| **FR-013** | Multi-Party Royalty Splitting | Phase 10| `/api/v1/royalties/*` | `RoyaltyEngine.sol` | `/royalties`, `RoyaltyDashboard` | `royalty-splits.test.jsx` |
| **FR-014** | Multi-Dimensional Analytics BI | Phase 11| `/api/v1/analytics/*` | Indexed Event DB | `/analytics`, `AnalyticsDashboard` | `analytics-render.test.jsx` |
| **FR-015** | Admin Moderation & Audit Logs | Phase 12| `/api/v1/admin/*` | All Contracts | `/admin`, `/admin/moderation` | `admin-moderation.cy.js` |
| **FR-016** | Deterministic Fraud Review | Phase 12| `/api/v1/admin/fraud-flags` | Fraud Engine | `/admin/fraud`, `FraudReviewDeck` | `fraud-review.test.jsx` |

---

## 46. Master Frontend Implementation Checklist

This exhaustive task checklist serves as the operational punch list for all frontend implementation across the platform:

### 1. Architecture, Shell & Navigation
- [x] Vite 8 + React 19 + Tailwind CSS v4 project initialization (`client/package.json`)
- [x] Modular wallet service with Ethers.js v6 (`client/src/services/blockchain/wallet/`)
- [x] Initial dataset marketplace catalog view (`client/src/pages/DatasetMarketplace.jsx`)
- [x] Initial dataset details view (`client/src/pages/DatasetDetails.jsx`)
- [x] Initial dataset registration view (`client/src/pages/RegisterDataset.jsx`)
- [x] Initial developer wallet testbed (`client/src/pages/WalletTest.jsx`)
- [ ] Initialize Redux Toolkit root store (`store/index.js`) with auth, wallet, and notification slices
- [ ] Implement `AppLayout.jsx` with responsive grid containers and sticky footer
- [ ] Refactor `Navbar.jsx` with full role-aware navigation links, active badges, and profile menu
- [ ] Implement `ProtectedRoute.jsx` and `AdminRoute.jsx` route boundary guards
- [ ] Setup TanStack React Query v5 client with standard stale/cache configurations

### 2. Design System Components (`components/common/`)
- [ ] Implement `Button.jsx` (Primary, Secondary, Danger, Ghost, Loading spinner)
- [ ] Implement `Input.jsx` (Text, Number, Search with icon and error text)
- [ ] Implement `Textarea.jsx` (Monospace and standard multi-line text input)
- [ ] Implement `Select.jsx` (Custom styled accessible select dropdown)
- [ ] Implement `Badge.jsx` (Success, Warning, Danger, Info, Neutral status badges)
- [ ] Implement `Modal.jsx` (Accessible dialog with focus trap and backdrop blur)
- [ ] Implement `Drawer.jsx` (Slide-over panel for inspector and review actions)
- [ ] Implement `Tabs.jsx` (Tab container with animated underline transitions)
- [ ] Implement `Table.jsx` (Sortable, responsive data table with empty/loading states)
- [ ] Implement `Pagination.jsx` (Accessible pagination controls with item counts)
- [ ] Implement `Skeleton.jsx` (Configurable layout-matching shimmer placeholders)
- [ ] Implement `Toast.jsx` & `ToastContainer.jsx` for global notifications

### 3. Authentication & User Profile
- [ ] Implement `/login` page with email/password and EIP-191 Web3 signing
- [ ] Implement `/register` page with real-time field validation
- [ ] Implement `/forgot-password` and `/reset-password` token recovery flows
- [ ] Implement `/verify-email` token confirmation page
- [ ] Implement `/profile` page displaying user attributes, avatar, and linked wallet
- [ ] Implement `/settings` page with security controls and session revocation

### 4. Web3 Wallet & AIX Token Economy
- [ ] Implement `/wallet` dashboard with native ETH and AIX token balances
- [ ] Implement `TokenTransferModal.jsx` for sending AIX tokens
- [ ] Implement `ApprovalStepper.jsx` for managing `PurchaseEngine` token allowances
- [ ] Implement `TxLifecycleModal.jsx` (Preparing → Mining → Confirmed → Synced)
- [ ] Implement `NetworkSwitcher.jsx` for chain ID verification and warning prompts
- [ ] Implement paginated transaction history table with local block explorer links

### 5. Dataset Marketplace & Registration Wizard
- [x] Basic marketplace catalog view with search and filters (`DatasetMarketplace.jsx`)
- [x] Basic dataset details view with metadata inspection (`DatasetDetails.jsx`)
- [x] Basic dataset registration form (`RegisterDataset.jsx`)
- [ ] Connect `DatasetMarketplace.jsx` to backend REST endpoint `/api/v1/datasets` with RPC fallback
- [ ] Upgrade `RegisterDataset.jsx` to full 10-step guided wizard with client SHA-256 calculation
- [ ] Implement `IPFSPreviewModal.jsx` for sanitized preview of tabular, image, or text samples
- [ ] Implement dataset review submission form with 1–5 star ratings
- [ ] Implement dataset owner management panel (toggle active, update CID, transfer ownership)

### 6. Licensing System UI
- [ ] Implement `/licenses/templates` template explorer (Academic, Commercial, Exclusive, Custom)
- [ ] Implement `LicenseSelector.jsx` component for dataset details page
- [ ] Implement `RightsMatrix.jsx` displaying the 8 atomic permission flags
- [ ] Implement `CreateLicenseModal.jsx` allowing creators to attach custom pricing terms
- [ ] Implement license revocation action dialog with smart contract execution

### 7. Purchase Engine & Consumer Hub
- [ ] Implement `PurchaseModal.jsx` guiding atomic payment and allowance approval
- [ ] Implement `PurchaseReceipt.jsx` with transaction confirmation and download triggers
- [ ] Implement `/my-assets` consumer library displaying purchased datasets and models
- [ ] Implement secure dataset download trigger with authenticated backend token
- [ ] Implement purchase entitlement gate (`hasAccess`) across protected UI components

### 8. Docker Sandbox & Training Studio
- [ ] Implement `/sandboxes` container management dashboard
- [ ] Implement `CreateSandboxModal.jsx` verifying dataset access entitlements
- [ ] Implement `/sandboxes/:id` active training control room
- [ ] Implement live 2-second log polling loop with monospace streaming console
- [ ] Implement dynamic Loss vs. Epoch canvas chart using responsive SVG/Canvas
- [ ] Implement model checkpoint download and export dialog
- [ ] Implement `/sandboxes/:id/jupyter` full-screen token-authenticated JupyterLab view

### 9. Model Marketplace & Inference Playground
- [ ] Implement `/models` marketplace catalog with framework filter pills
- [ ] Implement `/models/:id` detailed model view with architecture and input/output schemas
- [ ] Implement client-side drag-and-drop SHA-256 weight checksum verification tool
- [ ] Implement model version selector and changelog history panel
- [ ] Implement `/models/register` onboarding wizard for AI model creators
- [ ] Implement `/inference` interactive playground with schema-generated input forms and JSON mode
- [ ] Implement prediction confidence probability charts and latency display

### 10. AI Provenance & Lineage Visualizer
- [ ] Implement `/provenance` global provenance search and explorer
- [ ] Implement `/provenance/graph/:modelId` interactive Directed Acyclic Graph (DAG) canvas
- [ ] Implement node inspector drawer displaying raw hashes, block numbers, and transaction IDs
- [ ] Implement `/provenance/timeline/:modelId` chronological audit trail
- [ ] Implement `VerifyProvenanceModal.jsx` executing on-chain claim verification against `ProvenanceRegistry.sol`
- [ ] Implement accessible tabular alternative view for all graph visualizations

### 11. Secondary Royalty Engine
- [ ] Implement `/royalties` dashboard with total earnings and pending split metrics
- [ ] Implement interactive revenue distribution tree visualizer
- [ ] Implement `CalculateSplitSimulator.jsx` showing basis-point breakdowns down to treasury dust
- [ ] Implement historical royalty distributions table with recipient filter
- [ ] Implement on-chain reconciliation trigger auditing database against `RoyaltyEngine.sol`

### 12. Multi-Dimensional Analytics Dashboard
- [ ] Implement `/analytics` root dashboard with date range picker and domain selector tabs
- [ ] Implement `OverviewTab.jsx` with single-pass platform KPI cards
- [ ] Implement `RevenueAnalyticsTab.jsx` with time-series revenue and average order volume
- [ ] Implement `TransactionAnalyticsTab.jsx` with status distribution donut charts
- [ ] Implement `DownloadAnalyticsTab.jsx` with dataset access frequency metrics
- [ ] Implement `ApiCallAnalyticsTab.jsx` with model inference latency trends
- [ ] Implement `BlockchainAnalyticsTab.jsx` with token transfer volume and gas cost bar charts

### 13. Administrative & Moderation Portal
- [ ] Implement `/admin` executive overview with system health tickers and quick actions
- [ ] Implement `/admin/users` with user status toggle (`ACTIVE` ↔ `SUSPENDED`) and reason prompt
- [ ] Implement `/admin/moderation` with dataset and model deactivation controls
- [ ] Implement `/admin/reports` abuse report resolution queue
- [ ] Implement `/admin/treasury` vault monitoring terminal displaying ETH and AIX balances
- [ ] Implement `/admin/blockchain` real-time event observer and gas telemetry deck
- [ ] Implement `/admin/fraud` human-in-the-loop review deck for the 5 deterministic fraud rules
- [ ] Implement `/admin/audits` append-only moderation audit log table

### 14. Verification, Testing & Optimization
- [ ] Configure Vitest and React Testing Library for frontend component unit tests
- [ ] Implement unit tests for all currency, address truncate, and date utility formatters
- [ ] Implement integration tests for authentication and wallet connection flows
- [ ] Implement integration tests for dataset catalog filtering and purchase modal lifecycle
- [ ] Conduct comprehensive WCAG 2.1 AA accessibility contrast and keyboard navigation audit
- [ ] Optimize Vite bundle with vendor code splitting and lazy route loading
- [ ] Verify 95+ Lighthouse performance, accessibility, and best practices scores

---

## 47. Future Enhancements & Post-v1 Substrate Roadmap

The following architectural capabilities are cataloged as future enhancements and do not block the production release of Phase 14:
1. **Zero-Knowledge Provenance Proofs (zk-SNARKs)**: Generating succinct cryptographic proofs of training data inclusion without revealing underlying proprietary dataset samples.
2. **Decentralized Compute Federation**: Extending the Docker execution substrate to schedule training tasks across distributed GPU compute providers (e.g., Akash Network, io.net).
3. **Decentralized Multi-Sig Treasury Governance**: Transitioning platform fee adjustments and treasury withdrawals from single-admin controls to a multi-signature DAO governance contract.
4. **Automated Dynamic Pricing Curves**: Bonding curves for dataset and model licenses where price automatically adjusts based on download demand and quality ratings.

---

*This document stands as the definitive, immutable master roadmap for the AIXchange frontend client. All subsequent frontend pull requests, components, and phase milestones must conform to the specifications established herein.*
