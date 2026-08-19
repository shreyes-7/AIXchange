"""
AIXchange - Model Artifact Validator (Phase 7)
Validates model artifact integrity: file existence, SHA-256 checksums,
metadata structure, safe deserialization, and forward-pass inference smoke testing.
"""

import json
import time
import logging
from pathlib import Path
from typing import Optional
import torch
from safetensors.torch import load_file

from .exporter import ModelExporter
from ..schemas.execution import ModelArtifactMetadata, ValidationResult
from ..training.pytorch_trainer import DynamicMLP

logger = logging.getLogger("aixchange.validator")


class ModelValidator:
    """Performs rigorous automated validation of exported model artifacts."""

    def validate(
        self,
        artifact_path: str,
        metadata_path: Optional[str] = None,
        input_dim: Optional[int] = None,
        output_dim: Optional[int] = None,
    ) -> ValidationResult:
        """
        Validates the artifact by verifying checksums, schema, and running a smoke inference test.
        """
        start_time = time.time()
        art_path = Path(artifact_path).resolve()
        
        # 1. Existence and size checks
        if not art_path.exists():
            return ValidationResult(
                is_valid=False,
                artifact_path=str(art_path),
                checksum_verified=False,
                load_test_passed=False,
                inference_smoke_test_passed=False,
                error_message=f"Artifact file does not exist: {art_path}",
                validation_duration_ms=(time.time() - start_time) * 1000,
            )

        if art_path.stat().st_size == 0:
            return ValidationResult(
                is_valid=False,
                artifact_path=str(art_path),
                checksum_verified=False,
                load_test_passed=False,
                inference_smoke_test_passed=False,
                error_message="Artifact file is empty (0 bytes)",
                validation_duration_ms=(time.time() - start_time) * 1000,
            )

        # 2. Metadata loading and verification
        meta_obj: Optional[ModelArtifactMetadata] = None
        checksum_ok = False
        
        if metadata_path:
            meta_p = Path(metadata_path).resolve()
        else:
            meta_p = art_path.parent / "model_metadata.json"

        if meta_p.exists():
            try:
                with open(meta_p, "r") as f:
                    meta_dict = json.load(f)
                meta_obj = ModelArtifactMetadata(**meta_dict)
                
                # Checksum verification
                actual_hash = ModelExporter.compute_sha256(art_path)
                checksum_ok = (actual_hash == meta_obj.artifact_hash_sha256)
                if not checksum_ok:
                    return ValidationResult(
                        is_valid=False,
                        artifact_path=str(art_path),
                        model_metadata=meta_obj,
                        checksum_verified=False,
                        load_test_passed=False,
                        inference_smoke_test_passed=False,
                        error_message="SHA-256 checksum mismatch against model_metadata.json",
                        validation_duration_ms=(time.time() - start_time) * 1000,
                    )
            except Exception as e:
                logger.warning(f"Metadata verification failed: {e}")

        # 3. Model Loading Test
        load_passed = False
        state_dict = None
        try:
            if art_path.suffix == ".safetensors":
                state_dict = load_file(str(art_path))
            else:
                state_dict = torch.load(art_path, weights_only=True)
            load_passed = True
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                artifact_path=str(art_path),
                model_metadata=meta_obj,
                checksum_verified=checksum_ok,
                load_test_passed=False,
                inference_smoke_test_passed=False,
                error_message=f"Model deserialization failed: {str(e)}",
                validation_duration_ms=(time.time() - start_time) * 1000,
            )

        # 4. Smoke Test Forward Pass
        smoke_passed = False
        try:
            # Determine dimensions and architecture from metadata or parameters
            if meta_obj and "model_architecture" in meta_obj.model_dump():
                arch = meta_obj.model_architecture
                in_d = arch.get("input_dim", input_dim or 10)
                hidden_dims = arch.get("hidden_dims", [64, 32])
                out_d = arch.get("output_dim", output_dim or 2)
                activation = arch.get("activation", "relu")
                dropout = arch.get("dropout_rate", 0.0)
            else:
                in_d = input_dim or 10
                hidden_dims = [64, 32]
                out_d = output_dim or 2
                activation = "relu"
                dropout = 0.0

            model = DynamicMLP(
                input_dim=in_d,
                hidden_dims=hidden_dims,
                output_dim=out_d,
                activation=activation,
                dropout=dropout,
            )
            model.load_state_dict(state_dict)
            model.eval()

            # Dummy forward pass
            dummy_input = torch.randn(2, in_d)
            with torch.no_grad():
                output = model(dummy_input)
            
            if output.shape == (2, out_d):
                smoke_passed = True
            else:
                return ValidationResult(
                    is_valid=False,
                    artifact_path=str(art_path),
                    model_metadata=meta_obj,
                    checksum_verified=checksum_ok,
                    load_test_passed=True,
                    inference_smoke_test_passed=False,
                    error_message=f"Output tensor shape mismatch. Expected (2, {out_d}), got {output.shape}",
                    validation_duration_ms=(time.time() - start_time) * 1000,
                )
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                artifact_path=str(art_path),
                model_metadata=meta_obj,
                checksum_verified=checksum_ok,
                load_test_passed=True,
                inference_smoke_test_passed=False,
                error_message=f"Inference smoke test exception: {str(e)}",
                validation_duration_ms=(time.time() - start_time) * 1000,
            )

        duration = (time.time() - start_time) * 1000
        logger.info(f"Model artifact validation succeeded for {art_path} in {duration:.2f}ms")

        return ValidationResult(
            is_valid=True,
            artifact_path=str(art_path),
            model_metadata=meta_obj,
            checksum_verified=checksum_ok,
            load_test_passed=True,
            inference_smoke_test_passed=True,
            validation_duration_ms=duration,
        )
