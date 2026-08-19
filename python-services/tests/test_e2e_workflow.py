"""
AIXchange - End-to-End AI Sandbox Workflow Acceptance Test (Phase 7)
Validates the complete lifecycle:
Input Dataset -> Sandbox Provisioning -> PyTorch Training -> Checkpoints
-> Safetensors Export -> Provenance Metadata -> Artifact Validation
-> Decoupled Inference -> Cleanup.
"""

import pytest
import torch
from pathlib import Path

from app.schemas.training import (
    TrainingConfig,
    ModelArchitectureSpec,
    DatasetInputSpec,
    Hyperparameters,
    ExecutionState,
    OptimizerType,
    LossFunctionType,
)
from app.schemas.inference import InferenceRequest
from app.training.pipeline import TrainingPipeline
from app.inference.engine import InferenceEngine
from app.core.sandbox import sandbox_manager


def test_full_ai_sandbox_lifecycle():
    """Executes the full Phase 7 AI execution substrate acceptance workflow."""
    execution_id = "exec_e2e_phase7_test"

    # Clean any previous artifacts
    sandbox_manager.cleanup_workspace(execution_id)

    # 1. Define Training Configuration
    config = TrainingConfig(
        execution_id=execution_id,
        model_spec=ModelArchitectureSpec(
            input_dim=10,
            hidden_dims=[32, 16],
            output_dim=2,
            activation="relu",
            dropout_rate=0.05,
        ),
        dataset=DatasetInputSpec(
            format="csv",
            test_split_ratio=0.25,
            feature_columns=[f"feat_{i}" for i in range(10)],
            target_column="label",
        ),
        hyperparameters=Hyperparameters(
            epochs=4,
            batch_size=16,
            learning_rate=0.005,
            optimizer=OptimizerType.ADAMW,
            loss_function=LossFunctionType.CROSS_ENTROPY,
            weight_decay=0.01,
        ),
        checkpoint_interval=2,
        keep_top_k_checkpoints=2,
    )

    # 2. Stage Synthetic Input Tensors
    torch.manual_seed(42)
    X = torch.randn(120, 10)
    y = torch.randint(0, 2, (120,))

    # 3. Run Pipeline Orchestration
    pipeline = TrainingPipeline(config)
    exec_response = pipeline.execute(custom_tensors=(X, y))

    # Assert Execution & Validation Success
    assert exec_response.state == ExecutionState.COMPLETED
    assert exec_response.validation is not None
    assert exec_response.validation.is_valid is True
    assert exec_response.validation.checksum_verified is True
    assert exec_response.validation.inference_smoke_test_passed is True

    # 4. Verify Exported Artifacts Exist
    artifact_path = exec_response.artifacts["artifact_path"]
    metadata_path = exec_response.artifacts["metadata_path"]
    summary_path = exec_response.artifacts["summary_path"]

    assert Path(artifact_path).exists()
    assert Path(metadata_path).exists()
    assert Path(summary_path).exists()

    # 5. Independent Inference Test
    # Load model in a completely independent InferenceEngine instance
    infer_engine = InferenceEngine()
    test_inputs = [
        [0.1] * 10,
        [-0.5] * 10,
    ]
    infer_req = InferenceRequest(
        model_artifact_path=artifact_path,
        metadata_path=metadata_path,
        inputs=test_inputs,
    )
    infer_res = infer_engine.predict(infer_req)

    assert infer_res.num_samples == 2
    assert len(infer_res.results) == 2
    assert infer_res.results[0].prediction in [0, 1]
    assert infer_res.latency_ms > 0.0

    # 6. Cleanup Verification
    workspace = sandbox_manager.get_workspace(execution_id)
    assert workspace is not None

    # Prune temporary files
    sandbox_manager.cleanup_workspace(execution_id, keep_output=True)
    assert not workspace.input.exists()
    assert not workspace.checkpoints.exists()
    assert Path(artifact_path).exists()

    # Complete cleanup
    sandbox_manager.cleanup_workspace(execution_id, keep_output=False)
    assert not workspace.root.exists()
