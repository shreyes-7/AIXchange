# Backend Architecture

## Overview

The AIXchange backend is a structured Node.js service built with **Express.js 5** and **Mongoose 9**. It follows a layered architecture dividing HTTP handling, validation, business logic, data access, and blockchain synchronization.

```text
HTTP Request
     │
     ▼
[ Express Application Pipeline (app.js) ]
     │ ├── Helmet (Security headers)
     │ ├── CORS (Cross-Origin Resource Sharing)
     │ ├── Rate Limiter (express-rate-limit)
     │ ├── Body Parsers (express.json, urlencoded, cookie-parser)
     │ ├── Compression & Morgan Logger
     │ └── Swagger UI (/api-docs)
     ▼
[ Routes Layer (src/routes/) ]
     │ ├── auth.routes.js, wallet.route.js
     │ ├── dataset.route.js, license.route.js, purchase.route.js
     │ ├── token.route.js, treasury.route.js, health.routes.js
     ▼
[ Middleware & Validators (src/middlewares/, src/validators/) ]
     │ ├── auth.middleware.js (JWT validation)
     │ ├── role.middleware.js (Role-based access)
     │ ├── validation.middleware.js (Joi schema validation)
     │ └── dataset-access.middleware.js (Entitlement checking)
     ▼
[ Controller Layer (src/controllers/) ]
     │ ├── Extracts params/body
     │ └── Calls Service methods, formats ApiResponse
     ▼
[ Service Layer (src/services/) ]
     │ ├── auth.service.js, wallet.service.js
     │ ├── dataset.service.js, license.service.js, purchase.service.js
     │ ├── licenseBlockchain.service.js, purchaseBlockchain.service.js
     │ └── access-control.service.js, download.service.js, token.service.js
     ▼
[ Repository & Database Layer (src/repositories/, src/models/) ]
     │ ├── user.repository.js, session.repository.js
     │ ├── license.repository.js, purchase.repository.js, transaction.repository.js
     │ └── MongoDB / Mongoose Documents
     ▼
[ Background Jobs (src/jobs/) ]
       ├── license-event-indexer.js
       ├── purchase-event-indexer.js
       └── token-event-indexer.js
```

---

## Architectural Layers

### 1. Server Bootstrap & Configuration (`src/server.js`, `src/config/`)
- `server.js`: Connects to MongoDB via `config/database.js`, initializes HTTP server on `PORT=5000`, and starts background blockchain event indexers.
- `config/env.js`: Centralized environment variable validator ensuring required keys exist before server start.
- `config/logger.js`: Winston structured logger with console and file transports.
- `config/swagger.js`: OpenAPI 3.0 JSDoc specifications served on `/api-docs`.

### 2. Controllers & Routing (`src/controllers/`, `src/routes/`)
- **`auth.routes.js` / `auth.controller.js`**: User registration, login, logout, password change, profile lookup.
- **`wallet.route.js` / `wallet.controller.js`**: Web3 wallet challenge nonce generation and cryptographic signature authentication.
- **`dataset.route.js` / `dataset.controller.js`**: Dataset CRUD, pagination, filtering, tag search, and featured listings.
- **`license.route.js` / `license.controller.js`**: License creation, querying by asset ID, status updates, and revocation.
- **`purchase.route.js` / `purchase.controller.js`**: Purchase recording, receipt retrieval, user purchase history, and access entitlement checks.
- **`token.route.js` / `token.controller.js`**: Token statistics, user balances, allowances, and local test faucets.
- **`health.routes.js`**: Server health check and system diagnostic status.

### 3. Service Layer (`src/services/`)
- Encapsulates core business logic and orchestrates database transactions and Ethers.js blockchain reads/writes.
- `licenseBlockchain.service.js` & `purchaseBlockchain.service.js`: Interfaces directly with EVM smart contracts using Ethers v6 providers and contract factory bindings.
- `access-control.service.js`: Validates whether a given user address has active, valid access entitlements for a dataset.

### 4. Background Blockchain Event Indexers (`src/jobs/`)
- `license-event-indexer.js`: Subscribes to `LicenseCreated`, `LicenseUpdated`, and `LicenseRevoked` events emitted by `LicenseRegistry.sol`.
- `purchase-event-indexer.js`: Subscribes to `DatasetPurchased` and `RoyaltyTriggered` events emitted by `PurchaseEngine.sol` and syncs records into MongoDB.
- `token-event-indexer.js`: Subscribes to ERC-20 `Transfer` and `Approval` events emitted by `AIXToken.sol`.
