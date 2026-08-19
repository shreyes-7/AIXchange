# Authentication API

## Overview

Endpoints under `/api/v1/auth` and `/api/v1/wallet` manage user accounts, password authentication, and Web3 wallet cryptographic signature verification.

---

## Endpoints

### 1. `POST /api/v1/auth/register`
- **Description**: Registers a new user account.
- **Request Body**:
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "password": "SecurePassword123!",
    "role": "creator"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "60c72b2f...", "username": "alice", "email": "alice@example.com", "role": "creator" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2. `POST /api/v1/auth/login`
- **Description**: Authenticates user via email and password.
- **Request Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (`200 OK`)**: Returns user object and JWT access token.

### 3. `GET /api/v1/wallet/nonce`
- **Description**: Retrieves challenge nonce for an Ethereum wallet address.
- **Query Parameter**: `address=0x...`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "nonce": "c61b6928-8d4b-4df2-8bb4-05a812345678"
    }
  }
  ```

### 4. `POST /api/v1/wallet/verify`
- **Description**: Verifies an EIP-191 signature signed by MetaMask and authenticates the wallet.
- **Request Body**:
  ```json
  {
    "address": "0x71C8363837918a71b1832983298aC7B6527F83fC",
    "signature": "0x4f828a..."
  }
  ```
- **Response (`200 OK`)**: Returns JWT session token and user profile.
