# Project Overview

## What is AIXchange?

**AIXchange** is a decentralized, blockchain-powered marketplace designed for the discovery, trading, licensing, and access management of AI datasets and machine learning models.

The system addresses the trust, ownership, and monetization deficits of traditional AI data sharing by coupling decentralized file storage (IPFS/Pinata) with immutable on-chain ownership, smart-contract-based licensing enforcement, automated payment routing, and cryptographic access validation.

```
┌─────────────────────────────────────────────────────────────┐
│                       AIXchange Platform                    │
├──────────────────────────────┬──────────────────────────────┤
│         Frontend Client      │        Backend Server        │
│    (React 19 + Tailwind CSS) │   (Express 5 + MongoDB)      │
├──────────────────────────────┼──────────────────────────────┤
│       Smart Contracts        │      Decentralized Storage   │
│ (Solidity 0.8.28 + Hardhat)  │         (IPFS / Pinata)      │
└──────────────────────────────┴──────────────────────────────┘
```

---

## Core Problem Statement & Solutions

1. **Verifiable Data Ownership**:
   - *Problem*: Traditional data marketplaces lack transparent, tamper-proof proof of authorship and ownership.
   - *Solution*: [[Dataset Marketplace|DatasetRegistry.sol]] records each dataset's creator, metadata URI, and immutable IPFS Content Identifier (CID) on the Ethereum blockchain.

2. **Decoupling Data Ownership from Usage Rights**:
   - *Problem*: Purchasing a dataset often conflates transfer of ownership with permissioned usage.
   - *Solution*: [[Licensing System|LicenseRegistry.sol]] establishes modular, granular licenses (`ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`) with explicit permission flags (`canTrain`, `canInfer`, `canCommercialUse`, etc.) and validity windows without transferring underlying asset ownership.

3. **Trustless & Atomic Purchase Settlement**:
   - *Problem*: Intermediaries charge high fees and creator payments are delayed.
   - *Solution*: [[Purchase Engine|PurchaseEngine.sol]] atomically settles purchases using native ERC-20 [[Token Economy|AIXToken]], automatically deducting platform fees to [[Token Economy|Treasury]] and transferring creator revenues directly in one transaction.

4. **Web3 Authentication with Web2 Fallback**:
   - *Problem*: Friction in onboarding both crypto-native users and traditional developers.
   - *Solution*: Dual authentication in [[Authentication|Backend Auth]] supporting standard JWT email/password and cryptographic MetaMask EIP-191 signature nonce verification.

---

## High-Level System Boundaries

- **Client (`client/`)**: Web application providing the user interface for browsing datasets, viewing on-chain provenance, registering datasets with MetaMask, and inspecting wallet credentials.
- **Server (`server/`)**: Express REST API providing off-chain indexing, metadata caching, search, authentication, and blockchain event synchronizers.
- **Blockchain (`blockchain/`)**: Hardhat-managed Solidity smart contract suite providing authoritative state for tokens, treasury, dataset ownership, licenses, and purchase settlements.
- **Python AI Services (`python-services/`)**: Scaffolding for machine learning inference and dataset evaluation workflows.
- **Decentralized Storage (IPFS)**: Off-chain storage for dataset files and large metadata payloads; only cryptographic CIDs are stored on-chain.

---

## Key Repository References

- Root Configuration: `package.json`, `.env.example`, `docker-compose.yml`
- Blockchain Suite: `blockchain/contracts/`, `blockchain/test/`, `blockchain/ignition/`
- Backend API: `server/src/`
- Frontend Client: `client/src/`
- Documentation: `README.md`, `blockchain/README.md`
