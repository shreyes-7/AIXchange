# Controllers

## Overview

Controllers in `server/src/controllers/` process validated HTTP requests, invoke business logic in the Service layer, and return standardized JSON responses using the `ApiResponse` utility.

---

## Implemented Controllers

### 1. `auth.controller.js`
- `register(req, res, next)`: Calls `authService.register()`, returns status `201 Created` with new user record and JWT token.
- `login(req, res, next)`: Calls `authService.login()`, returns `200 OK` with session token.
- `logout(req, res, next)`: Calls `authService.logout()`, invalidates session token.
- `getMe(req, res, next)`: Returns authenticated user profile.
- `changePassword(req, res, next)`: Verifies current password and updates hash.
- `refreshToken(req, res, next)`: Re-issues access token from valid refresh token.

### 2. `wallet.controller.js`
- `getNonce(req, res, next)`: Queries `walletService.getNonce(address)`, returns challenge string.
- `verifyWallet(req, res, next)`: Invokes `walletService.verifySignature(address, signature)`, returns JWT token upon successful signature recovery.
- `connectWallet(req, res, next)`: Links authenticated user account with a verified wallet address.

### 3. `dataset.controller.js`
- `getDatasets(req, res, next)`: Parses pagination/filter parameters and calls `datasetService.getDatasets()`.
- `getFeaturedDatasets(req, res, next)`: Queries highest-rated or trending datasets.
- `getDatasetById(req, res, next)`: Queries dataset and increments view counter.
- `createDataset(req, res, next)`: Creates off-chain dataset document linked to on-chain `datasetId`.
- `updateDataset(req, res, next)`: Verifies caller ownership and updates metadata.
- `deleteDataset(req, res, next)`: Soft-deletes dataset.

### 4. `license.controller.js`
- `getLicensesByAsset(req, res, next)`: Returns all licenses created for a dataset.
- `getLicenseById(req, res, next)`: Returns specific license terms and permissions.
- `createLicense(req, res, next)`: Verifies ownership and indexes newly created on-chain license.
- `revokeLicense(req, res, next)`: Updates license status to revoked.

### 5. `purchase.controller.js`
- `recordPurchase(req, res, next)`: Records purchase transaction receipt from `PurchaseEngine.sol`.
- `getMyPurchases(req, res, next)`: Returns all purchase records for the authenticated buyer.
- `getReceipt(req, res, next)`: Retrieves itemized purchase receipt.
- `checkAccess(req, res, next)`: Calls `accessControlService.hasAccess(user, datasetId)`.

### 6. `token.controller.js`
- `getTokenStats(req, res, next)`: Returns total supply, circulating supply, and decimals.
- `getBalance(req, res, next)`: Fetches token balance for given address.
- `requestFaucet(req, res, next)`: Dispatches test AIX tokens in local dev mode.

### 7. `model.controller.js` (Phase 8)
- `create(req, res, next)`: Prepares model registration calldata or synchronizes transaction.
- `sync(req, res, next)`: Verifies and synchronizes broadcasted model transaction on-chain.
- `list(req, res, next)`: Queries registered models with pagination, search, sorting, and tag filters.
- `get(req, res, next)`: Retrieves model by on-chain `blockchainModelId` or MongoDB ObjectId.
- `addVersion(req, res, next)`: Prepares calldata for new model version additions.
- `getVersion(req, res, next)`: Retrieves version details.
- `verifyHash(req, res, next)`: Verifies SHA-256 model weights hash on-chain.
- `setStatus(req, res, next)`: Prepares calldata for model activation/deactivation.
- `transferOwnership(req, res, next)`: Prepares ownership transfer calldata.
- `infer(req, res, next)`: Proxies inference requests to AI execution substrate after validating access.

### 8. `provenance.controller.js` (Phase 9)
- `create(req, res, next)`: Prepares provenance registration calldata (`to`, `data`, `gasLimit`).
- `sync(req, res, next)`: Confirms transaction receipt and updates MongoDB lineage projection.
- `get(req, res, next)`: Retrieves provenance record by on-chain ID or MongoDB ObjectId.
- `listByDataset(req, res, next)`: Returns all models/runs derived from a dataset.
- `listByExecution(req, res, next)`: Returns provenance records associated with a training run.
- `listByModel(req, res, next)`: Returns all provenance records for a model.
- `listByModelVersion(req, res, next)`: Returns lineage records for a specific version.
- `getGraph(req, res, next)`: Constructs DAG lineage graph (nodes & edges) preserving multi-dataset links.
- `getTimeline(req, res, next)`: Generates chronological audit trail combining on-chain and sandbox events.
- `verify(req, res, next)`: Performs cryptographic on-chain verification via `ProvenanceRegistry.sol`.
- `verifyHash(req, res, next)`: Performs on-chain metadata hash verification.
- `setStatus(req, res, next)`: Prepares calldata for provenance deprecation/revocation.
