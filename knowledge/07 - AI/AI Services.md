# AI Services (Technical Details)

## Overview

The `python-services/` module provides a Python environment for artificial intelligence services.

---

## Environment & Dependencies

- **Configuration File**: `python-services/requirements.txt`
- **Installed Packages**: 130 dependencies, including:
  - `torch==2.13.0`
  - `safetensors==0.8.0`
  - `uvicorn==0.51.0`
  - `pydantic_core==2.46.4`
  - `scipy==1.18.0`
  - `numpy==2.5.1`
  - `requests==2.34.2`
  - `protobuf==7.35.1`

---

## Execution Guide

To initialize and run the Python AI service environment:

```bash
cd python-services

# 1. Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Linux / macOS:
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start service (when main.py is implemented)
# python main.py
```
