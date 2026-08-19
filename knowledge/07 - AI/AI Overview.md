# AI Overview

## Overview

The AI layer in AIXchange provides an isolated, reproducible execution substrate for dataset preparation, neural network training, model export to Safetensors, artifact validation, JupyterLab interactive sessions, and decoupled model inference.

> [!NOTE]
> **Implementation State: Implemented (Phase 7 — Docker Sandbox AI Substrate)**
> The Python AI services layer (`python-services/`) provides the core execution substrate, Docker sandbox environment, PyTorch training pipelines, model export to `.safetensors` with Phase 9 provenance metadata, and standalone inference runtime.

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
├── README.md             # Setup guide
└── main.py               # FastAPI application entrypoint
```

---

## AI Execution Architecture

```text
[ Application Backend / User ] ────> [ AI Execution API (FastAPI) ]
                                                │
                                                ▼
                                    [ Docker Sandbox Manager ]
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
           [ Training Pipeline ]                                 [ Inference Engine ]
           - PyTorch neural network                              - Safe weights loading
           - DynamicMLP construction                             - Input preprocessing
           - Atomic checkpoint manager                           - Tensor forward pass
           - Safetensors model export                            - Confidence calibration
           - Provenance metadata generator                       - Latency measurement
```

---

## Related Links

- [[Docker Sandbox]]
- [[Jupyter Environment]]
- [[Training Engine]]
- [[Model Export]]
- [[Inference Engine]]
- [[AI Execution Contract]]
