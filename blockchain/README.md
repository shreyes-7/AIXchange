# AIXchange Blockchain

The **AIXchange Blockchain Module** is responsible for implementing the decentralized core of the AIXchange platform using **Solidity**, **Hardhat**, and **Ethers.js**.

This module manages ownership verification, token transactions, royalty distribution, dataset and AI model registration, licensing, provenance, and other on-chain operations. It serves as the immutable source of truth for all blockchain-backed assets within the AIXchange ecosystem.

---

# Objectives

The blockchain layer provides:

- Native AIX utility token
- Dataset ownership registration
- AI model ownership registration
- Smart contract based licensing
- Automated royalty distribution
- AI provenance tracking
- Marketplace transaction validation
- Treasury management
- Immutable ownership records

---

# Technology Stack

- Solidity
- Hardhat
- Ethers.js
- OpenZeppelin Contracts
- Hardhat Toolbox
- Mocha & Chai
- Solidity Coverage
- dotenv

---

# Project Structure

```text
blockchain/
│
├── contracts/
│   ├── governance/
│   │   └── Treasury.sol
│   ├── interfaces/
│   │   ├── IAIXToken.sol
│   │   ├── IDatasetRegistry.sol
│   │   ├── IMarketplace.sol
│   │   ├── IModelRegistry.sol
│   │   ├── IRoyaltyEngine.sol
│   │   └── ITreasury.sol
│   ├── libraries/
│   │   ├── Errors.sol
│   │   ├── Events.sol
│   │   └── Structs.sol
│   ├── marketplace/
│   │   └── Marketplace.sol
│   ├── registry/
│   │   ├── DatasetRegistry.sol
│   │   └── ModelRegistry.sol
│   ├── royalty/
│   │   └── RoyaltyEngine.sol
│   ├── tokens/
│   │   └── AIXToken.sol
│   └── utils/
│       └── AccessControl.sol
│
├── ignition/
├── scripts/
├── test/
├── hardhat.config.js
├── README.md
├── ARCHITECTURE.md
├── .env.example
└── package.json
```

---

# Smart Contract Architecture

The blockchain consists of several independent smart contracts.

## Token

Responsible for

- AIX token creation
- Token transfers
- Balance management
- Allowances

---

## Dataset Registry

Responsible for

- Dataset ownership
- Dataset metadata hash
- Dataset licensing
- Dataset royalty configuration
- Dataset registration

---

## Model Registry

Responsible for

- AI model ownership
- Model metadata
- Dataset lineage
- Model registration

---

## Marketplace

Responsible for

- Asset purchases
- Ownership transfer
- Payment validation
- Purchase history

---

## Royalty Engine

Responsible for

- Automatic royalty distribution
- Revenue splitting
- Creator rewards
- Treasury allocation

---

## Treasury

Responsible for

- Platform treasury
- Fee collection
- Withdrawals
- Governance-controlled funds

---

# Development Workflow

Development follows a phase-wise approach.

Phase 1

- Project setup
- Hardhat configuration
- Contract architecture
- Shared libraries
- Interfaces
- Base contracts

Phase 2

- Wallet authentication
- MetaMask integration
- Wallet verification

Phase 3

- AIX ERC20 token

Phase 4

- Dataset Registry

Phase 5

- Licensing System

Phase 6

- Marketplace

Phase 7

- Royalty Engine

Phase 8

- Model Registry

Phase 9

- Provenance Engine

---

# Folder Responsibilities

## contracts/

Contains all Solidity smart contracts.

---

## scripts/

Deployment and utility scripts.

---

## test/

Unit tests for smart contracts.

---

## ignition/

Hardhat Ignition deployment modules.

---

# Installation

Clone the repository

```bash
git clone https://github.com/shreyes-7/AIXchange.git
```

Navigate to the blockchain module

```bash
cd blockchain
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file.

Example

```env
PRIVATE_KEY=

SEPOLIA_RPC_URL=

ETHERSCAN_API_KEY=

CHAIN_ID=11155111

TOKEN_NAME=AIX Token

TOKEN_SYMBOL=AIX
```

---

# Available Commands

Install dependencies

```bash
npm install
```

Compile contracts

```bash
npm run compile
```

Run tests

```bash
npm run test
```

Start local blockchain

```bash
npm run node
```

Clean artifacts

```bash
npm run clean
```

Run coverage

```bash
npm run coverage
```

Deploy locally

```bash
npm run deploy:local
```

---

# Development Standards

- Solidity version: 0.8.28
- SPDX license in every contract
- One contract per file
- Reusable interfaces
- Shared structs and events
- Custom errors instead of string-based require messages
- Comprehensive unit tests for every contract
- OpenZeppelin contracts wherever applicable

---

# Blockchain Data Responsibilities

## Stored On-Chain

- Ownership
- Royalty configuration
- Licenses
- Purchase records
- Provenance
- Token balances
- Token transfers
- Treasury transactions

---

## Stored Off-Chain (MongoDB)

- User profiles
- Dataset descriptions
- Reviews
- Ratings
- Analytics
- Search metadata
- Categories
- Tags

---

## Stored on IPFS

- Datasets
- AI models
- Large files
- Metadata files

---

# Testing Strategy

Each contract will have an independent test suite.

```
test/
│
├── governance/
├── marketplace/
├── registry/
├── royalty/
├── tokens/
└── utils/
```

Testing includes

- Deployment
- Ownership
- Access Control
- Events
- Error Handling
- Token Transfers
- Royalty Distribution
- Marketplace Transactions

---

# Future Enhancements

- Multi-signature treasury
- DAO governance
- Upgradeable contracts
- Cross-chain support
- Batch transactions
- Gas optimizations
- Advanced royalty strategies

---

# Contributing

Follow the project coding standards.

- Keep contracts modular.
- Avoid duplicated logic.
- Write unit tests for every feature.
- Update documentation whenever contracts are modified.

---

# License

This project is developed as part of the **AIXchange** research project.

All rights reserved.