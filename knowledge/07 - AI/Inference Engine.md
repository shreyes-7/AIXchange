# Inference Engine

## Overview

The AIXchange Inference Engine provides standalone, decoupled prediction capabilities for exported model artifacts without requiring the training process or training runtime to remain active.

---

## 1. Inference Pipeline Flow

```text
InferenceRequest (Artifact Path + Input Features)
               │
               ▼
SafeModelLoader (Safetensors / weights_only=True)
               │
               ▼
Architecture Reconstruction (from model_metadata.json)
               │
               ▼
Input Preprocessing (1D vectors, 2D batch arrays, or Dicts)
               │
               ▼
Model Forward Pass (torch.no_grad())
               │
               ▼
Postprocessing (Softmax/Sigmoid Probabilities & Top-K)
               │
               ▼
InferenceResponse (Predictions, Confidence, Latency ms)
```

---

## 2. Security & Safe Deserialization

- Models are loaded exclusively via `safetensors.torch.load_file` or `torch.load(..., weights_only=True)` to prevent arbitrary code execution vulnerabilities associated with standard Python `pickle`.
- Input validation sanitizes tensor dimensions prior to execution.

---

## 3. Related Links

- [[Model Export]]
- [[Training Engine]]
- [[AI Execution Contract]]
