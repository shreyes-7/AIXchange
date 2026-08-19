"""
AIXchange - Docker Container Isolation & Security Tests (Phase 7)
Verifies Dockerfile security rules, Docker run arguments, resource limits,
Docker socket protection, and container-to-container isolation.
"""

from pathlib import Path
import pytest

from app.core.docker_runner import DockerSecuritySpec, DockerSandboxRunner
from app.core.sandbox import SandboxManager


@pytest.fixture
def repo_root():
    return Path(__file__).resolve().parent.parent.parent


def test_dockerfile_security_hardening(repo_root):
    """Verifies that the Dockerfile enforces non-root execution and security best practices."""
    dockerfile_path = repo_root / "docker" / "sandbox" / "Dockerfile"
    assert dockerfile_path.exists(), "Dockerfile must exist at docker/sandbox/Dockerfile"

    content = dockerfile_path.read_text(encoding="utf-8")

    # 1. Non-root user creation and usage
    assert "useradd -u 1000" in content, "Must create dedicated non-root user (UID 1000)"
    assert "USER aixuser" in content, "Must switch to non-root user aixuser"

    # 2. Strict workspace tree creation
    for folder in ["/workspace/input", "/workspace/output", "/workspace/checkpoints", "/workspace/logs"]:
        assert folder in content, f"Must create partitioned workspace directory: {folder}"

    # 3. No secrets or host-specific paths in Dockerfile
    assert "password=" not in content.lower()
    assert "secret=" not in content.lower()
    assert "private_key" not in content.lower()


def test_docker_security_spec_flags(tmp_path):
    """Verifies generated Docker CLI flags enforce security, resource limits, and socket exclusion."""
    spec = DockerSecuritySpec(
        image_tag="aixchange-ai-sandbox:test",
        cpu_limit=2.0,
        memory_limit="4096m",
        pids_limit=80,
        network_mode="none",
        user_uid=1000,
        user_gid=1000,
    )

    ws_path = tmp_path / "exec_001"
    (ws_path / "input").mkdir(parents=True)
    (ws_path / "output").mkdir(parents=True)
    (ws_path / "checkpoints").mkdir(parents=True)
    (ws_path / "logs").mkdir(parents=True)

    args = spec.to_docker_run_args("test-container", ws_path)

    # 1. Non-root user
    assert "--user" in args
    assert "1000:1000" in args

    # 2. Privilege escalation prevention
    assert "--security-opt" in args
    assert "no-new-privileges:true" in args

    # 3. Resource limits
    assert "--cpus" in args and "2.0" in args
    assert "--memory" in args and "4096m" in args
    assert "--pids-limit" in args and "80" in args

    # 4. Network isolation
    assert "--network" in args and "none" in args

    # 5. Read-only input partition
    assert any("input:ro" in arg for arg in args), "Input volume must be mounted read-only"

    # 6. Docker socket protection (must NEVER mount docker.sock)
    assert not any("docker.sock" in arg for arg in args), "Docker socket must NEVER be mounted"


def test_container_to_container_workspace_isolation(tmp_path):
    """Verifies that two concurrent execution workspaces are completely isolated from each other."""
    sandbox = SandboxManager(base_dir=str(tmp_path))

    ws1 = sandbox.provision_workspace("exec_alpha_001")
    ws2 = sandbox.provision_workspace("exec_beta_002")

    assert ws1.root != ws2.root
    assert ws1.root.exists() and ws2.root.exists()

    # Create private file in ws1
    (ws1.input / "secret_data.csv").write_text("dataset_1_confidential")

    # ws2 should not see or have access to ws1 files
    assert not (ws2.input / "secret_data.csv").exists()

    # Path containment check
    with pytest.raises(PermissionError):
        sandbox.validate_contained_path("exec_beta_002", str(ws1.input / "secret_data.csv"))
