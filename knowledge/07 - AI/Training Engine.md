# Training Engine

## Overview

The AIXchange Training Engine executes structured, isolated model training pipelines across supported machine learning frameworks (PyTorch).

---

## 1. Structured Pipeline Flow

```text
TrainingConfig (Validated)
         │
         ▼
Workspace Provisioning (/workspace/<execution_id>/)
         │
         ▼
Dataset Preparation & Split Validation
         │
         ▼
PyTorch Model Construction (DynamicMLP)
         │
         ▼
Training Loop (Optimizer, Loss, Scheduler, Grad Clipping)
         │
         ├── Periodic Checkpoints (top-k atomic rotation)
         └── Live Epoch Metrics Logging
         │
         ▼
Model Export (.safetensors, .pt, model_metadata.json)
         │
         ▼
Artifact Validation & Forward-Pass Smoke Test
```

---

## 2. Checkpoint Management

- Implemented in `app.training.checkpoints.CheckpointManager`.
- Saves atomic `.pt` checkpoint files to `checkpoints/`.
- Maintains `checkpoints_index.json` tracking epoch, timestamp, train/validation loss.
- Automatically retains only top-$k$ checkpoints (lowest validation loss) to conserve disk space.

---

## 3. Related Links

- [[Model Export]]
- [[Inference Engine]]
- [[Docker Sandbox]]
- [[AI Execution Contract]]
