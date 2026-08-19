# Known Issues

This document records confirmed issues, build warnings, and incomplete placeholders verified in the repository.

---

## 1. Confirmed Issues & Warnings

1. **Vite Build Tailwind CSS Warning**:
   - *Symptom*: Running `npm run build` in `client/` produces:
     `[lightningcss minify] Unknown at rule: @tailwind`
   - *Impact*: Non-breaking warning. Vite builds the bundle successfully, but Tailwind v4 directive syntax is noted by LightningCSS.
2. **Empty `docker-compose.yml`**:
   - *Symptom*: `docker-compose.yml` in project root is 0 bytes.
   - *Impact*: Running `docker-compose up` fails until container definitions for MongoDB, IPFS, server, and client are added.
3. **Empty Blockchain Test Suites**:
   - *Symptom*: Files in `blockchain/test/wallet/` (`message.test.js`, `network.test.js`, `signature.test.js`, `wallet.test.js`) are currently empty (0 bytes).
   - *Impact*: Wallet cryptographic verification logic is tested in `client/src/pages/WalletTest.jsx` and `server/src/services/wallet.service.js`, but Hardhat test runners in `blockchain/test/wallet/` contain no assertions.

---

## 2. Placeholder Files / Directories

- `blockchain/contracts/registry/ModelRegistry.sol` (88 bytes stub).
- `blockchain/contracts/interfaces/IModelRegistry.sol` (178 bytes stub).
- `blockchain/contracts/marketplace/Marketplace.sol` (88 bytes stub).
- `blockchain/contracts/interfaces/IMarketplace.sol` (172 bytes stub).
- `blockchain/contracts/royalty/RoyaltyEngine.sol` (90 bytes stub).
- `blockchain/contracts/interfaces/IRoyaltyEngine.sol` (178 bytes stub).
- `database/migrations/`, `database/schemas/`, `database/seeders/` (contain `.gitkeep`).
- `docker/ipfs/`, `docker/mongodb/`, `docker/nginx/` (contain `.gitkeep`).
- `shared/constants/`, `shared/types/`, `shared/utils/` (contain `.gitkeep`).
