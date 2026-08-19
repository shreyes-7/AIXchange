# Database Architecture

## Overview

The AIXchange persistence layer uses **MongoDB** managed through the **Mongoose 9** Object Data Modeling (ODM) library in `server/src/models/`.

```
                    ┌─────────────────────────┐
                    │       User Schema       │
                    │      (users model)      │
                    └───────────┬─────────────┘
                                │ 1:N
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────┐ ┌───────────────────────┐
│     Session Schema    │ │  Dataset  │ │    Purchase Schema    │
│    (sessions model)   │ │  Schema   │ │   (purchases model)   │
└───────────────────────┘ └─────┬─────┘ └───────────┬───────────┘
                                │ 1:N               │
                                ▼                   │ References
                        ┌───────────────┐           │ datasetId &
                        │    License    │<──────────┘ licenseId
                        │    Schema     │
                        └───────────────┘
```

---

## Collections & Schemas

### 1. `users` Collection (`user.model.js`)
Stores registered platform users, credentials, roles, and linked Web3 wallet addresses.
- `username`: String, required, unique, trimmed, index.
- `email`: String, required, unique, lowercase, trimmed, index.
- `password`: String, required (hashed with bcrypt), `select: false`.
- `role`: String, enum: `['buyer', 'creator', 'validator', 'admin']`, default: `'buyer'`.
- `walletAddress`: String, lowercase, unique (sparse), index.
- `nonce`: String, cryptographic random challenge nonce for wallet authentication.
- `isEmailVerified`: Boolean, default: `false`.
- `reputationScore`: Number, default: `100`.
- `avatar`: String.
- `bio`: String.
- `createdAt`, `updatedAt`: Timestamps.

### 2. `sessions` Collection (`session.model.js`)
Tracks active user authentication sessions and refresh tokens.
- `userId`: ObjectId, ref: `'User'`, required, index.
- `token`: String, required.
- `userAgent`: String.
- `ipAddress`: String.
- `isValid`: Boolean, default: `true`.
- `expiresAt`: Date, required.
- `createdAt`, `updatedAt`: Timestamps.

### 3. `datasets` Collection (`dataset.model.js`)
Stores off-chain metadata, search tags, descriptions, and on-chain blockchain mapping for datasets.
- `datasetId`: Number, on-chain integer ID (assigned by `DatasetRegistry.sol`), unique, index.
- `title`: String, required, trimmed, text index.
- `description`: String, required.
- `category`: String, enum: `['computer-vision', 'nlp', 'audio', 'tabular', 'multimodal', 'other']`.
- `tags`: [String], indexed.
- `owner`: ObjectId, ref: `'User'` or wallet address string.
- `ownerAddress`: String, lowercase, index.
- `ipfsCid`: String, required, IPFS content hash.
- `metadataUri`: String.
- `format`: String (e.g. `'csv'`, `'json'`, `'parquet'`).
- `sizeBytes`: Number.
- `numSamples`: Number.
- `price`: Number (Fixed AIX token price).
- `defaultLicense`: String.
- `royaltyBps`: Number (Basis points, 0–10000).
- `isActive`: Boolean, default: `true`.
- `viewCount`, `downloadCount`, `purchaseCount`: Numbers, default: `0`.
- `rating`: Number, default: `0`.
- `createdAt`, `updatedAt`: Timestamps.

### 4. `licenses` Collection (`license.model.js`)
Off-chain index of licenses registered on `LicenseRegistry.sol`.
- `licenseId`: Number, on-chain integer ID, unique, index.
- `assetId`: Number, dataset integer ID, required, index.
- `assetType`: String, enum: `['DATASET', 'MODEL']`, default: `'DATASET'`.
- `licensorAddress`: String, required, lowercase, index.
- `licenseType`: String, enum: `['ACADEMIC', 'COMMERCIAL', 'EXCLUSIVE', 'CUSTOM']`, required.
- `pricingModel`: String, enum: `['FIXED', 'ROYALTY']`, required.
- `fixedPrice`: String / Number, price in AIX units.
- `royaltyBps`: Number, basis points (0–10000).
- `rights`: Object:
  - `canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, `canSublicense`: Booleans.
- `restrictions`: String.
- `validFrom`: Date / Timestamp.
- `validUntil`: Date / Timestamp.
- `isActive`: Boolean, default: `true`.
- `isRevoked`: Boolean, default: `false`.
- `version`: Number, default: `1`.
- `createdAt`, `updatedAt`: Timestamps.

### 5. `purchases` Collection (`purchase.model.js`)
Records settled purchases synchronized from `PurchaseEngine.sol`.
- `purchaseId`: Number, on-chain purchase ID, unique, index.
- `datasetId`: Number, required, index.
- `licenseId`: Number, required, index.
- `buyerAddress`: String, required, lowercase, index.
- `sellerAddress`: String, required, lowercase.
- `pricePaid`: String / Number, amount of AIX tokens paid.
- `feePaid`: String / Number, platform fee deducted.
- `creatorShare`: String / Number, net revenue to creator.
- `txHash`: String, transaction hash, unique.
- `blockNumber`: Number.
- `purchasedAt`: Date.
- `validUntil`: Date.
- `createdAt`, `updatedAt`: Timestamps.

### 6. `transactions` Collection (`transaction.model.js`)
Generic ledger tracking on-chain transactions and indexer status.
- `txHash`: String, required, unique, index.
- `from`: String, lowercase.
- `to`: String, lowercase.
- `value`: String.
- `type`: String, enum: `['TOKEN_TRANSFER', 'DATASET_REGISTRATION', 'LICENSE_CREATION', 'PURCHASE', 'ROYALTY_PAYOUT']`.
- `status`: String, enum: `['PENDING', 'CONFIRMED', 'FAILED']`.
- `blockNumber`: Number.
- `timestamp`: Date.

### 7. `indexer_state` Collection (`indexer-state.model.js`)
Maintains blockchain block synchronization cursors for event indexing workers.
- `indexerName`: String, required, unique (e.g. `'license-event-indexer'`, `'purchase-event-indexer'`).
- `lastProcessedBlock`: Number, required, default: `0`.
- `lastUpdated`: Date.
