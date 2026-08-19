# External Services

## Overview

This document catalogs all external protocols, networks, and cloud/decentralized infrastructure services utilized or referenced in AIXchange.

---

## 1. IPFS / Pinata (Decentralized File Storage)
- **Role**: Off-chain storage for dataset files, raw CSV/Parquet archives, and detailed JSON metadata schemas.
- **Protocol**: IPFS (InterPlanetary File System).
- **Public Gateways**: `https://ipfs.io/ipfs/<CID>` (Configured via `VITE_IPFS_GATEWAY_URL`).
- **Local IPFS Node**: `http://127.0.0.1:5001` (Referenced in `.env.example`).

---

## 2. Ethereum / EVM JSON-RPC Networks
- **Localhost Development Network**:
  - **URL**: `http://127.0.0.1:8545`
  - **Chain ID**: `31337`
  - **Currency**: ETH
- **Sepolia Testnet**:
  - **URL**: `https://sepolia.infura.io/v3/<REDACTED>`
  - **Chain ID**: `11155111`
  - **Block Explorer**: `https://sepolia.etherscan.io`

---

## 3. MetaMask (Browser Wallet Provider)
- **Standard**: EIP-1193 provider (`window.ethereum`) and EIP-191 personal message signing.
- **Role**: Account management, transaction signing, and identity verification.

---

## 4. MongoDB Database
- **Role**: Central off-chain index and metadata caching database.
- **Connection URI**: `mongodb://localhost:27017/aixchange`.
