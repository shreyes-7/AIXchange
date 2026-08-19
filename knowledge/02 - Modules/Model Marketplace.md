# Model Marketplace

## Overview

The **Model Marketplace** is a planned decentralized exchange module for browsing, licensing, and trading trained artificial intelligence and machine learning models.

> [!WARNING]
> **Implementation State: Placeholder / Stub**
> The model marketplace smart contract interface exists as a placeholder skeleton in `blockchain/contracts/registry/ModelRegistry.sol` (88 bytes) and `blockchain/contracts/interfaces/IModelRegistry.sol` (178 bytes). Frontend model catalog views and backend model APIs have not yet been implemented in the codebase.

---

## Existing Codebase References

- `blockchain/contracts/registry/ModelRegistry.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  contract ModelRegistry {
      // Placeholder for ModelRegistry
  }
  ```
- `blockchain/contracts/interfaces/IModelRegistry.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  interface IModelRegistry {
      // Placeholder interface for ModelRegistry
  }
  ```
- `blockchain/contracts/libraries/Structs.sol`:
  `AssetType` enum defines `MODEL` as an asset identifier alongside `DATASET`.

---

## Planned Architecture & Responsibilities (Phase 8 Roadmap)

1. **Model Weights & Checkpoints Storage**: Anchoring safetensors, GGUF, or ONNX model files to IPFS.
2. **Model Evaluation & Benchmarking**: Running automated benchmark suites (MMLU, HumanEval, etc.) via Python services before listing.
3. **Inference & Fine-Tuning Licensing**: Extending `LicenseRegistry.sol` to grant specific permissions (`canInfer`, `canTrain`, `canCommercialUse`) for AI models.
