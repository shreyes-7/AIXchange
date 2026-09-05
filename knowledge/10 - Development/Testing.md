# Testing

## Overview

AIXchange implements comprehensive automated testing across its blockchain smart contracts and AI execution sandbox layer.

---

## 1. Blockchain Test Suite (`blockchain/test/`)

- **Total Passing Tests**: `156 / 156`
- **Execution Time**: ~4–11 seconds
- **Command**: `npx hardhat test` (inside `blockchain/`)

### Test Coverage Breakdown

```text
ModelRegistry Smart Contract (41 tests)
  ├── Deployment & Initialization (Total models initialization)
  ├── Model Registration (Incremental IDs, empty validations, duplicate name revert, cross-owner name allowance, event emissions)
  ├── Model Retrieval (Full struct inspection, owner lookup, owner model array, zero address reverts, nonexistent reverts)
  ├── Model Versioning (Sequential versions, historical immutability, duplicate hash rejection, inactive model revert, empty validations, unauthorized caller revert)
  ├── Model Hash Verification (Matching/mismatching SHA-256 hash checks on-chain)
  ├── Status Management (Active/inactive toggling, caller restriction)
  └── Ownership Transfer (O(1) swap-and-pop index updates, duplicate name collision prevention, zero address revert, self-transfer)

Treasury Smart Contract (12 tests)
  ├── Deployment & Initialization
  ├── ETH Deposits and Withdrawals (Access control, zero address checks, balance bounds)
  └── ERC20 Token Deposits and Withdrawals (Access control, transfer boundaries)

LicenseRegistry Smart Contract (32 tests)
  ├── Deployment & Contract Linking
  ├── License Creation — Authorization & Asset Ownership
  ├── License Creation — Pricing Validations (Fixed vs Royalty boundaries)
  ├── License Creation — Validity & Metadata Validations
  ├── License Lifecycle & Expiration Checking (Timestamp boundaries, revocation)
  ├── License Updates & Versioning (Counter increments)
  └── Read Queries & Integration Hooks (Pricing, rights, licensor queries)

PurchaseEngine Smart Contract (30 tests)
  ├── Deployment & Initialization (Fee caps, dependency validations)
  ├── Fee Management (Rate limits, owner update controls)
  ├── Purchase Execution — Happy Path (Atomic token transfer & fee split)
  ├── Purchase Execution — Validation Failures (Inactive dataset, expired license, self-purchase)
  ├── Payment Failures — Balance & Allowance Checks
  ├── Duplicate Purchases & Exclusivity Locking (Single-buyer locking)
  ├── Access Queries & Entitlements (Creator natural access, buyer validity)
  ├── Admin Controls & Circuit Breaker (Pausable toggle, non-owner restrictions)
  └── Lookups and Query Functions

DatasetRegistry Smart Contract (26 tests)
  ├── Deployment & Initial State
  ├── Dataset Registration (Auto-increment IDs, CID validations, event emissions)
  ├── Dataset Retrieval (Owner mapping, full struct inspection)
  ├── Dataset Updates (Metadata, CID versioning, royalty bounds)
  ├── Status Management (Active/inactive toggling)
  └── Ownership Transfer (O(1) index updates, zero address reverts)

AIXToken Smart Contract (15 tests)
  ├── Deployment (Name, symbol, decimals, initial supply)
  ├── Transfers (Balance deductions, insufficient funds)
  ├── Minting (Owner restrictions, zero address checks)
  ├── Burning (Holder burning, approved spender burnFrom)
  └── Approvals & Allowances
```

---

## 2. AI Execution & Sandbox Test Suite (`python-services/tests/`)

- **Total Passing Tests**: `22 / 22`
- **Execution Time**: ~4.5 seconds
- **Command**: `.\venv\Scripts\pytest tests/ -v` (inside `python-services/`)

### Test Coverage Breakdown

```text
Docker Container Isolation & Security (3 tests)
  ├── test_dockerfile_security_hardening (Validates non-root user aixuser UID 1000, no secrets, workspace directories)
  ├── test_docker_security_spec_flags (Enforces --user 1000:1000, no-new-privileges, resource limits, network none, read-only input, no docker.sock)
  └── test_container_to_container_workspace_isolation (Validates complete namespace and directory boundary separation between concurrent workloads)

Docker Sandbox Workspace Isolation (3 tests)
  ├── test_workspace_provisioning (Validates creation of input, code, data, output, checkpoints, logs)
  ├── test_path_traversal_prevention (Validates boundary checks and raises on escape attempts)
  └── test_deterministic_cleanup (Validates selective pruning and full workspace removal)

Live Jupyter Runtime (1 test)
  └── test_jupyter_manager_lifecycle (Verifies programmatic startup, token auth URL, status reporting, and clean shutdown)

Resource Limits & Timeouts (2 tests)
  ├── test_training_timeout_enforcement (Verifies training halts and marks state TIMEOUT when exceeding timeout_seconds)
  └── test_resource_settings_bounds (Verifies CPU, memory, PID limits configuration)

Training Runtime & Checkpoints (4 tests)
  ├── test_dynamic_mlp_construction (Dynamic architecture construction and tensor dimensions)
  ├── test_pytorch_training_loop (End-to-end training loop with live metrics and checkpoint saving)
  ├── test_checkpoint_rotation (Atomic saving and top-k lowest loss checkpoint retention)
  └── test_training_cancellation (Graceful early termination support)

Model Export & Validation (3 tests)
  ├── test_model_export (Serialization to .safetensors, .pt, and model_metadata.json generation)
  ├── test_model_validator_success (SHA-256 verification and forward-pass smoke test)
  └── test_model_validator_corrupted_file (Tamper detection and rejection)

Inference Engine (3 tests)
  ├── test_safe_model_loader (Zero-copy weights loading with weights_only=True)
  ├── test_inference_prediction_single (Prediction on 1D feature vectors with confidence scores)
  └── test_inference_prediction_batch (Batch tensor prediction and indexing)

End-to-End Workflow Acceptance (1 test)
  └── test_full_ai_sandbox_lifecycle (Dataset -> Sandbox -> Training -> Checkpoint -> Export -> Validation -> Inference -> Cleanup)

AI Execution Contract API (2 tests)
  ├── test_health_check_endpoint (FastAPI health route)
  └── test_api_training_and_inference_flow (HTTP trigger, status query, validation, inference)
```

---

## 3. Backend Test Suite (`server/tests/`)

- **Total Passing Tests**: `22 / 22`
- **Execution Time**: ~2.5–4.2 seconds
- **Command**: `npm test` (inside `server/`)

```text
Dataset & Review Validation (3 tests)
  ├── Dataset creation requires encrypted upload metadata
  ├── Review ratings are constrained to one through five
  └── Dataset model defaults protected files and keeps encryption metadata

Licensing System (6 tests)
  ├── Phase 5 accepts all license templates and exact enum values
  ├── Phase 5 enforces mutually exclusive fixed and royalty pricing
  ├── Phase 5 rejects invalid metadata, rights, and validity
  ├── Templates are read-only deterministic configurations
  ├── Update input cannot modify immutable license fields
  └── License model contains blockchain-compatible fields and indexes

Purchase Engine (3 tests)
  ├── Purchase requests only accept dataset and license identifiers
  ├── Purchase model has pending/confirmed lifecycle and event deduplication indexes
  └── PurchaseEngine ABI contains authoritative purchase, access, and event interfaces

Docker Sandbox Backend Orchestration (10 tests)
  ├── End-to-End Phase 7 Workflow: Access Check -> Create -> Stage Files -> Train -> Complete -> Logs
  ├── Sandbox model enforces required fields, lifecycle enum, and nested schemas
  ├── Sandbox model rejects invalid status enum values
  ├── SandboxFile model validates category enum and required fields
  ├── ExecutionEvent model validates eventType and records timestamp
  ├── Joi validators accept valid payloads and reject malformed schemas
  ├── File upload utilities correctly calculate checksum and infer categories
  ├── AiExecutionService wraps HTTP errors into ApiError with appropriate status codes
  ├── MonitoringService synchronizes execution state, updates metrics and artifacts
  └── TrainingLogService formats structured logs from epoch metrics and events
```

---

## 4. Sandbox SDK Test Suite (`sandbox/tests/`)

- **Total Passing Tests**: `10 / 10`
- **Execution Time**: ~0.2 seconds
- **Command**: `npm test` (inside `sandbox/`)

```text
Sandbox Client (5 tests)
  ├── SandboxClient.train sends POST request and returns ExecutionResponse
  ├── SandboxClient.getStatus retrieves execution status
  ├── SandboxClient handles AI service errors with AIExecutionError
  ├── SandboxClient wraps network connection drops in ConnectionError
  └── SandboxClient Jupyter start, stop, and status lifecycle

Workspace Layout & Staging (5 tests)
  ├── WorkspaceLayout generates complete directory hierarchy paths
  ├── sanitizeExecutionId accepts valid IDs and rejects unsafe inputs
  ├── validateContainedPath strictly blocks path traversal escapes
  ├── getWorkspaceDestinationForCategory routes to appropriate workspace directories
  └── stageWorkspaceFiles creates workspace and copies files to correct subdirectories
```

---

## 5. Frontend Testing Status

- **Frontend**: Manual end-to-end testing via the `/wallet-test` developer dashboard and interactive marketplace pages.

