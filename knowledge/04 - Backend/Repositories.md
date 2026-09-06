# Repositories

## Overview

Repositories in `server/src/repositories/` isolate direct database queries and mutations from the Service layer, providing an abstraction layer over Mongoose models.

---

## Implemented Repositories

### 1. `user.repository.js`
- `findById(id)`: Look up user by MongoDB ObjectId.
- `findByEmail(email)`: Case-insensitive email lookup.
- `findByUsername(username)`: Username lookup.
- `findByWalletAddress(address)`: Lowercase wallet address lookup.
- `create(userData)`: Insert new user record.
- `update(id, updateData)`: Update user document.
- `updateNonce(id, nonce)`: Refresh wallet challenge nonce.

### 2. `session.repository.js`
- `createSession(userId, token, meta)`: Insert new active session record.
- `findValidSession(userId, token)`: Validate session existence and expiration.
- `invalidateSession(token)`: Soft-delete session by setting `isValid: false`.
- `invalidateAllUserSessions(userId)`: Revoke all active sessions for a user.

### 3. `license.repository.js`
- `findByLicenseId(licenseId)`: Find license by on-chain integer ID.
- `findByAssetId(assetId)`: Fetch all licenses associated with a dataset.
- `upsertLicense(licenseData)`: Insert or update license synchronized by the event indexer.
- `revokeLicense(licenseId)`: Set `isRevoked: true` and `isActive: false`.

### 4. `purchase.repository.js`
- `createPurchase(purchaseData)`: Insert new purchase record.
- `findByPurchaseId(purchaseId)`: Query specific purchase receipt.
- `findByBuyer(buyerAddress)`: Query buyer purchase history.
- `hasActiveAccess(buyerAddress, datasetId, licenseId)`: Check if an unexpired, active purchase exists.

### 5. `transaction.repository.js`
- `createTransaction(txData)`: Record on-chain transaction.
- `findByHash(txHash)`: Look up transaction status.
- `updateStatus(txHash, status, blockNumber)`: Update transaction confirmation.

### 6. `indexer-state.repository.js`
- `getLastProcessedBlock(indexerName)`: Query starting block for indexer sync.
- `updateLastProcessedBlock(indexerName, blockNumber)`: Save checkpoint block.

### 7. `model.repository.js` (Phase 8)
- `list(filter, options)`: Queries models with safe pagination, sorting, and public projections.
- `findById(id)`: Fetches model document by MongoDB ObjectId.
- `findByBlockchainId(modelId)`: Fetches model by on-chain integer ID.
- `saveConfirmed(modelId, payload)`: Atomically updates model state to `CONFIRMED` upon blockchain receipt verification.
- `addVersion(modelId, versionData)`: Pushes new version entry, updates currentVersion counter, and records model SHA-256 weight hash.
- `updateStatus(modelId, active)`: Toggles active status.
- `updateOwnership(modelId, newOwner)`: Updates model owner wallet address.

### 8. `provenance.repository.js` (Phase 9)
- `findByProvenanceId(provenanceId)`: Queries provenance record strictly by on-chain integer identifier.
- `findByMongoId(id)`: Queries provenance record strictly by MongoDB ObjectId.
- `findByKey(datasetId, executionId, modelId, modelVersion)`: Queries atomic lineage combination.
- `listByDataset(datasetId, options)`: Returns paginated provenance records derived from a dataset.
- `listByExecution(executionId, options)`: Returns paginated records for a training execution run.
- `listByModel(modelId, options)`: Returns paginated records associated with a model.
- `listByModelVersion(modelId, modelVersion, options)`: Returns records for a specific version.
- `createOrUpsertProjection(data)`: Idempotently upserts provenance projection document keyed by `provenanceId` or unique lineage key.
- `updateStatus(provenanceId, active, extra)`: Updates active flag and records transaction receipt metadata.

### 9. `royalty.repository.js` (Phase 10)
- `findByDistributionId(distributionId)`: Queries distribution by on-chain uint256-scale string identifier.
- `findByMongoId(id)`: Queries distribution by MongoDB ObjectId.
- `findBySource(sourceType, sourceId)`: Queries distribution for a given source entity.
- `list(filter, options)`: Queries paginated distributions with safe sorting and whitelist filtering.
- `upsertDistributionCreated(data)`: Idempotently creates distribution record on `DistributionCreated` event.
- `recordRecipientPaid(distributionId, paymentData)`: Idempotently appends recipient allocation to embedded array without duplicating records.
- `recordTreasuryPaid(distributionId, paymentData)`: Updates treasury amount and fee recipient in distribution record.
- `recordDistributionCompleted(distributionId, completionData)`: Sets status to `DISTRIBUTED`, marks tx `CONFIRMED`, and records completion timestamp.
- `markReconciled(distributionId, reconcileData)`: Updates `reconciled = true` and persists audit timestamp upon successful on-chain cross-check.
- `getSummary(options)`: Computes platform-wide financial aggregates using BigInt string math.
- `getReports(options)`: Multi-dimensional aggregations grouped by recipient, source, or time bucket.

