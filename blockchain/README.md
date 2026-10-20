# AIXchange Blockchain Layer

The **AIXchange Blockchain Layer** provides the decentralized trust, ownership, atomic settlement, cryptographic licensing, and verifiable provenance infrastructure for the AIXchange platform. Built with **Solidity ^0.8.28**, **Hardhat**, **OpenZeppelin Contracts v5**, **Hardhat Ignition**, and **Ethers.js v6**, it forms the immutable foundation of the AIXchange decentralized substrate.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Smart Contracts Catalog](#smart-contracts-catalog)
3. [Local Blockchain Node (Terminal 3)](#local-blockchain-node-terminal-3)
4. [Smart Contract Deployment via Phase10 (Terminal 4)](#smart-contract-deployment-via-phase10-terminal-4)
5. [Deployment Artifacts & Address Synchronization](#deployment-artifacts--address-synchronization)
6. [MetaMask Local Network Configuration](#metamask-local-network-configuration)
7. [Automated Test Suite (279 Tests) & Gas Benchmarks](#automated-test-suite-279-tests--gas-benchmarks)
8. [Security Invariants & Developer Safeguards](#security-invariants--developer-safeguards)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architectural Overview

The blockchain layer decouples heavy binary storage (dataset archives, PyTorch weights) from on-chain execution logic. Smart contracts strictly maintain **content identifiers (CIDs)**, **SHA-256 artifact digests**, **access entitlements**, **licensing terms**, and **payment state transitions**:

```text
                                  ┌────────────────────────┐
                                  │       AIXToken.sol     │
                                  │ (ERC-20, 18 Decimals)  │
                                  └───────────┬────────────┘
                                              │ safeTransferFrom
                                              ▼
┌──────────────────────┐  queries  ┌──────────────────────┐  splits fee  ┌──────────────────────┐
│ DatasetRegistry.sol  │◄──────────│  PurchaseEngine.sol  │─────────────►│     Treasury.sol     │
│ (IPFS CIDs, Owners)  │           │ (Atomic Settlement)  │ (2.50% BPS)  │ (Platform Vault)     │
└──────────┬───────────┘           └──────────┬───────────┘              └──────────▲───────────┘
           │                                  │                                     │
           │ verifies                         │ access                              │ absorbs
           ▼                                  ▼ entitlement                         │ dust
┌──────────────────────┐           ┌──────────────────────┐              ┌──────────┴───────────┐
│ LicenseRegistry.sol  │           │ Docker AI Sandbox    │              │  RoyaltyEngine.sol   │
│ (Rights, Fixed/BPS)  │           │ (Execution Substrate)│              │ (Multi-Party Splits) │
└──────────────────────┘           └──────────┬───────────┘              └──────────────────────┘
                                              │ generates SHA-256
                                              ▼
┌──────────────────────┐           ┌──────────────────────┐
│  ModelRegistry.sol   │◄──────────│ProvenanceRegistry.sol│
│ (Weights Digests)    │  verifies │ (Lineage DAG)        │
└──────────────────────┘           └──────────────────────┘
```

---

## Smart Contracts Catalog

All contracts reside in `blockchain/contracts/` and compile with Solidity `0.8.28` (optimizer enabled, 200 runs):

### 1. `AIXToken.sol` (`contracts/tokens/`)
- Standard ERC-20 token with OpenZeppelin `ERC20Burnable` and `Ownable`.
- **Name**: `AIX Token` | **Symbol**: `AIX` | **Decimals**: `18`
- **Initial Supply**: 100,000,000 AIX (`100000000 * 10^18` wei) minted to the deployer account.
- Serves as the primary medium of exchange for dataset purchases, model licensing, and royalty distributions.

### 2. `Treasury.sol` (`contracts/governance/`)
- Multi-asset protocol vault receiving protocol fees (default: 2.50% / 250 BPS) from marketplace purchases and unallocated royalty dust.
- Supports native ETH and arbitrary ERC-20 tokens with OpenZeppelin `SafeERC20` protections.
- Governed by timelocked administrative withdrawal controls.

### 3. `DatasetRegistry.sol` (`contracts/registry/`)
- Immutable catalog of verifiable AI training datasets.
- Stores dataset ID, creator address, IPFS CID, title, description, tags, price, and active status.
- Enforces unique dataset IDs and emits `DatasetRegistered`, `DatasetUpdated`, and `DatasetOwnershipTransferred` events.

### 4. `LicenseRegistry.sol` (`contracts/licensing/`)
- Cryptographic license issuance and verification for dataset and model consumers.
- Tracks license terms: fixed fee or basis points (BPS), validity duration, commercial rights, and revocation status.
- Emits `LicenseGranted`, `LicenseRevoked`, and `LicenseExpired` events.

### 5. `PurchaseEngine.sol` (`contracts/marketplace/`)
- Facilitates atomic purchases of datasets and model licenses using AIX tokens.
- Deducts platform fees and routes them to `Treasury.sol`.
- Triggers automatic secondary royalty distributions via `RoyaltyEngine.sol`.
- Emits `PurchaseInitiated` and `PurchaseCompleted` events.

### 6. `ModelRegistry.sol` (`contracts/registry/`)
- Manages AI model artifact registrations, tying parent dataset IDs, architecture tags (`pytorch`, `safetensors`), and parameter counts to an immutable SHA-256 weights digest.
- Protects downstream consumers against model weight tampering.

### 7. `ProvenanceRegistry.sol` (`contracts/registry/`)
- On-chain Directed Acyclic Graph (DAG) recording model provenance.
- Anchors the cryptographic relationship: `Dataset Hash + Training Code Hash + Hyperparameters -> Trained Model Weight Hash`.
- Emits `LineageAnchored` events for immutable audit trails.

### 8. `RoyaltyEngine.sol` (`contracts/royalty/`)
- Configurable multi-party revenue distribution engine supporting up to 50 beneficiaries per asset.
- Calculates exact proportional shares in basis points (10,000 BPS = 100.00%) with zero-leakage dust handling directed to the Treasury.
- Emits `RoyaltySplitConfigured` and `RoyaltyDistributed` events.

---

## Local Blockchain Node (Terminal 3)

The local development environment uses Hardhat's built-in EVM JSON-RPC node.

### How to Start

Open a dedicated terminal window (Terminal 3):

```powershell
# Working Directory: D:\AIXchange
cd blockchain
npx hardhat node
```

### Expected Output

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
...
Private Keys
==================
Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### Critical Operational Rules

1. **Keep Terminal 3 Running**: This terminal must remain open during your entire development session.
2. **State Reset Warning**: Terminating and restarting `npx hardhat node` **completely wipes local blockchain state**, resetting the block height to `0` and destroying all deployed contracts, token balances, and transaction history.
3. **Redeployment Requirement**: Whenever the local node is restarted, you **must re-run Terminal 4** to redeploy all smart contracts.
4. **Development Credentials Warning**: The private keys printed above are publicly known development credentials generated by Hardhat. **Never send real funds, mainnet assets, or production tokens to these accounts.**

---

## Smart Contract Deployment via Phase10 (Terminal 4)

Deployments are managed declaratively using **Hardhat Ignition**. The `Phase10.js` module deploys the complete, integrated suite of all 8 core platform contracts.

### How to Deploy

Open a new terminal window (Terminal 4):

```powershell
# Working Directory: D:\AIXchange
cd blockchain
npx hardhat ignition deploy ignition/modules/Phase10.js --network localhost
```

### What Phase10 Deploys

The module executes a dependency graph:
1. `Phase3Module`: Deploys `AIXToken` and `Treasury`.
2. `Phase4Module`: Deploys `DatasetRegistry`.
3. `Phase5Module`: Deploys `LicenseRegistry`.
4. `Phase6Module`: Deploys `PurchaseEngine`.
5. `Phase8Module`: Deploys `ModelRegistry`.
6. `Phase9Module`: Deploys `ProvenanceRegistry`.
7. `Phase10Module` / `RoyaltyEngineModule`: Deploys `RoyaltyEngine`.

### Expected Deployment Output

```text
Hardhat Ignition 🚀

Deploying [ Phase10Module ]

Batch #1
  Executed AIXTokenModule#AIXToken
  Executed TreasuryModule#Treasury

Batch #2
  Executed DatasetRegistryModule#DatasetRegistry
  Executed LicenseRegistryModule#LicenseRegistry

Batch #3
  Executed PurchaseEngineModule#PurchaseEngine
  Executed ModelRegistryModule#ModelRegistry

Batch #4
  Executed ProvenanceRegistryModule#ProvenanceRegistry
  Executed RoyaltyEngineModule#RoyaltyEngine

[ Phase10Module ] successfully deployed 🚀
```

---

## Deployment Artifacts & Address Synchronization

### Where Addresses are Recorded

When Hardhat Ignition finishes deployment, it records the exact deployed contract addresses to:
`blockchain/ignition/deployments/chain-31337/deployed_addresses.json`

Example contents:

```json
{
  "AIXTokenModule#AIXToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "TreasuryModule#Treasury": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "DatasetRegistryModule#DatasetRegistry": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "LicenseRegistryModule#LicenseRegistry": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "PurchaseEngineModule#PurchaseEngine": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  "ModelRegistryModule#ModelRegistry": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  "ProvenanceRegistryModule#ProvenanceRegistry": "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  "RoyaltyEngineModule#RoyaltyEngine": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
}
```

### Synchronizing with Backend & Frontend

1. **Backend (`server/.env`)**:
   Ensure `AIX_TOKEN_ADDRESS`, `TREASURY_ADDRESS`, `DATASET_REGISTRY_ADDRESS`, etc., match the addresses in `deployed_addresses.json`. The server also checks `blockchain/.env` as a fallback.
2. **Frontend (`client/.env`)**:
   Ensure `VITE_AIX_TOKEN_ADDRESS`, `VITE_TREASURY_ADDRESS`, and `VITE_DATASET_REGISTRY_ADDRESS` match the deployed addresses.

---

## MetaMask Local Network Configuration

To interact with the local blockchain through the browser, configure MetaMask as follows:

1. Open MetaMask and click the network selector at top-left.
2. Click **Add Network** -> **Add a network manually**.
3. Enter the following details:
   - **Network Name**: `Hardhat Localhost`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
4. Click **Save** and switch to `Hardhat Localhost`.
5. **Import Development Account**:
   - In MetaMask, click the account dropdown -> **Import account**.
   - Paste the private key for Account #0:
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Your account will display an initial balance of `10,000 ETH` for testing gas fees.

---

## Automated Test Suite (279 Tests) & Gas Benchmarks

The blockchain test suite verifies contract logic, access permissions, edge cases, and reentrancy protections across 279 comprehensive automated test cases:

```powershell
# Working Directory: D:\AIXchange\blockchain

# Compile Solidity contracts
npm run compile

# Execute complete test battery
npx hardhat test

# Run test coverage analysis
npm run coverage
```

### Gas Consumption Benchmarks

Typical gas consumption metrics measured on the local EVM:

| Smart Contract | Method Call | Average Gas Consumed |
| :--- | :--- | :--- |
| `AIXToken` | `transfer` | ~51,200 gas |
| `AIXToken` | `approve` | ~46,100 gas |
| `DatasetRegistry` | `registerDataset` | ~128,450 gas |
| `PurchaseEngine` | `purchaseDataset` | ~174,800 gas |
| `ModelRegistry` | `registerModel` | ~142,300 gas |
| `ProvenanceRegistry` | `anchorLineage` | ~118,900 gas |
| `RoyaltyEngine` | `distributeRoyalty` (3 splits) | ~132,600 gas |

---

## Security Invariants & Developer Safeguards

- **Checks-Effects-Interactions**: All payment and asset transfer functions strictly adhere to CEI patterns to eliminate reentrancy attack surfaces.
- **OpenZeppelin ReentrancyGuard**: Applied to all state-mutating functions in `PurchaseEngine` and `RoyaltyEngine`.
- **SafeERC20**: Token transfers use `safeTransfer` and `safeTransferFrom` to handle non-standard ERC-20 return values.
- **Basis Points (BPS) Math**: All percentages use integer BPS arithmetic (e.g., 250 = 2.50%, 10,000 = 100.00%) to prevent floating-point rounding errors.

---

## Troubleshooting & FAQ

### Issue: "Error: Connection refused at http://127.0.0.1:8545"
- **Cause**: Terminal 3 (`npx hardhat node`) is not running.
- **Fix**: Launch Terminal 3 and ensure the local JSON-RPC server is active before deploying or sending transactions.

### Issue: "Hardhat Ignition: Reconciliation error / contract already deployed"
- **Cause**: The local node was restarted or the deployment state is out of sync with previous records.
- **Fix**: Deploy with the `--reset` flag to wipe stale local Ignition deployment journals:
  ```powershell
  npx hardhat ignition deploy ignition/modules/Phase10.js --network localhost --reset
  ```

### Issue: "MetaMask: Nonce too high" or transaction hangs
- **Cause**: Hardhat node was restarted, resetting transaction nonces to 0, while MetaMask remembers higher nonces.
- **Fix**: In MetaMask, go to **Settings** -> **Advanced** -> **Clear activity tab data** (Reset Account). This clears cached local nonces without affecting your imported private keys.