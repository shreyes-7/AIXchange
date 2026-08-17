# AIXchange Blockchain Layer

The **AIXchange Blockchain Module** is the decentralized trust layer of the AIXchange platform, built using **Solidity ^0.8.28**, **Hardhat**, **OpenZeppelin Contracts**, and **Ethers.js**.

It provides immutable asset ownership records, automated token economy operations, vault security, decentralized marketplace clearing, verifiable dataset provenance, flexible AI licensing, and atomic purchase settlement.

---

## 🚀 Completed Phases

### Phase 3 – AIX Token Economy
- **`AIXToken.sol` (`contracts/tokens/AIXToken.sol`)**: ERC-20 utility token ("AIXchange Token" / "AIX", 18 decimals, 1 Billion initial supply, burnable, owner minting).
- **`Treasury.sol` (`contracts/governance/Treasury.sol`)**: Secure vault for holding platform AIX tokens and native ETH.
- **Interfaces & Libraries**: `IAIXToken.sol`, `ITreasury.sol`, `Errors.sol`, `Events.sol`, `Structs.sol`.

### Phase 4 – Dataset Marketplace Registry
- **`DatasetRegistry.sol` (`contracts/registry/DatasetRegistry.sol`)**:
  - **Storage Model**: Stores verifiable dataset metadata on-chain (`datasetId`, `owner`, `cid`, `license`, `royalty` in basis points 0-10000, `createdAt`, `active`). Raw payloads remain off-chain on IPFS/Pinata.
  - **Registration & Lookups**: Auto-incrementing IDs, `msg.sender` derived ownership, `getDataset(id)`, `getDatasetOwner(id)`, `getDatasetsByOwner(owner)`, `getTotalDatasets()`.
  - **Management**: Owner-restricted metadata updates (`updateDataset`), status toggle (`setDatasetStatus`), and index-preserving ownership transfers (`transferDatasetOwnership`).

### Phase 5 – Licensing System
- **`LicenseRegistry.sol` (`contracts/licensing/LicenseRegistry.sol`)**:
  - **License Types**: `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`.
  - **Pricing Models**: `FIXED` (in AIX token units), `ROYALTY` (basis points 0–10000).
  - **Asset Integration & Authorization**: Validates asset ownership with `DatasetRegistry`. Only the verified asset owner can create, update, or revoke licenses for that asset.
  - **Rights & Restrictions**: Explicit permissions struct (`canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, `canSublicense`) and restriction descriptions.
  - **Lifecycle & Validity**: Start (`validFrom`) and expiration (`validUntil`) timestamps, `isLicenseActive(licenseId)`, and revocation management.

### Phase 6 – Purchase Engine (Current)
- **`PurchaseEngine.sol` (`contracts/marketplace/PurchaseEngine.sol`)**:
  - **Purchase Execution**: Converts active license terms into atomic purchases using `purchaseDataset(datasetId, licenseId)`.
  - **Authoritative On-Chain Pricing**: Pulls authoritative price directly from `LicenseRegistry.getLicensePricing(licenseId)`.
  - **Settlement & Fee Splitting**: Routes platform fees (e.g. 2.50% / 250 BPS) to `Treasury` and remaining amount to dataset licensor using `AIXToken.safeTransferFrom`.
  - **Entitlement & Access Tracking**: Records immutable buyer entitlement (`hasAccess(buyer, datasetId, licenseId)`) without transferring underlying dataset ownership.
  - **Exclusivity Enforcement**: Automatically locks `EXCLUSIVE` licenses upon first purchase (`isExclusiveLicenseSold`).
  - **Duplicate Prevention**: Reverts redundant purchases of active unexpired licenses.
  - **Security**: Built with OpenZeppelin `ReentrancyGuard`, `Pausable`, and checks-effects-interactions.
- **`IPurchaseEngine.sol` (`contracts/interfaces/IPurchaseEngine.sol`)**: Comprehensive interface definition.

---

## 🛠️ Project Structure

```text
blockchain/
├── contracts/
│   ├── governance/
│   │   └── Treasury.sol
│   ├── interfaces/
│   │   ├── IAIXToken.sol
│   │   ├── IDatasetRegistry.sol
│   │   ├── ILicenseRegistry.sol
│   │   ├── IMarketplace.sol
│   │   ├── IModelRegistry.sol
│   │   ├── IPurchaseEngine.sol
│   │   ├── IRoyaltyEngine.sol
│   │   └── ITreasury.sol
│   ├── libraries/
│   │   ├── Errors.sol
│   │   ├── Events.sol
│   │   └── Structs.sol
│   ├── licensing/
│   │   └── LicenseRegistry.sol
│   ├── marketplace/
│   │   ├── Marketplace.sol
│   │   └── PurchaseEngine.sol
│   ├── registry/
│   │   ├── DatasetRegistry.sol
│   │   └── ModelRegistry.sol
│   ├── royalty/
│   │   └── RoyaltyEngine.sol
│   ├── tokens/
│   │   └── AIXToken.sol
│   └── utils/
│       └── AccessControl.sol
├── ignition/
│   └── modules/
│       ├── AIXToken.js
│       ├── Treasury.js
│       ├── Phase3.js
│       ├── DatasetRegistry.js
│       ├── Phase4.js
│       ├── LicenseRegistry.js
│       ├── Phase5.js
│       ├── PurchaseEngine.js
│       └── Phase6.js
├── scripts/
│   ├── deploy.js
│   ├── deployDatasetRegistry.js
│   ├── deployLicenseRegistry.js
│   ├── deployPurchaseEngine.js
│   ├── mint.js
│   ├── balance.js
│   └── transfer.js
├── test/
│   ├── governance/
│   │   └── Treasury.test.js
│   ├── licensing/
│   │   └── LicenseRegistry.test.js
│   ├── marketplace/
│   │   └── PurchaseEngine.test.js
│   ├── registry/
│   │   └── DatasetRegistry.test.js
│   └── tokens/
│       └── AIXToken.test.js
├── hardhat.config.js
├── README.md
├── architecture.md
└── package.json
```

---

## 💻 Commands & Execution

### 1. Compile Smart Contracts
```bash
npx hardhat compile
```

### 2. Run Automated Test Suite
```bash
npx hardhat test
```
*Executes all 115 unit tests across Treasury, AIXToken, DatasetRegistry, LicenseRegistry, and PurchaseEngine.*

### 3. Deploy Contracts (Local Network)
```bash
# Deploy PurchaseEngine (and dependencies if not configured)
npx hardhat run scripts/deployPurchaseEngine.js --network localhost

# Deploy via Hardhat Ignition Master Module (Phases 3, 4, 5, 6)
npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost
```

---

## 🔒 Security & Architecture Model

```text
                    Buyer
                      │
                      │ approve(PurchaseEngine, price)
                      ▼
               PurchaseEngine.sol
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
 DatasetRegistry  LicenseRegistry AIXToken (safeTransferFrom)
  [Valid, Active] [Valid, Active]   ├── Platform Fee (2.5%) ──► Treasury.sol
                                    └── Creator Payout (97.5%) ─► Licensor Address
                      │
                      ▼
                PurchaseRecord
                      │
             ┌────────┴────────┐
             ▼                 ▼
     Access Entitlement   Events Emitted
   hasAccess(buyer,...)   ├── DatasetPurchased
                          └── RoyaltyTriggered ──► Backend Indexer & Phase 10
```

- **Separation of Concerns**:
  - `DatasetRegistry`: Dataset identity, ownership, and CID references.
  - `LicenseRegistry`: Commercial and legal terms definition.
  - `PurchaseEngine`: Atomic payment settlement, fee routing, access grants, and exclusivity enforcement.
  - `Treasury`: Platform fee vault.
- **Zero Secret Leakage**: Private keys, database credentials, and raw dataset files are never stored on-chain.

---

## 📄 License

Developed as part of the **AIXchange** project. All rights reserved.