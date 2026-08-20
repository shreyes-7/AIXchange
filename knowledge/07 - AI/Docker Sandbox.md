# Docker Sandbox

## Overview

The AI Execution Sandbox in AIXchange provides an isolated, reproducible container environment for running machine learning training, JupyterLab development, model export, and inference workloads without exposing the host system.

---

## 1. Workspace Partitioning

Workspaces are provisioned under `/workspace/<execution_id>/` with strict separation of concerns:

```text
/workspace/<execution_id>/
├── input/          # Read-only input dataset, configuration, and credentials
├── code/           # User and framework training scripts
├── data/           # Preprocessed and staged tensors/data splits
├── output/         # Exported model artifacts (model.safetensors, model_metadata.json)
├── checkpoints/    # Intermediate epoch weights and checkpoints_index.json
└── logs/           # Stdout/stderr logs, metrics summaries, and traces
```

---

## 2. Security & Isolation Controls

- **Non-Root Execution**: Runs under unprivileged user `aixuser` (UID `1000`, GID `1000`).
- **Path Traversal Protection**: `SandboxManager.validate_contained_path()` ensures file operations cannot escape the assigned workspace subtree.
- **Docker Socket Isolation**: The Docker daemon socket (`/var/run/docker.sock`) is never mounted inside the workload container.
- **Resource Constraints**:
  - `cpus: '4.0'` (Configurable via `MAX_CPU_CORES`)
  - `memory: 8192M` (Configurable via `MAX_MEMORY_MB`)
  - `pids_limit: 100` (Mitigates fork bombs)
  - `tmpfs: /tmp:rw,noexec,nosuid,size=512m` (Prevents temporary binary execution)
- **Deterministic Cleanup**: `SandboxManager.cleanup_workspace(execution_id)` prunes intermediate checkpoints and temporary data while preserving final artifacts in `output/`.

---

## 3. Sandbox SDK & Workspace Staging (`@aixchange/sandbox`)

The Node.js Sandbox SDK mirrors this directory structure and provides path containment validation:
- `WorkspaceLayout`: Object mapping `input/`, `code/`, `data/`, `output/`, `checkpoints/`, `logs/`.
- `validateContainedPath(baseDir, targetPath)`: Asserts strict path containment against directory traversal attacks.
- `stageWorkspaceFiles(executionId, files, baseDir)`: Automatically stages uploaded user training scripts, datasets, and configurations into the appropriate workspace partition before execution start.

---

## 4. Related Links

- [[AI Architecture]]
- [[Jupyter Environment]]
- [[Training Engine]]
- [[AI Execution Contract]]

