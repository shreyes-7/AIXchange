"""
AIXchange - Inference Schemas (Phase 7)
Defines Pydantic models for model loading, prediction payloads, batch requests,
and inference responses with confidence scoring and latency metrics.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class InferenceRequest(BaseModel):
    """Payload for executing model inference."""
    model_artifact_path: str = Field(..., description="Path to model artifact or weights file (.safetensors, .pt)")
    metadata_path: Optional[str] = Field(None, description="Optional path to model_metadata.json")
    inputs: Union[List[float], List[List[float]], Dict[str, Any]] = Field(
        ..., description="Raw feature vector(s) or dictionary of feature tensors"
    )
    device: str = Field("cpu", description="Compute device: cpu, cuda")
    return_probabilities: bool = Field(True, description="Whether to include softmax/sigmoid confidence scores")
    top_k: Optional[int] = Field(None, ge=1, description="Return only top-k prediction classes")


class PredictionItem(BaseModel):
    """Single item prediction result."""
    index: int
    prediction: Union[int, float, List[float]]
    confidence: Optional[float] = None
    probabilities: Optional[List[float]] = None
    class_label: Optional[str] = None


class InferenceResponse(BaseModel):
    """Response returned from inference execution."""
    execution_id: Optional[str] = None
    model_type: str
    framework: str
    num_samples: int
    results: List[PredictionItem]
    latency_ms: float
    device_used: str
    metadata_digest: Optional[str] = None
