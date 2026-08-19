# Model Export

## Overview

Model Export serializes trained in-memory neural network weights into persistent, verifiable artifacts suitable for decoupled inference and future Phase 8/9 marketplace integration.

---

## 1. Export Formats

- **`model.safetensors`**: Primary export format utilizing Hugging Face Safetensors (zero-copy, fast deserialization, immune to Python pickle exploits).
- **`model.pt`**: PyTorch `state_dict` fallback.
- **`model_metadata.json`**: Complete execution and provenance metadata record.

---

## 2. Phase 9 Provenance Metadata Record

The generated `model_metadata.json` preserves:
- `model_id`: Unique model identifier (`model_<execution_id>`).
- `execution_id`: Sandbox execution run ID.
- `dataset_reference`: Dataset ID, CID, test split ratio, and column subsets.
- `framework` & `framework_version`: E.g. PyTorch `2.13.0`.
- `model_architecture`: Input dim, hidden dims, output dim, activation, dropout.
- `hyperparameters`: Epochs, batch size, learning rate, optimizer, loss.
- `metrics_summary`: Best validation loss, train/val accuracy, epoch count.
- `artifact_hash_sha256`: Cryptographic SHA-256 hash of the `.safetensors` file.
- `creation_timestamp`: ISO 8601 UTC timestamp.

---

## 3. Artifact Validation & Smoke Testing

The `ModelValidator` performs:
1. **Existence & Size Verification**: Ensures files are non-empty.
2. **Cryptographic Checksum Match**: Computes SHA-256 and compares with metadata.
3. **Safe Deserialization Test**: Loads weights into memory with `weights_only=True`.
4. **Inference Smoke Test**: Executes forward pass on dummy tensors to confirm matching output dimensions before approving the artifact as `VALID`.

---

## 4. Related Links

- [[Training Engine]]
- [[Inference Engine]]
- [[AI Provenance]]
