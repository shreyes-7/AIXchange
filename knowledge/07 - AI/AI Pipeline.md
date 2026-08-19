# AI Pipeline

## Overview

The **AI Pipeline** module in `python-services/app/pipelines/` is planned to structure the data preparation, quality scoring, and evaluation workflows for datasets and models submitted to AIXchange.

> [!WARNING]
> **Implementation State: Scaffold / Planned**
> Directory `python-services/app/pipelines/` currently contains `.gitkeep`. Active data transformation and preprocessing pipelines are scheduled for upcoming releases.

---

## Planned Pipeline Stages

1. **Ingestion & Validation**: Fetching raw dataset files from IPFS and validating file encoding and integrity.
2. **Schema & Feature Extraction**: Inferring column types, statistical distributions, class balances, and missing value ratios.
3. **Data Quality Scoring**: Generating an objective quality score stored in MongoDB to assist buyers during dataset selection.
4. **Evaluation Dispatch**: Benchmarking AI models against standardized test splits.
