"""
AIXchange - Docker Sandbox Runner (Phase 7)
Manages Docker container lifecycle, enforces non-root execution,
resource limits (CPU, memory, PIDs), network isolation, and Docker socket protection.
"""

import os
import shutil
import subprocess
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import settings

logger = logging.getLogger("aixchange.docker_runner")


class DockerSecuritySpec:
    """Security and resource limits specification for Docker execution."""

    def __init__(
        self,
        image_tag: str = "aixchange-ai-sandbox:latest",
        cpu_limit: float = 4.0,
        memory_limit: str = "8192m",
        pids_limit: int = 100,
        network_mode: str = "none",
        user_uid: int = 1000,
        user_gid: int = 1000,
        enable_gpu: bool = False,
    ):
        self.image_tag = image_tag
        self.cpu_limit = cpu_limit
        self.memory_limit = memory_limit
        self.pids_limit = pids_limit
        self.network_mode = network_mode
        self.user_uid = user_uid
        self.user_gid = user_gid
        self.enable_gpu = enable_gpu

    def to_docker_run_args(
        self,
        container_name: str,
        workspace_host_path: Path,
    ) -> List[str]:
        """
        Generates hardened Docker CLI execution arguments.
        Enforces:
          - Non-root user (UID:GID)
          - No new privileges
          - CPU and memory bounds
          - PID limit
          - Network isolation
          - Disallowing Docker socket access
          - Partitioned volume mounts (/input as read-only)
        """
        args = [
            "docker", "run",
            "--name", container_name,
            "--rm",  # Clean up container on exit
            "--user", f"{self.user_uid}:{self.user_gid}",
            "--security-opt", "no-new-privileges:true",
            "--cpus", str(self.cpu_limit),
            "--memory", self.memory_limit,
            "--pids-limit", str(self.pids_limit),
            "--tmpfs", "/tmp:rw,noexec,nosuid,size=512m",
        ]

        if self.network_mode:
            args.extend(["--network", self.network_mode])

        if self.enable_gpu:
            args.extend(["--gpus", "all"])

        # Volume mounts with strict isolation
        # Mount input as read-only, others as read-write
        input_dir = workspace_host_path / "input"
        output_dir = workspace_host_path / "output"
        checkpoints_dir = workspace_host_path / "checkpoints"
        logs_dir = workspace_host_path / "logs"

        if input_dir.exists():
            args.extend(["-v", f"{input_dir}:/workspace/input:ro"])
        if output_dir.exists():
            args.extend(["-v", f"{output_dir}:/workspace/output:rw"])
        if checkpoints_dir.exists():
            args.extend(["-v", f"{checkpoints_dir}:/workspace/checkpoints:rw"])
        if logs_dir.exists():
            args.extend(["-v", f"{logs_dir}:/workspace/logs:rw"])

        args.append(self.image_tag)
        return args


class DockerSandboxRunner:
    """Manages building and running isolated Docker containers."""

    def __init__(self, security_spec: Optional[DockerSecuritySpec] = None):
        self.spec = security_spec or DockerSecuritySpec()
        self.docker_bin = shutil.which("docker")

    def is_docker_available(self) -> bool:
        """Checks if the Docker CLI is installed and the daemon is reachable."""
        if not self.docker_bin:
            return False
        try:
            res = subprocess.run(
                [self.docker_bin, "info"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=3,
            )
            return res.returncode == 0
        except Exception:
            return False

    def build_image(self, context_path: Path, dockerfile_path: Path) -> Dict[str, Any]:
        """Builds the AI Sandbox Docker image."""
        if not self.is_docker_available():
            return {"success": False, "error": "Docker daemon is not running or available"}

        cmd = [
            self.docker_bin,
            "build",
            "-t", self.spec.image_tag,
            "-f", str(dockerfile_path),
            str(context_path),
        ]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return {
                "success": proc.returncode == 0,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def run_isolated_workload(
        self,
        execution_id: str,
        workspace_path: Path,
        command: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Runs a workload inside the isolated Docker container."""
        if not self.is_docker_available():
            return {
                "success": False,
                "executed": False,
                "message": "Docker daemon unavailable; falling back to process sandbox manager",
            }

        container_name = f"aixchange-sandbox-{execution_id}"
        cmd = self.spec.to_docker_run_args(container_name, workspace_path)
        if command:
            cmd.extend(command)

        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=settings.default_timeout_seconds)
            return {
                "success": proc.returncode == 0,
                "executed": True,
                "container_name": container_name,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
            }
        except subprocess.TimeoutExpired:
            subprocess.run([self.docker_bin, "rm", "-f", container_name], capture_output=True)
            return {
                "success": False,
                "executed": True,
                "timeout": True,
                "message": "Container execution timed out and was killed.",
            }


docker_runner = DockerSandboxRunner()
