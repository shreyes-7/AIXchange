# Blockchain Integration

## Overview

This document details the deployment infrastructure, toolchains, and client/backend connection libraries that integrate the blockchain tier with the rest of AIXchange.

---

## 1. Hardhat Ignition Deployment Modules (`blockchain/ignition/modules/`)

AIXchange uses **Hardhat Ignition** for declarative, repeatable smart contract deployments:

- `AIXToken.js`: Deploys `AIXToken.sol`.
- `Treasury.js`: Deploys `Treasury.sol`.
- `DatasetRegistry.js`: Deploys `DatasetRegistry.sol`.
- `LicenseRegistry.js`: Deploys `LicenseRegistry.sol` passing `datasetRegistry` as a constructor argument.
- `PurchaseEngine.js`: Deploys `PurchaseEngine.sol` linking `aixToken`, `datasetRegistry`, `licenseRegistry`, `treasury`, and initial fee BPS (`250`).
- **Master Modules**:
  - `Phase3.js`: Token + Treasury.
  - `Phase4.js`: Phase 3 + Dataset Registry.
  - `Phase5.js`: Phase 4 + License Registry.
  - `Phase6.js`: Master deployment for all 5 contracts.

---

## 2. Standalone Deployment Scripts (`blockchain/scripts/`)

- `scripts/deploy.js`: Standalone script to deploy AIXToken and Treasury.
- `scripts/deployDatasetRegistry.js`: Deploys DatasetRegistry.
- `scripts/deployLicenseRegistry.js`: Deploys LicenseRegistry with dependency resolution.
- `scripts/deployPurchaseEngine.js`: Deploys PurchaseEngine with full dependency injection and local verification.
- `scripts/mint.js`: CLI tool to mint test AIX tokens.
- `scripts/transfer.js`: CLI tool to transfer AIX tokens.
- `scripts/balance.js`: CLI tool to inspect ETH and AIX balances.

---

## 3. Frontend & Backend Ethers.js v6 Integration

- **Frontend Client (`client/src/services/blockchain/`)**:
  - Uses `BrowserProvider(window.ethereum)` to instantiate `Contract` objects with compiled JSON ABIs.
  - Handles gas estimation, transaction signing, and user notifications.
- **Backend Server (`server/src/services/`)**:
  - Uses `JsonRpcProvider(process.env.ETH_RPC_URL)` to connect to the Ethereum JSON-RPC endpoint.
  - Background workers subscribe to contract filters (`contract.on()`) or poll event logs (`contract.queryFilter()`) to sync state to MongoDB.
