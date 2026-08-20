# Environment Variables

## Overview

This document provides a consolidated reference for all environment variables utilized across the root, blockchain, backend, and client services.

> [!CAUTION]
> **Secret Redaction**: Real private keys, passwords, and API secrets are never stored in the knowledge base. All values below represent template placeholders (`<REDACTED>`).

---

## 1. Root Environment (`/.env.example`)

```env
NODE_ENV=development

# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/aixchange
JWT_SECRET=<REDACTED>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Blockchain
ETH_RPC_URL=https://sepolia.infura.io/v3/<REDACTED>
PRIVATE_KEY=<REDACTED>
ETH_NETWORK=sepolia

# IPFS / Storage
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=https://ipfs.io/ipfs

# AI Services
OPENAI_API_KEY=<REDACTED>
MODEL_API_URL=http://localhost:8000
```

---

## 2. Blockchain Environment (`blockchain/.env.example`)

```env
PRIVATE_KEY=<REDACTED>
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<REDACTED>
ETHERSCAN_API_KEY=<REDACTED>
CHAIN_ID=31337
TOKEN_NAME=AIX Token
TOKEN_SYMBOL=AIX

# Deployed Contract Addresses
AIX_TOKEN_ADDRESS=
TREASURY_ADDRESS=
DATASET_REGISTRY_ADDRESS=
LICENSE_REGISTRY_ADDRESS=
PURCHASE_ENGINE_ADDRESS=
```

---

## 3. Server Environment (`server/.env.example`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aixchange
ACCESS_TOKEN_SECRET=<REDACTED>
REFRESH_TOKEN_SECRET=<REDACTED>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
API_PREFIX=/api/v1

# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<REDACTED>
BLOCKCHAIN_CHAIN_ID=11155111
AIX_TOKEN_ADDRESS=0x<REDACTED>
TREASURY_ADDRESS=0x<REDACTED>
PURCHASE_ENGINE_ADDRESS=0x<REDACTED>
DATASET_REGISTRY_ADDRESS=0x<REDACTED>
LICENSE_REGISTRY_ADDRESS=0x<REDACTED>

# Storage & IPFS
DATASET_ENCRYPTION_KEY=<REDACTED>
PINATA_JWT=<REDACTED>
PINATA_API_URL=https://api.pinata.cloud/pinning/pinFileToIPFS
PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
DATASET_MAX_UPLOAD_BYTES=52428800

# Docker Sandbox & AI Execution Substrate (Phase 7)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT_MS=30000
SANDBOX_MONITOR_INTERVAL_MS=10000
SANDBOX_MAX_FILE_BYTES=52428800
SANDBOX_UPLOAD_DIR=uploads/sandboxes
WORKSPACE_DIR=../python-services/workspace
```


---

## 4. Client Environment (`client/.env.example`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
VITE_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io

# Deployed Contract Addresses (Defaults for Hardhat Local Node)
VITE_AIX_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_TREASURY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_DATASET_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_LICENSE_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
VITE_PURCHASE_ENGINE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
```
