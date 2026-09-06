# AIXchange — Frontend Executive Summary & Role Blueprint
**File:** `SUMMARY_FRONTEND_ROADMAP.md`  
**Companion Document:** [FRONTEND_ROADMAP.md](file:///d:/AIXchange/FRONTEND_ROADMAP.md) (Single Source of Truth)  
**Target Roles:** **User (Consumer)**, **Creator (Developer)**, **Admin (Operator)**  
**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, Ethers.js v6, Redux Toolkit, TanStack Query v5  

---

## 🚀 1. High-Level System Overview

AIXchange is a Web3-powered AI substrate and data marketplace. The frontend enables users to **discover, purchase, and verify datasets and models**, allows creators to **stage, monetize, train, and distribute royalties**, and empowers admins to **moderate content, audit the platform treasury, and review on-chain fraud alerts**.

### Status Legend
- 🟢 `ALREADY BUILT`: Code exists in `client/src/` (requires polish/API binding)
- 🟡 `IN PROGRESS`: Scaffolded or partially implemented
- 🔵 `BACKEND READY`: Server API is 100% verified; UI needs to be built
- 🟣 `BLOCKCHAIN READY`: Smart contract is 100% verified; Web3 UI needs to be built
- 🟠 `AI READY`: Docker / Python engine is ready; UI needs to be built

---

## 📅 2. Phase-by-Phase Frontend Breakdown

| Phase | Milestone Name | Frontend Responsibilities | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | Foundation & Layouts | App Shell, Navigation Header, Responsive Container Grid, Dark Theme tokens | 🟢 `ALREADY BUILT` |
| **Phase 2** | Authentication & Wallets | Login, Register, Password Reset, MetaMask EIP-191 Nonce Signing & Linking | 🔵 `BACKEND READY` |
| **Phase 3** | AIX Token Economy | AIX & ETH Balance Display, Token Transfers, Contract Allowance Approvals | 🟡 `IN PROGRESS` |
| **Phase 4** | Dataset Marketplace | Dataset Catalog, Tag & Category Filters, IPFS Previews, Details View | 🟢 `ALREADY BUILT` |
| **Phase 5** | Licensing System | License Tier Cards (Academic, Commercial, Exclusive), Rights Matrix, Custom Terms | 🔵 `BACKEND READY` |
| **Phase 6** | Purchase Engine | 2-Step Purchase Modal (Approve + Buy), Receipt Generator, My Assets Library | 🔵 `BACKEND READY` |
| **Phase 7** | Docker Sandbox & Training | Sandbox Workspace List, PyTorch Live Training Console (Loss Charts + Logs), JupyterLab | 🟠 `AI READY` |
| **Phase 8** | Model Marketplace | Model Catalog (PyTorch/ONNX/Safetensors), Model Details, Browser SHA-256 Checksum Tool | 🟣 `BLOCKCHAIN READY` |
| **Phase 8b**| AI Inference Playground | Interactive Model Testing Studio (Form Inputs, JSON Feature Vectors, Latency Meter) | 🟠 `AI READY` |
| **Phase 9** | AI Provenance Engine | Interactive Lineage DAG Graph (`Dataset` → `Training` → `Model`), On-Chain Verifier | 🟣 `BLOCKCHAIN READY` |
| **Phase 10**| Automated Royalty Engine | Multi-Party Split Tree Visualizer, Basis-Point Simulator, Payout History Table | 🟣 `BLOCKCHAIN READY` |
| **Phase 11**| Multi-Tier Analytics | Off-Chain KPIs (Revenue, Downloads, API Calls) + On-Chain Gas & Token Velocity | 🔵 `BACKEND READY` |
| **Phase 12**| Admin & Security Suite | User Suspension, Asset Deactivation, Report Queue, Treasury Vault, 5-Rule Fraud Deck | 🔵 `BACKEND READY` |
| **Phase 13**| API Integration Hardening | Connect UI services to verified REST endpoints with zero mock reliance | 🟢 `ALREADY BUILT` |
| **Phase 14**| Complete UI Polish | Deliver all remaining pages, atomic component library, responsive & a11y checks | 🟡 `IN PROGRESS` |
| **Phase 15**| E2E Testing | Automated Playwright/Cypress flows (Browse → Buy → Train → Verify) | ⬜ `NOT STARTED` |
| **Phase 16**| Production Deployment | Production Vite bundle optimization, Nginx Docker container, CDN caching | ⬜ `NOT STARTED` |
| **Phase 17**| Academic/Demo Showcase | Conference demo mode, pre-seeded dataset flows, interactive provenance slides | ⬜ `NOT STARTED` |

---

## 👥 3. Role-Based Deliverables Blueprint

The frontend enforces a **hierarchical, cumulative role model**. A **Creator is also a User/Consumer**, and an **Admin inherits all User and Creator capabilities**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Cumulative Role Inheritance Model                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Guest / Public]                                                            │
│   │  • Browse marketplace catalogs, view previews, inspect provenance DAGs  │
│   ▼                                                                         │
│ [Role 1: User / Consumer]                                                   │
│   │  • ALL Public capabilities                                              │
│   │  • Purchase dataset & model licenses with AIX tokens                    │
│   │  • Download purchased encrypted archives (/my-assets)                   │
│   │  • Run interactive AI inference in the playground                       │
│   │  • Manage Web3 AIX wallet & token transfers                             │
│   │  • Leave verified purchaser reviews & rate assets                       │
│   ▼                                                                         │
│ [Role 2: Creator / Developer]                                               │
│   │  • INHERITS ALL USER / CONSUMER CAPABILITIES (Can buy, use, download)  │
│   │  • Upload & register datasets on-chain (10-step wizard)                 │
│   │  • Register model weights & anchor SHA-256 digests                      │
│   │  • Provision isolated Docker sandboxes & train PyTorch models           │
│   │  • Embedded JupyterLab development studio                               │
│   │  • Automated multi-party royalty distributions & earnings               │
│   ▼                                                                         │
│ [Role 3: Admin / Operator]                                                  │
│      • INHERITS ALL USER & CREATOR CAPABILITIES                             │
│      • Moderate users (suspend/activate) & assets (deactivate)              │
│      • Review 5-rule deterministic on-chain fraud alerts                    │
│      • Audit platform treasury vault & inspect system health                │
└─────────────────────────────────────────────────────────────────────────────┘
```

> 💡 **Key Capability Directives**:
> 1. **Creators can buy and use!** A creator who uploads NLP datasets can also purchase computer vision datasets, download them, test models in the inference playground, and train new derivative models in the sandbox.
> 2. **Shared `/my-assets`**: Both pure consumers and creators have access to `/my-assets` and `/my-purchases` for all their acquired entitlements.

---

### ROLE 1: USER / CONSUMER (Data & AI Buyer)
*Focus: Discovery, trustless purchasing, downloading, testing inference, and asset ownership.*

#### 📄 Pages to Create / Polish:
1. **Landing Page (`/`)**: Value proposition hero, live platform counters, featured datasets & models.
2. **Authentication Pages (`/login`, `/register`, `/forgot-password`, `/reset-password`)**: Email + password login, Web3 wallet login.
3. **Dataset Marketplace (`/datasets`)**: Search, filter by category/license/price, sort by popularity/newest.
4. **Dataset Details & Preview (`/datasets/:id`)**: Technical specs, sanitized IPFS sample viewer, license selector, purchase trigger.
5. **Model Marketplace (`/models`)**: Framework filter pills (PyTorch, TensorFlow, Scikit-Learn, ONNX, Safetensors), model cards.
6. **Model Details & Checksum Check (`/models/:id`)**: Architecture specs, version history, drag-and-drop client SHA-256 weight verifier.
7. **Interactive AI Inference Studio (`/inference` or `/models/:id/infer`)**: Test models with form inputs or raw JSON; view predictions, probabilities, and latency.
8. **My Purchased Assets (`/my-assets`)**: Centralized library of licensed datasets and models with secure download triggers.
9. **My Purchase History (`/my-purchases`)**: Financial receipt ledger of all transactions with on-chain tx hashes.
10. **Web3 Wallet Terminal (`/wallet`)**: Native ETH & AIX balances, transfer modal, contract allowance approvals.
11. **User Profile & Security (`/profile`, `/settings`)**: Profile info, linked wallet management, session logout.
12. **Reputation & Review Hub (`/reputation`)**: Submit verified purchaser reviews (1-5 stars) and view creator quality scores.

#### 🧩 Components to Build for User Role:
- `DatasetCard.jsx` & `ModelCard.jsx` (with trust & provenance verification badges)
- `IPFSPreviewModal.jsx` (sanitized tabular, image, or text preview)
- `PurchaseModal.jsx` (2-step atomic flow: Step 1 Approve AIX → Step 2 Buy License)
- `PurchaseReceipt.jsx` (transaction confirmation card with download token trigger)
- `InferenceForm.jsx` & `LatencyMeter.jsx` (schema-driven inputs and latency display)
- `SHA256HashChecker.jsx` (in-browser Web Worker cryptographic checksum comparison)
- `RightsMatrix.jsx` (visual checklist of 8 permissions: view, download, train, commercial, etc.)
- `TokenTransferModal.jsx` (simple dialog to send AIX tokens)

---

### ROLE 2: CREATOR / DEVELOPER (Data Provider & ML Engineer)
*Focus: Monetization, decentralized storage, training pipelines, lineage anchoring, and royalty earnings.*  
*(Note: Inherits ALL Role 1 capabilities: can purchase, download, test inference, and manage assets).*

#### 📄 Creator-Exclusive Pages to Create / Polish:
1. **Multi-Step Dataset Registration Wizard (`/datasets/register`)**: 10-stage pipeline: basic info → metadata → tags → file upload to IPFS → license setup → pricing → royalty splits → review → on-chain registration → success.
2. **Model Registration Wizard (`/models/register`)**: Register pre-trained weights, anchor SHA-256 hash on `ModelRegistry.sol`, specify input/output schema.
3. **License Terms Manager (`/licenses/manage`)**: Create and attach Academic, Commercial, Exclusive, or Custom licenses to assets.
4. **Docker Sandbox Dashboard (`/sandboxes`)**: Overview of active/completed container sandboxes for model training.
5. **Active Training Console (`/sandboxes/:id`)**: Real-time PyTorch control room with live loss curves, epoch progress, and 2-second streaming logs.
6. **Embedded JupyterLab Studio (`/sandboxes/:id/jupyter`)**: Full-screen, token-authenticated JupyterLab IDE running inside the user's isolated Docker container.
7. **AI Provenance DAG Explorer (`/provenance`, `/provenance/graph/:modelId`)**: Interactive Directed Acyclic Graph proving dataset → training execution → model lineage.
8. **Provenance Verification Terminal (`/provenance/:id/verify`)**: Live cryptographic verification against `ProvenanceRegistry.sol`.
9. **Royalty Engine Dashboard (`/royalties`)**: Multi-party revenue split visualizer, basis-point calculator, payout history table.
10. **Developer Wallet Testbed (`/wallet-test`)**: Sandbox for testing MetaMask connection, signing challenge nonces, and AIX faucet minting.

#### 🧩 Creator-Exclusive Components to Build:
- `RegistrationStepper.jsx` (10-step progress indicator with validation gates)
- `IPFSUploader.jsx` (drag-and-drop file dropzone with client-side SHA-256 hashing)
- `TrainingLossChart.jsx` (real-time SVG/Canvas plotting training loss vs. validation loss)
- `StreamingTerminal.jsx` (monospace log console auto-scrolling live execution output)
- `JupyterIframe.jsx` (isolated iframe wrapper with server start/stop controls)
- `LineageDAGViewer.jsx` (interactive node-link graph with pan/zoom and node inspector drawer)
- `RoyaltySplitTree.jsx` (visual revenue tree: Gross → 2.5% Treasury → Creator → Upstream Licensors)
- `SplitSimulator.jsx` (interactive calculator showing exact AIX allocations down to zero-leakage dust)

---

### ROLE 3: ADMIN / OPERATOR (Governance & Platform Auditor)
*Focus: Platform health, asset and user moderation, abuse reports, treasury telemetry, and fraud reviews.*

#### 📄 Pages to Create / Polish:
1. **Admin Mission Control (`/admin`)**: Executive dashboard with platform KPIs, system health tickers, and urgent review alerts.
2. **User Moderation Deck (`/admin/users`)**: Search, view, and toggle user status (`ACTIVE` ↔ `SUSPENDED`) with mandatory reason prompts.
3. **Asset Moderation Queue (`/admin/moderation`)**: Inspect, approve, or deactivate datasets and models (removes from marketplace catalog).
4. **Platform Abuse Reports Queue (`/admin/reports`)**: Investigate user-submitted violation reports, assign handlers, update resolution status.
5. **Platform Treasury Terminal (`/admin/treasury`)**: Monitor native ETH and AIX vault balances, fee inflows (2.50%), and platform fee withdrawals.
6. **Blockchain Real-Time Monitoring Center (`/admin/blockchain`)**: Real-time feed of indexed smart contract events, token velocity, and gas consumption costs.
7. **Deterministic Fraud Review Deck (`/admin/fraud`)**: Human-in-the-loop review interface for evaluating transactions flagged by the 5 fraud rules.
8. **Append-Only Moderation Audit Log (`/admin/audits`)**: Tamper-evident historical table recording every administrative action taken.

#### 🧩 Components to Build for Admin Role:
- `AdminSidebar.jsx` (dedicated dark-tactical navigation menu with alert counters)
- `ModerationTable.jsx` (table with status badges, quick inspection drawer, and action buttons)
- `SuspensionModal.jsx` (modal enforcing mandatory reason logging for legal compliance)
- `TreasuryBalanceCard.jsx` (live readout of vault balances and cumulative platform fees)
- `FraudFlagCard.jsx` (renders risk score 0–100, heuristic trigger math, and block delta)
- `FraudEvidenceDrawer.jsx` (side panel detailing raw inputs, involved wallets, and resolution actions)
- `AuditLogTable.jsx` (read-only historical feed of admin modifications)

---

## 🏗️ 4. Shared Atomic Component Inventory

To prevent duplicated code, the frontend relies on a shared, atomic component library:

```text
client/src/components/
├── common/
│   ├── Button.jsx          # Primary, Secondary, Danger, Ghost, Loading states
│   ├── Input.jsx           # Form text/number input with validation errors & icons
│   ├── Select.jsx          # Accessible custom styled select dropdown
│   ├── Modal.jsx           # Accessible dialog with backdrop blur & focus trap
│   ├── Drawer.jsx          # Slide-over panel for inspector and detail views
│   ├── Tabs.jsx            # Animated tab switcher
│   ├── Table.jsx           # Sortable, responsive data table with pagination
│   ├── Badge.jsx           # Status badge (success, warning, error, info, neutral)
│   ├── Skeleton.jsx        # Layout-matching shimmer loader
│   └── Toast.jsx           # Global notification alert
├── feedback/
│   ├── EmptyState.jsx      # Empty view container with icon, message, and CTA
│   ├── ErrorBoundary.jsx   # React crash catcher with graceful reload trigger
│   └── ConfirmDialog.jsx   # Destructive action double-confirmation dialog
└── web3/
    ├── AddressBadge.jsx    # Formatted Ethereum address with copy & blockie
    ├── NetworkBadge.jsx    # Active chain indicator (Localhost 31337 / Sepolia)
    └── TxStepperModal.jsx  # Multi-stage mining modal (Preparing -> Mining -> Indexed)
```

---

## 📋 5. Master Page & Route Checklist

| Route Path | Page Name | Primary Role | Implementation Status |
| :--- | :--- | :---: | :---: |
| `/` | Landing / Hero Page | Public / All | ⬜ `NOT STARTED` |
| `/login` | User Sign In | Public / All | 🔵 `BACKEND READY` |
| `/register` | User Registration | Public / All | 🔵 `BACKEND READY` |
| `/datasets` | Dataset Marketplace Catalog | User / All | 🟢 `ALREADY BUILT` (Needs API polish) |
| `/datasets/:id` | Dataset Details & Access Portal | User / All | 🟢 `ALREADY BUILT` (Needs license selector) |
| `/datasets/register` | 10-Step Dataset Registration Wizard | Creator | 🟢 `ALREADY BUILT` (Needs 10-step wizard upgrade) |
| `/models` | Model Marketplace Catalog | User / All | 🟣 `BLOCKCHAIN READY` |
| `/models/:id` | Model Details & Weight Hash Check | User / All | 🟣 `BLOCKCHAIN READY` |
| `/models/register` | Model Registration Wizard | Creator | 🟣 `BLOCKCHAIN READY` |
| `/inference` | Interactive AI Inference Studio | User / Creator | 🟠 `AI READY` |
| `/licenses/templates` | License Template Explorer | User / Creator | 🔵 `BACKEND READY` |
| `/licenses/manage` | License Terms Manager | Creator | 🔵 `BACKEND READY` |
| `/my-assets` | Purchased Assets & Downloads Hub | User | 🔵 `BACKEND READY` |
| `/my-purchases` | Financial Purchase Ledger | User | 🔵 `BACKEND READY` |
| `/sandboxes` | Docker Training Sandbox Dashboard | Creator | 🟠 `AI READY` |
| `/sandboxes/:id` | Active Training Console & Live Logs | Creator | 🟠 `AI READY` |
| `/sandboxes/:id/jupyter`| Embedded JupyterLab Studio | Creator | 🟠 `AI READY` |
| `/provenance` | Provenance Explorer & Lineage Search | User / Creator | 🟣 `BLOCKCHAIN READY` |
| `/provenance/graph/:id`| Interactive Lineage DAG Visualizer | User / Creator | 🟣 `BLOCKCHAIN READY` |
| `/royalties` | Secondary Royalty Engine Dashboard | Creator | 🟣 `BLOCKCHAIN READY` |
| `/analytics` | Platform Business Intelligence Deck | User / Creator | 🔵 `BACKEND READY` |
| `/wallet` | Web3 AIX Token & Treasury Terminal | User / All | 🟡 `IN PROGRESS` |
| `/wallet-test` | Developer Web3 & Faucet Testbed | Creator / Dev | 🟢 `ALREADY BUILT` |
| `/profile` | User Profile & Linked Wallets | User / All | 🔵 `BACKEND READY` |
| `/settings` | Security & Session Settings | User / All | 🔵 `BACKEND READY` |
| `/admin` | Admin Mission Control Overview | Admin | 🔵 `BACKEND READY` |
| `/admin/users` | User Moderation Queue | Admin | 🔵 `BACKEND READY` |
| `/admin/moderation` | Asset Moderation Queue | Admin | 🔵 `BACKEND READY` |
| `/admin/reports` | Abuse Reports Queue | Admin | 🔵 `BACKEND READY` |
| `/admin/treasury` | Platform Treasury Vault Terminal | Admin | 🔵 `BACKEND READY` |
| `/admin/blockchain` | Blockchain Real-Time Event Monitor | Admin | 🔵 `BACKEND READY` |
| `/admin/fraud` | Deterministic Fraud Review Deck | Admin | 🔵 `BACKEND READY` |
| `/admin/audits` | Append-Only Moderation Audit Log | Admin | 🔵 `BACKEND READY` |

---

## ⚡ 6. Implementation Sequence & Next Steps

When ready to begin Phase 14 frontend execution, build in this strict dependency order:

1. **Sprint 1: Store & Core Components**  
   Configure Redux root store (`authSlice`, `walletSlice`, `notificationSlice`), set up TanStack Query provider, and build `components/common/` (`Button`, `Input`, `Modal`, `Table`, `Badge`).
2. **Sprint 2: Authentication & Wallet Hardening**  
   Build `/login`, `/register`, connect the existing `services/blockchain/wallet/` into a polished `WalletModal`, and implement `/wallet`.
3. **Sprint 3: Consumer Marketplace Polish**  
   Hook `/datasets` to backend REST endpoints, implement `PurchaseModal` (Approve + Purchase), and build `/my-assets`.
4. **Sprint 4: Models & Inference Playground**  
   Implement `/models`, `/models/:id` with client-side SHA-256 weight hashing, and build the `/inference` execution studio.
5. **Sprint 5: Docker Sandbox & Training Console**  
   Build `/sandboxes`, `/sandboxes/:id` with live PyTorch loss curves and terminal streaming logs, and embed `/sandboxes/:id/jupyter`.
6. **Sprint 6: Provenance DAG & Royalty Engine**  
   Build the interactive GPU/Canvas lineage visualizer `/provenance/graph/:id` and the secondary royalty tree `/royalties`.
7. **Sprint 7: Analytics & Admin Suite**  
   Build the 8-domain `/analytics` dashboard and the full administrative suite (`/admin`, `/admin/moderation`, `/admin/treasury`, `/admin/fraud`).
