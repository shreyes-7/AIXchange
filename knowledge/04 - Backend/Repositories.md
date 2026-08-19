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
