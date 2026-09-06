# AIXchange — Phase 9 Backend Requirements
## Provenance Engine — Backend / API / Indexing Implementation

**Document:** PHASE-9_BACKEND_REQUIREMENTS.md  
**Phase:** 9 — Provenance Engine  
**Backend Owner:** Prabhu Pachisia  
**Blockchain Owner:** Shreyes Jaiswal  
**Frontend:** Out of scope for this phase  
**Status:** Backend implementation specification  
**Primary backend responsibility:** MongoDB projection, provenance indexing, graph/timeline APIs, verification APIs, synchronization, validation, and documentation.

---

# 1. Purpose

This document defines the backend requirements for completing **Phase 9 — Provenance Engine** of the AIXchange Project.

The blockchain portion of Phase 9 has already been implemented, tested, deployed, and handed off.

The backend implementation must therefore **consume and expose the existing on-chain ProvenanceRegistry functionality** rather than redesigning or duplicating it.

The backend must provide a usable application/API layer that allows clients and future frontend components to:

- discover provenance records;
- reconstruct dataset → execution → model lineage;
- retrieve provenance timelines;
- query provenance by dataset, execution, model, or model version;
- verify provenance against blockchain state;
- index blockchain provenance events into MongoDB;
- recover from missed events/RPC failures;
- expose a stable API for future frontend and analytics phases.

---

# 2. CRITICAL IMPLEMENTATION RULE

## DO NOT REIMPLEMENT BLOCKCHAIN PROVENANCE

The existing blockchain implementation is the canonical source of truth for immutable provenance.

The backend must NOT create its own competing provenance authority.

The backend is a:

```text
Blockchain
    ↓
Canonical ProvenanceRegistry
    ↓
Event Listener / Indexer
    ↓
MongoDB Projection
    ↓
Service Layer
    ↓
REST APIs
    ↓
Frontend / Other Consumers
```

MongoDB is an indexed/read-optimized projection.

The blockchain remains authoritative for:

- provenance existence;
- provenance IDs;
- dataset/model relationships;
- execution identifier;
- metadata hash;
- registration timestamp;
- active/revoked state;
- provenance events;
- verification of the immutable on-chain record.

---

# 3. READ FIRST — EXISTING IMPLEMENTATION AUDIT

Before modifying any code, inspect the entire existing backend architecture and the completed blockchain implementation.

Do not assume the repository structure.

Inspect:

```text
server/
blockchain/
knowledge/
README.md
```

Specifically inspect:

## 3.1 Existing Backend Architecture

Understand:

- Express app setup;
- route registration;
- controllers;
- services;
- repositories;
- models;
- validators;
- middleware;
- authentication;
- authorization;
- blockchain services;
- event indexers/jobs;
- error handling;
- logging;
- Swagger/OpenAPI;
- configuration/environment handling;
- tests.

Follow the project's existing conventions.

Do not introduce a parallel architecture.

---

# 4. PHASE 9 BLOCKCHAIN IMPLEMENTATION — CANONICAL REFERENCE

The completed blockchain implementation provides:

```text
IProvenanceRegistry.sol
ProvenanceRegistry.sol
```

The contract establishes immutable relationships between:

```text
Dataset
    ↓
Execution / Training
    ↓
Model
    ↓
Model Version
```

The current provenance record is:

```solidity
struct ProvenanceRecord {
    uint256 provenanceId;
    uint256 datasetId;
    uint256 modelId;
    uint256 modelVersion;
    string executionId;
    bytes32 metadataHash;
    address registrant;
    uint256 createdAt;
    bool active;
}
```

The backend must treat this structure as authoritative.

---

# 5. EXISTING PHASES THAT MUST BE REUSED

Phase 9 backend is an integration/projection/API phase.

Do not rebuild functionality that already exists.

## 5.1 Phase 4 — DatasetRegistry

The blockchain already has the canonical dataset registry.

Backend provenance must reference:

```text
datasetId
```

Do not create a second dataset registry.

When useful, the backend may enrich provenance responses with existing dataset information from its current dataset data source.

However:

> The backend must never silently change the dataset identity referenced by the blockchain provenance record.

---

# 6. Phase 6 — PurchaseEngine

PurchaseEngine remains responsible for:

- purchases;
- payment settlement;
- entitlements;
- commercial access.

Phase 9 backend must not duplicate purchase/entitlement functionality.

If a future endpoint needs access checks, reuse the existing backend access-control/service conventions.

---

# 7. Phase 7 — AI Execution Substrate

Phase 7 already provides execution/training information.

Existing execution-related information may include:

- sandbox ID;
- execution ID;
- dataset ID;
- training status;
- metrics;
- artifacts;
- model metadata;
- SHA-256 metadata hash;
- execution timestamps;
- execution events.

The backend must use the existing execution infrastructure where available.

Do not create a second execution table/system.

The Phase 9 provenance index should link:

```text
executionId
```

to existing execution records when they are available.

---

# 8. Phase 8 — ModelRegistry

Phase 8 provides canonical model identity/version information on-chain.

The backend must use:

```text
modelId
modelVersion
modelHash
model metadata
```

according to the existing backend/model architecture.

Do not create a second model registry.

---

# 9. Phase 9 BLOCKCHAIN CONTRACT INTERFACE

The backend must integrate with the deployed `ProvenanceRegistry`.

The exact address must come from environment/configuration or deployment configuration.

For the current local deployment reported by the blockchain implementation:

```text
Network: Hardhat local node
Chain ID: 31337
RPC: http://127.0.0.1:8545

DatasetRegistry:
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

ModelRegistry:
0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

ProvenanceRegistry:
0x0165878A594ca255338adfa4d48449f69242Eb8F
```

These are local-development values only.

Do NOT hardcode them into application logic.

---

# 10. ABI INTEGRATION

Use the generated ABI from the blockchain implementation.

Current ABI artifact:

```text
blockchain/artifacts/contracts/registry/ProvenanceRegistry.sol/ProvenanceRegistry.json
```

The backend should load the ABI using the project's existing blockchain integration pattern.

Do not duplicate ABI definitions manually unless the current backend architecture already follows that pattern.

---

# 11. REQUIRED CONTRACT METHODS

The backend integration must support the existing ProvenanceRegistry methods.

## Write

```text
registerProvenance(
    datasetId,
    modelId,
    modelVersion,
    executionId,
    metadataHash
)
```

## Read / Lookup

```text
getProvenance(provenanceId)

getProvenanceByModel(modelId)

getProvenanceByModelVersion(modelId, modelVersion)

getProvenanceByDataset(datasetId)

getProvenanceByExecution(executionId)
```

## Verification

```text
verifyProvenance(
    provenanceId,
    expectedDatasetId,
    expectedExecutionId,
    expectedModelId,
    expectedModelVersion,
    expectedMetadataHash
)

verifyProvenanceHash(
    provenanceId,
    expectedMetadataHash
)
```

## Status

If the contract exposes provenance status management:

```text
setProvenanceStatus(provenanceId, active)
```

The backend must follow the actual ABI rather than inventing methods.

---

# 12. CANONICAL BLOCKCHAIN EVENTS

The backend must index the existing provenance events.

## ProvenanceRegistered

The existing event is:

```solidity
event ProvenanceRegistered(
    uint256 indexed provenanceId,
    uint256 indexed datasetId,
    uint256 indexed modelId,
    uint256 modelVersion,
    string executionId,
    bytes32 metadataHash,
    address indexed registrant,
    uint256 timestamp
);
```

The backend indexer must capture all relevant fields.

## ProvenanceStatusChanged

The existing event is:

```solidity
event ProvenanceStatusChanged(
    uint256 indexed provenanceId,
    bool active,
    address indexed updatedBy,
    uint256 timestamp
);
```

The backend must update the MongoDB projection when status changes.

---

# 13. MONGODB PROVENANCE MODEL

Create or extend the backend provenance model following existing project conventions.

Suggested conceptual schema:

```text
Provenance
├── provenanceId
├── datasetId
├── modelId
├── modelVersion
├── executionId
├── metadataHash
├── registrant
├── createdAt
├── active
├── blockchain
│   ├── chainId
│   ├── contractAddress
│   ├── registrationTxHash
│   ├── registrationBlockNumber
│   └── registrationLogIndex
├── status
├── indexedAt
└── timestamps
```

Do not blindly copy this structure.

First inspect existing MongoDB conventions.

The following blockchain fields are especially important for auditability:

```text
provenanceId
datasetId
modelId
modelVersion
executionId
metadataHash
registrant
createdAt
active
transaction hash
block number
log index
chain ID
contract address
```

---

# 14. MONGODB INDEXES

Add indexes appropriate for the required query patterns.

At minimum consider:

```text
provenanceId
datasetId
modelId
(modelId, modelVersion)
executionId
registrant
active
createdAt
```

Also enforce uniqueness where appropriate.

The backend must prevent duplicate MongoDB projections for the same blockchain provenance event.

Use an idempotency key based on blockchain identity, such as:

```text
chainId + contractAddress + transactionHash + logIndex
```

or another repository-consistent event identity.

---

# 15. BLOCKCHAIN INDEXER

Implement an event indexer following the existing backend job/indexer architecture.

The indexer must consume:

```text
ProvenanceRegistered
ProvenanceStatusChanged
```

The indexer must:

1. connect to the configured RPC;
2. load the ProvenanceRegistry ABI;
3. listen for events;
4. decode events;
5. validate event data;
6. upsert MongoDB projections;
7. record blockchain metadata;
8. handle duplicate delivery;
9. log failures;
10. support restart/recovery.

---

# 16. IDEMPOTENCY

Blockchain events can be delivered more than once.

The indexer must be idempotent.

Processing the same event repeatedly must not create duplicate provenance records.

Use a deterministic event identity.

Example:

```text
chainId
+
contractAddress
+
transactionHash
+
logIndex
```

Do not rely only on `provenanceId` if that would make cross-network data ambiguous.

---

# 17. MISSED EVENTS / RECOVERY

The indexer must not depend solely on a live event listener.

It should support recovery after:

- backend restart;
- RPC disconnect;
- temporary node failure;
- process crash;
- network interruption.

Use the project's existing indexing/checkpoint pattern if one exists.

If the project does not yet have a generic indexer framework, implement the smallest Phase 9-specific mechanism consistent with the architecture.

The indexer should track a synchronization checkpoint such as:

```text
lastProcessedBlock
```

and replay from the appropriate block after restart.

Do not silently lose provenance events.

---

# 18. REORG / FINALITY CONSIDERATIONS

Follow the project's existing blockchain indexing assumptions.

At minimum:

- store block number;
- store transaction hash;
- store log index;
- avoid treating MongoDB as more authoritative than the chain;
- re-check critical records from the contract when performing verification.

If the current local deployment does not require production-grade chain reorganization handling, document the limitation rather than pretending it is solved.

---

# 19. BACKEND PROVENANCE SERVICE

Create or extend:

```text
provenance.service.js
```

according to existing service conventions.

The service should provide:

- create/register provenance;
- retrieve provenance;
- query provenance by dataset;
- query provenance by execution;
- query provenance by model;
- query provenance by model version;
- verify provenance;
- verify provenance hash;
- update/retrieve active status where supported;
- synchronize/read canonical blockchain state.

The service must coordinate:

```text
Controller
   ↓
Service
   ├── MongoDB repository
   └── Blockchain service
```

Do not put blockchain calls directly inside controllers.

---

# 20. BLOCKCHAIN SERVICE

If the existing architecture has a dedicated blockchain service layer, add the ProvenanceRegistry integration there.

Responsibilities:

- provider initialization;
- contract initialization;
- ABI loading;
- reads;
- writes;
- transaction submission;
- receipt handling;
- event decoding if applicable;
- verification;
- error normalization.

Do not create a second provider configuration system.

---

# 21. REPOSITORY

Create or extend:

```text
provenance.repository.js
```

following existing repository conventions.

Repository responsibilities:

- create projection;
- find by provenance ID;
- find by dataset;
- find by execution;
- find by model;
- find by model/version;
- update status;
- find indexed events;
- checkpoint management if repository architecture uses MongoDB checkpoints.

The repository must not make blockchain calls.

---

# 22. CONTROLLERS

Create:

```text
provenance.controller.js
```

following existing controller patterns.

Controllers should:

- validate input;
- call service;
- map result to API response;
- map errors to existing error middleware.

Controllers must not contain business logic or direct MongoDB calls.

---

# 23. ROUTES

Create:

```text
provenance.route.js
```

and register it using the existing route index.

Do not introduce a new routing convention.

---

# 24. REQUIRED API SURFACE

The backend must expose APIs covering the following use cases.

Exact paths should follow existing project conventions.

## 24.1 Get provenance by ID

Concept:

```http
GET /provenance/:provenanceId
```

Response should include:

```text
provenanceId
datasetId
modelId
modelVersion
executionId
metadataHash
registrant
createdAt
active
blockchain metadata
```

---

# 25. Dataset Lineage API

Concept:

```http
GET /provenance/dataset/:datasetId
```

Return provenance records showing all training/execution relationships involving the dataset.

Support:

- pagination;
- sorting;
- active filtering where useful.

---

# 26. Execution Lineage API

Concept:

```http
GET /provenance/execution/:executionId
```

Return all provenance relationships associated with the execution.

This must support the multi-dataset case.

For example:

```text
Execution A
├── Dataset 1
├── Dataset 2
└── Model 5 v1
```

---

# 27. Model Lineage API

Concept:

```http
GET /provenance/model/:modelId
```

Return all provenance relationships for the model across versions.

---

# 28. Model Version Lineage API

Concept:

```http
GET /provenance/model/:modelId/version/:version
```

Return provenance records associated with that model version.

---

# 29. Provenance Graph API

The backend must provide a graph-oriented representation suitable for future frontend visualization.

Concept:

```http
GET /provenance/graph/:modelId
```

The exact route may follow the existing API conventions.

The graph should represent nodes such as:

```text
Dataset
Execution
Model
ModelVersion
```

and edges such as:

```text
Dataset --USED_IN--> Execution
Execution --PRODUCED--> ModelVersion
Model --HAS_VERSION--> ModelVersion
```

Do not store redundant graph edges as the canonical source of truth.

Generate the graph from indexed provenance relationships.

---

# 30. Graph Response

A useful conceptual response:

```json
{
  "nodes": [
    {
      "id": "dataset:1",
      "type": "dataset",
      "entityId": "1"
    },
    {
      "id": "execution:exec-123",
      "type": "execution",
      "entityId": "exec-123"
    },
    {
      "id": "model:1:v1",
      "type": "model_version",
      "entityId": "1:1"
    }
  ],
  "edges": [
    {
      "source": "dataset:1",
      "target": "execution:exec-123",
      "type": "USED_IN"
    },
    {
      "source": "execution:exec-123",
      "target": "model:1:v1",
      "type": "PRODUCED"
    }
  ]
}
```

Adapt the exact response to existing API conventions.

---

# 31. Timeline API

Provide a chronological provenance timeline.

Concept:

```http
GET /provenance/timeline/:modelId
```

Timeline entries may include:

```text
timestamp
event type
dataset
execution
model
model version
metadata hash
registrant
block number
transaction hash
active status
```

Sort deterministically.

Prefer blockchain block/transaction/log ordering when available rather than relying only on MongoDB timestamps.

---

# 32. Verification API

Expose backend verification.

Concept:

```http
GET /provenance/:provenanceId/verify
```

or an equivalent POST endpoint if expected hashes/parameters are supplied.

The verification API must ultimately rely on the blockchain contract for canonical verification.

Possible result:

```json
{
  "provenanceId": 1,
  "verified": true,
  "datasetId": 1,
  "executionId": "exec-test-12345",
  "modelId": 1,
  "modelVersion": 1,
  "metadataHash": "0x...",
  "source": "blockchain"
}
```

Do not return `verified: true` solely because MongoDB contains the record.

---

# 33. Verification Rules

The backend verification layer must distinguish:

### Indexed projection check

```text
MongoDB record exists
```

from:

### Canonical blockchain verification

```text
ProvenanceRegistry verification succeeds
```

The second is authoritative.

When verification is requested:

1. locate the provenance record;
2. obtain expected values;
3. query/verify against ProvenanceRegistry;
4. compare important values;
5. return verification status;
6. clearly indicate source.

---

# 34. Hash Verification

Support verification of the Phase 7 model metadata hash.

The backend must accept/validate hashes using the project's existing validation conventions.

Normalize representation consistently.

Do not silently convert an invalid hash to another value.

Support:

```text
0x + 64 hex characters
```

where the contract expects `bytes32`.

Use the actual contract requirements as canonical.

---

# 35. Registration API

If backend registration is required by the application architecture, expose a registration endpoint.

Concept:

```http
POST /provenance
```

Request:

```json
{
  "datasetId": 1,
  "modelId": 1,
  "modelVersion": 1,
  "executionId": "exec-test-12345",
  "metadataHash": "0x..."
}
```

The backend must:

1. authenticate the caller;
2. validate the request;
3. verify relevant application-level permissions;
4. verify referenced entities where appropriate;
5. submit the blockchain transaction;
6. wait for the required transaction state;
7. extract provenance ID/event information;
8. persist/index the resulting record;
9. return the canonical provenance identity.

The backend must NOT mark registration successful before the blockchain transaction has reached the required confirmation state.

---

# 36. Blockchain Transaction Handling

Follow existing project conventions.

Handle:

- pending;
- confirmed;
- reverted;
- RPC failure;
- insufficient funds;
- authorization failure;
- invalid entity references;
- duplicate provenance;
- timeout.

Do not swallow transaction errors.

Return stable API-level errors consistent with the existing backend error system.

---

# 37. Authentication & Authorization

Use the existing Phase 2 authentication/RBAC architecture.

For registration:

```text
Authenticated wallet
        ↓
Backend authorization
        ↓
Blockchain authorization
        ↓
Transaction
```

The backend must not assume that application-level authorization replaces contract-level authorization.

The contract remains the final authority.

For model provenance registration, respect the existing contract rule that the registrant must be the current model owner.

---

# 38. Ownership Transfer Consideration

Phase 8 ModelRegistry supports model ownership transfer.

The backend must not assume that the original provenance registrant remains the model owner forever.

For provenance reads:

- historical registrant remains unchanged;
- model ownership may change;
- provenance remains historical;
- current ownership should be resolved from ModelRegistry when necessary.

For status operations, respect the current contract authorization behavior.

---

# 39. Revocation / Status

The blockchain supports provenance status changes.

The backend should expose the status accurately.

Do not delete revoked provenance records from MongoDB.

A revoked record is historical evidence.

API responses should make the state explicit:

```text
active: true
```

or:

```text
active: false
```

Verification should fail for inactive provenance according to the contract's behavior.

---

# 40. Pagination

All list endpoints must support pagination according to existing backend conventions.

At minimum:

```text
page
limit
```

or the project's existing cursor-based mechanism.

Avoid returning unbounded provenance arrays.

---

# 41. Filtering

Where useful, support:

```text
datasetId
modelId
modelVersion
executionId
registrant
active
```

Do not introduce unnecessary search complexity.

---

# 42. Sorting

Default provenance ordering should be deterministic.

Preferred:

```text
createdAt DESC
```

For blockchain audit/timeline views, prefer:

```text
blockNumber ASC/DESC
transactionIndex
logIndex
```

when those fields are available.

---

# 43. Validation

Create:

```text
provenance.validator.js
```

or follow the existing validation architecture.

Validate:

- numeric IDs;
- version;
- executionId;
- metadataHash;
- pagination;
- filters.

Execution ID must follow the actual Phase 7 constraints.

Do not invent a restrictive regex that rejects valid existing execution IDs.

---

# 44. Error Handling

Use existing backend error conventions.

Map common blockchain errors into meaningful API errors.

Examples:

```text
PROVENANCE_NOT_FOUND
PROVENANCE_ALREADY_EXISTS
DATASET_NOT_FOUND
MODEL_NOT_FOUND
MODEL_VERSION_NOT_FOUND
INVALID_EXECUTION_ID
INVALID_METADATA_HASH
UNAUTHORIZED
PROVENANCE_INACTIVE
BLOCKCHAIN_UNAVAILABLE
TRANSACTION_REVERTED
INDEX_NOT_SYNCED
```

Do not expose raw provider internals unnecessarily.

---

# 45. Consistency Between MongoDB and Blockchain

MongoDB may temporarily lag behind the blockchain.

The backend should expose this clearly where relevant.

For example:

```text
indexed
pending_index
verified_on_chain
```

Do not pretend the projection is synchronized if the indexer has not processed the relevant block.

---

# 46. Indexer Synchronization State

Track enough state to answer:

```text
What is the last block indexed?
Is the indexer healthy?
Is the provenance registry synchronized?
```

If the existing backend already has a generic blockchain sync state model, reuse it.

Otherwise create a minimal Phase 9 synchronization record.

Potential fields:

```text
contractAddress
chainId
lastProcessedBlock
lastSuccessfulRun
status
error
updatedAt
```

---

# 47. API Documentation

Add Swagger/OpenAPI documentation for all Phase 9 endpoints.

Document:

- parameters;
- request bodies;
- responses;
- errors;
- authentication;
- verification semantics.

Do not document endpoints that do not actually exist.

---

# 48. Logging

Use the existing logger.

Log important events:

- indexer start/stop;
- block synchronization;
- event received;
- provenance indexed;
- duplicate event ignored;
- synchronization failure;
- RPC failure;
- transaction submitted;
- transaction confirmed;
- transaction reverted;
- verification request/result.

Do not log private keys or sensitive credentials.

---

# 49. Caching

Caching is optional.

If implemented:

- never cache canonical verification indefinitely;
- invalidate appropriately;
- do not let stale cache override blockchain state.

Correctness takes priority over performance.

---

# 50. Security Requirements

The backend must:

- validate all user input;
- authenticate write operations;
- enforce authorization;
- avoid arbitrary blockchain method execution;
- avoid accepting arbitrary contract addresses from API callers;
- use configured contract addresses;
- protect RPC credentials/private keys;
- avoid logging secrets;
- prevent injection into MongoDB queries;
- prevent unbounded query sizes;
- validate IDs and hashes;
- prevent duplicate registration requests where possible.

---

# 51. Concurrency / Duplicate Registration

Two requests may attempt the same provenance relationship.

Handle this safely.

At minimum:

```text
Request A ──┐
            ├── Blockchain
Request B ──┘
```

Only one should become the canonical relationship.

The blockchain's duplicate protection is authoritative.

The backend should handle the resulting duplicate error cleanly.

---

# 52. Test Requirements

Create comprehensive backend tests.

Follow the existing Phase 1–8 test framework and conventions.

## 52.1 Repository tests

Test:

- create;
- find by ID;
- find by dataset;
- find by execution;
- find by model;
- find by model/version;
- update status;
- event idempotency.

---

# 53. Service Tests

Test:

- valid registration;
- invalid dataset;
- invalid model;
- invalid model version;
- invalid hash;
- duplicate provenance;
- unauthorized user;
- blockchain failure;
- verification success;
- verification failure;
- inactive provenance;
- MongoDB/blockchain mismatch handling.

---

# 54. API Tests

Test:

```text
GET /provenance/:id
GET /provenance/dataset/:datasetId
GET /provenance/execution/:executionId
GET /provenance/model/:modelId
GET /provenance/model/:modelId/version/:version
GET /provenance/graph/:modelId
GET /provenance/timeline/:modelId
GET /provenance/:id/verify
POST /provenance
```

Use the actual final route paths.

Test:

- authentication;
- authorization;
- validation;
- success responses;
- not-found;
- duplicate;
- inactive;
- blockchain failure;
- pagination.

---

# 55. Indexer Tests

Test:

- ProvenanceRegistered event indexed;
- ProvenanceStatusChanged event indexed;
- duplicate event ignored;
- restart/replay;
- checkpoint advancement;
- RPC failure;
- malformed event handling;
- correct blockchain metadata stored.

---

# 56. End-to-End Tests

At least one E2E path should demonstrate:

```text
DatasetRegistry
       ↓
Phase 7 execution/training evidence
       ↓
ModelRegistry model/version
       ↓
ProvenanceRegistry registration
       ↓
Blockchain event
       ↓
Backend indexer
       ↓
MongoDB
       ↓
GET provenance
       ↓
GET graph
       ↓
GET timeline
       ↓
Blockchain verification
```

This is the primary Phase 9 backend acceptance flow.

---

# 57. Test Data

Use deterministic test fixtures.

Include:

```text
datasetId = valid existing dataset
modelId = valid existing model
modelVersion = valid existing version
executionId = deterministic execution ID
metadataHash = deterministic bytes32 hash
```

Do not depend on arbitrary developer wallet state.

---

# 58. Existing Test Regression

Run the existing backend test suite before and after implementation.

Record:

```text
Before Phase 9:
X/X

After Phase 9:
Y/Y
```

Also run relevant blockchain integration tests where the backend interacts with the deployed contract.

Do not claim completion with failing existing tests unless the failure is demonstrably unrelated and documented.

---

# 59. Local Integration Environment

Use the existing local infrastructure.

Expected local blockchain:

```text
RPC:
http://127.0.0.1:8545

Chain ID:
31337
```

The backend must read these from configuration/environment.

Example configuration concept:

```text
BLOCKCHAIN_RPC_URL
PROVENANCE_REGISTRY_ADDRESS
DATASET_REGISTRY_ADDRESS
MODEL_REGISTRY_ADDRESS
BLOCKCHAIN_CHAIN_ID
```

Use the project's actual environment variable naming conventions if they already exist.

---

# 60. Deployment / Startup Behavior

The backend should fail clearly if required blockchain configuration is missing.

Do not silently fall back to a wrong contract.

Startup should validate:

- RPC configured;
- ProvenanceRegistry address configured;
- ABI available;
- network/chain ID compatible;
- contract reachable.

---

# 61. Backend API Response Design

Keep responses consistent with the existing API.

A provenance response should contain canonical identity and enough metadata for consumers:

```json
{
  "provenanceId": 1,
  "datasetId": 1,
  "executionId": "exec-test-12345",
  "modelId": 1,
  "modelVersion": 1,
  "metadataHash": "0x...",
  "registrant": "0x...",
  "createdAt": 1725555000,
  "active": true,
  "blockchain": {
    "chainId": 31337,
    "contractAddress": "0x...",
    "blockNumber": 123,
    "transactionHash": "0x..."
  }
}
```

Adapt this to existing response wrappers.

---

# 62. Graph Semantics

The graph API must preserve provenance direction.

Use:

```text
Dataset → Execution → Model Version
```

Do not reverse the meaning of edges.

For a model version trained from multiple datasets:

```text
Dataset A ──┐
            ├──→ Execution X ──→ Model 1 v2
Dataset B ──┘
```

The backend must not collapse multiple datasets into one.

---

# 63. Timeline Semantics

A timeline should allow a consumer to understand:

```text
Dataset registered
      ↓
Execution occurred
      ↓
Model/version produced
      ↓
Provenance registered
      ↓
Provenance revoked, if applicable
```

However, Phase 9 backend must distinguish between:

- blockchain provenance events;
- Phase 7 execution events;
- other application events.

Do not fabricate historical events that are not available.

Where data comes from different sources, identify the source in the response.

---

# 64. Provenance + Phase 7 Execution Integration

Where an `executionId` matches an existing Phase 7 execution record, the backend may enrich the provenance response with:

- execution status;
- dataset context;
- training metrics;
- artifact information;
- model metadata;
- execution timestamps.

This enrichment is **off-chain convenience data**.

The blockchain provenance record remains authoritative for the registered relationship and hash.

Do not copy large execution payloads into the provenance collection unless the existing architecture requires it.

---

# 65. Provenance + Model Integration

Where appropriate, enrich provenance responses with existing model information:

```text
model name
description
owner
status
version metadata
```

Do not duplicate the canonical model registry.

The provenance record should retain only its relationship identifiers.

---

# 66. Provenance + Dataset Integration

Where appropriate, enrich responses with existing dataset information:

```text
dataset name
owner
CID
metadata
status
```

Do not duplicate the DatasetRegistry as a provenance-specific data model.

---

# 67. Ownership and Historical Accuracy

The backend must preserve:

```text
registrant
```

as the historical actor who registered provenance.

Do not rewrite registrant when model ownership changes.

Current model owner should be retrieved separately.

---

# 68. No Silent Data Repair

If MongoDB disagrees with the blockchain:

Do not silently overwrite the chain-derived truth with MongoDB.

Instead:

1. detect mismatch;
2. log it;
3. refresh/reindex if appropriate;
4. return canonical blockchain verification;
5. surface synchronization state if relevant.

---

# 69. Performance

The backend should avoid unnecessary RPC calls for ordinary list operations.

Recommended approach:

```text
MongoDB
  ↓
fast list/search/graph/timeline
```

and:

```text
Blockchain
  ↓
canonical verification / writes / reconciliation
```

Do not make one RPC call per MongoDB provenance record when constructing a large graph unless required.

---

# 70. Future Compatibility

Design the backend so future phases can build on it.

Phase 10 may require provenance context for:

- royalty attribution;
- model revenue;
- dataset contribution.

Phase 11 may require:

- provenance counts;
- lineage analytics;
- usage statistics.

Phase 14/15 may require:

- graph visualization;
- timeline UI;
- verification UI.

Do not implement those future features now.

Only expose a clean foundation.

---

# 71. Documentation

Update:

```text
README.md
knowledge/
```

with the actual backend Phase 9 implementation.

Document:

- API endpoints;
- data model;
- indexer;
- synchronization;
- verification;
- graph;
- timeline;
- configuration;
- tests;
- limitations;
- blockchain handoff.

Do not update blockchain documentation with backend features unless the documentation is specifically shared and the change is accurate.

---

# 72. Swagger

Add complete Swagger documentation for:

- provenance registration;
- provenance retrieval;
- dataset lineage;
- execution lineage;
- model lineage;
- model-version lineage;
- graph;
- timeline;
- verification.

Document response/error schemas.

---

# 73. Acceptance Criteria

Phase 9 Backend is COMPLETE only when:

## Architecture

- [ ] Existing backend conventions reused.
- [ ] No parallel backend architecture introduced.
- [ ] Blockchain remains canonical.
- [ ] MongoDB is treated as a projection.

## Blockchain Integration

- [ ] ProvenanceRegistry ABI integrated.
- [ ] Configurable contract address.
- [ ] Configurable RPC.
- [ ] DatasetRegistry integrated where required.
- [ ] ModelRegistry integrated where required.
- [ ] Contract reads work.
- [ ] Contract writes work where required.
- [ ] Verification works.

## Indexing

- [ ] ProvenanceRegistered indexed.
- [ ] ProvenanceStatusChanged indexed.
- [ ] Indexing is idempotent.
- [ ] Checkpoint/recovery exists.
- [ ] Blockchain metadata stored.
- [ ] RPC failure handled.

## Database

- [ ] Provenance model exists.
- [ ] Required indexes exist.
- [ ] Duplicate projections prevented.
- [ ] Historical records preserved.
- [ ] Status changes preserved.

## APIs

- [ ] Get by ID.
- [ ] Get by dataset.
- [ ] Get by execution.
- [ ] Get by model.
- [ ] Get by model version.
- [ ] Graph.
- [ ] Timeline.
- [ ] Verification.
- [ ] Registration if required by application flow.
- [ ] Pagination.
- [ ] Validation.
- [ ] Authentication/authorization.
- [ ] Swagger.

## Tests

- [ ] Repository tests.
- [ ] Service tests.
- [ ] Controller/API tests.
- [ ] Indexer tests.
- [ ] Blockchain integration tests.
- [ ] E2E provenance flow.
- [ ] Existing backend regression suite passes.

## Documentation

- [ ] README updated.
- [ ] Knowledge base updated.
- [ ] API documentation updated.
- [ ] Backend handoff recorded.
- [ ] Limitations documented.

---

# 74. Strict Out-of-Scope

Do NOT implement:

```text
client/
frontend provenance UI
analytics dashboards
royalty engine
purchase engine changes
model marketplace features
new DatasetRegistry
new ModelRegistry
new sandbox execution system
new training engine
zkML
zero-knowledge proofs
```

Do not modify Phase 4, 6, 7, or 8 systems unless a genuine integration defect is discovered.

If a previous-phase change becomes necessary, document:

1. the defect;
2. why Phase 9 cannot work without it;
3. exact change;
4. regression tests;
5. impact.

---

# 75. Definition of Done

The backend portion of Phase 9 is complete when the following real-world flow works:

```text
1. Existing DatasetRegistry contains dataset
              ↓
2. Existing Phase 7 execution produces executionId + metadata hash
              ↓
3. Existing ModelRegistry contains model/version
              ↓
4. ProvenanceRegistry records the immutable relationship
              ↓
5. ProvenanceRegistered event is emitted
              ↓
6. Backend indexer receives event
              ↓
7. MongoDB projection is created
              ↓
8. API returns provenance
              ↓
9. Graph API reconstructs lineage
              ↓
10. Timeline API reconstructs history
              ↓
11. Verification API checks blockchain
              ↓
12. Tampered/incorrect provenance fails verification
```

---

# 76. Final Backend Implementation Report

At completion, provide a report containing:

```text
PHASE 9 — BACKEND IMPLEMENTATION REPORT

1. Repository audit
2. Existing Phase 4 functionality reused
3. Existing Phase 6 functionality reused
4. Existing Phase 7 functionality reused
5. Existing Phase 8 functionality reused
6. New backend files
7. Modified backend files
8. MongoDB provenance schema
9. Indexes
10. Blockchain integration
11. Event indexer
12. Synchronization/checkpoint strategy
13. Idempotency strategy
14. Registration API
15. Provenance retrieval APIs
16. Graph API
17. Timeline API
18. Verification API
19. Authentication/authorization
20. Error handling
21. Swagger
22. Tests
    - New Phase 9 tests: X/X
    - Existing backend tests: X/X
    - Integration/E2E: X/X
23. Blockchain network/configuration
24. Contract address used
25. Documentation updated
26. Limitations
27. Files intentionally NOT changed
28. Final status
```

Never invent test counts, deployment results, or API behavior.

---

# 77. Final Principle

The Phase 9 backend is **not another provenance authority**.

It is the application layer around the existing blockchain provenance engine:

```text
                 ┌──────────────────────┐
                 │  DatasetRegistry     │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Phase 7 Execution    │
                 │ + Training Evidence  │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │  ModelRegistry       │
                 │  Model + Versions    │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ ProvenanceRegistry   │
                 │   BLOCKCHAIN         │
                 │ CANONICAL PROOF      │
                 └──────────┬───────────┘
                            │ Events
                            ▼
                 ┌──────────────────────┐
                 │ Backend Indexer      │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │ MongoDB Projection   │
                 └──────────┬───────────┘
                            ▼
              ┌─────────────┴─────────────┐
              │                           │
       Graph / Timeline              Verification
             APIs                        API
              │                           │
              └─────────────┬─────────────┘
                            ▼
                       Future UI
```

**Build the backend around what already exists. Do not rebuild the blockchain work completed in Phase 9.**
