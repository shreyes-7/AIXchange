# Models

## Overview

This document describes the planned handling of AI models, weight formats, and serialization within the AIXchange ecosystem.

> [!WARNING]
> **Implementation State: Scaffold / Planned**
> Concrete model architectures and weights are not yet loaded or hosted in the codebase. Dependency manifests indicate intended support for PyTorch (`torch 2.13.0`) and Hugging Face Safetensors (`safetensors 0.8.0`).

---

## Supported Model Formats (Planned)

1. **Safetensors (`.safetensors`)**: Secure, zero-copy serialization format for deep learning tensors without arbitrary code execution risks.
2. **PyTorch Checkpoints (`.pt`, `.bin`)**: Native PyTorch model state dictionaries.
3. **ONNX / GGUF**: Cross-platform runtime formats for edge and quantised model inference.

---

## Codebase Indicators

- `python-services/requirements.txt`:
  - `torch==2.13.0`
  - `safetensors==0.8.0`
  - `protobuf==7.35.1`
  - `h5py==3.14.0`
  - `flatbuffers==25.12.19`
- `blockchain/contracts/libraries/Structs.sol`:
  - `AssetType` enum declares `MODEL` alongside `DATASET`.
