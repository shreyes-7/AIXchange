# API Overview

## Overview

The AIXchange REST API is served on `http://localhost:5000/api/v1` by the Express 5 server. It provides JSON-based communication for user authentication, dataset discovery, license queries, purchase receipts, and token statistics.

---

## API Conventions

- **Base URL**: `/api/v1`
- **Data Format**: `application/json`
- **Interactive Documentation**: Swagger UI served at `http://localhost:5000/api-docs`.
- **Response Format (`ApiResponse.js`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operation successful",
    "data": { ... }
  }
  ```
- **Error Format (`ApiError.js`)**:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Validation failed"
  }
  ```
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_token>`).

---

## API Subsystem Routes

- [[Authentication API|/api/v1/auth]]: User registration, login, JWT refresh.
- [[Authentication API|/api/v1/wallet]]: Web3 wallet challenge nonces and signature verification.
- [[Marketplace API|/api/v1/datasets]]: Dataset catalog, metadata, search, and pagination.
- [[Marketplace API|/api/v1/licenses]]: License definitions, rights, and pricing.
- [[Marketplace API|/api/v1/purchases]]: Purchase transaction receipts and access entitlements.
- [[Blockchain API|/api/v1/token]]: AIX token balances, supply stats, and local test faucet.
- [[API Overview|/api/v1/health]]: Server health check and uptime.
