# AI API

## Overview

This document describes the planned HTTP endpoints for the Python AI Services module.

> [!WARNING]
> **Implementation State: Planned / Not Implemented**
> The Python AI services endpoints are planned for upcoming phases. `MODEL_API_URL=http://localhost:8000` is referenced in `.env.example`, but runtime routes in `python-services/app/api/` currently contain `.gitkeep`.

---

## Planned Endpoints (Roadmap)

### 1. `POST /api/v1/ai/evaluate-dataset`
- **Description**: Profiles dataset quality, checks distributions, and outputs quality metric scores.

### 2. `POST /api/v1/ai/infer`
- **Description**: Executes private inference inside a containerized sandbox on a licensed dataset or model.

### 3. `POST /api/v1/ai/embeddings`
- **Description**: Generates vector embeddings from dataset text descriptions for semantic catalog search.
