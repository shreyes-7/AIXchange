# AIXchange Database Architecture (`database/`)

The **AIXchange Database Layer** provides document persistence, query acceleration, user session tracking, and off-chain metadata caching using **MongoDB** and the **Mongoose ODM (v9)**.

---

## Table of Contents

1. [Architectural Role](#architectural-role)
2. [Database Technology & Configuration](#database-technology--configuration)
3. [Mongoose Model Catalog](#mongoose-model-catalog)
4. [Ecosystem Seeder Script (`seed:demo`)](#ecosystem-seeder-script-seeddemo)
5. [Database Operations & Maintenance](#database-operations--maintenance)
6. [Troubleshooting & Connection Issues](#troubleshooting--connection-issues)

---

## Architectural Role

While Ethereum smart contracts maintain immutable ownership rights, license terms, and financial settlements, storing rich text, dataset descriptions, training logs, and user profiles directly on-chain is cost-prohibitive.

MongoDB serves as the **high-speed queryable state layer**:

1. **Indexer Projections**: Background workers in `server/src/jobs/` ingest on-chain events and project them into MongoDB collections for sub-second marketplace search, filtering, and sorting.
2. **User Identity & Security**: Manages user profiles, bcrypt password hashes, EIP-191 wallet verification nonces, and JWT refresh tokens.
3. **Training & Metrics Telemetry**: Tracks AI sandbox execution states, epoch-by-epoch loss metrics, and stdout logs.
4. **Lineage DAG Caching**: Caches provenance parent-child node relationships to render interactive React lineage trees instantly.

---

## Database Technology & Configuration

- **Database Engine**: MongoDB Community Server (`>=6.0` or `>=7.0`) or MongoDB Atlas
- **Object Data Modeling (ODM)**: Mongoose `^9.7.4`
- **Default Database Name**: `aixchange`
- **Default Connection String**: `mongodb://localhost:27017/aixchange`
- **Environment Variable**: `MONGODB_URI` (configured in `server/.env`)

---

## Mongoose Model Catalog

All active schemas reside in `server/src/models/`:

| Collection / Model | File | Purpose |
| :--- | :--- | :--- |
| `User` | `user.model.js` | User profiles, bcrypt password hashes, roles, and linked wallet addresses |
| `Dataset` | `dataset.model.js` | Cached dataset catalog records, IPFS CIDs, metadata, tags, and ownership |
| `Model` | `model.model.js` | Machine learning model metadata, SHA-256 weight digests, and parameter counts |
| `Provenance` | `provenance.model.js` | Lineage DAG records linking datasets, training configs, and model digests |
| `License` | `license.model.js` | Issued commercial/research licenses, validity windows, and terms |
| `Purchase` | `purchase.model.js` | Off-chain mirrors of on-chain `PurchaseCompleted` events and token sums |
| `RoyaltyDistribution`| `royalty-distribution.model.js` | Secondary market royalty payouts, recipient breakdown, and fee logs |
| `Sandbox` | `sandbox.model.js` | Container training runs, execution status, and resource limits |
| `SandboxFile` | `sandbox-file.model.js` | Staged training files, code scripts, and input datasets |
| `InferenceCall` | `inference-call.model.js` | Inference playground telemetry, input shapes, and latency metrics |
| `BlockchainEvent` | `blockchain-event.model.js` | Raw event log audit trail ensuring idempotent worker processing |
| `BlockchainGasTx` | `blockchain-gas-tx.model.js` | Gas consumption telemetry aggregated for analytics charts |
| `FraudFlag` | `fraud-flag.model.js` | Suspicious activity flags raised by the deterministic monitoring engine |
| `ModerationAudit` | `moderation-audit.model.js` | Admin actions, user bans, and asset delisting logs |
| `Report` | `report.model.js` | User-submitted content reports and dispute tickets |
| `Session` | `session.model.js` | Active user sessions and device telemetry |
| `IndexerState` | `indexer-state.model.js` | Cursor recording the last processed block height for each contract |

---

## Ecosystem Seeder Script (`seed:demo`)

To populate the local MongoDB database with realistic sample datasets, machine learning models, and provenance records for demonstration:

```powershell
# Working Directory: D:\AIXchange (Workspace Root)
npm run seed:demo
```

Under the hood, this executes `scripts/seed-demo-ecosystem.mjs` and creates:
- 5 Verified Training Datasets (Computer Vision, NLP, Tabular, Audio, Multimodal)
- 3 Verified Model Weights (Safetensors) with SHA-256 digests
- 1 Multi-node Provenance Lineage DAG
- Demo research and creator user accounts

---

## Database Operations & Maintenance

### Starting MongoDB Locally

On Windows (installed as a Windows Service):
```powershell
Start-Service -Name MongoDB
```

Check service status:
```powershell
Get-Service -Name MongoDB
```

### Resetting the Local Database

If you wish to wipe test data and reseed from scratch:

```powershell
# In mongosh (MongoDB Shell):
mongosh "mongodb://localhost:27017/aixchange" --eval "db.dropDatabase()"

# Reseed demonstration assets:
npm run seed:demo
```

---

## Troubleshooting & Connection Issues

### Issue: "MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017"
- **Cause**: MongoDB is not running on your machine.
- **Fix**: Launch the service via PowerShell (`Start-Service MongoDB`) or launch `mongod.exe` manually.

### Issue: "Authentication failed on MongoDB Atlas"
- **Cause**: Special characters in the MongoDB Atlas password were not URL-encoded.
- **Fix**: Ensure characters like `@`, `:`, or `/` in your Atlas password are percent-encoded in `MONGODB_URI`.
