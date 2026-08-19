# Python Services — AI Execution Substrate (Phase 7)

The `python-services` module provides the isolated, reproducible AI execution substrate for AIXchange. It powers containerized model training, interactive JupyterLab sessions, model artifact export to Safetensors, cryptographic validation, and decoupled inference.

---

## 🚀 Key Capabilities

- **Docker Sandbox Infrastructure**: Non-root execution (`aixuser`, UID 1000), directory isolation (`/workspace/{input,code,data,output,checkpoints,logs}`), and Docker socket protection.
- **Interactive JupyterLab**: Hardened Jupyter server locked to the `/workspace` root with token authentication and terminal execution controls.
- **PyTorch Neural Training Pipeline**: Structured training loop with `DynamicMLP`, multiple optimizers (Adam, AdamW, SGD, RMSprop), StepLR decay, gradient clipping, live metrics logging, and early cancellation support.
- **Atomic Checkpoints**: `CheckpointManager` supporting atomic `.pt` persistence and automatic top-$k$ lowest loss rotation.
- **Model Export & Phase 9 Provenance**: Exports to Hugging Face `.safetensors` and PyTorch `.pt` formats, generating `model_metadata.json` preserving execution IDs, hyperparameters, dataset references, and SHA-256 cryptographic hashes.
- **Model Artifact Validation**: `ModelValidator` performing file existence checks, SHA-256 verification, safe weight deserialization (`weights_only=True`), and forward-pass smoke testing.
- **Decoupled Inference Engine**: Standalone `InferenceEngine` handling 1D vectors, 2D batch arrays, or dictionaries, calculating Softmax/Sigmoid probabilities, class predictions, and measuring inference latency in milliseconds.
- **AI Execution Contract REST API**: FastAPI server exposing standard endpoints for training, status polling, model validation, and inference.

---

## 📂 Directory Layout

```text
python-services/
├── app/
│   ├── api/              # FastAPI execution router (train, infer, validate-model, jupyter)
│   ├── core/             # SandboxManager, JupyterManager, DockerRunner, settings
│   ├── inference/        # SafeModelLoader, InferenceEngine
│   ├── models/           # ModelExporter, ModelValidator
│   ├── schemas/          # Pydantic schemas (training, inference, execution)
│   ├── training/         # BaseTrainer, PyTorchTrainer, CheckpointManager, TrainingPipeline
│   └── utils/            # Mathematical and tensor utilities
├── tests/                # Automated pytest suite (22 passing tests)
├── requirements.txt      # Pinned dependencies
├── pytest.ini            # Pytest configuration
├── main.py               # FastAPI application entrypoint
└── README.md             # This documentation
```

---

## 🛠️ How to Run

### 1. Local Development (Virtual Environment)

```bash
cd python-services

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the AI Execution FastAPI server
python main.py
```

- **Swagger API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 2. Docker Container Execution

```bash
# Build the AI Sandbox container
docker build -t aixchange-ai-sandbox:latest -f docker/sandbox/Dockerfile .

# Start container with Docker Compose
docker compose -f docker/docker-compose.sandbox.yml up -d
```

- **FastAPI Service**: `http://localhost:8000/docs`
- **JupyterLab Workspace**: `http://localhost:8888/lab?token=aixchange_sandbox_token`

---

## 🧪 Testing

Run the automated 22-test suite:

```bash
cd python-services
.\venv\Scripts\pytest tests/ -v
```

### Test Coverage Breakdown:
- `test_dockerfile_security_hardening`: Non-root user, workspace tree, no secret leaks.
- `test_docker_security_spec_flags`: Resource limits, network isolation, socket exclusion, read-only mounts.
- `test_container_to_container_workspace_isolation`: Workspace directory separation between runs.
- `test_workspace_provisioning` & `test_path_traversal_prevention`: Sandbox boundaries and path containment.
- `test_deterministic_cleanup`: Selective temporary file pruning vs. full workspace removal.
- `test_jupyter_manager_lifecycle`: Programmatic JupyterLab startup, token authentication, and shutdown.
- `test_training_timeout_enforcement`: Training timeout halts and marks execution state as `TIMEOUT`.
- `test_pytorch_training_loop` & `test_checkpoint_rotation`: Neural training loop and top-$k$ checkpoint saving.
- `test_model_export` & `test_model_validator_success`: Safetensors serialization and SHA-256 smoke test.
- `test_model_validator_corrupted_file`: Tamper detection and rejection.
- `test_inference_prediction_single` & `test_inference_prediction_batch`: Single and batch inference.
- `test_full_ai_sandbox_lifecycle`: Full end-to-end acceptance test (dataset $\to$ train $\to$ export $\to$ validate $\to$ infer $\to$ cleanup).
- `test_api_training_and_inference_flow`: HTTP API integration test.
