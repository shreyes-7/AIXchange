"""
AIXchange - PyTorch Trainer (Phase 7)
Concrete trainer implementation for neural network training in PyTorch.
"""

import time
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from .base import BaseTrainer
from .checkpoints import CheckpointManager
from ..schemas.training import (
    TrainingConfig,
    TrainingProgress,
    EpochMetric,
    ExecutionState,
    OptimizerType,
    LossFunctionType,
)

logger = logging.getLogger("aixchange.pytorch_trainer")


class DynamicMLP(nn.Module):
    """Dynamically constructed Multi-Layer Perceptron based on architecture spec."""

    def __init__(self, input_dim: int, hidden_dims: List[int], output_dim: int, activation: str = "relu", dropout: float = 0.0):
        super().__init__()
        layers: List[nn.Module] = []
        act_fn = nn.ReLU if activation.lower() == "relu" else (nn.GELU if activation.lower() == "gelu" else nn.Tanh)

        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(act_fn())
            if dropout > 0:
                layers.append(nn.Dropout(dropout))
            prev_dim = h_dim

        layers.append(nn.Linear(prev_dim, output_dim))
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class PyTorchTrainer(BaseTrainer):
    """Executes structured neural network training on PyTorch."""

    def __init__(self, config: TrainingConfig, workspace_dir: str):
        super().__init__(config, workspace_dir)
        self.device = torch.device(config.device if torch.cuda.is_available() and config.device == "cuda" else "cpu")
        self.model: Optional[nn.Module] = None
        self.optimizer: Optional[optim.Optimizer] = None
        self.criterion: Optional[nn.Module] = None
        self.scheduler: Optional[optim.lr_scheduler._LRScheduler] = None
        
        self.checkpoints_dir = Path(workspace_dir) / "checkpoints"
        self.checkpoint_manager = CheckpointManager(
            self.checkpoints_dir,
            keep_top_k=config.keep_top_k_checkpoints,
        )
        self._cancelled = False

    def cancel(self):
        """Signals the training loop to gracefully stop."""
        self._cancelled = True

    def build_model(self) -> nn.Module:
        """Constructs the neural network model."""
        spec = self.config.model_spec
        self.model = DynamicMLP(
            input_dim=spec.input_dim,
            hidden_dims=spec.hidden_dims,
            output_dim=spec.output_dim,
            activation=spec.activation,
            dropout=spec.dropout_rate,
        ).to(self.device)
        return self.model

    def prepare_data(self, X: Optional[torch.Tensor] = None, y: Optional[torch.Tensor] = None) -> Tuple[DataLoader, Optional[DataLoader]]:
        """
        Prepares training and validation DataLoaders.
        If synthetic or in-memory tensors are provided, stages them directly.
        """
        spec = self.config.model_spec
        hp = self.config.hyperparameters

        if X is None or y is None:
            # Fallback / synthetic dataset for testing
            num_samples = 200
            X = torch.randn(num_samples, spec.input_dim)
            if self.config.hyperparameters.loss_function in [LossFunctionType.MSE, LossFunctionType.L1]:
                y = torch.randn(num_samples, spec.output_dim)
            else:
                y = torch.randint(0, spec.output_dim, (num_samples,))

        split_idx = int(len(X) * (1.0 - self.config.dataset.test_split_ratio))
        train_ds = TensorDataset(X[:split_idx], y[:split_idx])
        val_ds = TensorDataset(X[split_idx:], y[split_idx:]) if split_idx < len(X) else None

        train_loader = DataLoader(train_ds, batch_size=hp.batch_size, shuffle=True)
        val_loader = DataLoader(val_ds, batch_size=hp.batch_size, shuffle=False) if val_ds else None

        return train_loader, val_loader

    def _setup_optimizer_and_loss(self):
        """Initializes optimizer, loss function, and learning rate scheduler."""
        hp = self.config.hyperparameters
        
        # Optimizer
        if hp.optimizer == OptimizerType.ADAMW:
            self.optimizer = optim.AdamW(self.model.parameters(), lr=hp.learning_rate, weight_decay=hp.weight_decay)
        elif hp.optimizer == OptimizerType.SGD:
            self.optimizer = optim.SGD(self.model.parameters(), lr=hp.learning_rate, weight_decay=hp.weight_decay)
        elif hp.optimizer == OptimizerType.RMSPROP:
            self.optimizer = optim.RMSprop(self.model.parameters(), lr=hp.learning_rate, weight_decay=hp.weight_decay)
        else:
            self.optimizer = optim.Adam(self.model.parameters(), lr=hp.learning_rate, weight_decay=hp.weight_decay)

        # Loss Function
        if hp.loss_function == LossFunctionType.MSE:
            self.criterion = nn.MSELoss()
        elif hp.loss_function == LossFunctionType.L1:
            self.criterion = nn.L1Loss()
        elif hp.loss_function == LossFunctionType.BCE_WITH_LOGITS:
            self.criterion = nn.BCEWithLogitsLoss()
        else:
            self.criterion = nn.CrossEntropyLoss()

        # Scheduler
        if hp.lr_decay_step:
            self.scheduler = optim.lr_scheduler.StepLR(
                self.optimizer,
                step_size=hp.lr_decay_step,
                gamma=hp.lr_decay_gamma,
            )

    def train(self, data_loaders: Optional[Tuple[DataLoader, Optional[DataLoader]]] = None) -> TrainingProgress:
        """Executes the full training lifecycle."""
        self.progress.state = ExecutionState.RUNNING
        self.build_model()
        self._setup_optimizer_and_loss()

        if data_loaders is None:
            train_loader, val_loader = self.prepare_data()
        else:
            train_loader, val_loader = data_loaders

        hp = self.config.hyperparameters
        best_loss = float("inf")
        total_start_time = time.time()

        try:
            for epoch in range(1, hp.epochs + 1):
                if self._cancelled:
                    self.progress.state = ExecutionState.CANCELLED
                    self.progress.error_message = "Training was cancelled by user"
                    break

                if (time.time() - total_start_time) > self.config.timeout_seconds:
                    self.progress.state = ExecutionState.TIMEOUT
                    self.progress.error_message = f"Training exceeded timeout limit of {self.config.timeout_seconds}s"
                    logger.warning(f"Training timeout exceeded on execution {self.config.execution_id}")
                    break

                start_time = time.time()
                self.model.train()
                total_train_loss = 0.0
                correct_train = 0
                total_train_samples = 0

                for batch_x, batch_y in train_loader:
                    batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                    self.optimizer.zero_grad()
                    output = self.model(batch_x)
                    loss = self.criterion(output, batch_y)
                    loss.backward()

                    if hp.grad_clip_norm:
                        nn.utils.clip_grad_norm_(self.model.parameters(), hp.grad_clip_norm)

                    self.optimizer.step()
                    total_train_loss += loss.item() * len(batch_x)

                    # Compute classification accuracy if applicable
                    if hp.loss_function == LossFunctionType.CROSS_ENTROPY:
                        preds = torch.argmax(output, dim=1)
                        correct_train += (preds == batch_y).sum().item()
                    total_train_samples += len(batch_x)

                if self.scheduler:
                    self.scheduler.step()

                avg_train_loss = total_train_loss / max(total_train_samples, 1)
                train_acc = (correct_train / total_train_samples) if total_train_samples > 0 and hp.loss_function == LossFunctionType.CROSS_ENTROPY else None

                # Validation step
                val_loss, val_acc = self._evaluate(val_loader)
                duration = time.time() - start_time
                current_lr = self.optimizer.param_groups[0]["lr"]

                metric = EpochMetric(
                    epoch=epoch,
                    train_loss=avg_train_loss,
                    train_accuracy=train_acc,
                    val_loss=val_loss,
                    val_accuracy=val_acc,
                    learning_rate=current_lr,
                    duration_seconds=duration,
                    timestamp=time.time(),
                )

                self.progress.current_epoch = epoch
                self.progress.history.append(metric)

                if val_loss is not None and val_loss < best_loss:
                    best_loss = val_loss
                    self.progress.best_val_loss = val_loss

                # Periodic Checkpoint
                if epoch % self.config.checkpoint_interval == 0 or epoch == hp.epochs:
                    saved_path = self.save_checkpoint(epoch, metric)
                    self.progress.active_checkpoint = saved_path

            if self.progress.state not in [ExecutionState.CANCELLED, ExecutionState.TIMEOUT, ExecutionState.FAILED]:
                self.progress.state = ExecutionState.COMPLETED

        except Exception as e:
            self.progress.state = ExecutionState.FAILED
            self.progress.error_message = str(e)
            logger.error(f"Training loop failed on execution {self.config.execution_id}: {str(e)}", exc_info=True)

        return self.progress

    def _evaluate(self, val_loader: Optional[DataLoader]) -> Tuple[Optional[float], Optional[float]]:
        if not val_loader:
            return None, None

        self.model.eval()
        total_val_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                output = self.model(batch_x)
                loss = self.criterion(output, batch_y)
                total_val_loss += loss.item() * len(batch_x)

                if self.config.hyperparameters.loss_function == LossFunctionType.CROSS_ENTROPY:
                    preds = torch.argmax(output, dim=1)
                    correct += (preds == batch_y).sum().item()
                total += len(batch_x)

        avg_loss = total_val_loss / max(total, 1)
        acc = (correct / total) if total > 0 and self.config.hyperparameters.loss_function == LossFunctionType.CROSS_ENTROPY else None
        return avg_loss, acc

    def save_checkpoint(self, epoch: int, metrics: EpochMetric) -> str:
        return self.checkpoint_manager.save_checkpoint(
            epoch=epoch,
            model_state=self.model.state_dict(),
            optimizer_state=self.optimizer.state_dict(),
            metrics=metrics,
            extra_meta={"framework": "pytorch", "config": self.config.model_dump()},
        )

    def load_checkpoint(self, checkpoint_path: str) -> None:
        if self.model is None:
            self.build_model()
        data = torch.load(checkpoint_path, weights_only=False)
        self.model.load_state_dict(data["model_state_dict"])
        if self.optimizer is not None and "optimizer_state_dict" in data:
            self.optimizer.load_state_dict(data["optimizer_state_dict"])
        logger.info(f"Loaded checkpoint from {checkpoint_path}")
