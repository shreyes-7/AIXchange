"""
AIXchange - Model Export and Validation Tests (Phase 7)
"""

import json
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
from app.models.validator import ModelValidator


@pytest.fixture
def trained_model_and_config():
    config = TrainingConfig(
        execution_id="exec_export_001",
        model_spec=ModelArchitectureSpec(input_dim=6, hidden_dims=[16], output_dim=3),
        dataset=DatasetInputSpec(format="csv"),
        hyperparameters=Hyperparameters(epochs=2),
    )
    model = DynamicMLP(input_dim=6, hidden_dims=[16], output_dim=3)
    progress = TrainingProgress(
        execution_id="exec_export_001",
        state=ExecutionState.COMPLETED,
        current_epoch=2,
        total_epochs=2,
        best_val_loss=0.35,
    )
    return model, config, progress


def test_model_export(trained_model_and_config, tmp_path):
    """Test serializing model to safetensors and generating model_metadata.json."""
    model, config, progress = trained_model_and_config
    exporter = ModelExporter()
    output_dir = tmp_path / "output"

    result = exporter.export(model, config, output_dir, progress)

    assert Path(result["primary_artifact_path"]).exists()
    assert Path(result["pytorch_artifact_path"]).exists()
    assert Path(result["metadata_path"]).exists()
    assert len(result["sha256"]) == 64

    # Verify metadata JSON contents
    with open(result["metadata_path"], "r") as f:
        meta = json.load(f)
    assert meta["model_id"] == "model_exec_export_001"
    assert meta["artifact_hash_sha256"] == result["sha256"]
    assert meta["framework"] == "pytorch"


def test_model_validator_success(trained_model_and_config, tmp_path):
    """Test successful artifact validation."""
    model, config, progress = trained_model_and_config
    exporter = ModelExporter()
    validator = ModelValidator()

    output_dir = tmp_path / "output"
    result = exporter.export(model, config, output_dir, progress)

    validation = validator.validate(
        artifact_path=result["primary_artifact_path"],
        metadata_path=result["metadata_path"],
        input_dim=6,
        output_dim=3,
    )

    assert validation.is_valid is True
    assert validation.checksum_verified is True
    assert validation.load_test_passed is True
    assert validation.inference_smoke_test_passed is True


def test_model_validator_corrupted_file(trained_model_and_config, tmp_path):
    """Test validator detects altered/corrupted file checksum."""
    model, config, progress = trained_model_and_config
    exporter = ModelExporter()
    validator = ModelValidator()

    output_dir = tmp_path / "output"
    result = exporter.export(model, config, output_dir, progress)

    # Tamper with file
    with open(result["primary_artifact_path"], "ab") as f:
        f.write(b"corruption_bytes")

    validation = validator.validate(
        artifact_path=result["primary_artifact_path"],
        metadata_path=result["metadata_path"],
    )

    assert validation.is_valid is False
    assert validation.checksum_verified is False
    assert "checksum mismatch" in validation.error_message.lower()
