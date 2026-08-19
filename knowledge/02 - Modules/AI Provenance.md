# AI Provenance

## Overview

The **AI Provenance** module is designed to provide immutable traceability and lineage tracking for artificial intelligence datasets, fine-tuned model checkpoints, and derived data assets.

> [!WARNING]
> **Implementation State: Planned / Not Implemented**
> AI Provenance is documented as a core project goal in `README.md` and scheduled for Phase 9. No dedicated provenance smart contracts, graph database pipelines, or client views exist in the repository currently.

---

## Existing Codebase References & Foundation

While a standalone provenance engine has not yet been built, fundamental provenance primitives are implemented in existing smart contracts:
- **`DatasetRegistry.sol`**:
  - Immutably records dataset creation timestamp (`createdAt`), initial creator (`owner`), and IPFS content hash (`cid`).
  - Tracks ownership transfer history via `transferDatasetOwnership()`.
- **`PurchaseEngine.sol`**:
  - Emits `RoyaltyTriggered` and `DatasetPurchased` events recording the exact block, timestamp, and addresses involved in asset transactions.

---

## Planned Architecture (Phase 9 Roadmap)

1. **Dataset-to-Model Lineage**: Cryptographically recording which dataset CIDs and license IDs were used to train or fine-tune specific model weights.
2. **Derivative Tracking**: Generating on-chain parent-child DAGs when datasets are merged, filtered, or synthetically augmented.
3. **Audit Trails**: Providing verifiable proof of compliance for AI models trained on legally licensed data.
