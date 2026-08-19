# Jupyter Environment

## Overview

AIXchange provides an interactive JupyterLab environment inside the Docker sandbox for exploratory data analysis, dataset inspection, and custom model prototyping.

---

## 1. Security Architecture

- **Root Directory Lock**: Server root directory is strictly locked to `/workspace`.
- **Token Authentication**: Requires secure bearer token authentication (`JUPYTER_TOKEN`).
- **Terminal Control**: Shell terminal execution can be disabled via `DISABLE_JUPYTER_TERMINAL=true`.
- **Network Boundaries**: Bound to isolated container bridge network; no direct host network access.

---

## 2. Management & Lifecycle

Managed via `app.core.jupyter.JupyterManager`:
- **Start**: `POST /api/v1/execution/jupyter/start`
- **Stop**: `POST /api/v1/execution/jupyter/stop`
- **Status**: `GET /api/v1/execution/jupyter/status`

---

## 3. Related Links

- [[Docker Sandbox]]
- [[AI Overview]]
- [[AI Execution Contract]]
