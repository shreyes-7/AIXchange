# AI Architecture

## Overview

The AI layer in AIXchange provides an isolated, reproducible execution substrate for dataset preparation, neural network training, model export to Safetensors, artifact validation, JupyterLab interactive sessions, and decoupled model inference.

> [!NOTE]
> **Implementation State: Implemented (Phase 7 — Docker Sandbox AI Substrate)**
> The Python AI services layer (`python-services/`) provides the core execution substrate, Docker sandbox environment, PyTorch training pipelines, model export to `.safetensors` with Phase 9 provenance metadata, and standalone inference runtime.

---

## Architecture Topology

```text
                    AIXchange Platform
                            │
                            ▼
                  Backend / Application
                            │
                  AI Execution Contract
                            │
                            ▼
                  AI Execution Layer (python-services)
                            │
                     Docker Sandbox
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
       Jupyter                             Training
          │                                   │
   Interactive ML                      ┌──────┴──────┐
     Workspaces                        │             │
                                  Checkpoints      Logs
                                       │
                                       ▼
                                  Model Export
                                       │
                                       ▼
                                 Model Artifact
                                       │
                                       ▼
                              Artifact Validation
                                       │
                                       ▼
                                 Model Loading
                                       │
                                       ▼
                                   Inference
                                       │
                                       ▼
                               Prediction Output
```

---

## Directory Layout (`python-services/`)

```text
python-services/
├── app/
│   ├── api/              # FastAPI execution router (train, infer, validate-model, jupyter)
│   ├── core/             # SandboxManager, JupyterManager, config settings
│   ├── inference/        # SafeModelLoader, InferenceEngine
│   ├── models/           # ModelExporter, ModelValidator
│   ├── schemas/          # Pydantic schemas (training, inference, execution)
│   ├── training/         # BaseTrainer, PyTorchTrainer, CheckpointManager, TrainingPipeline
│   └── utils/            # Math and tensor helpers
├── tests/                # Automated pytest suite (16 passing tests)
├── requirements.txt      # 130 pinned dependencies
├── pytest.ini            # Pytest configuration
└── main.py               # FastAPI application entrypoint
```

---

## Related Links

- [[Docker Sandbox]]
- [[Jupyter Environment]]
- [[Training Engine]]
- [[Model Export]]
- [[Inference Engine]]
- [[AI Execution Contract]]
