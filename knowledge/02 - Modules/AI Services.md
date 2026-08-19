# AI Services

## Overview

The **AI Services** module is designed to provide automated machine learning utilities, dataset profiling, quality evaluation, and model inference services to support marketplace assets.

> [!WARNING]
> **Implementation State: Scaffold / Setup**
> The `python-services/` directory contains an installed Python environment and package list in `requirements.txt` (PyTorch, Safetensors, Uvicorn, NumPy, Scipy), along with an empty directory skeleton. Active runtime endpoints and inference pipelines are planned for upcoming phases.

---

## Existing Codebase References

- `python-services/requirements.txt`: 130 pinned dependencies.
- `python-services/README.md`: Overview of the Python services package structure.
- `python-services/app/`: Scaffolded package subdirectories containing `.gitkeep` files:
  - `api/`: API router definitions
  - `core/`: Core settings and configuration
  - `evaluation/`: Dataset and model metrics evaluation
  - `inference/`: Model execution and inference handlers
  - `models/`: PyTorch and Safetensors model wrappers
  - `pipelines/`: Data transformation and preprocessing flows
  - `schemas/`: Pydantic validation schemas
  - `training/`: Fine-tuning scripts
  - `utils/`: Common helpers and mathematical operations

---

## Planned Service Responsibilities

1. **Dataset Profiling**: Validating column types, distributions, and null ratios for datasets uploaded to IPFS.
2. **Quality Verification**: Statistical anomaly detection and automated evaluation scores stored in MongoDB.
3. **Execution Sandbox**: Secure inference runtime (Phase 7).
