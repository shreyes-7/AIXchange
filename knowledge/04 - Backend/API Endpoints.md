# API Endpoints

This document catalogs all verified REST endpoints implemented in the Express backend (`server/src/routes/`).

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Register new user (username, email, password) | None | `auth.routes.js` |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT | None | `auth.routes.js` |
| `POST` | `/api/v1/auth/logout` | Invalidate current session | JWT | `auth.routes.js` |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | JWT | `auth.routes.js` |
| `POST` | `/api/v1/auth/change-password` | Update account password | JWT | `auth.routes.js` |
| `POST` | `/api/v1/auth/refresh-token` | Refresh expired access token | None | `auth.routes.js` |

---

## 2. Web3 Wallet (`/api/v1/wallet`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/wallet/nonce` | Generate challenge nonce for a wallet address | None | `wallet.route.js` |
| `POST` | `/api/v1/wallet/verify` | Verify EIP-191 signature and issue JWT | None | `wallet.route.js` |
| `POST` | `/api/v1/wallet/connect` | Link wallet address to an existing user account | JWT | `wallet.route.js` |

---

## 3. Datasets (`/api/v1/datasets`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/datasets` | Search and filter datasets (pagination, tags, price) | None | `dataset.route.js` |
| `GET` | `/api/v1/datasets/featured` | Fetch featured/top-rated datasets | None | `dataset.route.js` |
| `GET` | `/api/v1/datasets/:id` | Fetch dataset details by ID and increment views | None | `dataset.route.js` |
| `POST` | `/api/v1/datasets` | Create/index a newly registered dataset | JWT | `dataset.route.js` |
| `PUT` | `/api/v1/datasets/:id` | Update dataset metadata | JWT (Owner) | `dataset.route.js` |
| `DELETE`| `/api/v1/datasets/:id` | Deactivate/delete dataset | JWT (Owner) | `dataset.route.js` |

---

## 4. Licenses (`/api/v1/licenses`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/licenses/asset/:assetId` | Get all licenses for a dataset ID | None | `license.route.js` |
| `GET` | `/api/v1/licenses/:id` | Fetch specific license terms and rights | None | `license.route.js` |
| `POST` | `/api/v1/licenses` | Index a newly created license | JWT (Licensor) | `license.route.js` |
| `POST` | `/api/v1/licenses/:id/revoke`| Record license revocation | JWT (Licensor) | `license.route.js` |

---

## 5. Purchases (`/api/v1/purchases`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/purchases` | Record purchase transaction receipt | JWT | `purchase.route.js` |
| `GET` | `/api/v1/purchases/my-purchases` | Retrieve buyer's purchase history | JWT | `purchase.route.js` |
| `GET` | `/api/v1/purchases/receipt/:id` | Fetch purchase receipt by ID | JWT | `purchase.route.js` |
| `GET` | `/api/v1/purchases/check-access/:datasetId` | Verify dataset access entitlement | JWT | `purchase.route.js` |

---

## 6. Token & Utilities (`/api/v1/token`, `/api/v1/health`, `/api/v1/dashboard`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/token/stats` | Token total supply, decimals, and metrics | None | `token.route.js` |
| `GET` | `/api/v1/token/balance/:address` | Fetch AIX token balance for address | None | `token.route.js` |
| `POST` | `/api/v1/token/faucet` | Dispense test AIX tokens (Development only) | None | `token.route.js` |
| `GET` | `/api/v1/health` | Server and database health check | None | `health.routes.js` |
| `GET` | `/api/v1/dashboard/stats` | User creator/buyer summary metrics | JWT | `dashboard.route.js` |

---

## 7. Model Marketplace & Registry (`/api/v1/models`) — Phase 8

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/models` | Prepare model registration calldata or sync | JWT + Wallet | `model.route.js` |
| `POST` | `/api/v1/models/sync` | Confirm & sync transaction receipt | JWT + Wallet | `model.route.js` |
| `GET` | `/api/v1/models` | Query models with pagination, search, filters | None | `model.route.js` |
| `GET` | `/api/v1/models/:id` | Fetch model by on-chain ID or Mongo ID | None | `model.route.js` |
| `POST` | `/api/v1/models/:id/versions`| Prepare addModelVersion calldata | JWT + Wallet (Owner) | `model.route.js` |
| `GET` | `/api/v1/models/:id/versions/:version` | Fetch specific version details | None | `model.route.js` |
| `POST` | `/api/v1/models/:id/verify-hash` | Verify SHA-256 model weights on-chain | None | `model.route.js` |
| `POST` | `/api/v1/models/:id/status` | Prepare toggle active status calldata | JWT + Wallet (Owner) | `model.route.js` |
| `POST` | `/api/v1/models/:id/transfer`| Prepare ownership transfer calldata | JWT + Wallet (Owner) | `model.route.js` |

---

## 8. Provenance Engine (`/api/v1/provenance`) — Phase 9

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/provenance` | Prepare provenance registration calldata | JWT + Wallet | `provenance.route.js` |
| `POST` | `/api/v1/provenance/sync` | Confirm & synchronize transaction receipt | JWT + Wallet | `provenance.route.js` |
| `GET` | `/api/v1/provenance/:id` | Fetch provenance by on-chain ID or Mongo ID | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/dataset/:datasetId` | List provenance records derived from dataset | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/execution/:executionId`| List provenance records for execution run | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/model/:modelId` | List all provenance records for a model | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/model/:modelId/version/:version` | List provenance for a specific model version | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/graph/:modelId` | Build full DAG lineage graph (nodes & edges) | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/timeline/:modelId` | Build chronological audit trail (on-chain + execution) | None | `provenance.route.js` |
| `POST` | `/api/v1/provenance/:id/verify` | Verify lineage parameters on-chain | None | `provenance.route.js` |
| `GET` | `/api/v1/provenance/:id/verify` | Query on-chain record and verification status | None | `provenance.route.js` |
| `POST` | `/api/v1/provenance/:id/verify-hash` | Verify metadata hash against contract | None | `provenance.route.js` |
| `POST` | `/api/v1/provenance/:id/status` | Prepare status toggle calldata (revoke/deprecate) | JWT + Wallet | `provenance.route.js` |

---

## 9. Sandboxes & AI Execution (`/api/v1/sandboxes`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/sandboxes` | Create sandbox instance with Phase 6 entitlement check | JWT | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes` | List sandboxes for authenticated user (paginated) | JWT | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes/:sandboxId` | Get sandbox metadata and execution state | JWT (Owner) | `sandbox.route.js` |
| `POST` | `/api/v1/sandboxes/:sandboxId/files` | Upload code, dataset, or config file to sandbox | JWT (Owner) | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes/:sandboxId/files` | List uploaded files in sandbox | JWT (Owner) | `sandbox.route.js` |
| `DELETE` | `/api/v1/sandboxes/:sandboxId/files/:fileId` | Delete uploaded file from sandbox | JWT (Owner) | `sandbox.route.js` |
| `POST` | `/api/v1/sandboxes/:sandboxId/train` | Stage files and dispatch training to AI substrate | JWT (Owner) | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes/:sandboxId/logs` | Retrieve structured logs, epoch metrics, and events | JWT (Owner) | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes/:sandboxId/monitor` | Synchronize and retrieve live execution state | JWT (Owner) | `sandbox.route.js` |
| `POST` | `/api/v1/sandboxes/:sandboxId/jupyter/start` | Start isolated JupyterLab session | JWT (Owner) | `sandbox.route.js` |
| `POST` | `/api/v1/sandboxes/:sandboxId/jupyter/stop` | Stop active JupyterLab session | JWT (Owner) | `sandbox.route.js` |
| `GET` | `/api/v1/sandboxes/:sandboxId/jupyter/status` | Get JupyterLab session status and URL | JWT (Owner) | `sandbox.route.js` |

---

## 10. Royalty Engine (`/api/v1/royalties`)

| Method | Endpoint | Description | Auth Required | File |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/royalties/distributions/:distributionId` | Retrieve single distribution record from MongoDB | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/distributions/:distributionId/allocations` | Retrieve recipient allocation breakdown | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/recipients/:address` | Total claimed earnings and payout records | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/source/:sourceType/:sourceId` | Check if dataset or model has distributed royalties | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/history` | Paginated distribution history with filters | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/summary` | Platform-wide financial metrics and recipient stats | None | `royalty.route.js` |
| `GET` | `/api/v1/royalties/reports` | Multi-attribute aggregation by recipient/source | None | `royalty.route.js` |
| `POST` | `/api/v1/royalties/calculate-split` | Preview revenue split calculations without on-chain state change | None | `royalty.route.js` |
| `POST` | `/api/v1/royalties/prepare` | Zero-custody calldata encoding for `distributeRoyalty` | JWT | `royalty.route.js` |
| `POST` | `/api/v1/royalties/sync` | Synchronize and verify on-chain transaction receipt | JWT | `royalty.route.js` |
| `POST` | `/api/v1/royalties/reconcile` | Authoritative batch reconciliation against smart contract | JWT | `royalty.route.js` |
| `POST` | `/api/v1/royalties/reconcile/:distributionId` | Reconcile specific distribution against on-chain contract | JWT | `royalty.route.js` |


