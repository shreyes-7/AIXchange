"""
AIXchange - AI Execution Contract API Router (Phase 7)
Exposes HTTP endpoints implementing the standard AI Execution Contract.
"""

import logging
from typing import Dict, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from ..schemas.training import TrainingConfig, TrainingProgress, ExecutionState
from ..schemas.inference import InferenceRequest, InferenceResponse
from ..schemas.execution import ExecutionResponse, ValidationResult
from ..training.pipeline import TrainingPipeline
from ..inference.engine import inference_engine
from ..models.validator import ModelValidator
from ..core.sandbox import sandbox_manager
from ..core.jupyter import jupyter_manager

logger = logging.getLogger("aixchange.api.execution")
router = APIRouter(prefix="/api/v1/execution", tags=["AI Execution Contract"])

# In-memory execution registry for status tracking
_active_executions: Dict[str, ExecutionResponse] = {}


@router.post(
    "/train",
    response_model=ExecutionResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger Model Training Pipeline",
)
def start_training(config: TrainingConfig):
    """
    Launches an isolated training pipeline in the sandbox for the specified configuration.
    """
    try:
        pipeline = TrainingPipeline(config)
        response = pipeline.execute()
        _active_executions[config.execution_id] = response
        return response
    except Exception as e:
        logger.error(f"Training request execution failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get(
    "/{execution_id}/status",
    response_model=ExecutionResponse,
    summary="Get Execution Status and Metrics",
)
def get_execution_status(execution_id: str):
    """
    Retrieves the status, progress metrics, and artifact references for an execution ID.
    """
    if execution_id in _active_executions:
        return _active_executions[execution_id]

    # Check on-disk workspace for completed runs
    ws = sandbox_manager.get_workspace(execution_id)
    if ws and ws.output.exists():
        summary_file = ws.output / "training_summary.json"
        if summary_file.exists():
            import json
            with open(summary_file, "r") as f:
                data = json.load(f)
            return ExecutionResponse(
                execution_id=execution_id,
                state=ExecutionState(data.get("state", "COMPLETED")),
                message="Retrieved completed execution from disk",
                artifacts={
                    "artifact_path": str(ws.output / "model.safetensors"),
                    "metadata_path": str(ws.output / "model_metadata.json"),
                    "summary_path": str(summary_file),
                },
            )

    raise HTTPException(status_code=404, detail=f"Execution ID {execution_id} not found")


@router.post(
    "/infer",
    response_model=InferenceResponse,
    summary="Execute Model Inference",
)
def run_inference(request: InferenceRequest):
    """
    Runs model inference on the provided feature vector(s) against a model artifact.
    """
    try:
        return inference_engine.predict(request)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid inference inputs: {str(e)}")
    except Exception as e:
        logger.error(f"Inference execution failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post(
    "/validate-model",
    response_model=ValidationResult,
    summary="Validate Model Artifact",
)
def validate_model_artifact(artifact_path: str, metadata_path: Optional[str] = None):
    """
    Validates model checksums, metadata, and performs forward-pass smoke testing.
    """
    validator = ModelValidator()
    result = validator.validate(artifact_path=artifact_path, metadata_path=metadata_path)
    if not result.is_valid:
        raise HTTPException(status_code=422, detail=result.model_dump())
    return result


@router.post(
    "/jupyter/start",
    summary="Start Isolated Jupyter Environment",
)
def start_jupyter():
    """
    Starts an isolated Jupyter server instance inside the sandbox.
    """
    return jupyter_manager.start_server()


@router.post(
    "/jupyter/stop",
    summary="Stop Isolated Jupyter Environment",
)
def stop_jupyter():
    """
    Stops the active Jupyter server instance.
    """
    success = jupyter_manager.stop_server()
    return {"stopped": success}


@router.get(
    "/jupyter/status",
    summary="Get Jupyter Environment Status",
)
def get_jupyter_status():
    """
    Returns connection and lifecycle status of the Jupyter instance.
    """
    return jupyter_manager.get_connection_info()
