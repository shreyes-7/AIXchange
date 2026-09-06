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

---

## 7. `sandbox.model.js` (`Sandbox`)

```javascript
const sandboxSchema = new mongoose.Schema({
  sandboxId: { type: String, required: true, unique: true, index: true },
  executionId: { type: String, unique: true, sparse: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  datasetId: { type: Number, required: true, index: true },
  licenseId: { type: Number, required: true, index: true },
  datasetRef: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset", default: null },
  status: {
    type: String,
    enum: ["CREATING", "READY", "RUNNING", "COMPLETED", "FAILED", "CANCELLED", "TIMEOUT"],
    default: "CREATING",
    required: true,
    index: true,
  },
  trainingConfig: { type: trainingConfigSchema, default: null },
  files: [{ fileId, originalName, storedName, mimeType, sizeBytes, category, checksum, storagePath }],
  metrics: { currentEpoch, totalEpochs, bestValLoss, bestValAccuracy, history: [...] },
  artifact: { artifactPath, metadataPath, summaryPath, artifactHash, modelMetadata, validated },
  jupyter: { active, port, url, startedAt, stoppedAt },
  failureReason: { type: String, default: null },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  lastSyncedAt: { type: Date, default: null },
}, { timestamps: true });
```

---

## 8. `sandbox-file.model.js` (`SandboxFile`)

```javascript
const sandboxFileSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true, index: true },
  sandboxId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, default: "application/octet-stream" },
  sizeBytes: { type: Number, required: true },
  storagePath: { type: String, required: true },
  checksum: { type: String, required: true }, // SHA-256
  category: { type: String, enum: ["code", "data", "config", "notebook", "other"], default: "other" },
}, { timestamps: true });
```

---

## 9. `execution-event.model.js` (`ExecutionEvent`)

```javascript
const executionEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  sandboxId: { type: String, required: true, index: true },
  executionId: { type: String, default: null, index: true },
  eventType: {
    type: String,
    required: true,
    enum: ["CREATED", "FILE_UPLOADED", "FILE_DELETED", "TRAINING_STARTED", "STATUS_SYNC", "METRICS_UPDATED", "COMPLETED", "FAILED", "CANCELLED", "TIMEOUT", "JUPYTER_STARTED", "JUPYTER_STOPPED"],
    index: true,
  },
  message: { type: String, default: "" },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });## 7. `model.model.js` (`Model`) — Phase 8

```javascript
const modelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, index: true },
  ownerAddress: { type: String, required: true, lowercase: true, index: true },
  description: { type: String, trim: true, default: "" },
  framework: { type: String, default: "pytorch" },
  blockchainModelId: { type: Number, index: true, sparse: true },
  currentVersion: { type: Number, default: 1 },
  active: { type: Boolean, default: true, index: true },
  versions: [{
    version: { type: Number, required: true },
    metadataURI: { type: String, required: true },
    modelHash: { type: String, required: true },
    releasedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
```

---

## 8. `provenance.model.js` (`Provenance`) — Phase 9

```javascript
const provenanceSchema = new mongoose.Schema({
  provenanceId: { type: Number, unique: true, sparse: true, index: true },
  datasetId: { type: Number, required: true, index: true },
  modelId: { type: Number, required: true, index: true },
  modelVersion: { type: Number, required: true, min: 1 },
  executionId: { type: String, required: true, trim: true, index: true },
  metadataHash: { type: String, required: true, lowercase: true },
  registrant: { type: String, required: true, lowercase: true, index: true },
  createdAtTimestamp: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
  blockchain: {
    chainId: { type: Number, required: true },
    contractAddress: { type: String, required: true, lowercase: true },
    transactionHash: { type: String, required: true, lowercase: true },
    blockNumber: { type: Number, index: true },
    transactionIndex: { type: Number, default: 0 },
    logIndex: { type: Number, required: true },
    eventIdentity: { type: String, unique: true, sparse: true, index: true },
    state: { type: String, enum: ["CONFIRMED", "PENDING", "FAILED"], default: "CONFIRMED" },
  },
  indexedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound unique lineage index
provenanceSchema.index(
  { datasetId: 1, executionId: 1, modelId: 1, modelVersion: 1 },
  { unique: true }
);
```

