"""
AIXchange - Checkpoint Manager (Phase 7)
Handles atomic checkpoint creation, validation, top-k rotation, and recovery.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import torch

from ..schemas.training import EpochMetric

logger = logging.getLogger("aixchange.checkpoints")


class CheckpointManager:
    """Manages saving, rotating, and loading model training checkpoints."""

    def __init__(self, checkpoints_dir: Path, keep_top_k: int = 3):
        self.dir = Path(checkpoints_dir).resolve()
        self.dir.mkdir(parents=True, exist_ok=True)
        self.keep_top_k = keep_top_k
        self.index_file = self.dir / "checkpoints_index.json"
        self._history: List[Dict[str, Any]] = self._load_index()

    def _load_index(self) -> List[Dict[str, Any]]:
        if self.index_file.exists():
            try:
                with open(self.index_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read checkpoint index: {e}")
        return []

    def _save_index(self):
        with open(self.index_file, "w") as f:
            json.dump(self._history, f, indent=2)

    def save_checkpoint(
        self,
        epoch: int,
        model_state: Dict[str, Any],
        optimizer_state: Dict[str, Any],
        metrics: EpochMetric,
        extra_meta: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Atomically saves a checkpoint file and updates the rotation index.
        """
        filename = f"checkpoint_epoch_{epoch:04d}.pt"
        filepath = self.dir / filename
        tmp_filepath = self.dir / f".{filename}.tmp"

        payload = {
            "epoch": epoch,
            "model_state_dict": model_state,
            "optimizer_state_dict": optimizer_state,
            "metrics": metrics.model_dump(),
            "extra_meta": extra_meta or {},
        }

        # Atomic write
        torch.save(payload, tmp_filepath)
        if filepath.exists():
            filepath.unlink()
        tmp_filepath.rename(filepath)

        record = {
            "epoch": epoch,
            "filename": filename,
            "filepath": str(filepath),
            "val_loss": metrics.val_loss if metrics.val_loss is not None else metrics.train_loss,
            "train_loss": metrics.train_loss,
            "timestamp": metrics.timestamp,
        }
        self._history.append(record)
        self._prune_checkpoints()
        self._save_index()

        logger.info(f"Saved checkpoint for epoch {epoch} at {filepath}")
        return str(filepath)

    def load_latest_or_best(self, best: bool = True) -> Optional[Dict[str, Any]]:
        """Loads the best or latest checkpoint from the index."""
        if not self._history:
            return None

        if best:
            sorted_history = sorted(self._history, key=lambda x: x.get("val_loss", float("inf")))
            target = sorted_history[0]
        else:
            target = self._history[-1]

        target_path = Path(target["filepath"])
        if not target_path.exists():
            logger.error(f"Checkpoint file {target_path} missing on disk.")
            return None

        return torch.load(target_path, weights_only=False)

    def _prune_checkpoints(self):
        """Retains only the top-k checkpoints with lowest loss and removes older ones."""
        if len(self._history) <= self.keep_top_k:
            return

        sorted_history = sorted(self._history, key=lambda x: x.get("val_loss", float("inf")))
        keep_set = set(item["filename"] for item in sorted_history[:self.keep_top_k])

        remaining = []
        for item in self._history:
            if item["filename"] in keep_set:
                remaining.append(item)
            else:
                p = self.dir / item["filename"]
                if p.exists():
                    p.unlink()
                logger.info(f"Pruned older checkpoint: {item['filename']}")

        self._history = remaining
