# AI Architecture

## Overview

The AI layer in AIXchange is designed to support machine learning workflows, dataset quality evaluation, model inference, and secure execution.

> [!WARNING]
> **Implementation State: Scaffold / Planned**
> The Python AI services directory (`python-services/`) currently contains pinned package dependencies in `requirements.txt` and an application directory skeleton. Model training, inference servers, and evaluation pipelines have not yet been implemented as active runtime services.

---

## Directory Layout & Scaffolding (`python-services/`)

```text
python-services/
├── requirements.txt      # 130 pinned dependencies (PyTorch 2.13, Safetensors, Uvicorn, etc.)
├── README.md             # Module documentation
├── app/                  # Application package skeleton
│   ├── api/              # API router stubs (.gitkeep)
│   ├── core/             # Core configurations & helpers (.gitkeep)
│   ├── evaluation/       # Dataset / Model evaluation stubs (.gitkeep)
│   ├── inference/        # ML inference execution stubs (.gitkeep)
│   ├── models/           # Model definitions (.gitkeep)
│   ├── pipelines/        # Processing pipelines (.gitkeep)
│   ├── schemas/          # Pydantic schemas (.gitkeep)
│   ├── training/         # Training scripts (.gitkeep)
│   └── utils/            # Utility functions (.gitkeep)
└── tests/                # Test suite directory (.gitkeep)
```

---

## Detected Technology Dependencies

Inspected from `python-services/requirements.txt`:
- **Deep Learning**: `torch==2.13.0`, `safetensors==0.8.0`
- **Scientific Computing**: `scipy==1.18.0`, `numpy==2.5.1`, `sympy==1.14.0`, `networkx==3.6.1`
- **Web & Async Runtime**: `uvicorn==0.51.0`, `anyio==4.14.2`, `trio==0.33.0`, `requests==2.34.2`
- **Data Validation & Schemas**: `pydantic_core==2.46.4`, `fastjsonschema==2.21.2`
- **Serialization & Formats**: `protobuf==7.35.1`, `h5py==3.14.0`, `flatbuffers==25.12.19`

---

## Planned Capabilities (Roadmap)

1. **Dataset Quality Verification**: Automatic profiling, statistical checks, and sample verification of datasets uploaded to IPFS.
2. **Model Evaluation & Benchmarking**: Running standardized benchmarks on AI models hosted in the Model Marketplace.
3. **Execution Sandbox (Phase 7)**: Containerized Docker sandboxes allowing zero-leakage inference on confidential datasets.
4. **AI Provenance Engine (Phase 9)**: Tracking dataset lineage, model checkpoints, and synthetic data derivatives.
