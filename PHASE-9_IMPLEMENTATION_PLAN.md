# Phase 9 — Provenance Engine Backend Implementation Plan (Revised)

## Executive Summary
This implementation plan incorporates the user's revised directives for **Phase 9 — Provenance Engine Backend**:
1. **Strictly Externalized Configuration**: No hardcoded addresses for `ProvenanceRegistry`; obtain from environment/deployment configuration.
2. **Deterministic Event Identity**: Composite identity `chainId + contractAddress + transactionHash + logIndex`.
3. **Unambiguous Identifiers**: Strictly separate MongoDB `_id` from on-chain `provenanceId` (`findByProvenanceId` vs `findByMongoId`).
4. **Zero Custody Client Signing Flow**: Backend never handles private keys. Two-phase flow: (1) backend prepares calldata -> (2) client signs with their Web3 wallet -> (3) backend verifies on-chain receipt and decodes emitted event.
5. **Exact Timestamp Handling**: Explicit conversion of on-chain `uint256 createdAt` (seconds) to `Date` while preserving canonical numeric value.
6. **No Historical Fabrication & Optional Enrichment**: Inspect actual Phase 7 execution data before timeline enrichment; keep Dataset/Model/Execution enrichment optional so core provenance queries remain reliable.
7. **Single Source of Truth ABI**: Use the compiled `ProvenanceRegistry.json` artifact directly.
8. **Resilient Indexing with Backfill**: Support historical event backfill from configurable start block; ensure RPC/indexer failures do not block HTTP server startup.
9. **Exhaustive Testing**: Test duplicate events, restart/checkpoint recovery, status changes, missing projections, blockchain-vs-MongoDB verification, and end-to-end flow.

---

## Implementation Stages

### Stage 1: Environment & Configuration
- Ensure `server/src/config/env.js` and `server/src/config/blockchain.js` cleanly read `PROVENANCE_REGISTRY_ADDRESS` from environment configuration without hardcoded fallback addresses in production logic.
- Support `BLOCKCHAIN_START_BLOCK` for historical backfill.

### Stage 2: MongoDB Projection Model & Repository
- `server/src/models/provenance.model.js`:
  - `provenanceId`: Number, unique, sparse: true, index: true (on-chain assigned ID)
  - `datasetId`: Number, required, index: true
  - `modelId`: Number, required, index: true
  - `modelVersion`: Number, required, min: 1, index: true
  - `executionId`: String, required, trim: true, index: true
  - `metadataHash`: String, required, trim: true, lowercase: true (`0x` + 64 hex characters)
  - `registrant`: String, required, trim: true, lowercase: true, index: true
  - `createdAt`: Date, required
  - `createdAtTimestamp`: Number, required (canonical on-chain seconds)
  - `active`: Boolean, default: true, index: true
  - `blockchain`:
    - `chainId`: Number, required
    - `contractAddress`: String, required, lowercase: true
    - `transactionHash`: String, lowercase: true
    - `blockNumber`: Number
    - `transactionIndex`: Number
    - `logIndex`: Number
    - `eventIdentity`: String, unique, sparse: true (composite: `chainId:contractAddress:transactionHash:logIndex`)
    - `state`: String, enum: `["PREPARED", "PENDING", "CONFIRMED", "FAILED"]`, default: `CONFIRMED`
  - `indexedAt`: Date, default: Date.now
  - Indexes:
    - Compound unique on canonical relationship: `{ datasetId: 1, executionId: 1, modelId: 1, modelVersion: 1 }`
    - Compound index on `{ modelId: 1, modelVersion: 1 }`
    - Compound unique on event identity: `{ "blockchain.eventIdentity": 1 }` (sparse)
    - Query indexes: `{ modelId: 1, createdAt: -1 }`, `{ datasetId: 1, createdAt: -1 }`, `{ executionId: 1 }`, `{ registrant: 1 }`, `{ active: 1 }`
- `server/src/repositories/provenance.repository.js`:
  - `findByProvenanceId(provenanceId)` (searches solely by `provenanceId`)
  - `findByMongoId(id)` (searches solely by MongoDB `_id`)
  - `findByKey(datasetId, executionId, modelId, modelVersion)`
  - `findByDataset`, `findByExecution`, `findByModel`, `findByModelVersion` with safe pagination
  - `createOrUpsertProjection(data)`
  - `updateStatus(provenanceId, active, extra)`
  - `existsByEventIdentity(eventIdentity)`

### Stage 3: Blockchain Integration Service
- `server/src/services/provenanceBlockchain.service.js`:
  - Loads ABI directly from `blockchain/artifacts/contracts/registry/ProvenanceRegistry.sol/ProvenanceRegistry.json`.
  - Config resolution: reads `env.PROVENANCE_REGISTRY_ADDRESS` (throws clear error if unconfigured).
  - Methods:
    - `getProvenance(provenanceId)`
    - `getTotalProvenanceRecords()`
    - `getProvenanceByModel(modelId)`
    - `getProvenanceByModelVersion(modelId, version)`
    - `getProvenanceByDataset(datasetId)`
    - `getProvenanceByExecution(executionId)`
    - `getProvenanceIdByKey(datasetId, executionId, modelId, version)`
    - `verifyProvenance(provenanceId, datasetId, executionId, modelId, version, metadataHash)`
    - `verifyProvenanceHash(provenanceId, metadataHash)`
    - `isProvenanceActive(provenanceId)`
    - `prepareRegister(datasetId, modelId, modelVersion, executionId, metadataHash, wallet)`
    - `prepareSetStatus(provenanceId, active, wallet)`
    - `confirmTransaction(txHash, expected, wallet)`

### Stage 4: Background Event Indexer & Backfill
- `server/src/jobs/provenance-event-indexer.js`:
  - Starts safely without throwing uncaught exceptions that crash the server if RPC or contract is temporarily unavailable.
  - Checks `IndexerState` for `lastIndexedBlock`; if unset, initializes from `env.BLOCKCHAIN_START_BLOCK`.
  - Backfills historical blocks up to current safe head (`head - confirmations`).
  - Constructs event identity: `${chainId}:${contractAddress}:${transactionHash}:${logIndex}`.
  - Idempotently processes `ProvenanceRegistered` and `ProvenanceStatusChanged`.
  - Registered in `server/src/server.js` startup and graceful shutdown.

### Stage 5: Domain Service, Graph, Timeline & Verification
- `server/src/services/provenance.service.js`:
  - `create`: prepares calldata for client-signed registration transaction.
  - `sync`: confirms broadcast transaction receipt, decodes event, upserts MongoDB projection.
  - `getByProvenanceId`: queries by numeric `provenanceId` with optional enrichment.
  - `getByDataset`, `getByExecution`, `getByModel`, `getByModelVersion`: lineage queries with pagination.
  - `getGraph`: DAG nodes (`dataset`, `execution`, `model`, `model_version`) and edges (`USED_IN`, `PRODUCED`, `HAS_VERSION`), multi-dataset preservation, optional enrichment.
  - `getTimeline`: chronological timeline ordered by blockNumber -> txIndex -> logIndex -> timestamp, distinguishing event sources (`blockchain_provenance`, `execution`, `status_change`).
  - `verify`: calls `ProvenanceRegistry.verifyProvenance` on-chain, distinguishing `indexed` from `verified_on_chain`.
  - `verifyHash`: calls `ProvenanceRegistry.verifyProvenanceHash`.
  - `setStatus`: prepares calldata for status change transaction.

### Stage 6: Validation, Controllers & Routes
- `server/src/validators/provenance.validator.js`: Joi schemas for parameters, queries, and bodies.
- `server/src/controllers/provenance.controller.js`: Thin HTTP controller.
- `server/src/routes/provenance.route.js`: Express router with OpenAPI 3.0 / Swagger documentation and rate limiting.
- Mount route in `server/src/routes/index.js`.

### Stage 7: Exhaustive Testing
- `server/tests/provenance.phase9.test.js`: Unit tests for schema, validation, ABI matching, event identity deduplication.
- `server/tests/provenance.api.test.js`: API tests covering all endpoints, pagination, graph, timeline, and error responses.
- `server/tests/provenance.e2e.test.js`: End-to-end flow with live/mocked blockchain, indexer processing, MongoDB projection, graph, timeline, verification, and tamper detection.

### Stage 8: Documentation & Knowledge Base Updates
- Update `README.md` and `server/README.md`.
- Update Obsidian knowledge base under `knowledge/04 - Backend/` and `knowledge/01 - Architecture/`.
