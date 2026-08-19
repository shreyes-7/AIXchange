# Setup Guide

## Overview

Follow this guide to set up, install, run, and test the entire AIXchange development environment locally.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (Recommended: `v22+`)
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher
- **MongoDB**: Running instance at `mongodb://localhost:27017`
- **MetaMask**: Browser extension installed

---

## 2. Dependency Installation

```bash
# 1. Install Blockchain dependencies
cd blockchain
npm install

# 2. Install Client dependencies
cd ../client
npm install

# 3. Install Server dependencies
cd ../server
npm install

# 4. Setup Python AI environment
cd ../python-services
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

## 3. Running the Complete System (Multi-Terminal)

### Terminal 1: Hardhat Local Ethereum Node
```bash
cd blockchain
npx hardhat node
```
*Starts JSON-RPC node on `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Terminal 2: Deploy Smart Contracts
```bash
cd blockchain
npx hardhat ignition deploy ignition/modules/Phase6.js --network localhost
```
*Deploys `AIXToken`, `Treasury`, `DatasetRegistry`, `LicenseRegistry`, and `PurchaseEngine`.*

### Terminal 3: Express Backend API Server
```bash
cd server
npm run dev
```
*Starts API on `http://localhost:5000` with Swagger docs at `http://localhost:5000/api-docs`.*

### Terminal 4: Frontend Client SPA
```bash
cd client
npm run dev
```
*Launches Vite React app on `http://localhost:5173`.*

---

## 4. MetaMask Configuration

1. Open MetaMask and add custom network:
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency**: `ETH`
2. Import Account #0 private key from Terminal 1 output (`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
3. Connect wallet on `http://localhost:5173`.
