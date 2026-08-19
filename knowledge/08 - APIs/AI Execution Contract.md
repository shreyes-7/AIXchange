# AI Execution Contract

## Overview

The AI Execution Contract defines the structured API specification governing interactions between the AIXchange application backend and the isolated AI Execution Substrate.

---

## 1. REST Endpoints

### 1. Trigger Model Training
- **Endpoint**: `POST /api/v1/execution/train`
- **Request Body**: `TrainingConfig` (JSON)
- **Response**: `ExecutionResponse` (Status, Progress, Artifact Paths, Validation)

### 2. Query Execution Status
- **Endpoint**: `GET /api/v1/execution/{execution_id}/status`
- **Response**: `ExecutionResponse`

### 3. Run Inference
- **Endpoint**: `POST /api/v1/execution/infer`
- **Request Body**:
  ```json
  {
    "model_artifact_path": "/workspace/exec_001/output/model.safetensors",
    "metadata_path": "/workspace/exec_001/output/model_metadata.json",
    "inputs": [0.5, -0.2, 1.3, 0.0],
    "return_probabilities": true
  }
  ```
- **Response**: `InferenceResponse` (Prediction, Class Label, Confidence, Latency in ms)

### 4. Validate Model Artifact
- **Endpoint**: `POST /api/v1/execution/validate-model`
- **Query Params**: `artifact_path`, `metadata_path`
- **Response**: `ValidationResult` (is_valid, checksum_verified, load_test_passed, inference_smoke_test_passed)

### 5. Jupyter Management
- **Start**: `POST /api/v1/execution/jupyter/start`
- **Stop**: `POST /api/v1/execution/jupyter/stop`
- **Status**: `GET /api/v1/execution/jupyter/status`

---

## 2. Related Links

- [[Docker Sandbox]]
- [[Training Engine]]
- [[Inference Engine]]
- [[API Overview]]
