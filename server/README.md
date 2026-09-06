# Server Application

The server application provides the Express 5 backend API and coordination layer for AIXchange.

## Purpose

- Expose REST endpoints for dataset marketplace, licensing, transactions, AI sandboxes, model registry, provenance verification, and royalty engine.
- Manage authentication (traditional JWT and Web3 EIP-191 wallet signature verification).
- Connect backend services with MongoDB Atlas/Local and Hardhat/Ethereum smart contracts.
- Orchestrate Docker AI Sandbox workflows: Phase 6 access validation, secure file uploads, training dispatch, live status monitoring, structured log retrieval, and JupyterLab sessions.
- Provide Model Registry & Marketplace APIs (Phase 8) for model registration, versioning, and on-chain verification.
- Provide Provenance Engine APIs (Phase 9) for training-to-model lineage registration, DAG graphs, chronological timelines, zero-custody signing, and cryptographic hash verification.
- Provide Royalty Engine APIs & Event Indexer (Phase 10) for automated multi-party revenue splits, exact BigInt accounting, zero-custody transaction preparation, idempotent multi-event projections, and authoritative on-chain reconciliation.
- Synchronize blockchain and execution state with persistent background workers and event indexers.

## How to Run

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Swagger OpenAPI docs available at `http://localhost:5000/api-docs` or `http://localhost:5000/api/v1/docs`.

## Important Folders

- `src/controllers/`: HTTP request handlers (`auth`, `wallet`, `dataset`, `license`, `purchase`, `sandbox`, `model`, `provenance`, `royalty`, `token`).
- `src/services/`: Business logic layer (sandbox orchestration, AI execution client, access control, file upload, training logs, monitoring, model service, provenance service, royalty service, blockchain adapters).
- `src/models/`: Mongoose document schemas (`Sandbox`, `SandboxFile`, `ExecutionEvent`, `User`, `Dataset`, `License`, `Purchase`, `Model`, `Provenance`, `RoyaltyDistribution`, `Transaction`, `BlockchainEvent`, `IndexerState`).
- `src/repositories/`: Data access layer abstracting MongoDB queries (`royalty.repository.js`, `provenance.repository.js`, etc.).
- `src/routes/`: REST API route definitions with Swagger annotations and rate limiters.
- `src/jobs/`: Blockchain event indexers (`purchase-event-indexer`, `model-event-indexer`, `provenance-event-indexer`, `royalty-event-indexer`) and `sandbox-monitor.job.js`.
- `src/validators/`: Joi payload validation schemas.

## Commands

- `npm run dev`: Start development server with Nodemon.
- `npm start`: Start production server.
- `npm test`: Run automated backend test suites serially (`node --test --test-concurrency=1 tests/**/*.test.js`) — 89 passing tests with zero regressions.
- `npm run lint`: Run ESLint checks.

## Key Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aixchange
ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
AI_SERVICE_URL=http://localhost:8000
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337
AIX_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TREASURY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
DATASET_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
MODEL_REGISTRY_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
PROVENANCE_REGISTRY_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
ROYALTY_ENGINE_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
BLOCKCHAIN_START_BLOCK=0
BLOCKCHAIN_CONFIRMATIONS=1
```

## Royalty Engine API Endpoints (`/api/v1/royalties`)

- `GET  /api/v1/royalties/distributions/:distributionId` — Retrieve single distribution record from MongoDB.
- `GET  /api/v1/royalties/distributions/:distributionId/allocations` — Retrieve recipient allocations with percentage splits.
- `GET  /api/v1/royalties/recipients/:address` — Retrieve total claimed earnings and distribution history for a recipient.
- `GET  /api/v1/royalties/source/:sourceType/:sourceId` — Check if a dataset or model has distributed royalties.
- `GET  /api/v1/royalties/history` — Paginated distribution history with filters (`recipient`, `sourceType`, `status`, `dateRange`).
- `GET  /api/v1/royalties/summary` — Aggregate financial metrics (total distributed, platform treasury share, active recipients).
- `GET  /api/v1/royalties/reports` — Multi-dimensional reporting grouped by recipient, source, or time interval.
- `POST /api/v1/royalties/calculate-split` — Preview revenue split calculations without modifying on-chain state.
- `POST /api/v1/royalties/prepare` — Zero-custody calldata encoding for `distributeRoyalty` (JWT authenticated).
- `POST /api/v1/royalties/sync` — Synchronize and verify on-chain transaction receipt for newly submitted distributions.
- `POST /api/v1/royalties/reconcile` — Authoritative cross-check comparing off-chain MongoDB records with on-chain contract state.
- `POST /api/v1/royalties/reconcile/:distributionId` — Reconcile a single distribution by ID.

## Backend Analytics API Endpoints (`/api/v1/analytics`)

- `GET  /api/v1/analytics/overview` — High-performance single-pass executive KPI summary across all 5 dimensions (Revenue, Transactions, Downloads, API Calls, Users).
- `GET  /api/v1/analytics/revenue` — Off-chain confirmed marketplace revenue, fee splits, and ISO-8601 UTC time-series.
- `GET  /api/v1/analytics/transactions` — Marketplace purchase transaction volume, status breakdown (CONFIRMED/PENDING/FAILED), and audit log.
- `GET  /api/v1/analytics/downloads` — Dataset download volume, failure status, unique downloaders, top datasets, and trends.
- `GET  /api/v1/analytics/api-calls` — AI model inference execution metrics, average latency, sanitized error categorization, and trends.
- `GET  /api/v1/analytics/users` — User lifecycle, registration growth, verification statistics, and historically verifiable active users.

