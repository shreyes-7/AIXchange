"""
AIXchange - Docker Sandbox Manager (Phase 7)
Manages isolated execution workspaces, enforces strict path boundaries,
handles resource limits, and guarantees deterministic workspace cleanup.
"""

import os
import shutil
import logging
from pathlib import Path
from typing import Dict, Optional

from .config import settings

logger = logging.getLogger("aixchange.sandbox")


class WorkspaceLayout:
    """Represents the strictly partitioned directory layout of a sandbox."""
    def __init__(self, root_dir: Path):
        self.root = root_dir
        self.input = root_dir / "input"
        self.code = root_dir / "code"
        self.data = root_dir / "data"
        self.output = root_dir / "output"
        self.checkpoints = root_dir / "checkpoints"
        self.logs = root_dir / "logs"

    def create_all(self):
        """Create all subdirectories in the workspace hierarchy."""
        for directory in [self.input, self.code, self.data, self.output, self.checkpoints, self.logs]:
            directory.mkdir(parents=True, exist_ok=True)

    def to_dict(self) -> Dict[str, str]:
        return {
            "root": str(self.root),
            "input": str(self.input),
            "code": str(self.code),
            "data": str(self.data),
            "output": str(self.output),
            "checkpoints": str(self.checkpoints),
            "logs": str(self.logs),
        }


class SandboxManager:
    """Provisions and enforces boundaries for isolated execution sandboxes."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.base_workspace_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def provision_workspace(self, execution_id: str) -> WorkspaceLayout:
        """
        Provisions a pristine, isolated workspace directory hierarchy for an execution ID.
        Guarantees path traversal prevention.
        """
        self._validate_execution_id(execution_id)
        workspace_path = (self.base_dir / execution_id).resolve()
        
        # Security assertion: ensure workspace cannot escape base_dir
        if not str(workspace_path).startswith(str(self.base_dir)):
            raise ValueError(f"Path traversal detected for execution ID: {execution_id}")

        layout = WorkspaceLayout(workspace_path)
        layout.create_all()
        logger.info(f"Provisioned sandbox workspace at {workspace_path}")
        return layout

    def get_workspace(self, execution_id: str) -> Optional[WorkspaceLayout]:
        """Retrieves an existing workspace if it exists."""
        self._validate_execution_id(execution_id)
        workspace_path = (self.base_dir / execution_id).resolve()
        if workspace_path.exists() and workspace_path.is_dir():
            return WorkspaceLayout(workspace_path)
        return None

    def cleanup_workspace(self, execution_id: str, keep_output: bool = False) -> bool:
        """
        Cleans up a sandbox workspace deterministically.
        If keep_output is True, preserves the output directory while removing temporary input/checkpoints/data.
        """
        self._validate_execution_id(execution_id)
        workspace_path = (self.base_dir / execution_id).resolve()
        
        if not workspace_path.exists():
            return False

        if keep_output:
            layout = WorkspaceLayout(workspace_path)
            for d in [layout.input, layout.code, layout.data, layout.checkpoints]:
                if d.exists():
                    shutil.rmtree(d, ignore_errors=True)
            logger.info(f"Pruned temporary files in sandbox workspace: {execution_id}")
            return True
        else:
            shutil.rmtree(workspace_path, ignore_errors=True)
            logger.info(f"Completely removed sandbox workspace: {execution_id}")
            return True

    def validate_contained_path(self, execution_id: str, target_path: str) -> Path:
        """
        Ensures a given file/directory path is strictly contained within the execution's workspace.
        """
        self._validate_execution_id(execution_id)
        workspace_path = (self.base_dir / execution_id).resolve()
        resolved_target = Path(target_path).resolve()
        
        if not str(resolved_target).startswith(str(workspace_path)):
            raise PermissionError(f"Access denied: Path {target_path} is outside sandbox workspace {workspace_path}")
        
        return resolved_target

    def _validate_execution_id(self, execution_id: str):
        """Disallow dangerous path characters in execution identifiers."""
        if not execution_id or not execution_id.replace("-", "").replace("_", "").isalnum():
            raise ValueError(f"Invalid execution ID format: {execution_id}")


# Global default instance
sandbox_manager = SandboxManager()
