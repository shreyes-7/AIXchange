# TODOs and Planned Work

This document tracks upcoming development phases and planned work based on project roadmaps and codebase stubs.

---

## 1. Phase 7 — Docker Sandbox & Secure Execution
- Implement containerized execution runtime in `python-services/` or `sandbox/`.
- Support zero-leakage inference and private model training on confidential datasets.

---

## 2. Phase 8 — Model Marketplace & Registry
- Implement full `ModelRegistry.sol` contract with model versioning, framework identification (PyTorch, ONNX, Safetensors), and benchmark metric metadata.
- Create client frontend pages for browsing, searching, and licensing AI models.
- Add backend REST APIs for model indexing in `server/src/routes/model.route.js`.

---

## 3. Phase 9 — AI Provenance & Lineage Engine
- Build on-chain dataset $\to$ model training lineage graphs.
- Track fine-tuning checkpoints and synthetic derivative datasets.
- Provide cryptographic audit trails for copyright compliance.

---

## 4. Phase 10 — Advanced Secondary Royalty Engine
- Implement `RoyaltyEngine.sol` with multi-party revenue splits, fractional shares, and pull-based claiming mechanisms.
- Automate downstream inference royalty kickbacks to original dataset contributors.
