# AIXchange Blockchain Layer

The **AIXchange Blockchain Module** is the decentralized trust layer of the AIXchange platform, built using **Solidity**, **Hardhat**, **OpenZeppelin Contracts**, and **Ethers.js**.

It provides immutable asset ownership records, automated token economy operations, vault security, decentralized marketplace clearing, and transparent dataset provenance.

---

## 🚀 Completed Phases

### Phase 3 – AIX Token Economy
- **`AIXToken.sol` (`contracts/tokens/AIXToken.sol`)**: ERC-20 utility token ("AIXchange Token" / "AIX", 18 decimals, 1 Billion initial supply, burnable, owner minting).
- **`Treasury.sol` (`contracts/governance/Treasury.sol`)**: Secure vault for holding platform AIX tokens and native ETH.
- **Interfaces & Libraries**: `IAIXToken.sol`, `ITreasury.sol`, `Errors.sol`, `Events.sol`, `Structs.sol`.

### Phase 4 – Dataset Marketplace Registry (Current)
- **`DatasetRegistry.sol` (`contracts/registry/DatasetRegistry.sol`)**:
  - **Storage Model**: Stores verifiable dataset metadata on-chain (`datasetId`, `owner`, `cid`, `license`, `royalty` in basis points 0-10000, `createdAt`, `active`). Raw payloads remain off-chain on IPFS/Pinata.
  - **Registration**: Auto-incrementing IDs, `msg.sender` derived ownership, boundary validations.
  - **Lookups**: `getDataset(id)`, `getDatasetOwner(id)`, `getDatasetsByOwner(owner)`, `getTotalDatasets()`.
  - **Management**: Owner-restricted metadata updates (`updateDataset`), status toggle (`setDatasetStatus`), and index-preserving ownership transfers (`transferDatasetOwnership`).
- **`IDatasetRegistry.sol` (`contracts/interfaces/IDatasetRegistry.sol`)**: Full interface specification.
- **Custom Errors & Events**: `InvalidCID`, `InvalidLicense`, `InvalidRoyalty`, `DatasetNotFound`, `DatasetInactive`, `UnauthorizedCaller`, `DatasetRegistered`, `DatasetUpdated`, `DatasetStatusChanged`, `DatasetOwnershipTransferred`.

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
│   │   ├── IMarketplace.sol
│   │   ├── IModelRegistry.sol
│   │   ├── IRoyaltyEngine.sol
│   │   └── ITreasury.sol
│   ├── libraries/
│   │   ├── Errors.sol
│   │   ├── Events.sol
│   │   └── Structs.sol
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
│       └── Phase4.js
├── scripts/
│   ├── deploy.js
│   ├── deployDatasetRegistry.js
│   ├── mint.js
│   ├── balance.js
│   └── transfer.js
├── test/
│   ├── governance/
│   │   └── Treasury.test.js
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

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npx hardhat compile
```

### 3. Run Automated Tests
```bash
npx hardhat test
```

### 4. Deploy Contracts (Local Network)
```bash
# Deploy DatasetRegistry
npx hardhat run scripts/deployDatasetRegistry.js --network localhost

# Deploy Token and Treasury
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Execute Hardhat Ignition Modules
```bash
npx hardhat ignition deploy ignition/modules/Phase4.js --network localhost
```

---

## 🔒 Security & Architecture Model

```text
Actual Dataset Payload  --> Backend Server (Encryption) --> Pinata / IPFS (Off-chain)
                                                                 |
                                                                CID
                                                                 |
                                                                 v
                                                       DatasetRegistry.sol (On-chain)
```

- **Off-chain Privacy**: Sensitive dataset payloads and encryption keys are NEVER stored on-chain or in client source code.
- **On-chain Integrity**: The blockchain stores the dataset CID hash, owner address, license terms, and royalty parameters.
- **Authorization**: All update and transfer functions enforce caller authorization (`msg.sender == dataset.owner`).

---

## 📄 License

Developed as part of the **AIXchange** project. All rights reserved.