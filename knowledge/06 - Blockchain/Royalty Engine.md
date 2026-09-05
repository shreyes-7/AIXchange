# Royalty Engine

## Overview

The **Royalty Engine** (`RoyaltyEngine.sol`) is the on-chain settlement and revenue splitting layer of AIXchange. It governs multi-party revenue allocations, platform treasury fee collection, atomic token payouts, duplicate distribution prevention, and auditable accounting.

The Royalty Engine operates in conjunction with Phase 3 (`AIXToken` & `Treasury`) and Phase 6 (`PurchaseEngine`), ensuring that all downstream secondary sales, derivative works, model inference revenues, or multi-author dataset purchases are deterministically distributed on-chain.

---

## Architecture & Data Flow

```text
                     AIX Revenue (Payer / Licensor)
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   RoyaltyEngine   │
                         └─────────┬─────────┘
                                   │
                             Revenue Split
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
       Recipient 1           Recipient 2              Treasury
     (Co-author 60%)       (Curator 37.5%)        (Platform 2.5% + rem)
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                                   ▼
                          On-Chain Events
                (DistributionCreated, RecipientPaid,
                  TreasuryPaid, DistributionCompleted)
                                   │
                                   ▼
                           Backend Indexer
                    (Prabhu - History & Reports)
```

---

## Core Smart Contracts

### 1. `IRoyaltyEngine.sol`
Defines public structs, events, read methods, and write functions:
- `distributeRoyalty(sourceType, sourceId, totalRevenue, recipients)`
- `distributePurchaseRoyalty(purchaseId, recipients)`
- `calculateSplit(totalRevenue, treasuryFeeBps, recipients)`
- `getDistribution(distributionId)`
- `getDistributionAllocations(distributionId)`
- `isSourceDistributed(sourceType, sourceId)`
- `getTotalDistributions()`
- `getTotalDistributedAmount()`
- `getTotalTreasuryDistributed()`
- `getRecipientTotalClaimed(recipient)`

### 2. `RoyaltyEngine.sol`
The implementation contract inheriting `Ownable`, `ReentrancyGuard`, `Pausable`, and `IRoyaltyEngine`:
- **Basis Points System**: `BPS_DENOMINATOR = 10000` (100.00%).
- **Maximum Treasury Fee**: `MAX_TREASURY_FEE_BPS = 2000` (20.00%).
- **Gas Limit Protection**: `MAX_RECIPIENTS = 50` recipients per transaction.
- **Strict Accounting Invariant**:
  $$\sum_{i} \text{recipientAmounts}[i] + \text{treasuryAmount} \equiv \text{totalRevenue}$$
  Any integer division rounding remainder is deterministically absorbed into the platform Treasury, preventing any token loss or unallocated dust.
- **Double-Distribution Protection**: Enforces single distribution per unique `sourceKey = keccak256(sourceType, sourceId)`. Subsequent attempts revert with `DistributionAlreadyCompleted`.
- **Atomicity**: Uses OpenZeppelin `SafeERC20`. If any recipient transfer fails, the entire transaction reverts.

---

## Revenue Sources (`RoyaltySourceType`)

```solidity
enum RoyaltySourceType {
    PURCHASE,       // Phase 6 dataset or model license purchase
    DERIVATIVE,     // Downstream derivative model/dataset commercial revenue
    INFERENCE,      // Model inference fee distributions
    DIRECT          // Direct contributor tips, grants, or collaborative settlements
}
```

---

## Backend Handoff for Prabhu (Phase 10 Backend Lead)

Prabhu will consume the Royalty Engine contract to build:
1. **Royalty APIs**: Endpoints to trigger distributions or preview calculations.
2. **Royalty History**: Chronological audit trail reconstructed from blockchain events.
3. **Royalty Reports**: Aggregated financial metrics and recipient earnings.

### Contract References
- **Local Address**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` (or dynamic deployment address)
- **ABI Path**: `blockchain/artifacts/contracts/royalty/RoyaltyEngine.sol/RoyaltyEngine.json`
- **Interface**: `blockchain/contracts/interfaces/IRoyaltyEngine.sol`

### Key Events to Index

```solidity
event DistributionCreated(
    uint256 indexed distributionId,
    bytes32 indexed sourceKey,
    uint8 sourceType,
    uint256 sourceId,
    address indexed payer,
    uint256 totalRevenue
);

event RecipientPaid(
    uint256 indexed distributionId,
    address indexed recipient,
    uint256 amount,
    uint256 shareBps
);

event TreasuryPaid(
    uint256 indexed distributionId,
    address indexed treasury,
    uint256 amount,
    uint256 feeBps
);

event DistributionCompleted(
    uint256 indexed distributionId,
    uint256 totalDistributed,
    uint256 recipientCount,
    uint256 timestamp
);
```

### Event Indexing Flow for Backend

1. Listen for `DistributionCreated`: Insert new distribution document in MongoDB with `distributionId`, `sourceKey`, `sourceType`, `sourceId`, `payer`, and `totalRevenue`.
2. Listen for `RecipientPaid`: Record individual recipient payout records, incrementing cumulative recipient balance.
3. Listen for `TreasuryPaid`: Record platform commission entry.
4. Listen for `DistributionCompleted`: Mark distribution status as `DISTRIBUTED` with final timestamp.

---

## Verification & Test Coverage

- **Phase 10 Tests**: 36 unit tests in `blockchain/test/royalty/RoyaltyEngine.test.js`
- **Regression Tests**: 228 passing tests across the full blockchain suite (zero regressions)
- **Verified Scenarios**:
  - Exact split calculations with integer rounding remainder absorption
  - Single and multi-recipient distributions
  - Duplicate source distribution rejection
  - Phase 6 PurchaseEngine integration
  - Treasury updates & fee modifications by owner
  - Emergency pause / unpause
  - Zero address, zero amount, and invalid allocation validations
