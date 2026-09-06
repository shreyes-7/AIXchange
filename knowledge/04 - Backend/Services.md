# Services

## Overview

The Service layer in `server/src/services/` encapsulates core application business logic, cryptographic operations, blockchain interactions, and repository queries.

---

## Implemented Services

### 1. `auth.service.js`
- Handles user registration, duplicate email/username checking, password hashing with `bcryptjs`, password verification, JWT generation, and session lifecycle tracking via `session.repository.js`.

### 2. `wallet.service.js`
- `getNonce(address)`: Looks up or creates a user by wallet address and generates a secure random challenge nonce string (`nonce = uuidv4()`).
- `verifySignature(address, signature)`: Constructs the canonical challenge message `AIXchange Authentication Nonce: <nonce>` and invokes `ethers.verifyMessage()`. Confirms recovered signer matches the given address, refreshes the nonce to prevent replay attacks, and generates an authentication session.

### 3. `dataset.service.js`
- Coordinates dataset listing, searching, pagination, text indexing queries, tag aggregation, view count increments, and ownership validation against `user.repository.js`.

### 4. `license.service.js` & `licenseBlockchain.service.js`
- `license.service.js`: Manages database operations on the `licenses` collection, validity filters, and licensor authorization.
- `licenseBlockchain.service.js`: Direct Ethers.js integration with `LicenseRegistry.sol` to fetch on-chain license terms, verify active validity, and check caller permissions.

### 5. `purchase.service.js` & `purchaseBlockchain.service.js`
- `purchase.service.js`: Handles purchase recording, receipt generation, and transaction history updates.
- `purchaseBlockchain.service.js`: Queries `PurchaseEngine.sol` contract state to verify transaction receipts, check exclusivity locks, and validate `hasAccess(buyer, datasetId, licenseId)`.

### 6. `access-control.service.js`
- Validates user entitlement to view or download raw dataset payloads by cross-referencing dataset ownership and active `PurchaseRecord` validity.

### 7. `token.service.js`
- Interacts with `AIXToken.sol` to query token decimals, total supply, balances, and trigger local dev faucet distributions.

### 8. `download.service.js`
- Verifies authorization via `access-control.service.js` before generating signed URLs or streaming protected dataset payloads from IPFS gateways.

### 9. `sandbox.service.js`
- Coordinates sandbox lifecycle management, verifies dataset entitlement via Phase 6 `accessControl.authorize()`, validates state transitions, stages execution files, dispatches training configurations to the AI substrate, and manages Jupyter sessions.

### 10. `aiExecution.service.js`
- Dedicated HTTP client integration layer communicating with `python-services` via `SandboxClient` from `@aixchange/sandbox`. Handles request timeouts, structured error mapping (`502` on connection drops, `422` on schema rejections), model validation requests, and Jupyter controls.

### 11. `fileUpload.service.js`
- Manages Multer upload pipelines for sandbox training scripts, dataset inputs, and configs. Enforces size limits (`SANDBOX_MAX_FILE_BYTES`), MIME filtering, path traversal protection, SHA-256 checksum calculation, metadata persistence in `SandboxFile`, and workspace staging via `stageWorkspaceFiles()`.

### 12. `trainingLog.service.js`
- Retrieves live execution progress and history from the AI service contract, synthesizes human-readable epoch metric logs, and returns structured log responses.

### 13. `monitoring.service.js`
- Synchronizes sandbox execution states (`RUNNING` -> `COMPLETED`, `FAILED`, `TIMEOUT`), updates epoch metrics and best validation scores, records model artifact paths and SHA-256 hashes, and handles batch synchronization for active executions.

### 14. `model.service.js` & `modelBlockchain.service.js` (Phase 8)
- `model.service.js`: Manages off-chain model documents, version history, local artifact path containment guards, SHA-256 weight hash calculations, inference proxying to AI execution substrate, and resolution by on-chain ID or Mongo ID.
- `modelBlockchain.service.js`: Direct Ethers.js v6 interface with `ModelRegistry.sol`. Handles zero-custody transaction preparation (`prepareRegister`, `prepareAddVersion`, `prepareSetStatus`, `prepareTransferOwnership`), receipt validation, event log parsing, and on-chain hash verification (`verifyModelHash`).

### 15. `provenance.service.js` & `provenanceBlockchain.service.js` (Phase 9)
- `provenance.service.js`: Orchestrates dataset-to-model lineage tracking, DAG lineage graph construction (nodes for datasets, executions, models, and model versions; edges for `USED_IN`, `PRODUCED`, `HAS_VERSION`), chronological audit trail timeline synthesis, cryptographic verification against smart contracts, and graceful optional enrichment.
- `provenanceBlockchain.service.js`: Direct Ethers.js v6 interface with `ProvenanceRegistry.sol`. Handles transaction preparation (`prepareRegister`, `prepareSetStatus`), receipt confirmation, canonical timestamp normalization (`uint256 createdAt` to Date and timestamp), and on-chain verification queries (`verifyProvenance`, `verifyProvenanceHash`, `isProvenanceActive`).

