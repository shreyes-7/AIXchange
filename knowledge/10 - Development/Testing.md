# Testing

## Overview

AIXchange implements comprehensive automated testing across its smart contracts using Hardhat, Chai, and Mocha.

---

## 1. Blockchain Test Suite (`blockchain/test/`)

- **Total Passing Tests**: `115 / 115`
- **Execution Time**: ~4–11 seconds
- **Command**: `npx hardhat test` (inside `blockchain/`)

### Test Coverage Breakdown

```text
Treasury Smart Contract (12 tests)
  ├── Deployment & Initialization
  ├── ETH Deposits and Withdrawals (Access control, zero address checks, balance bounds)
  └── ERC20 Token Deposits and Withdrawals (Access control, transfer boundaries)

LicenseRegistry Smart Contract (32 tests)
  ├── Deployment & Contract Linking
  ├── License Creation — Authorization & Asset Ownership
  ├── License Creation — Pricing Validations (Fixed vs Royalty boundaries)
  ├── License Creation — Validity & Metadata Validations
  ├── License Lifecycle & Expiration Checking (Timestamp boundaries, revocation)
  ├── License Updates & Versioning (Counter increments)
  └── Read Queries & Integration Hooks (Pricing, rights, licensor queries)

PurchaseEngine Smart Contract (30 tests)
  ├── Deployment & Initialization (Fee caps, dependency validations)
  ├── Fee Management (Rate limits, owner update controls)
  ├── Purchase Execution — Happy Path (Atomic token transfer & fee split)
  ├── Purchase Execution — Validation Failures (Inactive dataset, expired license, self-purchase)
  ├── Payment Failures — Balance & Allowance Checks
  ├── Duplicate Purchases & Exclusivity Locking (Single-buyer locking)
  ├── Access Queries & Entitlements (Creator natural access, buyer validity)
  ├── Admin Controls & Circuit Breaker (Pausable toggle, non-owner restrictions)
  └── Lookups and Query Functions

DatasetRegistry Smart Contract (26 tests)
  ├── Deployment & Initial State
  ├── Dataset Registration (Auto-increment IDs, CID validations, event emissions)
  ├── Dataset Retrieval (Owner mapping, full struct inspection)
  ├── Dataset Updates (Metadata, CID versioning, royalty bounds)
  ├── Status Management (Active/inactive toggling)
  └── Ownership Transfer (O(1) index updates, zero address reverts)

AIXToken Smart Contract (15 tests)
  ├── Deployment (Name, symbol, decimals, initial supply)
  ├── Transfers (Balance deductions, insufficient funds)
  ├── Minting (Owner restrictions, zero address checks)
  ├── Burning (Holder burning, approved spender burnFrom)
  └── Approvals & Allowances
```

---

## 2. Frontend & Backend Testing Status

- **Frontend**: Manual end-to-end testing via the `/wallet-test` developer dashboard and interactive marketplace pages.
- **Backend**: Test runner configured in `server/package.json` (`node --test tests/**/*.test.js`).
