"""
AIXchange - AI Execution API Integration Tests (Phase 7)
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AIXchange AI Execution Service"


def test_api_training_and_inference_flow(client, tmp_path):
    execution_id = "exec_api_test_001"
    train_payload = {
        "execution_id": execution_id,
        "framework": "pytorch",
        "model_spec": {
            "model_type": "mlp",
            "input_dim": 5,
            "hidden_dims": [16],
            "output_dim": 2,
            "activation": "relu",
            "dropout_rate": 0.0,
        },
        "dataset": {
            "format": "csv",
            "test_split_ratio": 0.2,
        },
        "hyperparameters": {
            "epochs": 2,
            "batch_size": 16,
            "learning_rate": 0.01,
            "optimizer": "adam",
            "loss_function": "cross_entropy",
        },
        "checkpoint_interval": 1,
    }

    # 1. Trigger Training
    train_res = client.post("/api/v1/execution/train", json=train_payload)
    assert train_res.status_code == 200
    train_data = train_res.json()
    assert train_data["state"] == "COMPLETED"
    assert train_data["validation"]["is_valid"] is True
    
    artifact_path = train_data["artifacts"]["artifact_path"]
    metadata_path = train_data["artifacts"]["metadata_path"]

    # 2. Query Status
    status_res = client.get(f"/api/v1/execution/{execution_id}/status")
    assert status_res.status_code == 200
    assert status_res.json()["state"] == "COMPLETED"

    # 3. Model Validation
    val_res = client.post(
        "/api/v1/execution/validate-model",
        params={"artifact_path": artifact_path, "metadata_path": metadata_path},
    )
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True

    # 4. Run Inference
    infer_payload = {
        "model_artifact_path": artifact_path,
        "metadata_path": metadata_path,
        "inputs": [0.1, 0.2, 0.3, 0.4, 0.5],
    }
    infer_res = client.post("/api/v1/execution/infer", json=infer_payload)
    assert infer_res.status_code == 200
    infer_data = infer_res.json()
    assert infer_data["num_samples"] == 1
    assert len(infer_data["results"]) == 1
    assert infer_data["results"][0]["prediction"] in [0, 1]
