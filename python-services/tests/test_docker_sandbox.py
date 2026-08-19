"""
AIXchange - Sandbox Isolation Tests (Phase 7)
"""

import pytest
from pathlib import Path
from app.core.sandbox import SandboxManager, WorkspaceLayout


@pytest.fixture
def temp_sandbox(tmp_path):
    return SandboxManager(base_dir=str(tmp_path))


def test_workspace_provisioning(temp_sandbox):
    """Test that all required workspace subdirectories are created with correct layout."""
    layout = temp_sandbox.provision_workspace("exec_test_001")
    assert isinstance(layout, WorkspaceLayout)
    assert layout.root.exists()
    assert layout.input.exists()
    assert layout.code.exists()
    assert layout.data.exists()
    assert layout.output.exists()
    assert layout.checkpoints.exists()
    assert layout.logs.exists()


def test_path_traversal_prevention(temp_sandbox):
    """Test that path traversal attempts raise ValueError or PermissionError."""
    with pytest.raises(ValueError):
        temp_sandbox.provision_workspace("../escape_sandbox")

    with pytest.raises(ValueError):
        temp_sandbox.provision_workspace("exec/../../bad")

    layout = temp_sandbox.provision_workspace("exec_valid_002")
    with pytest.raises(PermissionError):
        temp_sandbox.validate_contained_path("exec_valid_002", "C:/Windows/System32")


def test_deterministic_cleanup(temp_sandbox):
    """Test that cleanup removes workspace directories cleanly."""
    layout = temp_sandbox.provision_workspace("exec_cleanup_003")
    assert layout.root.exists()

    # Create dummy files
    (layout.input / "test.csv").write_text("a,b,c")
    (layout.output / "model.safetensors").write_text("fake_weights")

    # Prune temporary files keeping output
    temp_sandbox.cleanup_workspace("exec_cleanup_003", keep_output=True)
    assert not layout.input.exists()
    assert layout.output.exists()
    assert (layout.output / "model.safetensors").exists()

    # Full cleanup
    temp_sandbox.cleanup_workspace("exec_cleanup_003", keep_output=False)
    assert not layout.root.exists()
