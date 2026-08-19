# Scripts

This document catalogs all runnable npm scripts and standalone CLI automation utilities in the repository.

---

## 1. Root Workspace Scripts (`package.json`)

```bash
# Formats code across packages (via Prettier)
npm run format
```

---

## 2. Blockchain Scripts (`blockchain/`)

```bash
# Compile Solidity contracts
npx hardhat compile

# Run Hardhat test suite (115 tests)
npx hardhat test

# Run gas reporter
REPORT_GAS=true npx hardhat test

# Start local Hardhat JSON-RPC node
npx hardhat node

# Deploy smart contracts via Ignition
npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost

# Standalone deployment scripts
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deployDatasetRegistry.js --network localhost
npx hardhat run scripts/deployLicenseRegistry.js --network localhost
npx hardhat run scripts/deployPurchaseEngine.js --network localhost

# CLI token helpers
npx hardhat run scripts/mint.js --network localhost
npx hardhat run scripts/transfer.js --network localhost
npx hardhat run scripts/balance.js --network localhost
```

---

## 3. Server Scripts (`server/`)

```bash
# Start backend in development mode with nodemon
npm run dev

# Start backend in production mode
npm start

# Run backend linter
npm run lint

# Run backend test suite
npm test
```

---

## 4. Client Scripts (`client/`)

```bash
# Start Vite development server (port 5173)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Run frontend linter
npm run lint
```
