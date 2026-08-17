# AIXchange Blockchain Layer

The **AIXchange Blockchain Module** is the decentralized trust layer of the AIXchange platform, built using **Solidity ^0.8.28**, **Hardhat**, **OpenZeppelin Contracts**, and **Ethers.js**.

It provides immutable asset ownership records, automated token economy operations, vault security, decentralized marketplace clearing, verifiable dataset provenance, and flexible AI licensing.

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

### Phase 5 – Licensing System (Current)
- **`LicenseRegistry.sol` (`contracts/licensing/LicenseRegistry.sol`)**:
  - **License Types**: `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`.
  - **Pricing Models**:
    - `FIXED`: One-time fixed fee in AIX token units (wei).
    - `ROYALTY`: Percentage royalty rate represented in basis points (0–10000 BPS, where 1000 = 10.00%).
  - **Asset Integration & Authorization**: Verifies asset ownership against Phase 4 `DatasetRegistry.getDatasetOwner(assetId)`. Only the verified asset owner can create, update, or revoke licenses for that asset. Extensible for future Phase 8 `ModelRegistry`.
  - **Rights & Restrictions**: Explicit permissions struct (`canView`, `canDownload`, `canModify`, `canTrain`, `canInfer`, `canCommercialUse`, `canDistribute`, `canSublicense`) and restriction descriptions.
  - **Lifecycle & Validity**: Supports start (`validFrom`) and expiration (`validUntil`) timestamps. Provides dynamic `isLicenseActive(licenseId)` check and revocation management (`revokeLicense`, `setLicenseStatus`).
  - **Integration Hooks**:
    - **Phase 6 Purchase Engine Hook**: `getLicensePricing(licenseId)` returns `(pricingModel, fixedPrice, royaltyRate)`.
    - **Phase 10 Royalty Engine Hook**: `getLicensesByAsset(assetType, assetId)` and `getLicensesByLicensor(licensor)`.
- **`ILicenseRegistry.sol` (`contracts/interfaces/ILicenseRegistry.sol`)**: Comprehensive interface definition.

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
│   │   ├── IRoyaltyEngine.sol
│   │   └── ITreasury.sol
│   ├── libraries/
│   │   ├── Errors.sol
│   │   ├── Events.sol
│   │   └── Structs.sol
│   ├── licensing/
│   │   └── LicenseRegistry.sol
│   ├── marketplace/
│   │   └── Marketplace.sol
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
│       └── Phase5.js
├── scripts/
│   ├── deploy.js
│   ├── deployDatasetRegistry.js
│   ├── deployLicenseRegistry.js
│   ├── mint.js
│   ├── balance.js
│   └── transfer.js
├── test/
│   ├── governance/
│   │   └── Treasury.test.js
│   ├── licensing/
│   │   └── LicenseRegistry.test.js
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
*Executes all 85 unit tests across Treasury, AIXToken, DatasetRegistry, and LicenseRegistry.*

### 3. Deploy Contracts (Local Network)
```bash
# Deploy LicenseRegistry (and DatasetRegistry if not configured)
npx hardhat run scripts/deployLicenseRegistry.js --network localhost

# Deploy via Hardhat Ignition Master Module (Phases 3, 4, 5)
npx hardhat ignition deploy ignition/modules/Phase5.js --network localhost
```

---

## 🔒 Security & Architecture Model

```text
Dataset Owner / Licensor
         │
         ▼
LicenseRegistry.sol  ──────────►  DatasetRegistry.sol (Ownership Verification)
         │
  [Terms Stored On-Chain]
  - LicenseType: ACADEMIC | COMMERCIAL | EXCLUSIVE | CUSTOM
  - PricingModel: FIXED (AIX) | ROYALTY (BPS)
  - Rights & Restrictions
  - Validity Window (validFrom, validUntil)
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
Phase 6 (Purchase Engine)              Phase 10 (Royalty Engine)
"What is the price & rights?"          "What is the royalty rate & licensor?"
```

- **Separation of Concerns**:
  - Phase 5 configures and registers commercial terms.
  - Phase 6 executes token payments and issues access grants.
  - Phase 10 executes automated revenue splits.
- **Zero Secret Leakage**: Private keys, database secrets, and raw datasets are never committed or stored on-chain.

---

## 📄 License

Developed as part of the **AIXchange** project. All rights reserved.