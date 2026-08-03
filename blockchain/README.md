# AIXchange Blockchain Layer

The **AIXchange Blockchain Module** is the decentralized trust layer of the AIXchange platform, built using **Solidity**, **Hardhat**, **OpenZeppelin Contracts**, and **Ethers.js**.

It provides immutable asset ownership records, automated token economy operations, vault security, decentralized marketplace clearing, and transparent provenance tracking.

---

## 🚀 Phase 3 – AIX Token Economy (Completed)

Phase 3 establishes the native ERC20 token ecosystem (`AIXToken`) and the central platform treasury (`Treasury`).

### Implemented Contracts

1. **`AIXToken.sol` (`contracts/tokens/AIXToken.sol`)**
   - **Type**: Standard ERC20 with Burnable and Owner Access Control extensions.
   - **Name**: `AIXchange Token`
   - **Symbol**: `AIX`
   - **Decimals**: `18`
   - **Initial Supply**: 1,000,000,000 AIX (minted to contract owner/deployer).
   - **Minting**: Restricted to contract owner via `mint(address to, uint256 amount)`.
   - **Burning**: Supported via `burn(uint256 amount)` and `burnFrom(address account, uint256 amount)`.

2. **`Treasury.sol` (`contracts/governance/Treasury.sol`)**
   - **Type**: Vault contract for holding platform AIX tokens and native ETH.
   - **Ownership**: Controlled via OpenZeppelin `Ownable`.
   - **Withdrawals**: Owner-restricted token withdrawal `withdrawToken(address token, address to, uint256 amount)` and ETH withdrawal `withdrawETH(address payable to, uint256 amount)`.
   - **Deposits**: Receives ERC20 transfers and native ETH deposits (`receive()` and `fallback()`).
   - **Balance Queries**: `getTokenBalance(address token)` and `getETHBalance()`.

3. **Supporting Architecture**
   - **`IAIXToken.sol`**: Interface contract defining AIX Token methods.
   - **`ITreasury.sol`**: Interface contract defining Treasury vault methods.
   - **`Errors.sol`**: Custom errors (`ZeroAddress`, `ZeroAmount`, `InsufficientBalance`, `UnauthorizedAccount`, `TransferFailed`).
   - **`Events.sol`**: Custom events (`TokensMinted`, `TokensBurned`, `TokenDeposited`, `TokenWithdrawn`, `ETHDeposited`, `ETHWithdrawn`).

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
│       └── Phase3.js
├── scripts/
│   ├── deploy.js
│   ├── mint.js
│   ├── balance.js
│   └── transfer.js
├── test/
│   ├── governance/
│   │   └── Treasury.test.js
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
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Execute Hardhat Ignition Module
```bash
npx hardhat ignition deploy ignition/modules/Phase3.js --network localhost
```

### 6. Run Helper Scripts
```bash
# Mint tokens
npx hardhat run scripts/mint.js

# Check balances
npx hardhat run scripts/balance.js

# Transfer tokens
npx hardhat run scripts/transfer.js
```

---

## 🌐 Frontend Blockchain Service

The frontend service layer provides an `ethers.js` v6 interface to interact with `AIXToken`:

- **Path**: `client/src/services/blockchain/token/`
- **Modules**:
  - `token.service.js`: High-level functions (`initializeContract`, `getBalance`, `transfer`, `approve`, `allowance`, `getTokenMetadata`, `mint`, `burn`).
  - `token.abi.js`: Human-readable ABI for `AIXToken`.
  - `index.js`: Service export entrypoint.

---

## 🔒 Security Considerations

- **OpenZeppelin Contracts**: Inherits audited, battle-tested `ERC20`, `ERC20Burnable`, `Ownable`, and `SafeERC20`.
- **Access Control**: Owner-only modifiers protect token minting and treasury withdrawals.
- **Input Validation**: All functions check for `address(0)` and zero amounts before state modifications.
- **Checks-Effects-Interactions**: State updates precede token or ETH transfers.

---

## 📄 License

Developed as part of the **AIXchange** project. All rights reserved.