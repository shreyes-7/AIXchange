# Application Flow

This document maps out the core data and transaction execution flows implemented across the AIXchange platform.

---

## 1. Web3 Wallet Authentication Flow

```
[User Browser]                      [Express Server]                    [MongoDB]
      │                                     │                                │
      ├── 1. Request Nonce (Address) ──────>│                                │
      │                                     ├── 2. Generate Nonce & User ───>│
      │                                     │<── 3. Return Nonce Document ───│
      │<── 4. Return Nonce String ──────────┤                                │
      │                                     │                                │
      ├── 5. Sign Message via MetaMask      │                                │
      │   (EIP-191 personal_sign)           │                                │
      │                                     │                                │
      ├── 6. Submit Signature & Address ───>│                                │
      │                                     ├── 7. ethers.verifyMessage()    │
      │                                     ├── 8. Check Address Match       │
      │                                     ├── 9. Issue JWT Token & Session>│
      │<── 10. Return JWT & User Object ────┤                                │
```

1. **Nonce Request**: Frontend queries `GET /api/v1/auth/wallet/nonce?address=0x...`.
2. **Nonce Generation**: Server generates a cryptographically random nonce and associates it with the wallet in MongoDB (`user.model.js`).
3. **User Signature**: User signs the challenge message in MetaMask via `signer.signMessage()`.
4. **Signature Verification**: Server verifies the signer address using `ethers.verifyMessage()` in `wallet.service.js`.
5. **Session Creation**: Server creates an active session and returns a signed JWT access token.

---

## 2. Dataset Publishing & On-Chain Registration Flow

```
[Creator / Client]               [IPFS / Gateway]               [DatasetRegistry.sol]
        │                               │                                │
        ├── 1. Upload Dataset File ────>│                                │
        │<── 2. Return IPFS CID ────────┤                                │
        │                                                                │
        ├── 3. Send registerDataset(cid, name, desc, metadataUri, ...) ─>│
        │                                                                ├── 4. Validate CID & Royalty BPS
        │                                                                ├── 5. Auto-increment datasetId
        │                                                                ├── 6. Assign Owner & State
        │                                                                ├── 7. Emit DatasetRegistered
        │<── 8. Transaction Receipt (datasetId) ─────────────────────────┤
```

1. **File Storage**: Dataset file is uploaded to IPFS to obtain a permanent, immutable Content Identifier (CID).
2. **Transaction Dispatch**: Creator calls `DatasetRegistry.registerDataset()` via MetaMask.
3. **On-Chain State**: Smart contract assigns the next auto-incremented integer `datasetId`, maps creator address as owner, stores IPFS CID, and emits the `DatasetRegistered` event.
4. **Local Indexing**: Frontend records the transaction receipt and transitions the multi-stage submission modal to `CONFIRMED`.

---

## 3. Dataset Purchase & Settlement Flow

```
[Buyer / Client]           [AIXToken.sol]       [PurchaseEngine.sol]     [Treasury.sol]     [Dataset Licensor]
       │                          │                     │                       │                   │
       ├── 1. approve(engine, price) ─>│                │                       │                   │
       │                                                │                       │                   │
       ├── 2. purchaseDataset(datasetId, licenseId) ───>│                       │                   │
       │                                                ├── 3. Verify Active & Ownership            │
       │                                                ├── 4. Query License Pricing                │
       │                                                ├── 5. Deduct Fee (2.50%) ─>│                   │
       │                          │<── 6. safeTransferFrom(buyer, treasury, fee) ───│                   │
       │                          │<── 7. safeTransferFrom(buyer, creator, net) ───────────────────────>│
       │                                                ├── 8. Store PurchaseRecord │                   │
       │                                                ├── 9. Grant Entitlement    │                   │
       │                                                ├── 10. Lock Exclusivity (if EXCLUSIVE)         │
       │                                                ├── 11. Emit DatasetPurchased & RoyaltyTriggered
       │<── 12. Purchase Receipt ───────────────────────┤                       │                   │
```

1. **Token Approval**: Buyer calls `AIXToken.approve(purchaseEngineAddress, licensePrice)` to permit token transfer.
2. **Purchase Invocation**: Buyer executes `PurchaseEngine.purchaseDataset(datasetId, licenseId)`.
3. **Authoritative Checks**: Engine verifies:
   - `DatasetRegistry.getDataset(datasetId)` is active.
   - `LicenseRegistry.getLicense(licenseId)` belongs to the dataset and is valid/unexpired.
   - License has not already been purchased exclusively by another buyer.
   - Buyer is not the dataset creator (no self-purchase).
4. **Atomic Payments**:
   - Platform fee (e.g. 2.50% / 250 BPS) is sent to `Treasury.sol`.
   - Remaining creator share (e.g. 97.50%) is sent to the licensor.
5. **Entitlement Recording**: Engine saves `_purchases[purchaseId]` and updates `_accessEntitlements[buyer][datasetId][licenseId] = true`.
6. **Event Triggering**: Contract emits `DatasetPurchased` and `RoyaltyTriggered` for backend indexers.
