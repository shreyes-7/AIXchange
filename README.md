# AIXchange

AIXchange is a blockchain-powered decentralized marketplace for AI datasets, AI models, and AI services. It is designed to support transparent provenance, verifiable ownership, secure licensing, and automated royalty distribution for digital AI assets.

## Overview

AIXchange brings together:

- a dataset marketplace for high-quality AI training data
- a model marketplace for reusable AI assets
- AI provenance tracking for trust and auditability
- a royalty engine for creator compensation
- an AIX token for ecosystem incentives
- smart contracts for decentralized ownership and settlement
- IPFS storage for distributed asset hosting
- blockchain verification for authenticity and traceability

## Features

- Decentralized marketplace for datasets and models
- Provenance tracking for creators and assets
- Royalty distribution through smart contracts
- Token-based incentives using AIX
- Secure metadata and asset indexing
- Web-based marketplace experience for users and contributors
- API services for AI inference, evaluation, and model workflows
- Multi-service architecture for frontend, backend, blockchain, and AI operations

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- JWT authentication

### Blockchain
- Hardhat
- Solidity
- Ethers.js
- OpenZeppelin contracts

### Database
- MongoDB
- Mongoose

### AI
- Python
- FastAPI-style service structure
- model inference and evaluation workflows

### Storage
- IPFS
- decentralized asset metadata

### Authentication
- JWT-based auth
- wallet-based integration support

### DevOps
- Docker Compose
- environment-based configuration

### Deployment
- containerized local development
- cloud-ready architecture for future deployment

## Repository Structure

```text
AIXchange/
├── blockchain/          # Smart contracts, deployment scripts, and Hardhat setup
├── client/              # React frontend application
├── database/            # Database migration, schema, and seeding assets
├── docker/              # Docker support files for services
├── docs/                # Project documentation and architecture notes
├── python-services/     # Python-based AI services and workflows
├── sandbox/             # Experimental or temporary development space
├── scripts/             # Shared operational scripts
├── server/              # Node.js backend services and API layer
├── shared/              # Shared constants, types, and utilities
├── docker-compose.yml   # Local multi-service orchestration
├── package.json         # Root workspace tooling and scripts
└── README.md            # Repository overview
```

### Directory Notes

- blockchain: Solidity contracts, Hardhat config, deployment scripts, and tests
- client: Vite-based frontend application
- database: SQL or schema-oriented assets for persistence setup
- docker: container configuration for supporting services
- docs: architecture, API, contract, and planning documentation
- python-services: AI workflows, model handling, inference, and evaluation logic
- sandbox: isolated area for experiments and prototypes
- scripts: repo automation helpers
- server: Express-based backend and API services
- shared: common code and type definitions used across services

## Project Architecture

The platform is organized as a layered system:

Frontend
↓
Backend
↓
MongoDB
↓
Blockchain
↓
IPFS
↓
AI Services

Together, these layers support a marketplace experience where users interact with the app, backend services coordinate data and access control, blockchain provides ownership and settlement guarantees, IPFS stores assets, and AI services process model-related workflows.

## Development Workflow

1. Create a feature branch
2. Develop the change locally
3. Commit the work with clear messages
4. Push the branch to the remote repository
5. Open a pull request
6. Review the changes
7. Merge into develop
8. Merge into main after release readiness

## Git Branch Strategy

- main: production-ready code
- develop: integration branch for upcoming releases
- feature/<feature-name>: new functionality
- bugfix/<issue>: fixes for known issues
- hotfix/<issue>: urgent production fixes
- docs/<task>: documentation-only changes

## Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker Desktop or Docker Engine
- MetaMask or another Web3 wallet
- MongoDB instance or Docker-based MongoDB
- Git

### Clone Repository

```bash
git clone <repository-url>
cd AIXchange
```

### Install Dependencies

```bash
cd client
npm install

cd ../server
npm install

cd ../blockchain
npm install

cd ../python-services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Project

### Frontend

```bash
cd client
npm run dev
```

### Backend

```bash
cd server
npm run dev
```

### Blockchain

```bash
cd blockchain
npx hardhat node
```

### Python Services

```bash
cd python-services
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

## Environment Variables

Create a local environment file for each service as needed.

```env
# Root / shared
NODE_ENV=development

# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/aixchange
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Blockchain
ETH_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your-wallet-private-key
ETH_NETWORK=sepolia

# IPFS / storage
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY=https://ipfs.io/ipfs

# AI services
OPENAI_API_KEY=your-openai-key
MODEL_API_URL=http://localhost:8000
```

## Team Structure

- Product and project leads: define roadmap and product direction
- Frontend developers: build the marketplace experience
- Backend developers: implement APIs, auth, and integrations
- Blockchain developers: maintain smart contracts and deployment flow
- AI engineers: support model workflows and inference services
- DevOps contributors: manage environments, containers, and deployment automation

## Contributing Guidelines

### Create a branch

```bash
git checkout -b feature/my-change
```

### Commit changes

```bash
git add .
git commit -m "feat: add new marketplace capability"
```

### Open a pull request

- keep PRs focused and small
- include a summary of the change
- reference related issues where possible
- request review from the appropriate team members

## Coding Standards

- Format code consistently with the repository tooling
- Use descriptive names for variables, functions, and files
- Keep service boundaries clear across frontend, backend, blockchain, and AI modules
- Use small, focused commits with meaningful messages
- Prefer documentation updates for shared changes

## License

This project is licensed under the MIT License.

