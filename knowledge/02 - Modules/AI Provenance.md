# AI Provenance

## Overview

The **AI Provenance** module is designed to provide immutable traceability and lineage tracking for artificial intelligence datasets, fine-tuned model checkpoints, and derived data assets.

> [!NOTE]
> **Implementation State: Completed (Phase 9)**
> AI Provenance is fully implemented across the smart contract layer (`ProvenanceRegistry.sol`), backend architecture (`provenance.service.js`, `provenance.controller.js`, `provenanceBlockchain.service.js`, `provenance.repository.js`), MongoDB projections, background event indexing (`provenance-event-indexer.js`), and live E2E integration test suites.

---

## Architecture & Implementation

1. **Smart Contract Layer (`ProvenanceRegistry.sol`)**:
   - Deployed at `PROVENANCE_REGISTRY_ADDRESS`.
   - Records immutable lineage relationships linking `datasetId` &rarr; `executionId` &rarr; `modelId` (with `modelVersion`) &rarr; `metadataHash`.
   - Prevents duplicate registrations for the same relationship using a deterministic composite hash key (`keccak256(datasetId, executionId, modelId, modelVersion)`).
   - On-chain verification engine (`verifyProvenance` and `verifyProvenanceHash`) allows trustless verification of training parameters and metadata hashes directly on Ethereum.
   - Auditable status management (`setProvenanceStatus`) allows model owners and registrants to toggle active status or deprecate models.

2. **Backend Engine (`server/src/`)**:
   - **Zero-Custody Transaction Flow**: Prepares client-side transaction calldata (`prepareRegister`, `prepareSetStatus`) so users sign via Web3 wallets.
   - **Receipt Synchronization**: `POST /api/v1/provenance/sync` confirms transactions, decodes on-chain logs, and upserts MongoDB projections.
   - **Composite Event Idempotency**: Identity format `chainId:contractAddress:transactionHash:logIndex` prevents race conditions and duplicates during indexer sync or backfill.
   - **DAG Lineage Graph**: `GET /api/v1/provenance/graph/:modelId` builds complete lineage graphs with nodes (`dataset`, `execution`, `model`, `model_version`) and edges (`USED_IN`, `PRODUCED`, `HAS_VERSION`), preserving multi-dataset links.
   - **Chronological Audit Timeline**: `GET /api/v1/provenance/timeline/:modelId` aggregates on-chain events and Phase 7 Sandbox execution milestones sorted deterministically.
   - **Cryptographic Verification**: `POST /api/v1/provenance/:id/verify` queries `ProvenanceRegistry.sol` directly, never returning `verified_on_chain: true` from MongoDB presence alone.

3. **Background Indexer (`jobs/provenance-event-indexer.js`)**:
   - Periodically polls blockchain logs every 15s.
   - Checkpoints synchronization state via `indexer-state.repository.js`.
   - Performs historical event backfill from `BLOCKCHAIN_START_BLOCK`.
   - Swallows transient RPC connection drops to prevent server termination.
