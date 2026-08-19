"""
AIXchange - Jupyter Sandbox Environment Manager (Phase 7)
Manages isolated Jupyter Server / JupyterLab instances bounded to /workspace.
"""

import os
import subprocess
import logging
from pathlib import Path
from typing import Dict, Optional

from .config import settings
from .sandbox import WorkspaceLayout

logger = logging.getLogger("aixchange.jupyter")


class JupyterManager:
    """Manages the lifecycle of a Jupyter server instance inside the sandbox."""

    def __init__(self):
        self._process: Optional[subprocess.Popen] = None
        self._port = settings.jupyter_port
        self._token = settings.jupyter_token

    def start_server(self, workspace_root: Optional[Path] = None) -> Dict[str, str]:
        """
        Starts an isolated Jupyter server process anchored to the given workspace.
        """
        if self.is_running():
            logger.info("Jupyter server is already running.")
            return self.get_connection_info()

        root_dir = str(workspace_root or settings.base_workspace_dir)
        cmd = [
            "jupyter",
            "lab",
            f"--ServerApp.ip={settings.host}",
            f"--ServerApp.port={self._port}",
            f"--ServerApp.root_dir={root_dir}",
            f"--ServerApp.token={self._token}",
            "--ServerApp.open_browser=False",
            "--ServerApp.allow_remote_access=True",
            "--ServerApp.allow_origin=*",
        ]

        if settings.disable_jupyter_terminal:
            cmd.append("--ServerApp.terminals_enabled=False")

        try:
            self._process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            logger.info(f"Started Jupyter server on port {self._port} bounded to {root_dir}")
        except Exception as e:
            logger.error(f"Failed to start Jupyter server: {str(e)}")
            raise RuntimeError(f"Could not initialize Jupyter server: {str(e)}")

        return self.get_connection_info()

    def stop_server(self) -> bool:
        """Stops the active Jupyter server process."""
        if not self._process:
            return False

        try:
            self._process.terminate()
            self._process.wait(timeout=5)
            logger.info("Terminated Jupyter server successfully.")
        except subprocess.TimeoutExpired:
            self._process.kill()
            logger.warning("Force killed Jupyter server.")
        finally:
            self._process = None

        return True

    def is_running(self) -> bool:
        """Checks if the Jupyter server process is active."""
        if self._process is None:
            return False
        return self._process.poll() is None

    def get_connection_info(self) -> Dict[str, str]:
        """Returns connection URL and authentication token for the Jupyter instance."""
        return {
            "status": "RUNNING" if self.is_running() else "STOPPED",
            "port": str(self._port),
            "token": self._token,
            "url": f"http://localhost:{self._port}/lab?token={self._token}",
        }


jupyter_manager = JupyterManager()
