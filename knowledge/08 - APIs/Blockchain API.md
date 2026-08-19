# Blockchain API

## Overview

The `/api/v1/token` endpoints provide REST queries for AIX token balances, supply metrics, and local development faucets.

---

## Implemented Endpoints

### 1. `GET /api/v1/token/stats`
- **Description**: Returns general token statistics.
- **Auth**: None.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "name": "AIXchange Token",
      "symbol": "AIX",
      "decimals": 18,
      "totalSupply": "1000000000000000000000000000"
    }
  }
  ```

### 2. `GET /api/v1/token/balance/:address`
- **Description**: Returns the AIX token balance for a specific Ethereum address.
- **Auth**: None.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "address": "0x71C...",
      "balance": "1000.0"
    }
  }
  ```

### 3. `POST /api/v1/token/faucet`
- **Description**: Dispenses test AIX tokens in local/development environments.
- **Auth**: None.
- **Request Body**:
  ```json
  {
    "recipientAddress": "0x71C...",
    "amount": "100"
  }
  ```
- **Response (`200 OK`)**: Transaction receipt confirming test token transfer.
