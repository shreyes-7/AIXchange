# Python Services

The Python services module hosts AI-oriented workflows for AIXchange.

## Purpose

- support AI inference and evaluation tasks
- manage model-related processing flows
- provide a Python-based service layer for data preparation and analysis

## How to Run

```bash
cd python-services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Important Folders

- app/: application package structure for API, core, training, inference, evaluation, and models
- tests/: Python test suite

## Commands

- python main.py: start the service entrypoint
- pytest: run tests

## Dependencies

This module relies on Python packages listed in requirements.txt and supports AI-related workflow execution.
