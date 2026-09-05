# Blockchain Overview

## Overview

The AIXchange blockchain layer is developed in **Solidity `^0.8.28`** using the **Hardhat** development framework. It provides the decentralized backbone for token economics, treasury custody, dataset registry, licensing terms, and atomic purchase settlement.

---

## Technical Specifications

- **Solidity Version**: `^0.8.28` (EVM target: `cancun` / default)
- **Framework**: Hardhat `^2.22.19`
- **Compiler Optimizer**: Enabled (`runs: 200`)
- **Core Dependencies**: OpenZeppelin Contracts `^5.2.0` (`ERC20`, `Ownable`, `ReentrancyGuard`, `Pausable`, `SafeERC20`)
- **Deployment Engine**: Hardhat Ignition & Standalone Node scripts
- **Test Suite**: 228 passing unit tests across 8 suites (100% pass rate)

---

## Architecture Topology

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AIXchange Smart Contracts                       │
├────────────────────────────────┬───────────────────────────────────────┤
│        Tokens & Vaults         │               Registries              │
│  • AIXToken.sol (ERC-20)       │  • DatasetRegistry.sol (Datasets)     │
│  • Treasury.sol (Protocol)     │  • LicenseRegistry.sol (Licensing)    │
│                                │  • ModelRegistry.sol (Models & Hashes)│
│                                │  • ProvenanceRegistry.sol (Lineage)   │
├────────────────────────────────┴───────────────────────────────────────┤
│                          Settlement Engine                             │
│  • PurchaseEngine.sol (Atomic Payments, Exclusivity, Access Tracking) │
│  • RoyaltyEngine.sol (Multi-party Revenue Split, Treasury Routing)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Deployed Contract Addresses (Local Network Chain ID `31337`)

| Contract | Hardhat Ignition Local Address (Default) |
| :--- | :--- |
| **`AIXToken`** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| **`Treasury`** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| **`DatasetRegistry`** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| **`LicenseRegistry`** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| **`PurchaseEngine`** | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| **`ModelRegistry`** | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` |
| **`ProvenanceRegistry`** | `0x0165878A594ca255338adfa4d48449f69242Eb8F` |
| **`RoyaltyEngine`** | `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853` |


