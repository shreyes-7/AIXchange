# AI Overview

## Overview

The AI layer in AIXchange is planned to handle automated dataset profiling, machine learning model evaluation, secure inference, and embeddings-based semantic discovery.

> [!WARNING]
> **Implementation State: Scaffold / Setup**
> The Python AI services directory (`python-services/`) contains a pinned dependency manifest in `requirements.txt` and an application directory skeleton. The core execution engine is planned for development in subsequent phases.

---

## Directory Skeleton (`python-services/`)

```text
python-services/
├── requirements.txt      # 130 pinned dependencies (PyTorch, Safetensors, Uvicorn, etc.)
├── README.md             # Overview and virtual environment setup guide
├── app/                  # Application package skeleton
│   ├── api/              # API router stubs (.gitkeep)
│   ├── core/             # Core configurations & settings (.gitkeep)
│   ├── evaluation/       # Benchmark and metric evaluation stubs (.gitkeep)
│   ├── inference/        # Model execution & inference stubs (.gitkeep)
│   ├── models/           # PyTorch / Safetensors model wrappers (.gitkeep)
│   ├── pipelines/        # Data preprocessing pipelines (.gitkeep)
│   ├── schemas/          # Pydantic data schemas (.gitkeep)
│   ├── training/         # Fine-tuning & training stubs (.gitkeep)
│   └── utils/            # Mathematical & data utilities (.gitkeep)
└── tests/                # Test suite directory (.gitkeep)
```

---

## Planned Architecture

```text
[ User / Marketplace ] ────> [ Express API ] ────> [ Python FastAPI Service ]
                                                          │
                               ┌──────────────────────────┴──────────────────────────┐
                               ▼                                                     ▼
                     [ Quality Profiler ]                                  [ Model Evaluator ]
                     - Data distributions                                  - MMLU / Benchmarks
                     - Schema consistency                                  - Inference latency
                     - Missing values check                                - Accuracy metrics
```
