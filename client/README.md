# AIXchange Frontend Client

The **AIXchange Client** is a high-performance Web3 single-page application (SPA) built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Redux Toolkit**, and **Ethers.js v6**. It serves as the primary user interface for discovering, licensing, registering, and trading AI datasets and machine learning models, exploring cryptographic provenance lineage graphs, executing live tensor inference, managing containerized AI training sandboxes, and auditing decentralized royalty distributions.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Installation & Local Execution](#installation--local-execution)
6. [Application Routing & Pages](#application-routing--pages)
7. [Web3 & State Management Architecture](#web3--state-management-architecture)
8. [Backend & Service Integration](#backend--service-integration)
9. [Build & Quality Commands](#build--quality-commands)
10. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architectural Overview

The frontend layer connects browser users with both off-chain REST services and on-chain EVM smart contracts:

```text
               ┌────────────────────────────────────────────────────────┐
               │                 Browser User Interface                 │
               │   (React 19 + Tailwind CSS v4 + Redux Toolkit + Sonner)│
               └───────────────┬────────────────────────┬───────────────┘
                               │                        │
                    HTTP REST  │                        │ JSON-RPC EIP-1193
               (Axios Service) │                        │ (MetaMask / Ethers v6)
                               ▼                        ▼
               ┌───────────────────────┐        ┌───────────────────────┐
               │    Express Backend    │        │  EVM Smart Contracts  │
               │  http://localhost:5000│        │  http://127.0.0.1:8545│
               │        (API v1)       │        │   (Chain ID: 31337)   │
               └───────────────────────┘        └───────────────────────┘
```

- **Zero-Custody Cryptography**: Private keys remain securely in the user's browser wallet (MetaMask). Transactions and EIP-191 authentication signatures are requested directly via standard EIP-1193 providers.
- **Optimistic UI with On-Chain Fallbacks**: Asset reads query indexed MongoDB endpoints for speed while supporting direct smart contract fallback calls via Ethers.js providers.
- **Embedded Sandbox Workspace**: The training sandbox interface embeds the isolated JupyterLab runtime in an iframe with strict Content Security Policy (CSP) headers.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.7` | Reactive component rendering and UI lifecycle |
| **Build Tool** | Vite | `^8.1.1` | Instant HMR development server and optimized ESM bundler |
| **Styling** | Tailwind CSS | `^4.3.2` | Utility-first cybernetic design system and animations |
| **State Store** | Redux Toolkit | `^2.12.0` | Global state management for authentication, wallet, and assets |
| **Blockchain** | Ethers.js | `^6.17.0` | EVM contract interaction, wallet signing, and BigInt math |
| **Routing** | React Router DOM | `^7.18.1` | Declarative client-side routing and protected navigations |
| **Notifications** | Sonner | `^2.0.8` | High-fidelity toast notifications for blockchain events |
| **Icons** | Lucide React | `^1.41.0` | Modern, clean vector iconography |

---

## Prerequisites

- **Node.js**: `v20.0.0` or higher (`v22.x` recommended)
- **npm**: `v10.0.0` or higher
- **MetaMask Browser Extension**: Installed in Google Chrome, Brave, Firefox, or Microsoft Edge
- **Active Backend Server**: Express server running on port `5000`
- **Active Local Blockchain**: Hardhat node running on port `8545`

---

## Environment Configuration

Configuration is loaded from `client/.env`. Create this file by copying the provided template:

```powershell
# Working Directory: D:\AIXchange\client
Copy-Item .env.example .env
```

### Environment Variables Reference

| Variable | Type | Required | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String (URL) | **Yes** | `http://localhost:5000/api/v1` | Base URL for the Express backend REST API |
| `VITE_BLOCKCHAIN_RPC_URL` | String (URL) | **Yes** | `http://127.0.0.1:8545` | JSON-RPC provider endpoint for the local blockchain |
| `VITE_CHAIN_ID` | Number | **Yes** | `31337` | Target EVM chain ID (`31337` for Hardhat, `11155111` for Sepolia) |
| `VITE_BLOCK_EXPLORER_URL` | String (URL) | No | `https://sepolia.etherscan.io` | External block explorer for testnet transaction links |
| `VITE_AIX_TOKEN_ADDRESS` | String (Hex) | **Yes** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Deployed address of the AIX ERC-20 token contract |
| `VITE_TREASURY_ADDRESS` | String (Hex) | **Yes** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Deployed address of the Treasury vault contract |
| `VITE_DATASET_REGISTRY_ADDRESS` | String (Hex) | **Yes** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Deployed address of the DatasetRegistry contract |
| `VITE_IPFS_GATEWAY_URL` | String (URL) | No | `https://ipfs.io/ipfs` | Public IPFS gateway for previewing decentralized assets |

> **Security Note:** Vite exposes variables prefixed with `VITE_` to the client-side JavaScript bundle. **Never** place private keys, database passwords, or backend secrets in `client/.env`.

---

## Installation & Local Execution

### 1. Install Dependencies

```powershell
# Working Directory: D:\AIXchange\client
npm install
```

### 2. Start Development Server

```powershell
# Working Directory: D:\AIXchange\client
npm run dev
```

The development server starts with Vite hot module replacement (HMR):

- **Local URL**: `http://localhost:5173/`
- **Network URL**: Visible in console output if `--host` is supplied

---

## Application Routing & Pages

All route declarations reside in `client/src/App.jsx`:

| Path | Component | Purpose & Functionality |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Platform hero, feature showcases, telemetry metrics, and CLI launcher |
| `/login` | `LoginPage.jsx` | User authentication via email/password or Web3 wallet challenge |
| `/register` | `RegisterPage.jsx` | New user onboarding and researcher registration |
| `/wallet` | `WalletPage.jsx` | Web3 wallet dashboard, AIX balance, allowance approvals, and test faucets |
| `/profile` | `UserProfileSettings.jsx` | User profile management, linked wallets, and notification settings |
| `/my-assets` | `MyAssets.jsx` | Purchased datasets, model weights, and license receipt downloads |
| `/datasets` | `DatasetMarketplace.jsx` | Browse, filter, and inspect cryptographically registered datasets |
| `/datasets/register` | `RegisterDataset.jsx` | 10-step wizard to upload, hash, license, and anchor datasets on-chain |
| `/datasets/:id` | `DatasetDetails.jsx` | Dataset provenance view, license purchasing, and ownership management |
| `/models` | `ModelMarketplace.jsx` | AI model catalog with SHA-256 weight digests and framework tags |
| `/models/register` | `RegisterModel.jsx` | Anchor trained model weights and metadata commitments on-chain |
| `/models/:id` | `ModelDetails.jsx` | Model technical specifications, lineage parent links, and downloads |
| `/sandboxes` | `SandboxDashboard.jsx` | Docker training monitor, resource graphs, and embedded JupyterLab IDE |
| `/provenance` | `ProvenanceExplorer.jsx` | Global lineage DAG explorer connecting datasets to trained models |
| `/provenance/graph/:id` | `LineageGraphView.jsx` | Interactive node-link visualizer for specific model lineage trees |
| `/inference` | `InferencePlayground.jsx` | Live interactive tensor testing with dynamic schema sliders and latency metrics |
| `/royalties` | `RoyaltyDashboard.jsx` | Multi-party revenue split trees, fee claim logs, and recipient accounting |
| `/analytics` | `AnalyticsDashboard.jsx` | On-chain gas metrics, daily transaction volume, and platform BI |
| `/admin` | `AdminDashboard.jsx` | Treasury vault monitoring, moderation review, and fraud flag audit |
| `/wallet-test` | `WalletTest.jsx` | Developer diagnostics for MetaMask sign, verify, and RPC latency testing |

---

## Web3 & State Management Architecture

### State Store Structure (`src/store/`)

- `walletSlice.js`: Tracks connected address, active `chainId`, connection status (`CONNECTED`/`DISCONNECTED`), and formatted `aixBalance`.
- `authSlice.js`: Manages JWT access tokens, authenticated user profile, and session state.

### Blockchain Service Layer (`src/services/blockchain/`)

```text
src/services/blockchain/
├── wallet/
│   ├── metamask.service.js   # Window.ethereum provider detection, account/chain listeners
│   ├── signer.service.js     # EIP-191 personal_sign message generation and verification
│   ├── constants.js          # Supported chain IDs (31337, 11155111) and error constants
│   └── index.js              # Unified wallet connection entrypoint
├── token/
│   ├── token.service.js      # ERC-20 balanceOf, approve, transfer, and allowance methods
│   └── token.abi.js          # Human-readable AIX token ABI
├── dataset/
│   ├── dataset.service.js    # DatasetRegistry registerDataset, getDataset, updateDataset
│   └── dataset.abi.js        # DatasetRegistry contract ABI
└── provenance/
    └── provenance.service.js # ProvenanceRegistry lineage record commitments and queries
```

---

## Backend & Service Integration

API calls use configured Axios instances in `src/services/api/`:

- Automatically injects JWT Bearer tokens from local state.
- Gracefully handles HTTP 401 unauthenticated errors.
- Provides fallback mock data when backend services are offline during initial UI development.

---

## Build & Quality Commands

```powershell
# Working Directory: D:\AIXchange\client

# 1. Start development server
npm run dev

# 2. Compile production bundle
npm run build

# 3. Preview production build locally
npm run preview

# 4. Execute ESLint code quality checks
npm run lint
```

The production output is built into `client/dist/` with optimized chunking and CSS asset extraction.

---

## Troubleshooting & FAQ

### Issue: Vite opens on port 5174 instead of 5173
- **Cause**: Port `5173` is occupied by another process or an orphaned Vite instance.
- **Fix**: Identify and terminate the occupying process on Windows:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  npm run dev
  ```

### Issue: "MetaMask RPC Error: Chain ID Mismatch"
- **Cause**: MetaMask is connected to Ethereum Mainnet or Sepolia while the client expects Hardhat (`31337`).
- **Fix**: In MetaMask, switch network to **Hardhat Local Network** (`RPC: http://127.0.0.1:8545`, `Chain ID: 31337`, `Currency: ETH`).

### Issue: "Failed to fetch AIX balance" or "0 AIX displayed"
- **Cause**: Hardhat node was restarted, changing contract addresses, or the contracts were not yet deployed.
- **Fix**: Ensure Terminal 3 (`npx hardhat node`) is running, re-run Terminal 4 (`npx hardhat ignition deploy ...`), and verify that `VITE_AIX_TOKEN_ADDRESS` matches `deployed_addresses.json`.
