# Models

## Overview

Mongoose models in `server/src/models/` define the document schemas, validation constraints, and indexes for collections in the MongoDB database.

---

## 1. `user.model.js` (`User`)

```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['buyer', 'creator', 'validator', 'admin'], default: 'buyer' },
  walletAddress: { type: String, lowercase: true, sparse: true, unique: true, index: true },
  nonce: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  reputationScore: { type: Number, default: 100 },
  avatar: { type: String },
  bio: { type: String }
}, { timestamps: true });
```

---

## 2. `session.model.js` (`Session`)

```javascript
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  isValid: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
```

---

## 3. `dataset.model.js` (`Dataset`)

```javascript
const datasetSchema = new mongoose.Schema({
  datasetId: { type: Number, unique: true, sparse: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['computer-vision', 'nlp', 'audio', 'tabular', 'multimodal', 'other'] },
  tags: [{ type: String, index: true }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerAddress: { type: String, required: true, lowercase: true, index: true },
  ipfsCid: { type: String, required: true },
  metadataUri: { type: String },
  format: { type: String },
  sizeBytes: { type: Number },
  numSamples: { type: Number },
  price: { type: Number, default: 0 },
  defaultLicense: { type: String },
  royaltyBps: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, { timestamps: true });
```

---

## 4. `license.model.js` (`License`)

```javascript
const licenseSchema = new mongoose.Schema({
  licenseId: { type: Number, unique: true, required: true, index: true },
  assetId: { type: Number, required: true, index: true },
  assetType: { type: String, enum: ['DATASET', 'MODEL'], default: 'DATASET' },
  licensorAddress: { type: String, required: true, lowercase: true, index: true },
  licenseType: { type: String, enum: ['ACADEMIC', 'COMMERCIAL', 'EXCLUSIVE', 'CUSTOM'], required: true },
  pricingModel: { type: String, enum: ['FIXED', 'ROYALTY'], required: true },
  fixedPrice: { type: String, default: '0' },
  royaltyBps: { type: Number, default: 0 },
  rights: {
    canView: { type: Boolean, default: true },
    canDownload: { type: Boolean, default: false },
    canModify: { type: Boolean, default: false },
    canTrain: { type: Boolean, default: false },
    canInfer: { type: Boolean, default: false },
    canCommercialUse: { type: Boolean, default: false },
    canDistribute: { type: Boolean, default: false },
    canSublicense: { type: Boolean, default: false }
  },
  restrictions: { type: String },
  validFrom: { type: Date },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  isRevoked: { type: Boolean, default: false },
  version: { type: Number, default: 1 }
}, { timestamps: true });
```

---

## 5. `purchase.model.js` (`Purchase`)

```javascript
const purchaseSchema = new mongoose.Schema({
  purchaseId: { type: Number, unique: true, required: true, index: true },
  datasetId: { type: Number, required: true, index: true },
  licenseId: { type: Number, required: true, index: true },
  buyerAddress: { type: String, required: true, lowercase: true, index: true },
  sellerAddress: { type: String, required: true, lowercase: true },
  pricePaid: { type: String, required: true },
  feePaid: { type: String, required: true },
  creatorShare: { type: String, required: true },
  txHash: { type: String, unique: true },
  blockNumber: { type: Number },
  purchasedAt: { type: Date },
  validUntil: { type: Date }
}, { timestamps: true });
```

---

## 6. `transaction.model.js` (`Transaction`) & `indexer-state.model.js` (`IndexerState`)

- **`Transaction`**: Tracks `txHash`, `from`, `to`, `value`, `type` (`TOKEN_TRANSFER`, `DATASET_REGISTRATION`, `LICENSE_CREATION`, `PURCHASE`, `ROYALTY_PAYOUT`), and status (`PENDING`, `CONFIRMED`, `FAILED`).
- **`IndexerState`**: Tracks `indexerName` (e.g. `purchase-event-indexer`) and `lastProcessedBlock` for reliable crash recovery.
