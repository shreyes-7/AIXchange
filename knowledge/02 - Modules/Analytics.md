# Analytics

## Overview

The **Analytics** module provides comprehensive off-chain analytics and business intelligence across AIXchange marketplace operations, off-chain downloads, AI model inference executions, user growth, and aggregated platform performance.

> [!NOTE]
> **Implementation State: Phase 11 Complete (Off-Chain Analytics Layer)**
> Off-chain backend analytics are fully implemented, verified, and exposed under `/api/v1/analytics/`. Blockchain event, token, and gas analytics continue to operate separately under `/api/v1/analytics/blockchain/`. The frontend Analytics Dashboard is scheduled for Phase 14.

---

## Architecture & Data Flow

```text
Off-Chain Client / SDK / API Users
             │
             ▼
    REST API Routes (`/api/v1/analytics/*`)
             │
       [auth Middleware]
             │
       [validation Middleware] (Joi query schemas)
             │
      Analytics Controller (`analytics.controller.js`)
             │
      Analytics Service (`analytics.service.js`)
   (UTC validation, ISO-8601 week normalization, precision math)
             │
     Analytics Repository (`analytics.repository.js`)
   (MongoDB-side aggregation, $match, $facet, $toDecimal, compound indexes)
             │
             ├── Purchase Collection (Marketplace Transactions & Revenue)
             ├── Download Collection (Off-Chain Dataset Access Tracking)
             ├── InferenceCall Collection (Model Substrate Execution Logs)
             └── User Collection (Registration, Verification & Active Users)
```

---

## Core Domains & Data Sources

| Domain | Primary Model / Collection | Key Metrics Calculated |
| :--- | :--- | :--- |
| **Revenue** | `Purchase` (`status: "CONFIRMED"`) | `totalRevenue`, `platformRevenue`, `creatorRevenue`, `datasetRevenue`, `transactionCount`, `averageTransactionValue`, timeline |
| **Transactions** | `Purchase` (`status: CONFIRMED / PENDING / FAILED`) | `totalTransactions`, `successfulTransactions`, `pendingTransactions`, `failedTransactions`, `totalTransactionValue`, `averageTransactionValue`, paginated transaction audit log |
| **Downloads** | `Download` (`download.model.js`) | `totalDownloads`, `successfulDownloads`, `failedDownloads`, `uniqueDownloaders`, top datasets breakdown, timeline |
| **API / Inference Calls** | `InferenceCall` (`inference-call.model.js`) | `totalApiCalls`, `successfulApiCalls`, `failedApiCalls`, `uniqueConsumers`, `averageExecutionTimeMs`, `totalExecutionTimeMs`, model breakdown, timeline |
| **Users** | `User` + activity logs (`Purchase`, `Download`, `InferenceCall`) | `totalUsers`, `newUsers`, `activeUsers`, `verifiedUsers`, `usersWithPurchases`, `usersWithDownloads`, `usersWithApiCalls`, growth timeline |
| **Overview** | Parallel single-pass aggregate queries | Unified executive snapshot across all 5 dimensions |

---

## Failure-Isolated Activity Instrumentation

To record dataset access and AI inference executions without risking core application availability:
1. **Download Instrumentation (`server/src/services/download.service.js`)**:
   - Asynchronously logs `Download` documents with status (`SUCCESS` or `FAILED`), dataset reference, sanitized `errorCode`, and duration.
   - Completely wrapped in error boundaries (`try/catch` with fire-and-forget promise). A failure in analytics persistence will **never** interrupt or fail dataset downloads.
2. **Inference Call Instrumentation (`server/src/services/model.service.js`)**:
   - Asynchronously logs `InferenceCall` records upon inference execution completion in a `finally` block.
   - Completely failure-isolated; errors in logging are sent to `logger.warn` and never propagate to the inference response.

---

## Active User Definition & `lastLoginAt` Limitation

- **`lastLoginAt` Limitation**: `User.lastLoginAt` stores only the single latest login timestamp for a user. It does not record historical login occurrences and cannot accurately calculate historical active user counts across past date intervals.
- **Verifiable Active Users**: For any queried date range `[startDate, endDate]`, an "active user" is defined strictly through verifiable historical activity logs:
  - Users who made confirmed purchases in `Purchase` within the window.
  - Users who downloaded datasets in `Download` within the window.
  - Users who executed model inference in `InferenceCall` within the window.
  The count of active users is the deduplicated union across these verifiable event sources.

---

## ISO-8601 UTC Week Bucketing Strategy

All time-series timelines enforce UTC timezone consistency:
- **`day`**: `%Y-%m-%d` (calendar date in UTC).
- **`week`**: `%G-W%V` (ISO-8601 standard week where Monday starts the week and Week 01 contains the first Thursday of the year). Deterministically handles year-boundary crossings (e.g. Dec 29–31 belonging to the correct ISO week).
- **`month`**: `%Y-%m` (calendar month in UTC).

---

## REST API Endpoints

All endpoints are authenticated with `Bearer <JWT>`:

- `GET /api/v1/analytics/overview` - Unified platform executive KPI summary across all 5 dimensions.
- `GET /api/v1/analytics/revenue` - Marketplace revenue totals, fee breakdown, and time-series.
- `GET /api/v1/analytics/transactions` - Marketplace purchase transaction metrics, status distribution, and audit log.
- `GET /api/v1/analytics/downloads` - Off-chain dataset download volume, unique downloaders, and dataset breakdown.
- `GET /api/v1/analytics/api-calls` - AI model execution volume, error rates, and latency metrics.
- `GET /api/v1/analytics/users` - User registration growth, verification stats, and verifiable active user counts.
