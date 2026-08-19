# Licensing System

## Overview

The **Licensing System** in AIXchange manages on-chain intellectual property rights, commercial usage terms, pricing models, and access permissions for assets published on the platform.

Implemented in [[Blockchain Architecture|LicenseRegistry.sol]], the licensing system decouples asset ownership from usage permissions, allowing creators to monetize their datasets and models through multiple concurrent or exclusive licensing options.

---

## 1. Core Data Structures (`Structs.sol`)

### License Types
- `ACADEMIC`: Restricted to non-commercial research, educational institutions, and non-profit benchmarking.
- `COMMERCIAL`: Permits revenue-generating applications, commercial inference, and production fine-tuning.
- `EXCLUSIVE`: Restricts license usage to a single buyer. Upon purchase, the license is locked on-chain.
- `CUSTOM`: Bespoke terms defining unique constraints and permissions.

### Pricing Models
- `FIXED`: One-time fixed price denominated in native ERC-20 [[Token Economy|AIXToken]] wei units.
- `ROYALTY`: Recurring or derivative percentage fee defined in basis points (0–10000 BPS, where `1000 = 10.00%`).

### Granular License Rights (`LicenseRights`)
```solidity
struct LicenseRights {
    bool canView;           // Permission to preview/inspect metadata and samples
    bool canDownload;       // Permission to download raw payload from IPFS
    bool canModify;         // Permission to augment, clean, or alter the dataset
    bool canTrain;          // Permission to train ML/AI models on the dataset
    bool canInfer;          // Permission to run inference against the dataset/model
    bool canCommercialUse;  // Permission for commercial deployment
    bool canDistribute;     // Permission to redistribute dataset derivative copies
    bool canSublicense;     // Permission to issue sublicenses to third parties
}
```

---

## 2. On-Chain Registry Operations (`LicenseRegistry.sol`)

- **Asset Ownership Verification**:
  When creating a license for an asset (`assetId`), `LicenseRegistry` queries `IDatasetRegistry(datasetRegistry).getDatasetOwner(assetId)`. Only the verified asset owner can issue licenses.
- **Validity & Expiration**:
  Licenses include `validFrom` and `validUntil` timestamps. Function `isLicenseActive(licenseId)` verifies:
  $$\text{isActive} = \text{true} \land \neg\text{isRevoked} \land (\text{validFrom} \le \text{block.timestamp} \le \text{validUntil})$$
- **Revocation**:
  The asset licensor can invoke `revokeLicense(licenseId)` to immediately deactivate the license, preventing any future purchases.
- **Versioning**:
  Licensors can update price, metadata URI, and rights parameters via `updateLicense()`, which increments the internal `version` counter and emits `LicenseUpdated`.

---

## 3. Backend Integration & Synchronization

- **Event Indexer (`jobs/license-event-indexer.js`)**:
  Listens for smart contract events:
  - `LicenseCreated(licenseId, assetId, licensor, licenseType, pricingModel, ...)`
  - `LicenseUpdated(licenseId, version, ...)`
  - `LicenseRevoked(licenseId, licensor)`
  Automatically syncs changes to the MongoDB `licenses` collection.
- **API Endpoints (`routes/license.route.js`)**:
  - `GET /api/v1/licenses/asset/:assetId`: Fetch all active licenses for a given dataset.
  - `GET /api/v1/licenses/:id`: Fetch specific license terms and rights.
  - `POST /api/v1/licenses`: Index newly created license.
  - `POST /api/v1/licenses/:id/revoke`: Record license revocation.
