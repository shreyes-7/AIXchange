# Relationships

## Overview

The database models maintain both relational document references (`ObjectId` via `ref`) and on-chain identifier references (`datasetId`, `licenseId`, `purchaseId`, `walletAddress`).

```text
┌─────────────────┐             1:N             ┌─────────────────┐
│      User       │────────────────────────────>│     Session     │
│   (User.js)     │ (userId -> _id)             │  (Session.js)   │
└────────┬────────┘                             └─────────────────┘
         │
         │ 1:N (owner -> _id or ownerAddress -> walletAddress)
         ▼
┌─────────────────┐             1:N             ┌─────────────────┐
│     Dataset     │────────────────────────────>│     License     │
│  (Dataset.js)   │ (assetId -> datasetId)      │  (License.js)   │
└────────┬────────┘                             └────────┬────────┘
         │                                               │
         │ 1:N (datasetId)                               │ 1:N (licenseId)
         └───────────────────────┬───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │    Purchase     │
                        │  (Purchase.js)  │
                        └─────────────────┘
```

---

## Reference Matrix

1. **User $\to$ Session**:
   - `Session.userId` $\to$ `User._id` (One-to-Many).
2. **User $\to$ Dataset**:
   - `Dataset.owner` $\to$ `User._id` (Optional reference).
   - `Dataset.ownerAddress` $\to$ `User.walletAddress` (On-chain address mapping).
3. **Dataset $\to$ License**:
   - `License.assetId` $\to$ `Dataset.datasetId` (Logical on-chain foreign key).
4. **Dataset & License $\to$ Purchase**:
   - `Purchase.datasetId` $\to$ `Dataset.datasetId`.
   - `Purchase.licenseId` $\to$ `License.licenseId`.
   - `Purchase.buyerAddress` $\to$ `User.walletAddress`.
