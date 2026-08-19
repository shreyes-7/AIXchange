# Purchase Engine

## Overview

The **Purchase Engine** is the core settlement and access entitlement module in AIXchange. Implemented in [[Blockchain Architecture|PurchaseEngine.sol]], it facilitates trustless, atomic payments using [[Token Economy|AIXToken]], automatically distributes platform fees and creator shares, enforces exclusivity locks, and provides on-chain access verification.

```text
                               PURCHASE ENGINE
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
 [ Atomic Payment ]          [ Fee Distribution ]         [ Access Verification ]
 - ERC-20 SafeERC20          - 2.50% to Treasury Vault    - hasAccess(buyer, id)
 - Price from License        - 97.50% to Asset Licensor   - Exclusivity Lock
 - Duplicate Purchase Check  - Configurable Rate Limit    - Prevents Self-Purchase
```

---

## 1. Settlement Mechanics & Rules

1. **Authoritative On-Chain Pricing**:
   `PurchaseEngine` reads the purchase price directly from `ILicenseRegistry(licenseRegistry).getLicensePricing(licenseId)`. Frontend or caller prices cannot be manipulated.
2. **Fee Calculation & Split**:
   - Platform fee is calculated using basis points:
     $$\text{fee} = \frac{\text{price} \times \text{platformFeeBps}}{10000}$$
     $$\text{creatorShare} = \text{price} - \text{fee}$$
   - Platform fee is routed to `ITreasury(treasury)`.
   - Creator share is routed to the dataset owner identified via `IDatasetRegistry(datasetRegistry).getDatasetOwner(datasetId)`.
3. **Exclusivity Enforcement**:
   If a license has type `EXCLUSIVE`, `PurchaseEngine` checks `_exclusiveLicensesSold[licenseId]`. The first buyer acquires the license, and subsequent purchase attempts by any other buyer are reverted with custom error `ExclusiveLicenseSold`.
4. **Duplicate Active Purchase Prevention**:
   If a buyer already holds an active, unexpired purchase for a license, duplicate purchase attempts are reverted with `AlreadyPurchased`.
5. **Self-Purchase Prevention**:
   Dataset creators cannot purchase their own datasets (`SelfPurchaseNotAllowed`).
6. **Access Entitlement Validation**:
   - Function `hasAccess(address buyer, uint256 datasetId, uint256 licenseId)` returns `true` if:
     - The caller is the dataset creator (natural access), OR
     - The caller has a valid purchase record, the license is active, and the license has not expired.

---

## 2. On-Chain State & Data Structures

```solidity
struct PurchaseRecord {
    uint256 id;
    uint256 datasetId;
    uint256 licenseId;
    address buyer;
    address licensor;
    uint256 price;
    uint256 platformFee;
    uint256 licensorShare;
    uint256 timestamp;
    uint256 validUntil;
    bool isActive;
}
```

---

## 3. Emitted Events for Off-Chain Indexing

- **`DatasetPurchased`**:
  ```solidity
  event DatasetPurchased(
      uint256 indexed purchaseId,
      uint256 indexed datasetId,
      address indexed buyer,
      uint256 licenseId,
      address licensor,
      uint256 price,
      uint256 platformFee,
      uint256 licensorShare,
      uint256 timestamp
  );
  ```
- **`RoyaltyTriggered`**:
  ```solidity
  event RoyaltyTriggered(
      uint256 indexed assetId,
      uint256 indexed licenseId,
      address indexed licensor,
      address buyer,
      uint256 royaltyAmount,
      uint256 timestamp
  );
  ```

---

## 4. Backend & API Services

- **Event Indexer (`jobs/purchase-event-indexer.js`)**:
  Listens for `DatasetPurchased` events, records transactions into the `purchases` and `transactions` MongoDB collections, and increments dataset `purchaseCount`.
- **API Endpoints (`routes/purchase.route.js`)**:
  - `POST /api/v1/purchases`: Record purchase transaction receipt.
  - `GET /api/v1/purchases/my-purchases`: Retrieve authenticated user's purchased datasets and licenses.
  - `GET /api/v1/purchases/receipt/:purchaseId`: Fetch full cryptographic purchase receipt.
  - `GET /api/v1/purchases/check-access/:datasetId`: Verify access entitlement.
