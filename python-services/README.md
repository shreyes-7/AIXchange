# Python AI Execution Substrate (`python-services`)

The `python-services` module provides the isolated, reproducible AI execution substrate for AIXchange. It powers containerized model training, interactive JupyterLab sessions, model artifact export to Hugging Face Safetensors, cryptographic SHA-256 weight validation, decoupled tensor inference, and execution contract REST endpoints.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Key Capabilities](#key-capabilities)
3. [Technology Stack & Dependencies](#technology-stack--dependencies)
4. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
5. [How to Run the Services](#how-to-run-the-services)
   - [A. Running the AI Execution REST API (Port 8000)](#a-running-the-ai-execution-rest-api-port-8000)
   - [B. Running the JupyterLab Sandbox (Terminal 5 / Port 8888)](#b-running-the-jupyterlab-sandbox-terminal-5--port-8888)
6. [API Route Catalog](#api-route-catalog)
7. [Workspace Directory Hierarchy](#workspace-directory-hierarchy)
8. [Automated Testing Suite (Pytest)](#automated-testing-suite-pytest)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Architectural Overview

The Python substrate handles computationally intensive AI workloads and keeps dangerous, untrusted user code isolated from backend database and blockchain credentials:

```text
 ┌─────────────────────────┐               ┌─────────────────────────┐
 │   Backend Node Server   │               │ React Frontend Client   │
 │  http://localhost:5000  │               │ http://localhost:5173   │
 └───────────┬─────────────┘               └───────────┬─────────────┘
             │ HTTP REST Execution                     │ iframe Embedding
             ▼                                         ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │                       python-services                             │
 │                                                                   │
 │  ┌────────────────────────────────┐   ┌────────────────────────┐  │
 │  │ FastAPI AI Execution Service   │   │ Interactive JupyterLab │  │
 │  │      http://localhost:8000     │   │  http://127.0.0.1:8888 │  │
 │  │  (Train, Infer, Validate, Log) │   │ (Token Auth, Workspaces)│  │
 │  └────────────────┬───────────────┘   └───────────┬────────────┘  │
 │                   │                               │               │
 │                   ▼                               ▼               │
 │        ┌─────────────────────────────────────────────────┐        │
 │        │  Structured Workspace Filesystem (/workspace)   │        │
 │        │  (input/data, code, checkpoints, output, logs)  │        │
 │        └─────────────────────────────────────────────────┘        │
 └───────────────────────────────────────────────────────────────────┘
```

---

## Key Capabilities

- **PyTorch Training Pipeline**: Automated training loops supporting `DynamicMLP`, multiple optimizers (Adam, AdamW, SGD, RMSprop), StepLR learning rate schedules, gradient clipping, live epoch loss telemetry, and graceful early cancellation.
- **Atomic Model Checkpointing**: `CheckpointManager` handles safe `.pt` model checkpoint persistence with automatic top-$k$ lowest loss rotation.
- **Safetensors & PyTorch Export**: Exports trained weights to Hugging Face `.safetensors` format and generates `model_metadata.json` containing architecture hyperparameters, parent dataset IDs, and cryptographic SHA-256 digests.
- **Cryptographic Model Validation**: `ModelValidator` performs weight integrity checks, validates SHA-256 hashes against blockchain commitments, safely deserializes tensors (`weights_only=True`), and performs forward-pass smoke tests.
- **Decoupled Inference Engine**: High-throughput `InferenceEngine` accepts 1D feature vectors or 2D batch arrays, applies Softmax/Sigmoid activations, generates class labels, and measures inference latency in milliseconds.
- **Interactive JupyterLab IDE**: Hardened Jupyter server locked to the `./workspace` directory with token-based authentication and iframe embedding support.

---

## Technology Stack & Dependencies

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `>=3.10, <3.12` | Runtime environment (Python 3.11 recommended) |
| **FastAPI** | `>=0.115.0` | Asynchronous high-performance REST API framework |
| **Uvicorn** | `>=0.30.0` | ASGI web server implementation |
| **PyTorch** | `>=2.4.0` | Deep learning tensor framework and training autograd |
| **Safetensors** | `>=0.4.4` | Fast, safe serialization format for neural network weights |
| **JupyterLab** | `>=4.2.0` | Interactive web-based notebook development environment |
| **Pydantic** | `>=2.8.0` | Data validation and settings management |
| **NumPy / Pandas** | Latest | Data processing and numerical array operations |
| **Pytest** | `>=8.3.0` | Automated unit and integration test runner |

---

## Prerequisites & Environment Setup

### 1. Create Virtual Environment

Ensure you have Python 3.10 or 3.11 installed.

```powershell
# Working Directory: D:\AIXchange\python-services
python -m venv venv
```

### 2. Activate Virtual Environment

```powershell
# Windows PowerShell:
.\venv\Scripts\activate

# Linux / macOS:
# source venv/bin/activate
```

### 3. Install Dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

---

## How to Run the Services

### A. Running the AI Execution REST API (Port 8000)

This service executes training jobs, generates predictions, and validates model weights dispatched by the backend server:

```powershell
# Working Directory: D:\AIXchange\python-services
# Ensure venv is activated: .\venv\Scripts\activate
python main.py
```

- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

---

### B. Running the JupyterLab Sandbox (Terminal 5 / Port 8888)

This is the exact command invoked in **Terminal 5** of the master five-terminal workflow:

```powershell
# Working Directory: D:\AIXchange (Workspace Root)
npm run sandbox:jupyter
```

Under the hood, this executes:
```powershell
cd python-services && .\venv\Scripts\jupyter-lab.exe --config=./jupyter_server_config.py --ServerApp.root_dir=./workspace
```

### Jupyter Configuration Details (`jupyter_server_config.py`)

- **Host & Port**: `127.0.0.1:8888`
- **Authentication Token**: `aixchange_sandbox_token`
- **Access URL**: `http://127.0.0.1:8888/lab?token=aixchange_sandbox_token`
- **Root Directory**: `python-services/workspace`
- **Content Security Policy**: Configured to permit iframe embedding inside the AIXchange client (`http://localhost:5173/sandboxes`).

> **Workflow Note:** The Jupyter sandbox is required when training models or working in interactive notebooks via the frontend Sandbox Dashboard. The dataset and model marketplaces will function without it, but the AI studio and sandbox pages require this service.

---

## API Route Catalog

The execution API is mounted under `/api/v1/execution`:

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/execution/train` | `TrainingConfig` (JSON) | Launches an isolated training pipeline in the sandbox |
| `POST` | `/api/v1/execution/infer` | `InferenceRequest` (JSON) | Executes forward inference on a model with input features |
| `POST` | `/api/v1/execution/validate-model`| Query: `artifact_path` | Validates model checksums and runs forward-pass tests |
| `POST` | `/api/v1/execution/jupyter/start`| None | Starts the JupyterLab server programmatically |
| `POST` | `/api/v1/execution/jupyter/stop` | None | Terminates the active JupyterLab instance |
| `GET` | `/api/v1/execution/jupyter/status`| None | Returns Jupyter status, port, and authentication token |
| `GET` | `/api/v1/execution/{id}/status` | Path parameter: `id` | Polls training metrics, epoch loss, and output artifact paths |
| `GET` | `/health` | None | Service liveness probe |

---

## Workspace Directory Hierarchy

Training artifacts and datasets are strictly partitioned inside `python-services/workspace/{execution_id}/`:

```text
workspace/{execution_id}/
├── input/          # Staged input datasets (CSV, JSON, NPZ archives)
├── code/           # User-submitted training scripts (e.g. train.py)
├── checkpoints/    # Intermediate epoch checkpoints (model_best.pt)
├── output/         # Final model.safetensors, model.pt, model_metadata.json
└── logs/           # Real-time stdout/stderr execution logs
```

Path containment checks guarantee that no execution can read or write outside its allocated execution folder.

---

## Automated Testing Suite (Pytest)

The Python test battery verifies the neural training loop, checkpoint manager, Safetensors exporter, model validator, and inference engine:

```powershell
# Working Directory: D:\AIXchange\python-services
# Ensure venv is activated: .\venv\Scripts\activate

# Run full test battery
pytest -v

# Run with concise output
pytest -q
```

All 22 automated unit and integration tests validate the mathematical correctness and security invariants of the execution layer.

---

## Troubleshooting & FAQ

### Issue: "jupyter-lab.exe is not recognized as an internal or external command"
- **Cause**: The Python virtual environment is missing or dependencies have not been installed.
- **Fix**: Create and populate the virtual environment:
  ```powershell
  cd python-services
  python -m venv venv
  .\venv\Scripts\activate
  pip install -r requirements.txt
  ```

### Issue: "Port 8888 is already in use"
- **Cause**: A previous JupyterLab instance was not cleanly stopped.
- **Fix**: Terminate the occupying process on Windows:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8888).OwningProcess | Stop-Process -Force
  npm run sandbox:jupyter
  ```

### Issue: "Iframe refused to connect" on the Sandbox Dashboard page
- **Cause**: Jupyter was started without `jupyter_server_config.py` headers allowing `frame-ancestors`.
- **Fix**: Ensure Jupyter is started with the exact command in `npm run sandbox:jupyter`, which loads `jupyter_server_config.py`.
