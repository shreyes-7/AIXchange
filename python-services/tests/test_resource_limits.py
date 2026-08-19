"""
AIXchange - Resource Limits & Timeout Tests (Phase 7)
"""

import time
import pytest
import torch

from app.schemas.training import (
    TrainingConfig,
    ModelArchitectureSpec,
    DatasetInputSpec,
    Hyperparameters,
    ExecutionState,
    OptimizerType,
    LossFunctionType,
)
from app.training.pytorch_trainer import PyTorchTrainer
from app.core.config import settings


def test_training_timeout_enforcement(tmp_path):
    """Test that training halts with TIMEOUT state when exceeding timeout_seconds."""
    config = TrainingConfig(
        execution_id="exec_timeout_test",
        model_spec=ModelArchitectureSpec(input_dim=8, hidden_dims=[32], output_dim=2),
        dataset=DatasetInputSpec(format="csv"),
        hyperparameters=Hyperparameters(epochs=1000, batch_size=4),  # Very large epochs
        timeout_seconds=1,  # Strict 1-second timeout
        checkpoint_interval=50,
    )

    trainer = PyTorchTrainer(config, str(tmp_path))
    progress = trainer.train()

    assert progress.state == ExecutionState.TIMEOUT
    assert "exceeded timeout" in progress.error_message.lower()
    assert progress.current_epoch < 1000


def test_resource_settings_bounds():
    """Verify centralized resource configuration constants."""
    assert settings.max_memory_mb >= 1024
    assert settings.max_cpu_cores >= 1.0
    assert settings.pids_limit >= 50
    assert settings.default_timeout_seconds >= 60
