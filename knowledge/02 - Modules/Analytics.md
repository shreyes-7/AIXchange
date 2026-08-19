# Analytics

## Overview

The **Analytics** module aggregates platform trading volume, dataset engagement, token velocity, and user activity across AIXchange.

> [!NOTE]
> **Implementation State: Partially Implemented**
> Aggregated statistics and dashboard routes exist in the backend (`routes/dashboard.route.js`, `routes/token.route.js`) and live metrics banners exist in the frontend (`DatasetMarketplace.jsx`). Comprehensive historical charts and time-series aggregations are ongoing.

---

## Existing Codebase References

1. **Frontend Metrics Display (`client/src/pages/DatasetMarketplace.jsx`)**:
   - Total datasets published.
   - Active verified creators.
   - Total volume traded.
2. **Backend Token & Dashboard APIs**:
   - `server/src/routes/token.route.js` (`GET /api/v1/token/stats`): Total AIX supply, circulating tokens, burn totals.
   - `server/src/routes/dashboard.route.js`: User-specific purchase, listing, and earnings summary.
3. **Database Counter Aggregations (`server/src/models/dataset.model.js`)**:
   - `viewCount`, `downloadCount`, `purchaseCount` counters incremented by API calls and event indexer workers.
