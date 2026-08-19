"""
AIXchange - AI Execution Contract Schemas (Phase 7)
Defines structured request, response, metadata, and status contracts
governing the interface between the AI Execution Layer and external orchestrators.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .training import ExecutionState, TrainingConfig, TrainingProgress
from .inference import InferenceRequest, InferenceResponse


class ModelArtifactMetadata(BaseModel):
    """Rich metadata artifact (model_metadata.json) preserved for Phase 9 Provenance."""
    model_id: str
    execution_id: str
    dataset_reference: Optional[Dict[str, Any]] = None
    framework: str
    framework_version: str
    model_architecture: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    metrics_summary: Dict[str, Any]
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    artifact_files: List[str]
    artifact_hash_sha256: str
    creation_timestamp: str
    author_wallet: Optional[str] = None


class ValidationResult(BaseModel):
    """Outcome of model artifact verification and smoke test."""
    is_valid: bool
    artifact_path: str
    model_metadata: Optional[ModelArtifactMetadata] = None
    checksum_verified: bool
    load_test_passed: bool
    inference_smoke_test_passed: bool
    error_message: Optional[str] = None
    validation_duration_ms: float


class ExecutionResponse(BaseModel):
    """Generic status response for an asynchronous execution job."""
    execution_id: str
    state: ExecutionState
    message: str
    progress: Optional[TrainingProgress] = None
    artifacts: Optional[Dict[str, str]] = None
    validation: Optional[ValidationResult] = None
