# Provenance Registry Smart Contract

This document provides complete architecture, interface, implementation details, and backend integration guidance for the **AIXchange Phase 9 on-chain Provenance Engine**.

---

## 1. Overview

The `ProvenanceRegistry.sol` smart contract provides the decentralized trust and lineage relationship anchor for AI models, training executions, and datasets within the AIXchange ecosystem.

Rather than duplicating dataset or model registries, `ProvenanceRegistry` acts as a **pure relationship and verification layer**:
- **Dataset Lineage**: Links source datasets registered in Phase 4's `DatasetRegistry.sol`.
- **Execution Lineage**: Anchors off-chain training execution / sandbox runs produced during Phase 7 (`executionId` and cryptographic commitment `metadataHash`).
- **Model & Version Lineage**: Links target models and specific model versions registered in Phase 8's `ModelRegistry.sol`.
- **Verification Engine**: Provides deterministic on-chain verification functions allowing anyone to independently verify lineage claims without trusted intermediaries.
- **Auditability & Immutability**: Enforces append-only immutable historical records with auditable active/deprecated status toggling.

> [!IMPORTANT]
> **Zero Raw Data On-Chain**: Training logs, loss curves, PyTorch checkpoints, and raw dataset files are **NEVER** stored on-chain. Only compact numeric IDs, execution identifiers, and cryptographic hash commitments are anchored.

---

## 2. Architecture & Lineage Flow

```text
  Existing Phase 4                   Existing Phase 7                    Existing Phase 8
   DatasetRegistry                   Execution / Sandbox                   ModelRegistry
┌────────────────────┐             ┌─────────────────────┐             ┌────────────────────┐
│ • datasetId        │             │ • executionId       │             │ • modelId          │
│ • CID / IPFS Hash  │             │ • model_metadata.json│             │ • versionNumber    │
│ • owner            │             │ • artifact SHA-256  │             │ • modelHash        │
└─────────┬──────────┘             └──────────┬──────────┘             └─────────┬──────────┘
          │                                   │                                  │
          └───────────────────────────┐       │       ┌──────────────────────────┘
                                      ▼       ▼       ▼
                               ┌─────────────────────────────┐
                               │     NEW Phase 9 On-Chain    │
                               │     ProvenanceRegistry      │
                               ├─────────────────────────────┤
                               │ • provenanceId              │
                               │ • datasetId                 │
                               │ • executionId               │
                               │ • modelId & modelVersion    │
                               │ • metadataHash (SHA-256)    │
                               │ • registrant (model owner)  │
                               │ • active (status flag)      │
                               │ • verifyProvenance()        │
                               └─────────────────────────────┘
```

---

## 3. Contract Files & Dependencies

- **Contract**: `blockchain/contracts/registry/ProvenanceRegistry.sol`
- **Interface**: `blockchain/contracts/interfaces/IProvenanceRegistry.sol`
- **Linked Registries**:
  - `blockchain/contracts/interfaces/IDatasetRegistry.sol` (Phase 4)
  - `blockchain/contracts/interfaces/IModelRegistry.sol` (Phase 8)
- **Data Structs**: `blockchain/contracts/libraries/Structs.sol` (`ProvenanceRecord`)
- **Custom Errors**: `blockchain/contracts/libraries/Errors.sol`
- **Events**: `blockchain/contracts/libraries/Events.sol`
- **Deployment Modules**: `blockchain/ignition/modules/ProvenanceRegistry.js`, `Phase9.js`
- **Deployment Script**: `blockchain/scripts/deployProvenanceRegistry.js`

---

## 4. Data Storage Model

### `Structs.ProvenanceRecord`
```solidity
struct ProvenanceRecord {
    uint256 provenanceId;     // Unique sequential identifier (1, 2, 3...)
    uint256 datasetId;        // Reference to DatasetRegistry datasetId
    uint256 modelId;          // Reference to ModelRegistry modelId
    uint256 modelVersion;     // Reference to ModelRegistry versionNumber
    string executionId;       // Off-chain execution/sandbox identifier (e.g. "exec-001")
    bytes32 metadataHash;     // Cryptographic commitment/hash of model_metadata.json
    address registrant;       // Account that anchored the provenance record
    uint256 createdAt;        // Timestamp when record was committed
    bool active;              // Status flag (true = active, false = deprecated/revoked)
}
```

---

## 5. Provenance Identity & Duplicate Protection

1. **Unique Sequential ID**: Auto-incrementing `uint256 provenanceId` starting at 1.
2. **Deterministic Composite Key**: 
   $$\text{key} = \text{keccak256}(\text{abi.encodePacked}(\text{datasetId}, \text{executionId}, \text{modelId}, \text{modelVersion}))$$
3. **Duplicate Prevention**: If a relationship record with the same composite key is already committed, `registerProvenance` reverts with `Errors.ProvenanceAlreadyExists(existingId)`.
4. **Multi-Dataset Support**: If a model training run consumes multiple datasets $D_1, D_2$, the system records distinct atomic provenance edges:
   - $(D_1, \text{exec}, M, V)$
   - $(D_2, \text{exec}, M, V)$
   This models the lineage as a directed acyclic property graph (DAG).

---

## 6. Authorization & Access Control

- **Registration Authorization**: Calling `registerProvenance` requires that `msg.sender == modelRegistry.getModelOwner(modelId)`. Only the creator/owner of the model produced by the training execution can anchor its lineage.
- **Status Mutation Authorization**: Calling `setProvenanceStatus` is restricted to either the original `registrant` or the current model owner (supporting transferred ownership). Unrelated accounts revert with `Errors.UnauthorizedCaller(msg.sender)`.

---

## 7. Smart Contract Interface (`IProvenanceRegistry.sol`)

### Write Functions
```solidity
function registerProvenance(
    uint256 datasetId,
    uint256 modelId,
    uint256 modelVersion,
    string calldata executionId,
    bytes32 metadataHash
) external returns (uint256 provenanceId);

function setProvenanceStatus(uint256 provenanceId, bool active) external;
```

### Read & Verification Functions
```solidity
function getProvenance(uint256 provenanceId) external view returns (Structs.ProvenanceRecord memory record);
function getTotalProvenanceRecords() external view returns (uint256 total);
function getProvenanceByModel(uint256 modelId) external view returns (uint256[] memory provenanceIds);
function getProvenanceByModelVersion(uint256 modelId, uint256 modelVersion) external view returns (uint256[] memory provenanceIds);
function getProvenanceByDataset(uint256 datasetId) external view returns (uint256[] memory provenanceIds);
function getProvenanceByExecution(string calldata executionId) external view returns (uint256[] memory provenanceIds);
function getProvenanceIdByKey(uint256 datasetId, string calldata executionId, uint256 modelId, uint256 modelVersion) external view returns (uint256 provenanceId);

function verifyProvenance(
    uint256 provenanceId,
    uint256 expectedDatasetId,
    string calldata expectedExecutionId,
    uint256 expectedModelId,
    uint256 expectedModelVersion,
    bytes32 expectedMetadataHash
) external view returns (bool isValid);

function verifyProvenanceHash(uint256 provenanceId, bytes32 expectedMetadataHash) external view returns (bool isValid);
function isProvenanceActive(uint256 provenanceId) external view returns (bool active);
function datasetRegistry() external view returns (IDatasetRegistry registry);
function modelRegistry() external view returns (IModelRegistry registry);
```

---

## 8. Emitted Events

| Event | Indexed Arguments | Unindexed Arguments | Description |
| :--- | :--- | :--- | :--- |
| `ProvenanceRegistered` | `uint256 indexed provenanceId`, `uint256 indexed datasetId`, `uint256 indexed modelId` | `uint256 modelVersion`, `string executionId`, `bytes32 metadataHash`, `address registrant`, `uint256 createdAt` | Emitted on new lineage commitment |
| `ProvenanceStatusChanged` | `uint256 indexed provenanceId` | `bool active`, `uint256 timestamp` | Emitted when status changes |

---

## 9. Custom Errors

| Error | Parameters | Revert Condition |
| :--- | :--- | :--- |
| `ProvenanceNotFound` | `uint256 provenanceId` | Queried provenanceId is 0 or out of range |
| `ProvenanceAlreadyExists` | `uint256 provenanceId` | Duplicate (dataset, exec, model, version) relationship |
| `InvalidExecutionId` | None | Empty executionId string |
| `InvalidMetadataHash` | None | Zero bytes32 metadataHash |
| `ProvenanceInactive` | `uint256 provenanceId` | Queried record is inactive |
| `DatasetNotFound` | `uint256 datasetId` | Referenced dataset does not exist in DatasetRegistry |
| `ModelNotFound` | `uint256 modelId` | Referenced model does not exist in ModelRegistry |
| `VersionNotFound` | `uint256 modelId, uint256 versionNumber` | Referenced version is invalid or out of bounds |
| `UnauthorizedCaller` | `address caller` | Non-owner attempts to register or modify provenance |
| `ZeroAddress` | None | Zero address passed to constructor |

---

## 10. Backend Handoff Guide (For Prabhu)

### ABI & Artifact Locations
- Compiled ABI: `blockchain/artifacts/contracts/registry/ProvenanceRegistry.sol/ProvenanceRegistry.json`
- Interface ABI: `blockchain/artifacts/contracts/interfaces/IProvenanceRegistry.sol/IProvenanceRegistry.json`

### Constructor Dependencies
- `datasetRegistryAddress`: Address of Phase 4 `DatasetRegistry.sol`
- `modelRegistryAddress`: Address of Phase 8 `ModelRegistry.sol`

### Integration Flow
```text
1. Phase 7 Execution Completes
   ├── Model exported (.safetensors, .pt)
   ├── SHA-256 hash computed
   └── model_metadata.json generated with executionId
         │
2. Phase 8 Model Registration
   └── Model owner registers model in ModelRegistry (modelId, versionNumber = 1)
         │
3. Phase 9 Provenance Commitment
   ├── Off-chain service computes metadataHash = keccak256(model_metadata.json)
   └── Model owner signs registerProvenance(datasetId, modelId, versionNumber, executionId, metadataHash)
         │
4. ProvenanceRegistered Event Emitted
   └── Backend indexer stores lineage graph edge: (Dataset) -> (Execution) -> (ModelVersion)
         │
5. Prabhu's Backend APIs
   ├── GET /api/v1/provenance/model/:modelId
   ├── GET /api/v1/provenance/timeline/:modelId
   └── POST /api/v1/provenance/verify
```

---

## 11. Verification & Testing Evidence

- **Dedicated Test Suite**: `blockchain/test/registry/ProvenanceRegistry.test.js`
- **Phase 9 Tests**: **36 / 36 Passing**
- **Full Blockchain Suite**: **192 / 192 Passing** (Zero regressions across Phases 3–8)
- **Deployment & On-Chain Verification**: Successfully deployed and smoke-tested with live on-chain assertions.

---

## 12. Scope Confirmation

- **Blockchain Phase 9**: **100% Complete**.
- **Backend Graph & Timeline APIs**: Owned by Prabhu (out of scope for this task).
- **Frontend Provenance Visualization**: Deferred to frontend phase.
