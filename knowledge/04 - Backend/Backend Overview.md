# Backend Overview

## Overview

The AIXchange backend is a Node.js REST API server built with **Express 5** and **Mongoose 9**. It provides off-chain data indexing, user management, authentication, and continuous event synchronization with the EVM blockchain.

---

## Technical Specifications

- **Runtime**: Node.js `^22.0.0`
- **Framework**: Express.js `^5.2.1`
- **Database ODM**: Mongoose `^9.7.4`
- **Authentication**: JWT (`jsonwebtoken`) & EIP-191 Web3 Wallet Signatures (`ethers`)
- **Validation**: Joi `^18.2.3`
- **Documentation**: Swagger UI Express (`^5.0.1`) on `/api-docs`
- **Logging**: Winston `^3.19.0` with Morgan `^1.11.0` HTTP middleware
- **Security**: Helmet, CORS, Express Rate Limit, Bcryptjs

---

## Directory Organization (`server/src/`)

```text
server/src/
├── app.js                          # Express app configuration & middleware pipeline
├── server.js                       # Server entrypoint, DB connection, & background jobs
├── config/
│   ├── database.js                 # MongoDB connection
│   ├── env.js                      # Environment variable validation
│   ├── logger.js                   # Winston logger
│   ├── swagger.js                  # OpenAPI 3.0 JSDoc spec
│   ├── blockchain.js               # Ethers provider & network configs
│   └── purchase-abi.js             # PurchaseEngine ABI definition
├── controllers/
│   ├── auth.controller.js          # Authentication handlers
│   ├── wallet.controller.js        # Wallet nonce & verify handlers
│   ├── dataset.controller.js       # Dataset CRUD handlers
│   ├── license.controller.js       # License handlers
│   ├── purchase.controller.js      # Purchase handlers
│   └── token.controller.js         # Token stats & faucet handlers
├── jobs/
│   ├── license-event-indexer.js    # Syncs LicenseRegistry events to MongoDB
│   ├── purchase-event-indexer.js   # Syncs PurchaseEngine events to MongoDB
│   └── token-event-indexer.js      # Syncs AIXToken transfers to MongoDB
├── middlewares/
│   ├── auth.middleware.js          # JWT authentication middleware
│   ├── role.middleware.js          # Role-based authorization middleware
│   ├── validation.middleware.js    # Joi request validation middleware
│   ├── dataset-access.middleware.js# Entitlement checking middleware
│   ├── error.middleware.js         # Centralized error handler
│   ├── notFound.middleware.js      # 404 handler
│   └── requestLogger.middleware.js # HTTP request logging
├── models/
│   ├── user.model.js               # User credentials & profile
│   ├── session.model.js            # Active sessions
│   ├── dataset.model.js            # Off-chain dataset metadata
│   ├── license.model.js            # Off-chain license terms
│   ├── purchase.model.js           # Purchase records
│   ├── transaction.model.js        # Transaction history
│   └── indexer-state.model.js      # Blockchain block cursors
├── repositories/
│   ├── user.repository.js          # Database queries for users
│   ├── session.repository.js       # Database queries for sessions
│   ├── license.repository.js       # Database queries for licenses
│   ├── purchase.repository.js      # Database queries for purchases
│   ├── transaction.repository.js   # Database queries for transactions
│   └── indexer-state.repository.js # Database queries for indexers
├── routes/
│   ├── index.js                    # Master router
│   ├── auth.routes.js              # Auth endpoints
│   ├── wallet.route.js             # Wallet endpoints
│   ├── dataset.route.js            # Dataset endpoints
│   ├── license.route.js            # License endpoints
│   ├── purchase.route.js           # Purchase endpoints
│   ├── token.route.js              # Token endpoints
│   ├── treasury.route.js           # Treasury endpoints
│   ├── dashboard.route.js          # Dashboard analytics endpoints
│   └── health.routes.js            # Server health endpoints
├── services/
│   ├── auth.service.js             # User authentication logic
│   ├── wallet.service.js           # Nonce & signature verification
│   ├── dataset.service.js          # Dataset management logic
│   ├── license.service.js          # License logic
│   ├── licenseBlockchain.service.js# Blockchain license queries
│   ├── purchase.service.js         # Purchase logic
│   ├── purchaseBlockchain.service.js# Blockchain purchase queries
│   ├── access-control.service.js   # Access entitlement checking
│   ├── token.service.js            # Token stats & transfers
│   ├── download.service.js         # Protected asset downloads
│   └── email.service.js            # Nodemailer integration
└── utils/
    ├── ApiError.js                 # Custom error class
    ├── ApiResponse.js              # Standardized API response format
    ├── jwt.js                      # JWT signing and verification
    └── password.js                 # Bcrypt password hashing
```
