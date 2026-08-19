# ==============================================================================
# AIXchange - AI Execution Sandbox Dockerfile (Phase 7)
# ------------------------------------------------------------------------------
# Isolated, reproducible AI execution environment for Training, Jupyter,
# Model Export, and Inference.
# ==============================================================================

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    WORKSPACE_DIR=/workspace \
    JUPYTER_PORT=8888 \
    AI_SERVICE_PORT=8000

# Install minimal OS dependencies for ML and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root execution user for security hardening
RUN groupadd -g 1000 aixgroup && \
    useradd -u 1000 -g aixgroup -m -s /bin/bash aixuser

# Setup isolated workspace hierarchy with strict boundaries
WORKDIR /workspace
RUN mkdir -p /workspace/input \
             /workspace/code \
             /workspace/data \
             /workspace/output \
             /workspace/checkpoints \
             /workspace/logs \
             /etc/jupyter && \
    chown -R aixuser:aixgroup /workspace /etc/jupyter

# Install pinned Python dependencies
COPY python-services/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
    pip install --no-cache-dir jupyterlab==4.3.5 fastapi==0.141.1 uvicorn==0.51.0 pydantic==2.13.4 pytest==9.1.1 && \
    rm /tmp/requirements.txt

# Copy Jupyter configuration
COPY docker/sandbox/jupyter_server_config.py /etc/jupyter/jupyter_server_config.py
RUN chown aixuser:aixgroup /etc/jupyter/jupyter_server_config.py

# Copy AI service application code
COPY --chown=aixuser:aixgroup python-services/ /opt/aixchange/python-services/
ENV PYTHONPATH="/opt/aixchange/python-services"

# Switch to non-root user
USER aixuser

EXPOSE 8000 8888

# Default entrypoint starts the AI Execution Service
CMD ["python", "/opt/aixchange/python-services/main.py"]
