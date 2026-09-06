# Admin & Moderation Module

## Overview

The **Admin & Moderation** module provides administrative governance, content moderation, user safety management, report handling, human-in-the-loop fraud review, authoritative treasury telemetry, and an append-only audit trail for AIXchange.

> [!NOTE]
> **Implementation State: Phase 12 Complete (Backend & Moderation Services)**
> Full backend routes, validation, business logic, repositories, and persistence models are implemented and verified under `/api/v1/admin` and `/api/v1/reports`. All endpoints enforce strict authentication and role-based access controls (`USER_ROLES.ADMIN`). The frontend admin dashboard is scheduled for subsequent UI phases; the `client/` directory remains completely untouched.

---

## Architecture & Data Flow

```text
Admin / Authenticated Client
              │
              ├── [POST /api/v1/reports] ──► [authMiddleware] ──► report.controller ──► report.service ──► report.repository
              │                                                                                                │
              └── [/api/v1/admin/*] ───────► [authMiddleware]                                                 ▼
                                                    │                                                    Report Collection
                                            [requireAdmin]
                                                    │
        ┌───────────────────┬───────────────────────┼───────────────────────┬───────────────────┐
        ▼                   ▼                       ▼                       ▼                   ▼
admin.controller   admin.controller        report.controller       fraud-review.ctrl   admin.controller
 (User Moderation)  (Asset Moderation)     (Report Resolution)     (Flag Review)       (Treasury Telemetry)
        │                   │                       │                       │                   │
  admin.service       admin.service           report.service        fraud-review.serv   admin-treasury.serv
        │                   │                       │                       │                   │
  user.repository    dataset/model.repo      report.repository       fraud-flag.repo     TreasuryMonitor /
        │                   │                       │                       │            Smart Contracts
        └───────────────────┴───────────────────────┼───────────────────────┘                   │
                                                    ▼                                           ▼
                                      moderation-audit.repository                      Authoritative State
                                                    │                                   (Exact Token/Wei)
                                                    ▼
                                     ModerationAudit Collection
                                       (Strictly Append-Only)
```

---

## Core Domains & Functionality

### 1. User Account Moderation
- **Status Enum**: `USER_STATUS.ACTIVE` (`ACTIVE`), `USER_STATUS.SUSPENDED` (`SUSPENDED`).
- **Suspension Enforcement**:
  - `auth.middleware.js` inspects `user.status` and rejects suspended accounts with `403 Forbidden` (`ACCOUNT_SUSPENDED`).
  - `auth.service.js` blocks both credential login and token refresh for suspended users.
- **Self-Moderation Protection**: Administrators cannot suspend their own user accounts.
- **Audit Logging**: Every status transition triggers an immutable `ModerationAudit` record (`USER_STATUS_CHANGE`).

### 2. Dataset Moderation
- **Status State Machine**:
  - `active`: Fully visible in marketplace searches and browse listings.
  - `hidden`: Delisted from public discovery; existing license holders retain direct access.
  - `under_review`: Flagged for review; public discovery restricted.
  - `removed`: Administratively taken down.
  - `archived`: Maintained for historical consistency.
- **Audit Logging**: Status updates generate `DATASET_STATUS_CHANGE` audit entries capturing previous and new statuses with required reason strings.

### 3. AI Model Moderation
- **Status Synchronization**:
  - Model status transitions between `active`, `hidden`, `under_review`, and `removed`.
  - Atomically synchronized with the legacy `active` boolean flag (`active: true` when `status === "active"`, `false` otherwise).
- **Audit Logging**: Status updates generate `MODEL_STATUS_CHANGE` audit entries with full prior-state and new-state metadata.

### 4. User Reports & Resolution Queue
- **Submission (`POST /api/v1/reports`)**:
  - Authenticated users can submit reports against `USER`, `DATASET`, or `MODEL` entities.
  - Verifies target entity existence across collections before report creation.
  - Validates report categories (`SPAM`, `INAPPROPRIATE_CONTENT`, `COPYRIGHT_INFRINGEMENT`, `FRAUD`, `MALICIOUS_CODE`, `HARASSMENT`, `OTHER`).
- **Admin Workflow (`/api/v1/admin/reports/*`)**:
  - Filterable by `status`, `targetType`, `category`, and `priority`.
  - Admin assignment (`PATCH /api/v1/admin/reports/:reportId/assignment`) records `REPORT_ASSIGNMENT` audit.
  - Status updates and resolutions (`PENDING`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`) require admin notes and record `REPORT_RESOLUTION` audits.

### 5. Append-Only Moderation Audit Trail
- **Model**: `ModerationAudit` (`moderation-audit.model.js`).
- **Immutability Guarantee**: `moderation-audit.repository.js` exposes strictly append-only write functions (`recordAudit`). No update or delete operations are implemented.
- **Recorded Fields**: `action`, `targetType`, `targetId`, `moderatorId`, `reason`, `previousState`, `newState`, `metadata`, `createdAt`.
- **Querying (`GET /api/v1/admin/audits`)**: Paginated audit search filtered by `targetType`, `adminId`, `action`, and date range.

### 6. Human-in-the-Loop Fraud Flag Review
- **Subsystem Boundary**: Fraud detection is owned by the blockchain/indexer subsystem (`FraudEngine`). The backend does **not** independently inspect blockchain events or duplicate fraud rules.
- **Ingestion (`POST /api/v1/admin/fraud-flags/ingest`)**:
  - Ingests structured fraud flags containing `flagId`, `ruleId`, `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `targetAddress`, `evidence`, and `recommendedAction`.
- **Review Workflow (`PATCH /api/v1/admin/fraud-flags/:id/status`)**:
  - Admin marks flags as `CONFIRMED` or `DISMISSED` with required review notes.
  - Records `FRAUD_FLAG_CONFIRMED` or `FRAUD_FLAG_DISMISSED` audit entries.
  - **No Automated Punishment**: Confirmation does not trigger automatic account bans or asset deletion; penalties require explicit admin moderation actions.

### 7. Authoritative Treasury Telemetry
- **Subsystem Boundary**: The backend does **not** reconstruct or calculate on-chain treasury accounting from raw purchases.
- **Authoritative Source**: Consumes telemetry from `TreasuryMonitor` and authoritative smart contract view functions (`getTreasuryFee()`, on-chain balances, on-chain distribution events).
- **Precision Safety**: Balances, revenues, and fee shares are presented strictly with BigInt/string precision preservation.

---

## Security & Access Control

| Layer | Requirement | Implementation |
| :--- | :--- | :--- |
| **Authentication** | Valid Bearer JWT | `authenticate` middleware (`server/src/middlewares/auth.middleware.js`) |
| **Role Authorization** | `role: "ADMIN"` | `requireAdmin` (`server/src/middlewares/role.middleware.js`) |
| **Account State** | `status: "ACTIVE"` | Rejection of `SUSPENDED` users across all authenticated endpoints with HTTP 403 |
| **Self-Protection** | No self-suspension | `admin.service.js` enforces `adminId !== targetUserId` |
| **Input Validation** | Strict Joi schemas | `admin.validator.js`, `report.validator.js` |
