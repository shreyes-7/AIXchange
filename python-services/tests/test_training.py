"""
AIXchange - Training Runtime Tests (Phase 7)
"""

import pytest
import torch
from pathlib import Path

from app.schemas.training import (
    TrainingConfig,
    ModelArchitectureSpec,
    DatasetInputSpec,
    Hyperparameters,
    ExecutionState,
    OptimizerType,
    LossFunctionType,
)
from app.training.pytorch_trainer import PyTorchTrainer, DynamicMLP
from app.training.checkpoints import CheckpointManager


@pytest.fixture
def sample_training_config():
    return TrainingConfig(
        execution_id="exec_train_001",
        model_spec=ModelArchitectureSpec(
            input_dim=8,
            hidden_dims=[32, 16],
            output_dim=2,
            activation="relu",
            dropout_rate=0.1,
        ),
        dataset=DatasetInputSpec(
            format="csv",
            test_split_ratio=0.2,
        ),
        hyperparameters=Hyperparameters(
            epochs=3,
            batch_size=16,
            learning_rate=0.01,
            optimizer=OptimizerType.ADAM,
            loss_function=LossFunctionType.CROSS_ENTROPY,
        ),
        checkpoint_interval=1,
    )


def test_dynamic_mlp_construction():
    """Verify dynamic MLP construction and forward pass tensor shapes."""
    model = DynamicMLP(input_dim=8, hidden_dims=[32, 16], output_dim=2)
    x = torch.randn(4, 8)
    out = model(x)
    assert out.shape == (4, 2)


def test_pytorch_training_loop(sample_training_config, tmp_path):
    """Test full training execution, epoch metrics, and checkpoint creation."""
    trainer = PyTorchTrainer(sample_training_config, str(tmp_path))
    
    # Train with synthetic data
    progress = trainer.train()

    assert progress.state == ExecutionState.COMPLETED
    assert progress.current_epoch == 3
    assert len(progress.history) == 3
    assert progress.history[0].train_loss > 0
    assert progress.active_checkpoint is not None
    assert Path(progress.active_checkpoint).exists()


def test_checkpoint_rotation(tmp_path):
    """Test that CheckpointManager respects keep_top_k and atomic saving."""
    from app.schemas.training import EpochMetric
    import time

    mgr = CheckpointManager(tmp_path / "checkpoints", keep_top_k=2)

    # Save 4 checkpoints with decreasing losses
    for epoch, loss in [(1, 0.9), (2, 0.7), (3, 0.4), (4, 0.5)]:
        metric = EpochMetric(
            epoch=epoch,
            train_loss=loss,
            val_loss=loss,
            learning_rate=0.001,
            duration_seconds=0.1,
            timestamp=time.time(),
        )
        mgr.save_checkpoint(
            epoch=epoch,
            model_state={"w": torch.tensor([1.0])},
            optimizer_state={},
            metrics=metric,
        )

    # Should retain best 2 (epoch 3 with 0.4 and epoch 4 with 0.5)
    best = mgr.load_latest_or_best(best=True)
    assert best["epoch"] == 3
    assert len(mgr._history) == 2


def test_training_cancellation(sample_training_config, tmp_path):
    """Test training cancellation support."""
    sample_training_config.hyperparameters.epochs = 100
    trainer = PyTorchTrainer(sample_training_config, str(tmp_path))
    trainer.cancel()
    
    progress = trainer.train()
    assert progress.state == ExecutionState.CANCELLED
