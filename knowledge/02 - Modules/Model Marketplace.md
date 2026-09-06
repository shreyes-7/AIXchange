# Model Marketplace

## Overview

The **Model Marketplace** is a planned decentralized exchange module for browsing, licensing, and trading trained artificial intelligence and machine learning models.

> [!NOTE]
> **Implementation State: Completed (Phase 8)**
> The Model Marketplace & Registry is fully implemented across the smart contract layer (`ModelRegistry.sol`), backend architecture (`model.service.js`, `model.controller.js`, `modelBlockchain.service.js`, `model.repository.js`), MongoDB collections, background event indexing (`model-event-indexer.js`), AI execution inference proxying, and live integration test suites.

---

## Architecture & Implementation

1. **Smart Contract Layer (`ModelRegistry.sol`)**:
   - Deployed at `MODEL_REGISTRY_ADDRESS`.
   - Supports model registration (`registerModel`), immutable append-only version history (`addModelVersion`), status management (`setModelStatus`), and ownership transfer (`transferModelOwnership`).
   - Cryptographic SHA-256 weight hash anchoring (`verifyModelHash`) prevents tampered models.
   - Enforces unique model names per owner address.

2. **Backend Engine (`server/src/`)**:
   - **Zero-Custody Transaction Flow**: Prepares client-side transaction calldata (`prepareRegister`, `prepareAddVersion`, `prepareSetStatus`, `prepareTransferOwnership`).
   - **Receipt Synchronization**: `POST /api/v1/models/sync` verifies and synchronizes broadcasted model transactions.
   - **Model Catalog Queries**: `GET /api/v1/models` supports search, tag filters, sorting, and pagination.
   - **AI Execution Integration**: `POST /api/v1/models/:id/infer` validates user access, validates containment of local model artifacts, and proxies inference requests to the Phase 7 AI execution substrate (`python-services`).

3. **Background Indexer (`jobs/model-event-indexer.js`)**:
   - Periodically polls `ModelRegistry` event logs every 15s.
   - Checkpoints progress via `indexer-state.repository.js`.
   - Enforces idempotency on replayed events.
