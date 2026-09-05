# Model Registry Smart Contract

This document provides complete architecture, interface, implementation details, and backend integration guidance for the **AIXchange Phase 8 on-chain Model Registry**.

---

## 1. Overview

The `ModelRegistry.sol` smart contract provides the decentralized trust and ownership anchor for AI models created, fine-tuned, or traded within the AIXchange ecosystem.

It acts as the authoritative registry for:
- **Model Identity**: Deterministic, incremental, unique on-chain identifiers (`modelId`).
- **Cryptographic Model Hash**: On-chain anchoring of off-chain model artifact hashes (SHA-256 digests produced during Phase 7 training/export).
- **Model Ownership**: On-chain cryptographic ownership and access control for registry modifications.
- **Model Versioning**: Immutable append-only version history for model checkpoints, weights, and metadata.
- **Verification Engine**: On-chain verification comparing expected artifact hashes against recorded versions.

> [!IMPORTANT]
> **Storage Boundary**: Model binaries, PyTorch checkpoints (`.pt`), and Safetensors weights (`.safetensors`) are **NEVER** stored on-chain. The smart contract stores only compact metadata, cryptographic hashes, and IPFS/URI pointers.

---

## 2. Architecture

```text
       ┌────────────────────────────────────────┐
       │             Backend Layer              │
       │   (Model Services & Indexers)          │
       └──────────────────┬─────────────────────┘
                          │ JSON-RPC / Ethers.js v6
                          ▼
       ┌────────────────────────────────────────┐
       │           ModelRegistry.sol            │
       ├────────────────────────────────────────┤
       │  ├── Model Identity (uint256 modelId)  │
       │  ├── Ownership (address owner)         │
       │  ├── Versioning (1, 2, 3, ...)         │
       │  ├── Artifact Hash (SHA-256 string)    │
       │  ├── Status (active / inactive)        │
       │  └── Indexing Events                   │
       └────────────────────────────────────────┘
```

The `ModelRegistry` contract is intentionally decoupled and self-contained. It requires zero external contract calls, preserving modularity and minimizing attack surfaces.

---

## 3. Contract Files & Interfaces

- **Contract**: `blockchain/contracts/registry/ModelRegistry.sol`
- **Interface**: `blockchain/contracts/interfaces/IModelRegistry.sol`
- **Data Structs**: `blockchain/contracts/libraries/Structs.sol` (`Model`, `ModelVersion`)
- **Custom Errors**: `blockchain/contracts/libraries/Errors.sol`
- **Events**: `blockchain/contracts/libraries/Events.sol`
- **Deployment Module**: `blockchain/ignition/modules/ModelRegistry.js`, `Phase8.js`
- **Deployment Script**: `blockchain/scripts/deployModelRegistry.js`

---

## 4. Model Lifecycle

```text
    ┌─────────────────────────┐
    │     registerModel()     │ ──> Creates Model (v1), emits ModelRegistered & ModelVersionAdded
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │    addModelVersion()    │ ──> Increments version (v2, v3...), stores new hash, emits ModelVersionAdded
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │    setModelStatus()     │ ──> Owner can pause/resume model availability
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ transferModelOwnership()│ ──> Reassigns owner with O(1) swap-and-pop index tracking
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │    verifyModelHash()    │ ──> Verifies off-chain artifact integrity against on-chain hash
    └─────────────────────────┘
```

---

## 5. Storage Model

### `Structs.Model`
```solidity
struct Model {
    uint256 modelId;          // Auto-incrementing unique identifier
    address owner;            // Current owner of the model
    string name;              // Name/title (unique per owner)
    string metadataURI;       // Off-chain metadata URI / IPFS CID
    uint256 currentVersion;   // Current active version number
    uint256 totalVersions;    // Total versions registered to date
    uint256 createdAt;        // Creation block timestamp
    bool active;              // Active status flag
}
```

### `Structs.ModelVersion`
```solidity
struct ModelVersion {
    uint256 versionNumber;    // Sequential version number (1, 2, 3, ...)
    string modelHash;         // Cryptographic SHA-256 artifact digest
    string metadataURI;       // Version-specific metadata URI / IPFS CID
    uint256 createdAt;        // Version registration block timestamp
    bool active;              // Status flag for this version
}
```

---

## 6. Model Identity & Duplicate Protection

1. **Identity**: Sequential `uint256` model identifiers generated via internal counter starting at 1 (`modelId = 1, 2, 3, ...`).
2. **Duplicate Name Protection**: Scoped per owner via `_ownerModelNameToId[owner][name]`. An owner cannot register multiple models with identical names. However, different users may independently register models with the same name.
3. **Duplicate Version Protection**: `addModelVersion` prevents re-registering an identical model hash as the current version (`DuplicateModelVersion`).

---

## 7. Ownership & Access Control

- **On-chain Authorization**: Modification operations (`addModelVersion`, `setModelStatus`, `transferModelOwnership`) strictly enforce that `msg.sender == _models[modelId].owner`, reverting with custom error `UnauthorizedCaller(address caller)`.
- **Ownership Transfer**: Uses efficient $O(1)$ swap-and-pop array updates to maintain owner-to-models indices and updates the name reservation mapping to allow former owners to reuse model names while protecting the new owner against collisions.

---

## 8. Smart Contract Interface (`IModelRegistry.sol`)

### Write Functions
```solidity
function registerModel(
    string calldata name,
    string calldata metadataURI,
    string calldata modelHash
) external returns (uint256 modelId);

function addModelVersion(
    uint256 modelId,
    string calldata metadataURI,
    string calldata modelHash
) external returns (uint256 versionNumber);

function setModelStatus(uint256 modelId, bool active) external;

function transferModelOwnership(uint256 modelId, address newOwner) external;
```

### Read Functions
```solidity
function getModel(uint256 modelId) external view returns (Structs.Model memory model);
function getModelOwner(uint256 modelId) external view returns (address owner);
function getModelsByOwner(address owner) external view returns (uint256[] memory modelIds);
function getTotalModels() external view returns (uint256 total);
function getVersion(uint256 modelId, uint256 versionNumber) external view returns (Structs.ModelVersion memory version);
function getLatestVersion(uint256 modelId) external view returns (Structs.ModelVersion memory version);
function getVersionCount(uint256 modelId) external view returns (uint256 count);
function getModelVersions(uint256 modelId) external view returns (Structs.ModelVersion[] memory versions);
function isModelActive(uint256 modelId) external view returns (bool active);
function verifyModelHash(uint256 modelId, uint256 versionNumber, string calldata expectedHash) external view returns (bool matches);
```

---

## 9. Emitted Events

| Event | Indexed Arguments | Unindexed Arguments | Description |
| :--- | :--- | :--- | :--- |
| `ModelRegistered` | `uint256 indexed modelId`, `address indexed owner` | `string name`, `string metadataURI`, `string modelHash`, `uint256 initialVersion`, `uint256 createdAt` | Emitted when model is registered |
| `ModelVersionAdded` | `uint256 indexed modelId`, `uint256 indexed versionNumber` | `string modelHash`, `string metadataURI`, `uint256 createdAt` | Emitted on initial and subsequent version creations |
| `ModelStatusChanged` | `uint256 indexed modelId` | `bool active` | Emitted when active status toggles |
| `ModelOwnershipTransferred` | `uint256 indexed modelId`, `address indexed previousOwner`, `address indexed newOwner` | None | Emitted on ownership transfer |

---

## 10. Custom Errors

| Error | Parameters | Revert Condition |
| :--- | :--- | :--- |
| `ModelNotFound` | `uint256 modelId` | Queried or target `modelId` is 0 or unassigned |
| `ModelAlreadyExists` | `string name` | Owner already has an active model with that name |
| `InvalidModelName` | None | Empty string supplied for model name |
| `InvalidMetadataURI` | None | Empty string supplied for metadata URI |
| `InvalidModelHash` | None | Empty string supplied for model artifact hash |
| `ModelInactive` | `uint256 modelId` | Attempting to version an inactive model |
| `VersionNotFound` | `uint256 modelId`, `uint256 versionNumber` | Requested version is 0 or exceeds total versions |
| `DuplicateModelVersion` | `uint256 modelId`, `uint256 versionNumber` | New version hash matches current version hash |
| `UnauthorizedCaller` | `address caller` | Non-owner attempts protected state mutation |
| `ZeroAddress` | None | Attempting ownership transfer or owner query to zero address |

---

## 11. Backend Integration Guide (Teammate Handoff)

### ABI Location
- Compiled ABI: `blockchain/artifacts/contracts/registry/ModelRegistry.sol/ModelRegistry.json`
- Interface ABI: `blockchain/artifacts/contracts/interfaces/IModelRegistry.sol/IModelRegistry.json`

### Deployed Contract Address
- Localhost (Hardhat Network): `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

### Off-Chain to On-Chain Workflow
1. **Model Export / Training Complete (Phase 7)**:
   - PyTorch script exports trained weights (`model.safetensors` / `checkpoint.pt`).
   - Off-chain service computes SHA-256 digest (e.g., `e3b0c44298fc1c149afbf4c8996fb92427ae41...`).
   - Off-chain metadata is uploaded to IPFS/S3 storage, yielding a `metadataURI`.
2. **On-Chain Anchor Transaction**:
   - Model creator signs transaction calling `registerModel(name, metadataURI, modelHash)`.
   - Transaction confirms in block; event `ModelRegistered` and `ModelVersionAdded` emitted.
3. **Backend Event Indexer**:
   - Backend listens for `ModelRegistered` event.
   - Saves `blockchainModelId = event.args.modelId`, `owner = event.args.owner`, `version = 1`, and `modelHash`.
4. **New Version Flow**:
   - Model creator refines model; computes new SHA-256 artifact hash.
   - Creator calls `addModelVersion(modelId, newMetadataURI, newModelHash)`.
   - Event `ModelVersionAdded` emitted; backend updates version list.

---

## 12. Verification & Testing

- **Contract Test Suite**: `blockchain/test/registry/ModelRegistry.test.js`
- **Total Phase 8 Tests**: `41 / 41` Passing
- **Full Blockchain Suite**: `156 / 156` Passing (zero regressions across Phase 3–7 contracts)
- **Deployment Verification**: Verified on local Hardhat network at address `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`.

---

## 13. Phase Scope Boundary

- **Blockchain**: **100% Complete** for Phase 8.
- **Backend**: Owned by teammate (Model MongoDB models, CRUD APIs, marketplace discovery, inference routing).
- **Frontend**: Intentionally deferred.
