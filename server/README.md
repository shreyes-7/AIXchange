# Server Application

The server application provides the Express 5 backend API and coordination layer for AIXchange.

## Purpose

- Expose REST endpoints for dataset marketplace, licensing, transactions, AI sandboxes, model registry, and provenance verification.
- Manage authentication (traditional JWT and Web3 EIP-191 wallet signature verification).
- Connect backend services with MongoDB Atlas/Local and Hardhat/Ethereum smart contracts.
- Orchestrate Docker AI Sandbox workflows: Phase 6 access validation, secure file uploads, training dispatch, live status monitoring, structured log retrieval, and JupyterLab sessions.
- Provide Model Registry & Marketplace APIs (Phase 8) for model registration, versioning, and on-chain verification.
- Provide Provenance Engine APIs (Phase 9) for training-to-model lineage registration, DAG graphs, chronological timelines, zero-custody signing, and cryptographic hash verification.
- Synchronize blockchain and execution state with persistent background workers.

## How to Run

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Swagger OpenAPI docs available at `http://localhost:5000/api-docs` or `http://localhost:5000/api/v1/docs`.

## Important Folders

- `src/controllers/`: HTTP request handlers (auth, wallet, dataset, license, purchase, sandbox, model, provenance, token).
- `src/services/`: Business logic layer (sandbox orchestration, AI execution client, access control, file upload, training logs, monitoring, model service, provenance service, blockchain adapters).
- `src/models/`: Mongoose document schemas (`Sandbox`, `SandboxFile`, `ExecutionEvent`, `User`, `Dataset`, `License`, `Purchase`, `Model`, `Provenance`, `Transaction`).
- `src/repositories/`: Data access layer abstracting MongoDB queries.
- `src/routes/`: REST API route definitions with Swagger annotations and rate limiters.
- `src/jobs/`: Blockchain event indexers (`purchase-event-indexer`, `model-event-indexer`, `provenance-event-indexer`) and `sandbox-monitor.job.js`.
- `src/validators/`: Joi payload validation schemas.

## Commands

- `npm run dev`: Start development server with Nodemon.
- `npm start`: Start production server.
- `npm test`: Run automated backend unit and end-to-end test suites.
- `npm run lint`: Run ESLint checks.

## Key Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aixchange
ACCESS_TOKEN_SECRET=<secret>
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT_MS=30000
SANDBOX_MONITOR_INTERVAL_MS=10000
SANDBOX_MAX_FILE_BYTES=52428800
SANDBOX_UPLOAD_DIR=uploads/sandboxes
WORKSPACE_DIR=../python-services/workspace
```

