# Testing

## Overview

AIXchange implements comprehensive automated testing across its blockchain smart contracts and AI execution sandbox layer.

---

## 1. Blockchain Test Suite (`blockchain/test/`)

- **Total Passing Tests**: `115 / 115`
- **Execution Time**: ~4–11 seconds
- **Command**: `npx hardhat test` (inside `blockchain/`)

### Test Coverage Breakdown

```text
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

## 3. Frontend & Backend Testing Status

- **Frontend**: Manual end-to-end testing via the `/wallet-test` developer dashboard and interactive marketplace pages.
- **Backend**: Test runner configured in `server/package.json` (`node --test tests/**/*.test.js`).
