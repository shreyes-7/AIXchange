# Architecture Decisions

## Overview

This document records architectural decisions that are explicitly documented or directly evident from patterns implemented in the AIXchange repository.

---

## 1. Off-Chain File Storage with On-Chain Cryptographic Anchoring
- **Decision**: Store actual large dataset files and heavy model checkpoints on IPFS; store only verifiable CIDs and metadata URIs on the Ethereum blockchain.
- **Evidence**: `DatasetRegistry.sol`, `DatasetDetails.jsx`, `blockchain/README.md`.
- **Rationale**: On-chain EVM storage costs are prohibitive for multi-gigabyte AI datasets. Storing cryptographic CIDs preserves immutability and provenance without gas inflation.

---

## 2. Decoupling Asset Ownership from Usage Rights
- **Decision**: Keep dataset ownership residing with the creator in `DatasetRegistry.sol`, while granting purchase-based access entitlements in `PurchaseEngine.sol` referencing terms in `LicenseRegistry.sol`.
- **Evidence**: `LicenseRegistry.sol`, `PurchaseEngine.sol` (`hasAccess` mapping).
- **Rationale**: Prevents dataset ownership transfer upon purchase; multiple buyers can hold distinct commercial or academic licenses simultaneously while the creator retains IP ownership.

---

## 3. Hybrid Web2/Web3 Dual Authentication
- **Decision**: Support both traditional email/password with JWT and passwordless Web3 wallet nonce signature verification.
- **Evidence**: `server/src/routes/auth.routes.js`, `server/src/routes/wallet.route.js`, `server/src/models/user.model.js`.
- **Rationale**: Lowers barrier of entry for non-crypto AI developers while providing native Web3 authorization for wallet transactions.

---

## 4. Background Blockchain Event Indexers over Pure RPC Polling
- **Decision**: Implement persistent background event indexers in Express to cache contract events into MongoDB.
- **Evidence**: `server/src/jobs/purchase-event-indexer.js`, `server/src/jobs/license-event-indexer.js`.
- **Rationale**: Direct blockchain JSON-RPC calls are too slow for real-time catalog filtering, sorting, and pagination. MongoDB provides sub-millisecond query latency.

---

## 5. Decoupling Training Runtime from Standalone Inference Engine (Phase 7)
- **Decision**: Architect the AI inference engine as a standalone runtime that loads exported `.safetensors` artifacts independently from the training process.
- **Evidence**: `python-services/app/inference/engine.py`, `python-services/app/training/pipeline.py`.
- **Rationale**: Training jobs are ephemeral and resource-heavy, whereas inference requires lightweight, persistent, and low-latency execution without training dependencies running.

---

## 6. Safetensors Format & Weights-Only Loading for Safe Deserialization (Phase 7)
- **Decision**: Adopt Hugging Face Safetensors format as the primary model export standard and enforce `weights_only=True` for PyTorch state dicts.
- **Evidence**: `python-services/app/models/exporter.py`, `python-services/app/inference/loader.py`.
- **Rationale**: Eliminates arbitrary code execution vulnerabilities inherent to Python's standard `pickle` deserialization during model loading from untrusted marketplace creators.
