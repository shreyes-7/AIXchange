"""
AIXchange - Base Trainer Interface (Phase 7)
Defines the standard abstract contract for framework-specific trainers.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from ..schemas.training import TrainingConfig, TrainingProgress, EpochMetric


class BaseTrainer(ABC):
    """Abstract base class for all model trainers (PyTorch, TensorFlow, etc.)."""

    def __init__(self, config: TrainingConfig, workspace_dir: str):
        self.config = config
        self.workspace_dir = workspace_dir
        self.progress = TrainingProgress(
            execution_id=config.execution_id,
            state="READY",
            current_epoch=0,
            total_epochs=config.hyperparameters.epochs,
        )

    @abstractmethod
    def build_model(self) -> Any:
        """Constructs and initializes the model architecture."""
        pass

    @abstractmethod
    def prepare_data(self) -> Any:
        """Loads, validates, and stages the dataset for training."""
        pass

    @abstractmethod
    def train(self) -> TrainingProgress:
        """Executes the full training loop with epoch iterations and metrics tracking."""
        pass

    @abstractmethod
    def save_checkpoint(self, epoch: int, metrics: EpochMetric) -> str:
        """Saves a model and optimizer checkpoint to the checkpoints directory."""
        pass

    @abstractmethod
    def load_checkpoint(self, checkpoint_path: str) -> None:
        """Restores model and optimizer states from a checkpoint."""
        pass
