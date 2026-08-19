"""
AIXchange - Live Jupyter Runtime Tests (Phase 7)
Verifies Jupyter server startup, token security, and clean shutdown.
"""

import time
import pytest
from app.core.jupyter import JupyterManager


def test_jupyter_manager_lifecycle(tmp_path):
    """Test starting, querying status, and stopping a Jupyter server instance."""
    manager = JupyterManager()
    manager._port = 8899  # Dedicated test port
    manager._token = "test_sandbox_secret_token"

    # 1. Start Server
    info = manager.start_server(workspace_root=tmp_path)
    assert info["status"] == "RUNNING"
    assert info["port"] == "8899"
    assert "token=test_sandbox_secret_token" in info["url"]
    assert manager.is_running() is True

    # 2. Re-start idempotence
    second_info = manager.start_server(workspace_root=tmp_path)
    assert second_info["status"] == "RUNNING"

    # 3. Stop Server
    stopped = manager.stop_server()
    assert stopped is True
    assert manager.is_running() is False
    assert manager.get_connection_info()["status"] == "STOPPED"
