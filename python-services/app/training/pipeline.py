"""
AIXchange - End-to-End Training Pipeline Orchestrator (Phase 7)
Orchestrates the full ML training lifecycle:
Validation -> Env Prep -> Dataset Prep -> Training Loop -> Metrics -> Checkpoint -> Export -> Artifact Validation.
"""

import json
import time
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import torch

from .pytorch_trainer import PyTorchTrainer
from ..core.sandbox import sandbox_manager, WorkspaceLayout
from ..models.exporter import ModelExporter
from ..models.validator import ModelValidator
from ..schemas.training import TrainingConfig, TrainingProgress, ExecutionState
from ..schemas.execution import ExecutionResponse, ValidationResult

logger = logging.getLogger("aixchange.pipeline")


class TrainingPipeline:
    """Orchestrates isolated training workloads from dataset input to validated model artifact."""

    def __init__(self, config: TrainingConfig, base_workspace_dir: Optional[str] = None):
        self.config = config
        self.workspace_layout: Optional[WorkspaceLayout] = None
        self.trainer: Optional[PyTorchTrainer] = None
        self.exporter = ModelExporter()
        self.validator = ModelValidator()

    def execute(self, custom_tensors: Optional[Tuple[torch.Tensor, torch.Tensor]] = None) -> ExecutionResponse:
        """Runs the complete training and export pipeline synchronously."""
        execution_id = self.config.execution_id
        logger.info(f"Starting training pipeline execution: {execution_id}")

        # 1. Provision isolated sandbox workspace
        self.workspace_layout = sandbox_manager.provision_workspace(execution_id)

        # 2. Persist training configuration
        config_path = self.workspace_layout.input / "training_config.json"
        with open(config_path, "w") as f:
            f.write(self.config.model_dump_json(indent=2))

        # 3. Instantiate Framework Trainer
        self.trainer = PyTorchTrainer(self.config, str(self.workspace_layout.root))

        # 4. Prepare data loaders
        if custom_tensors:
            X, y = custom_tensors
            data_loaders = self.trainer.prepare_data(X, y)
        else:
            data_loaders = self.trainer.prepare_data()

        # 5. Execute Training Loop
        progress: TrainingProgress = self.trainer.train(data_loaders)

        if progress.state != ExecutionState.COMPLETED:
            return ExecutionResponse(
                execution_id=execution_id,
                state=progress.state,
                message=f"Training ended with state: {progress.state}. Error: {progress.error_message}",
                progress=progress,
            )

        # 6. Model Export to Output Directory
        export_result = self.exporter.export(
            model=self.trainer.model,
            config=self.config,
            output_dir=self.workspace_layout.output,
            progress=progress,
        )

        # 7. Model Artifact Validation & Smoke Test
        validation: ValidationResult = self.validator.validate(
            artifact_path=export_result["primary_artifact_path"],
            metadata_path=export_result["metadata_path"],
            input_dim=self.config.model_spec.input_dim,
            output_dim=self.config.model_spec.output_dim,
        )

        # 8. Save execution summary
        summary_path = self.workspace_layout.output / "training_summary.json"
        summary = {
            "execution_id": execution_id,
            "state": ExecutionState.COMPLETED.value,
            "is_valid": validation.is_valid,
            "export_files": export_result["artifact_files"],
            "best_val_loss": progress.best_val_loss,
            "epochs_completed": progress.current_epoch,
            "timestamp": time.time(),
        }
        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=2)

        return ExecutionResponse(
            execution_id=execution_id,
            state=ExecutionState.COMPLETED if validation.is_valid else ExecutionState.FAILED,
            message="Training and artifact validation completed successfully" if validation.is_valid else "Model export validation failed",
            progress=progress,
            artifacts={
                "artifact_path": export_result["primary_artifact_path"],
                "metadata_path": export_result["metadata_path"],
                "summary_path": str(summary_path),
            },
            validation=validation,
        )
