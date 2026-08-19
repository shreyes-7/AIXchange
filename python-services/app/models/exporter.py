"""
AIXchange - Model Exporter (Phase 7)
Exports trained PyTorch models to standard formats (.safetensors, .pt)
and generates model_metadata.json preserving all Phase 9 Provenance primitives.
"""

import hashlib
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
import torch
from safetensors.torch import save_file

from ..schemas.training import TrainingConfig, TrainingProgress
from ..schemas.execution import ModelArtifactMetadata

logger = logging.getLogger("aixchange.exporter")


class ModelExporter:
    """Serializes in-memory models into persistent, validated artifacts."""

    @staticmethod
    def compute_sha256(file_path: Path) -> str:
        """Computes the SHA-256 cryptographic hash of an artifact file."""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
        return sha256.hexdigest()

    def export(
        self,
        model: torch.nn.Module,
        config: TrainingConfig,
        output_dir: Path,
        progress: TrainingProgress,
    ) -> Dict[str, Any]:
        """
        Exports model weights and metadata into the output directory.
        """
        output_path = Path(output_dir).resolve()
        output_path.mkdir(parents=True, exist_ok=True)

        execution_id = config.execution_id
        model_id = f"model_{execution_id}"
        created_files: List[str] = []

        # 1. Export weights in Safetensors format
        safetensors_file = output_path / "model.safetensors"
        state_dict = {k: v.contiguous().cpu() for k, v in model.state_dict().items()}
        save_file(state_dict, str(safetensors_file))
        created_files.append("model.safetensors")

        # 2. Export PyTorch state dict fallback
        pt_file = output_path / "model.pt"
        torch.save(state_dict, pt_file)
        created_files.append("model.pt")

        # 3. Compute primary artifact SHA-256 checksum
        primary_hash = self.compute_sha256(safetensors_file)

        # 4. Construct comprehensive provenance metadata
        metadata = ModelArtifactMetadata(
            model_id=model_id,
            execution_id=execution_id,
            dataset_reference=config.dataset.model_dump(),
            framework=config.framework.value,
            framework_version=torch.__version__,
            model_architecture=config.model_spec.model_dump(),
            hyperparameters=config.hyperparameters.model_dump(),
            metrics_summary={
                "best_val_loss": progress.best_val_loss,
                "total_epochs": progress.current_epoch,
                "final_train_loss": progress.history[-1].train_loss if progress.history else None,
                "final_val_loss": progress.history[-1].val_loss if progress.history else None,
                "final_train_accuracy": progress.history[-1].train_accuracy if progress.history else None,
                "final_val_accuracy": progress.history[-1].val_accuracy if progress.history else None,
            },
            input_schema={
                "type": "tensor",
                "dtype": "float32",
                "shape": [None, config.model_spec.input_dim],
                "feature_columns": config.dataset.feature_columns,
            },
            output_schema={
                "type": "tensor",
                "dtype": "float32",
                "shape": [None, config.model_spec.output_dim],
            },
            artifact_files=created_files,
            artifact_hash_sha256=primary_hash,
            creation_timestamp=datetime.now(timezone.utc).isoformat(),
        )

        metadata_file = output_path / "model_metadata.json"
        with open(metadata_file, "w") as f:
            f.write(metadata.model_dump_json(indent=2))
        created_files.append("model_metadata.json")

        logger.info(f"Model exported successfully for execution {execution_id} at {output_path}")

        return {
            "model_id": model_id,
            "primary_artifact_path": str(safetensors_file),
            "pytorch_artifact_path": str(pt_file),
            "metadata_path": str(metadata_file),
            "artifact_files": [str(output_path / f) for f in created_files],
            "sha256": primary_hash,
        }
