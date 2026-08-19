"""
AIXchange - Core Configuration (Phase 7)
"""

import os
from pathlib import Path
from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Global service settings."""
    app_name: str = "AIXchange AI Execution Service"
    app_version: str = "1.0.0"
    environment: str = os.getenv("NODE_ENV", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    
    # Workspace & Storage Settings
    base_workspace_dir: str = os.getenv("WORKSPACE_DIR", str(Path(__file__).resolve().parent.parent.parent / "workspace"))
    default_timeout_seconds: int = int(os.getenv("DEFAULT_TIMEOUT_SECONDS", "3600"))
    max_memory_mb: int = int(os.getenv("MAX_MEMORY_MB", "8192"))
    max_cpu_cores: float = float(os.getenv("MAX_CPU_CORES", "4.0"))
    pids_limit: int = int(os.getenv("PIDS_LIMIT", "100"))
    
    # Jupyter Settings
    jupyter_port: int = int(os.getenv("JUPYTER_PORT", "8888"))
    jupyter_token: str = os.getenv("JUPYTER_TOKEN", "aixchange_sandbox_token")
    disable_jupyter_terminal: bool = os.getenv("DISABLE_JUPYTER_TERMINAL", "false").lower() == "true"


settings = Settings()
