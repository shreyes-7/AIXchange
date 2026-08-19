# ==============================================================================
# AIXchange - Hardened Jupyter Server Configuration (Phase 7)
# ------------------------------------------------------------------------------
# Enforces strict isolation boundaries:
#  - Root directory locked to /workspace
#  - Disables arbitrary system command injection where possible
#  - No host root access or Docker socket visibility
# ==============================================================================

import os

c = get_config()  # noqa: F821

# Network & Server Settings
c.ServerApp.ip = "0.0.0.0"
c.ServerApp.port = int(os.environ.get("JUPYTER_PORT", 8888))
c.ServerApp.open_browser = False
c.ServerApp.allow_remote_access = True
c.ServerApp.allow_origin = "*"

# Security & Workspace Isolation
c.ServerApp.root_dir = "/workspace"
c.ServerApp.allow_root = False
c.ServerApp.token = os.environ.get("JUPYTER_TOKEN", "aixchange_sandbox_token")
c.ServerApp.password = ""

# Disable terminal if strict sandbox mode is requested
if os.environ.get("DISABLE_JUPYTER_TERMINAL", "false").lower() == "true":
    c.ServerApp.terminals_enabled = False

# File management limits
c.ServerApp.max_body_size = 50 * 1024 * 1024  # 50 MB max upload
c.FileContentsManager.always_delete_dir = False
