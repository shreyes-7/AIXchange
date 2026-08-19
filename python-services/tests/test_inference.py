"""
AIXchange - Inference Engine Tests (Phase 7)
"""

import pytest
import torch
from pathlib import Path

from app.schemas.training import (
    TrainingConfig,
    ModelArchitectureSpec,
    DatasetInputSpec,
    Hyperparameters,
    TrainingProgress,
    ExecutionState,
)
from app.training.pytorch_trainer import DynamicMLP
from app.models.exporter import ModelExporter
from app.inference.loader import SafeModelLoader
from app.inference.engine import InferenceEngine
from app.schemas.inference import InferenceRequest


@pytest.fixture
def exported_model_paths(tmp_path):
    config = TrainingConfig(
        execution_id="exec_infer_001",
        model_spec=ModelArchitectureSpec(input_dim=4, hidden_dims=[16], output_dim=3),
        dataset=DatasetInputSpec(format="csv"),
        hyperparameters=Hyperparameters(epochs=1),
    )
    model = DynamicMLP(input_dim=4, hidden_dims=[16], output_dim=3)
    progress = TrainingProgress(
        execution_id="exec_infer_001",
        state=ExecutionState.COMPLETED,
        current_epoch=1,
        total_epochs=1,
    )
    exporter = ModelExporter()
    output_dir = tmp_path / "output"
    return exporter.export(model, config, output_dir, progress)


def test_safe_model_loader(exported_model_paths):
    """Test loading model weights into DynamicMLP safely."""
    model, metadata = SafeModelLoader.load_model(
        artifact_path=exported_model_paths["primary_artifact_path"],
        metadata_path=exported_model_paths["metadata_path"],
    )
    assert model is not None
    assert metadata is not None
    assert metadata.model_id == "model_exec_infer_001"


def test_inference_prediction_single(exported_model_paths):
    """Test inference on a single 1D feature vector."""
    engine = InferenceEngine()
    req = InferenceRequest(
        model_artifact_path=exported_model_paths["primary_artifact_path"],
        metadata_path=exported_model_paths["metadata_path"],
        inputs=[0.5, -0.2, 1.3, 0.0],
    )
    response = engine.predict(req)

    assert response.num_samples == 1
    assert len(response.results) == 1
    assert response.results[0].prediction in [0, 1, 2]
    assert response.results[0].confidence > 0.0
    assert response.latency_ms > 0.0


def test_inference_prediction_batch(exported_model_paths):
    """Test inference on a batch of feature vectors."""
    engine = InferenceEngine()
    req = InferenceRequest(
        model_artifact_path=exported_model_paths["primary_artifact_path"],
        metadata_path=exported_model_paths["metadata_path"],
        inputs=[
            [0.1, 0.2, 0.3, 0.4],
            [1.0, 0.0, -1.0, 0.5],
            [0.0, 0.0, 0.0, 0.0],
        ],
    )
    response = engine.predict(req)

    assert response.num_samples == 3
    assert len(response.results) == 3
    assert response.results[1].index == 1
