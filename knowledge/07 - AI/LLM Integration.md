# LLM Integration

## Overview

This document tracks large language model (LLM) providers and inference integration references in the AIXchange codebase.

> [!WARNING]
> **Implementation State: Configuration Template Only**
> `OPENAI_API_KEY` is referenced in the root `.env.example` template file, but no active LLM API calls (OpenAI, Anthropic, Gemini, or local Ollama) exist in backend or Python service code.

---

## Codebase References

- `/.env.example`:
  ```env
  # AI services
  OPENAI_API_KEY=your-openai-key
  MODEL_API_URL=http://localhost:8000
  ```

---

## Planned Use Cases

1. **Dataset Summary Generation**: Automatically generating markdown summaries and feature descriptions for datasets uploaded to IPFS.
2. **Metadata Tagging**: Suggesting optimal taxonomy categories and search tags based on sample data.
3. **Automated License Compatibility Analysis**: Analyzing custom license terms for conflicts.
