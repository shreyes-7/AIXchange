# Development Workflow

## Overview

This document describes the software engineering practices, Git branching strategy, and code quality standards in the AIXchange repository.

---

## 1. Git Branching Strategy

- **`main`**: Production-ready code.
- **`develop`**: Active integration branch for upcoming releases.
- **`feature/<name>`**: Feature branches for new functionality.
- **`bugfix/<issue>`**: Bug fix branches.

---

## 2. Commit Conventions

Conventional commits format is used across the repository:
- `feat(blockchain)`: New smart contracts or on-chain logic.
- `feat(backend)`: New REST endpoints, models, or indexers.
- `feat(client)`: New UI pages, components, or Web3 hooks.
- `docs`: Documentation updates.
- `test`: Automated unit or integration tests.
- `fix`: Bug fixes.

---

## 3. Code Standards & Tooling

- **Formatting**: Prettier (`package.json` devDependency).
- **Linting**: ESLint.
- **Git Hooks**: Husky and `lint-staged`.
