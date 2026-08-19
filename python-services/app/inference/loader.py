"""
AIXchange - Safe Model Loader (Phase 7)
Loads model weights safely using Safetensors (zero-copy, no arbitrary code execution)
or PyTorch weights_only=True, reconstructing the neural architecture from metadata.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import torch
import torch.nn as nn
from safetensors.torch import load_file

from ..schemas.execution import ModelArtifactMetadata
from ..training.pytorch_trainer import DynamicMLP

logger = logging.getLogger("aixchange.loader")


class SafeModelLoader:
    """Safe deserialization and runtime instantiation of trained model artifacts."""

    @staticmethod
    def load_model(
        artifact_path: str,
        metadata_path: Optional[str] = None,
        device: str = "cpu",
    ) -> Tuple[nn.Module, Optional[ModelArtifactMetadata]]:
        """
        Safely loads a model from disk into the specified compute device.
        """
        art_path = Path(artifact_path).resolve()
        if not art_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {art_path}")

        # Locate and parse metadata
        meta_obj: Optional[ModelArtifactMetadata] = None
        meta_p = Path(metadata_path).resolve() if metadata_path else (art_path.parent / "model_metadata.json")
        
        if meta_p.exists():
            with open(meta_p, "r") as f:
                meta_obj = ModelArtifactMetadata(**json.load(f))

        # Safe weight loading
        dev = torch.device(device if torch.cuda.is_available() and device == "cuda" else "cpu")
        if art_path.suffix == ".safetensors":
            state_dict = load_file(str(art_path), device=str(dev))
        else:
            state_dict = torch.load(art_path, map_location=dev, weights_only=True)

        # Infer architecture
        if meta_obj and "model_architecture" in meta_obj.model_dump():
            arch = meta_obj.model_architecture
            input_dim = arch.get("input_dim", 10)
            hidden_dims = arch.get("hidden_dims", [64, 32])
            output_dim = arch.get("output_dim", 2)
            activation = arch.get("activation", "relu")
            dropout = arch.get("dropout_rate", 0.0)
        else:
            # Fallback estimation from state dict keys
            first_weight = state_dict[list(state_dict.keys())[0]]
            input_dim = first_weight.shape[1]
            last_weight = state_dict[list(state_dict.keys())[-2]]
            output_dim = last_weight.shape[0]
            hidden_dims = [64, 32]
            activation = "relu"
            dropout = 0.0

        model = DynamicMLP(
            input_dim=input_dim,
            hidden_dims=hidden_dims,
            output_dim=output_dim,
            activation=activation,
            dropout=dropout,
        )
        model.load_state_dict(state_dict)
        model.to(dev)
        model.eval()

        logger.info(f"Loaded model from {art_path} onto {dev}")
        return model, meta_obj
