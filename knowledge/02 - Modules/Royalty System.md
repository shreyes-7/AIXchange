# Royalty System

## Overview

The **Royalty System** is designed to provide automated, multi-tier royalty distribution to original data creators whenever their datasets or derived models generate downstream commercial revenue.

> [!WARNING]
> **Implementation State: Partially Implemented / Foundation Ready**
> Primary purchase revenue splits (creator share + platform fee) and on-chain royalty rate parameters (`royaltyBps`) are fully implemented in [[Licensing System|LicenseRegistry.sol]] and [[Purchase Engine|PurchaseEngine.sol]]. A dedicated secondary downstream royalty distribution engine (`RoyaltyEngine.sol`) is currently a placeholder stub scheduled for Phase 10.

---

## 1. Existing Implemented Royalty Mechanics

- **On-Chain Royalty Parameters**:
  - `DatasetRegistry.sol`: Stores `defaultRoyaltyBps` (0–10000 BPS, max 100%).
  - `LicenseRegistry.sol`: Supports `ROYALTY` pricing models with configurable `royaltyBps`.
- **Purchase Settlement Fee Splits**:
  - `PurchaseEngine.sol`: Automates immediate creator revenue distribution upon purchase (`safeTransferFrom(buyer, licensor, creatorShare)`).
- **Event Trigger for Indexers**:
  - `PurchaseEngine.sol` emits `RoyaltyTriggered` on every purchase to enable off-chain accounting:
    ```solidity
    emit RoyaltyTriggered(datasetId, licenseId, licensor, msg.sender, licensorShare, block.timestamp);
    ```

---

## 2. Existing Placeholder Code (`RoyaltyEngine.sol`)

- `blockchain/contracts/royalty/RoyaltyEngine.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  contract RoyaltyEngine {
      // Placeholder for RoyaltyEngine
  }
  ```
- `blockchain/contracts/interfaces/IRoyaltyEngine.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  interface IRoyaltyEngine {
      // Placeholder interface for RoyaltyEngine
  }
  ```

---

## 3. Planned Capabilities (Phase 10 Roadmap)

1. **Multi-Party Splits**: Splitting royalties among multiple co-authors, data curators, and annotators based on fractional shares.
2. **Downstream Model Royalties**: Automatically routing a percentage of AI inference or model purchase fees back to original dataset creators.
3. **Escrow & Claiming**: Pull-based royalty claiming contracts for high-frequency micro-settlements.
