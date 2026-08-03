# AIXchange Architecture & Development Rules

This document defines the global engineering standards that must be followed for every implementation phase.

These rules apply to the entire repository unless explicitly overridden.

---

# 1. General Principles

Always:

- Follow existing project architecture.
- Reuse existing modules.
- Avoid duplicate code.
- Keep the project modular.
- Follow SOLID principles.
- Follow Clean Architecture where applicable.
- Keep implementations production-ready.
- Keep functions small and reusable.
- Write readable and maintainable code.

Never redesign the architecture unless explicitly instructed.

---

# 2. Project Ownership

Each phase owns only specific directories.

Only modify files related to the current phase.

If another directory must be modified, explain why before making changes.

---

# 3. Blockchain Standards

Use:

- Solidity
- Hardhat
- OpenZeppelin Contracts

Always prefer audited OpenZeppelin implementations over writing custom code.

Use the Solidity compiler version already configured in the repository.

Do not change compiler versions unless absolutely necessary.

---

# 4. Smart Contract Standards

Every contract must include:

- SPDX License
- NatSpec documentation
- Constructor documentation
- Events
- Custom errors where appropriate
- Access control
- Input validation

Contracts should be modular.

Avoid unnecessary inheritance.

Prefer composition where possible.

---

# 5. Security Requirements

Always consider:

- Access Control
- Reentrancy
- Integer safety
- Zero-address validation
- Checks-Effects-Interactions pattern
- Ownership validation

Never introduce unrestricted privileged functions.

Prevent unauthorized minting, burning or ownership transfers.

---

# 6. Gas Optimization

Whenever possible:

- Use immutable variables.
- Use constant values.
- Minimize storage writes.
- Avoid duplicated storage reads.
- Use calldata instead of memory when appropriate.
- Avoid unnecessary loops.

Do not sacrifice readability for minor gas savings.

---

# 7. Deployment Standards

Deployment should always be reproducible.

Deployment order must be documented.

Deployment scripts should be idempotent whenever possible.

Deployment modules should be placed inside:

```
blockchain/ignition/modules/
```

---

# 8. Testing Standards

Every implementation must include tests.

Tests should cover:

- Successful execution
- Failure cases
- Access control
- Event emission
- Edge cases

No skipped tests.

No failing tests.

---

# 9. Documentation Standards

Every public function must include NatSpec.

Every contract must explain:

- Purpose
- Responsibilities
- Security assumptions

README files should be updated whenever functionality changes.

---

# 10. Frontend Integration Rules

Frontend services may be updated only when required for blockchain integration.

Do not build UI unless the current phase explicitly requires it.

Business logic should remain inside reusable service classes.

---

# 11. Backend Rules

Backend APIs should only be modified if explicitly required by the current phase.

Do not implement future APIs early.

---

# 12. Future Phase Protection

Do NOT implement features from future phases unless explicitly instructed.

Examples include:

- Dataset Marketplace
- Model Marketplace
- Provenance Engine
- Royalty Distribution
- Licensing
- Analytics
- Admin

Focus only on the current phase.

---

# 13. Required Commands Before Completion

Before marking any phase complete, execute:

```bash
npm install
```

```bash
npx hardhat compile
```

```bash
npx hardhat test
```

Run any deployment scripts required for the current phase.

Report the output of each command.

---

# 14. Required Deliverables

Before closing a phase, provide:

## Files Modified

List every modified file.

---

## Files Created

List every newly created file.

---

## Features Implemented

Describe every completed feature.

---

## Architecture Decisions

Explain:

- Design choices
- Trade-offs
- Security decisions
- Gas optimization decisions

---

## Testing

List:

- Commands executed
- Tests performed
- Results

---

## Outstanding Work

List work intentionally left for future phases.

---

## Suggested Git Commit

Provide a meaningful commit message.

---

# 15. Definition of Done

A phase is COMPLETE only if:

- Code compiles.
- Tests pass.
- Documentation updated.
- No known blockers remain.
- Acceptance criteria satisfied.
- No future-phase functionality implemented.
- Repository remains clean and modular.

Never mark a phase COMPLETE if any acceptance criterion is unmet.