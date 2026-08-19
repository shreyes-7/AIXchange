"""
AIXchange - Standalone Inference Engine (Phase 7)
Executes decoupled model inference: input validation, preprocessing,
forward-pass prediction, probability calibration, and latency benchmarking.
"""

import time
import logging
from typing import Any, Dict, List, Union
import torch
import torch.nn.functional as F

from .loader import SafeModelLoader
from ..schemas.inference import InferenceRequest, InferenceResponse, PredictionItem

logger = logging.getLogger("aixchange.inference")


class InferenceEngine:
    """Standalone inference execution engine decoupled from the training process."""

    def __init__(self, loader: SafeModelLoader = None):
        self.loader = loader or SafeModelLoader()

    def predict(self, request: InferenceRequest) -> InferenceResponse:
        """
        Executes inference prediction on the supplied request payload.
        """
        start_time = time.perf_counter()

        # 1. Load model and metadata safely
        model, metadata = self.loader.load_model(
            artifact_path=request.model_artifact_path,
            metadata_path=request.metadata_path,
            device=request.device,
        )

        # 2. Input validation and tensor conversion
        tensor_input = self._preprocess_input(request.inputs)
        device = next(model.parameters()).device
        tensor_input = tensor_input.to(device)

        # 3. Model Forward Pass
        with torch.no_grad():
            raw_logits = model(tensor_input)

        # 4. Postprocessing & Confidence Scoring
        results = self._postprocess_output(raw_logits, request.return_probabilities, request.top_k)

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return InferenceResponse(
            execution_id=metadata.execution_id if metadata else None,
            model_type=metadata.model_architecture.get("model_type", "mlp") if metadata else "mlp",
            framework=metadata.framework if metadata else "pytorch",
            num_samples=len(results),
            results=results,
            latency_ms=latency_ms,
            device_used=str(device),
            metadata_digest=metadata.artifact_hash_sha256 if metadata else None,
        )

    def _preprocess_input(self, inputs: Union[List[float], List[List[float]], Dict[str, Any]]) -> torch.Tensor:
        """Converts diverse input representations into a float32 2D Tensor (batch_size, feature_dim)."""
        if isinstance(inputs, list):
            if len(inputs) == 0:
                raise ValueError("Inputs list is empty")
            # If 1D list of floats: [0.1, 0.2, 0.3] -> shape (1, N)
            if isinstance(inputs[0], (int, float)):
                return torch.tensor([inputs], dtype=torch.float32)
            # If 2D list: [[0.1, 0.2], [0.3, 0.4]] -> shape (B, N)
            elif isinstance(inputs[0], list):
                return torch.tensor(inputs, dtype=torch.float32)
            else:
                raise ValueError(f"Unsupported list element type: {type(inputs[0])}")
        elif isinstance(inputs, dict):
            # Extract values in sorted key order
            values = [inputs[k] for k in sorted(inputs.keys())]
            return torch.tensor([values], dtype=torch.float32)
        else:
            raise ValueError(f"Unsupported input payload type: {type(inputs)}")

    def _postprocess_output(
        self,
        logits: torch.Tensor,
        return_probabilities: bool,
        top_k: Union[int, None],
    ) -> List[PredictionItem]:
        """Maps output logits into structured PredictionItem models."""
        items: List[PredictionItem] = []
        batch_size, output_dim = logits.shape

        if output_dim == 1:
            # Binary / Regression
            probs = torch.sigmoid(logits).cpu().numpy().tolist()
            preds = (logits > 0.0).long().cpu().numpy().tolist()
            for i in range(batch_size):
                p_val = probs[i][0]
                items.append(
                    PredictionItem(
                        index=i,
                        prediction=preds[i][0],
                        confidence=p_val if preds[i][0] == 1 else (1.0 - p_val),
                        probabilities=[1.0 - p_val, p_val] if return_probabilities else None,
                    )
                )
        else:
            # Multi-class Classification
            probs = F.softmax(logits, dim=1).cpu().numpy().tolist()
            preds = torch.argmax(logits, dim=1).cpu().numpy().tolist()
            for i in range(batch_size):
                class_idx = preds[i]
                confidence = probs[i][class_idx]
                items.append(
                    PredictionItem(
                        index=i,
                        prediction=class_idx,
                        confidence=float(confidence),
                        probabilities=probs[i] if return_probabilities else None,
                        class_label=f"Class_{class_idx}",
                    )
                )

        return items


inference_engine = InferenceEngine()
