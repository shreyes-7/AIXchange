# Technology Stack

This document catalogs every programming language, runtime, framework, library, and tool **actually detected** in the AIXchange codebase.

---

## 1. Blockchain & Smart Contracts

| Technology | Version / Spec | Purpose | Detected In |
| :--- | :--- | :--- | :--- |
| **Solidity** | `^0.8.28` | Smart contract language | `blockchain/contracts/**/*.sol` |
| **Hardhat** | `^2.22.19` | Ethereum development environment | `blockchain/package.json` |
| **Ethers.js** | `^6.13.5` | Web3 blockchain interaction library | `blockchain/package.json` |
| **OpenZeppelin Contracts** | `^5.2.0` | Secure ERC20, Ownable, ReentrancyGuard, Pausable primitives | `blockchain/package.json` |
| **Hardhat Ignition** | `^0.15.9` | Declarative contract deployment system | `blockchain/package.json` |
| **Chai / Mocha** | Default Hardhat | Unit testing framework | `blockchain/test/**/*.test.js` |
| **Hardhat Gas Reporter**| `^1.0.8` | Gas benchmarking plugin | `blockchain/package.json` |
| **Solidity Coverage** | `^0.8.1` | Test coverage measurement | `blockchain/package.json` |

---

## 2. Backend Server

| Technology | Version / Spec | Purpose | Detected In |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>=22.0.0` | JavaScript backend runtime | `server/package.json` |
| **Express.js** | `^5.2.1` | REST API HTTP server framework | `server/package.json` |
| **MongoDB / Mongoose** | `^9.7.4` | NoSQL document database ODM | `server/package.json` |
| **jsonwebtoken** | `^9.0.3` | JWT token generation & verification | `server/package.json` |
| **bcryptjs** | `^3.0.3` | Password hashing | `server/package.json` |
| **Joi** | `^18.2.3` | Request payload schema validation | `server/package.json` |
| **Ethers.js (Backend)** | `^6.17.0` | Node.js blockchain event listeners & indexers | `server/package.json` |
| **Winston** | `^3.19.0` | Structured logging | `server/package.json` |
| **Morgan** | `^1.11.0` | HTTP request logging middleware | `server/package.json` |
| **Helmet** | `^8.3.0` | Security headers middleware | `server/package.json` |
| **CORS** | `^2.8.6` | Cross-origin resource sharing | `server/package.json` |
| **Express Rate Limit** | `^8.5.2` | API rate limiting | `server/package.json` |
| **Compression** | `^1.8.1` | Gzip HTTP response compression | `server/package.json` |
| **Cookie Parser** | `^1.4.7` | Cookie parsing middleware | `server/package.json` |
| **Multer** | `^2.2.0` | Multipart file upload middleware | `server/package.json` |
| **Nodemailer** | `^9.0.3` | Email delivery service | `server/package.json` |
| **Swagger UI / JSDoc** | `^5.0.1` / `^6.3.0`| OpenAPI API documentation | `server/package.json` |
| **UUID** | `^11.1.0` | Unique ID generation | `server/package.json` |
| **Dotenv** | `^17.4.2` | Environment variables loader | `server/package.json` |

---

## 3. Frontend Client

| Technology | Version / Spec | Purpose | Detected In |
| :--- | :--- | :--- | :--- |
| **React** | `^19.0.0` | UI component library | `client/package.json` |
| **React DOM** | `^19.0.0` | DOM renderer for React | `client/package.json` |
| **Vite** | `^8.1.4` | Frontend build tool and dev server | `client/package.json` |
| **React Router DOM** | `^7.1.5` | Client-side routing | `client/package.json` |
| **Tailwind CSS** | `^4.0.6` | Utility-first CSS styling | `client/package.json` |
| **Ethers.js (Client)** | `^6.13.5` | MetaMask wallet & contract interaction | `client/package.json` |
| **Lucide React** | `^0.475.0` | Icon system | `client/package.json` |
| **Axios** | `^1.7.9` | HTTP client for backend REST APIs | `client/package.json` |
| **ESLint** | `^9.19.0` | Frontend code linting | `client/package.json` |

---

## 4. Python AI Services (Scaffolding / Dependencies)

| Technology | Version / Spec | Purpose | Detected In |
| :--- | :--- | :--- | :--- |
| **Python** | `3.10+` | AI / ML service runtime | `python-services/` |
| **PyTorch (`torch`)** | `2.13.0` | Deep learning & tensor computation | `python-services/requirements.txt` |
| **Safetensors** | `0.8.0` | Safe model weights serialization | `python-services/requirements.txt` |
| **Scipy** | `1.18.0` | Scientific computing | `python-services/requirements.txt` |
| **NumPy** | `2.5.1` | Array and mathematical computing | `python-services/requirements.txt` |
| **Uvicorn** | `0.51.0` | ASGI web server | `python-services/requirements.txt` |
| **Pydantic Core** | `2.46.4` | Data validation | `python-services/requirements.txt` |
| **Requests** | `2.34.2` | HTTP client | `python-services/requirements.txt` |

---

## 5. Storage & Protocol Integrations

| Technology | Purpose | Implementation Location |
| :--- | :--- | :--- |
| **IPFS / Pinata** | Decentralized asset & metadata hosting | Referenced in `contracts/registry/DatasetRegistry.sol`, `client/src/pages/DatasetDetails.jsx`, `.env.example` |
| **MetaMask (EIP-1193 / EIP-191)** | Browser Web3 wallet & message signing | `client/src/services/blockchain/wallet/`, `server/src/services/wallet.service.js` |
| **Local Ethereum Node (JSON-RPC)** | Local blockchain runtime at `http://127.0.0.1:8545` | Hardhat runtime, `.env.example` |
