"""
AIXchange - Training Schemas (Phase 7)
Defines Pydantic models for training configuration, hyperparameters,
dataset specifications, metrics logging, and lifecycle states.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ExecutionState(str, Enum):
    """Lifecycle state of an AI execution job."""
    CREATING = "CREATING"
    READY = "READY"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    TIMEOUT = "TIMEOUT"


class FrameworkType(str, Enum):
    """Supported ML/DL frameworks."""
    PYTORCH = "pytorch"
    TENSORFLOW = "tensorflow"
    SCIKIT_LEARN = "scikit-learn"


class OptimizerType(str, Enum):
    """Supported optimizers."""
    ADAM = "adam"
    ADAMW = "adamw"
    SGD = "sgd"
    RMSPROP = "rmsprop"


class LossFunctionType(str, Enum):
    """Supported loss functions."""
    CROSS_ENTROPY = "cross_entropy"
    MSE = "mse"
    BCE = "bce"
    BCE_WITH_LOGITS = "bce_with_logits"
    L1 = "l1"


class DatasetInputSpec(BaseModel):
    """Dataset input specification supplied by the authorized application layer."""
    dataset_id: Optional[int] = Field(None, description="On-chain dataset ID if applicable")
    cid: Optional[str] = Field(None, description="IPFS Content Identifier for dataset payload")
    local_path: Optional[str] = Field(None, description="Path to dataset inside workspace input/")
    format: str = Field("csv", description="Dataset format: csv, json, parquet, npy, etc.")
    target_column: Optional[str] = Field(None, description="Label/target column name")
    feature_columns: Optional[List[str]] = Field(None, description="Explicit feature column subset")
    test_split_ratio: float = Field(0.2, ge=0.0, le=0.5, description="Validation/Test split ratio")


class Hyperparameters(BaseModel):
    """Training hyperparameters."""
    epochs: int = Field(10, ge=1, le=1000, description="Total training epochs")
    batch_size: int = Field(32, ge=1, le=4096, description="Mini-batch size")
    learning_rate: float = Field(0.001, gt=0.0, le=1.0, description="Initial learning rate")
    optimizer: OptimizerType = Field(OptimizerType.ADAM, description="Optimizer algorithm")
    loss_function: LossFunctionType = Field(LossFunctionType.CROSS_ENTROPY, description="Loss criterion")
    weight_decay: float = Field(0.0, ge=0.0, le=0.1, description="L2 regularization factor")
    grad_clip_norm: Optional[float] = Field(None, gt=0.0, description="Max gradient norm clipping")
    lr_decay_step: Optional[int] = Field(None, ge=1, description="Epoch interval for StepLR decay")
    lr_decay_gamma: float = Field(0.1, gt=0.0, le=1.0, description="Multiplicative LR decay factor")


class ModelArchitectureSpec(BaseModel):
    """Specification of the neural network or model architecture."""
    model_type: str = Field("mlp", description="Model architecture type: mlp, cnn, linear, custom")
    input_dim: int = Field(..., ge=1, description="Input feature dimension")
    hidden_dims: List[int] = Field(default_factory=lambda: [64, 32], description="Hidden layer dimensions")
    output_dim: int = Field(..., ge=1, description="Output classification or regression dimension")
    activation: str = Field("relu", description="Activation function: relu, gelu, tanh, sigmoid")
    dropout_rate: float = Field(0.0, ge=0.0, le=0.8, description="Dropout probability")


class TrainingConfig(BaseModel):
    """Complete, validated training configuration."""
    execution_id: str = Field(..., description="Unique execution identifier")
    framework: FrameworkType = Field(FrameworkType.PYTORCH, description="Underlying ML framework")
    model_spec: ModelArchitectureSpec = Field(..., description="Model architecture specification")
    dataset: DatasetInputSpec = Field(..., description="Dataset input specification")
    hyperparameters: Hyperparameters = Field(default_factory=Hyperparameters, description="Training hyperparameters")
    checkpoint_interval: int = Field(5, ge=1, description="Epoch interval for saving checkpoints")
    keep_top_k_checkpoints: int = Field(3, ge=1, description="Number of best checkpoints to retain")
    device: str = Field("cpu", description="Compute device: cpu, cuda")
    timeout_seconds: int = Field(3600, ge=1, le=86400, description="Maximum execution timeout in seconds")
    export_format: str = Field("safetensors", description="Export format: safetensors, pt, torchscript")


class EpochMetric(BaseModel):
    """Metrics recorded for a single training epoch."""
    epoch: int
    train_loss: float
    train_accuracy: Optional[float] = None
    val_loss: Optional[float] = None
    val_accuracy: Optional[float] = None
    learning_rate: float
    duration_seconds: float
    timestamp: float


class TrainingProgress(BaseModel):
    """Live progress and metrics summary during training."""
    execution_id: str
    state: ExecutionState
    current_epoch: int
    total_epochs: int
    best_val_loss: Optional[float] = None
    best_val_accuracy: Optional[float] = None
    history: List[EpochMetric] = Field(default_factory=list)
    active_checkpoint: Optional[str] = None
    error_message: Optional[str] = None
