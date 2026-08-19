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
