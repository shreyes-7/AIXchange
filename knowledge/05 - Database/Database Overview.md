# Database Overview

## Overview

AIXchange uses **MongoDB** as its primary off-chain document database, interfaced via **Mongoose ODM v9**.

The database acts as a read-optimized index for on-chain assets, facilitating full-text search, multi-attribute filtering, category classification, view/download counters, user sessions, and cached transaction receipts.

---

## Configuration & Connection

- **Connection Handler**: `server/src/config/database.js`
- **Environment Variable**: `MONGO_URI` (Default: `mongodb://localhost:27017/aixchange`)
- **Connection Logic**:
  ```javascript
  import mongoose from 'mongoose';
  import { logger } from './logger.js';

  export async function connectDB() {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      logger.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
  ```

---

## Database Summary

| Collection | Schema File | Primary Role |
| :--- | :--- | :--- |
| **`users`** | `user.model.js` | User profiles, passwords (bcrypt), roles, linked wallet addresses, and challenge nonces |
| **`sessions`** | `session.model.js` | Active JWT authentication sessions and expiration timestamps |
| **`datasets`** | `dataset.model.js` | Dataset catalog metadata, IPFS CIDs, search tags, pricing, and on-chain dataset ID |
| **`licenses`** | `license.model.js` | Off-chain synchronized license terms, rights permissions, and pricing models |
| **`purchases`** | `purchase.model.js` | Settled dataset purchase records and access validity windows |
| **`transactions`**| `transaction.model.js` | Ledger of on-chain contract transactions and confirmation states |
| **`indexer_state`**| `indexer-state.model.js` | Background event indexer block sync cursors |
