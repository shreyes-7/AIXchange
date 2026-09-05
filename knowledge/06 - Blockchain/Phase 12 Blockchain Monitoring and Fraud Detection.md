# Phase 12 — Blockchain Monitoring, Treasury & Fraud Detection

## 1. Executive Summary

Phase 12 establishes the decentralized oversight layer for the AIXchange platform, consisting of:
1. **Treasury Management**: Enhanced vault functionality supporting explicit ERC20 token deposits via `depositToken` and emission of `Events.TokenDeposited`, with continuous balance tracking and inflow/outflow auditability.
2. **Blockchain Monitoring**: A robust, event-driven monitoring engine (`blockchain/monitoring/eventMonitor.js` and `treasuryMonitor.js`) observing live and historical on-chain activity across all 8 contracts with zero disruption to core operations.
3. **Deterministic Fraud Detection**: An explainable, rule-based anomaly engine (`blockchain/monitoring/fraudEngine.js`) that detects suspicious patterns (rapid transaction bursts, abnormally large transfers, suspicious treasury movements, and repeated failed probing attempts) without automated state manipulation.
4. **Backend Integration Handoff**: Complete interface specification for the backend teammate (Prabhu) to integrate blockchain telemetry into the administrative dashboard.

---

## 2. Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        EVM Smart Contracts                             │
│  (AIXToken, Treasury, DatasetRegistry, LicenseRegistry, PurchaseEngine,│
│   ModelRegistry, ProvenanceRegistry, RoyaltyEngine)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ getLogs / WebSocket Events
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EventMonitor Component                          │
│  - Multi-contract event query & log parsing                            │
│  - Deduplication on (txHash + logIndex)                                │
│  - Normalizes arguments, timestamps, and addresses                     │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌─────────────────────────────────────┐  ┌───────────────────────────────┐
│           TreasuryMonitor           │  │          FraudEngine          │
│  - Real-time ETH/ERC20 balances     │  │  - Deterministic rules        │
│  - Inflows & Outflows classification│  │  - Configurable thresholds    │
│  - Privileged operation auditing    │  │  - Explanations & Evidence    │
└───────────────────┬─────────────────┘  └───────────┬───────────────────┘
                    │                                │
                    └────────────────┬───────────────┘
                                     │ Normalized Telemetry & Flags
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Backend Handoff Interface                          │
│  - Admin Dashboard API Specifications                                  │
│  - Flagged Address & Transaction Audit Trail                           │
│  - Administrative Review (NO automated account freezing)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Treasury Architecture & Enhancements

### 3.1 Contract Specification
- **Contract**: [`Treasury.sol`](file:///d:/AIXchange/blockchain/contracts/governance/Treasury.sol) (implements [`ITreasury.sol`](file:///d:/AIXchange/blockchain/contracts/interfaces/ITreasury.sol))
- **Inheritance**: OpenZeppelin `Ownable`
- **Security**: Safe ERC20 transfers via `SafeERC20`, strict `onlyOwner` modifier for withdrawals, explicit zero address and zero amount validations.

### 3.2 Implemented Methods
- `depositToken(address token, uint256 amount)`:
  Allows accounts or smart contracts to deposit ERC20 tokens into the treasury vault, safely pulling funds via `safeTransferFrom` and emitting `Events.TokenDeposited(token, msg.sender, amount)`.
- `withdrawToken(address token, address to, uint256 amount)` (`onlyOwner`):
  Disburses tokens from the vault to a designated recipient address.
- `withdrawETH(address payable to, uint256 amount)` (`onlyOwner`):
  Disburses native ETH from the vault.
- `getTokenBalance(address token)`:
  View method returning current ERC20 token holdings.
- `getETHBalance()`:
  View method returning current native ETH holdings in wei.
- `receive()` / `fallback()`:
  Accepts native ETH deposits and emits `Events.ETHDeposited`.

---

## 4. Blockchain Monitoring Engine

### 4.1 Scope of Monitored Activity
The monitoring subsystem (`blockchain/monitoring/eventMonitor.js`) tracks all analytics and security-relevant events across the 8 AIXchange contracts:

1. **AIX Token Activity**:
   - `Transfer(from, to, value)`
   - `TokensMinted(to, amount)`
   - `TokensBurned(from, amount)`
2. **Marketplace & Licensing**:
   - `DatasetPurchased(purchaseId, datasetId, buyer, licensor, price, feeAmount, licensorAmount)`
   - `LicenseCreated(licenseId, assetId, licensor, fixedPrice, royaltyRate)`
   - `LicenseRevoked(licenseId, licensor)`
3. **Treasury Vault**:
   - `ETHDeposited(sender, amount)`
   - `TokenDeposited(token, sender, amount)`
   - `ETHWithdrawn(recipient, amount)`
   - `TokenWithdrawn(token, recipient, amount)`
4. **Royalty Distributions**:
   - `DistributionCreated(distributionId, sourceKey, totalRevenue)`
   - `RecipientPaid(distributionId, recipient, amount, shareBps)`
   - `TreasuryPaid(distributionId, treasury, amount, feeBps)`
5. **Asset Registries & Provenance**:
   - `DatasetRegistered`, `DatasetOwnershipTransferred`
   - `ModelRegistered`, `ModelVersionAdded`
   - `ProvenanceRegistered`, `ProvenanceStatusChanged`

### 4.2 Reliability & Fault Tolerance
- **Deduplication**: Enforces uniqueness using `txHash + logIndex`.
- **Fault Resilience**: Provider/RPC timeouts or parsing exceptions on unknown logs do not crash the engine; warnings are logged and partial clean events are returned.
- **Timestamp Caching**: Caches block timestamps to prevent redundant `getBlock` network calls.

---

## 5. Deterministic Fraud Detection Engine

The fraud detection engine (`blockchain/monitoring/fraudEngine.js`) evaluates normalized activity records against explainable rules with configurable thresholds (`blockchain/monitoring/config.js`).

### 5.1 Configured Rules & Thresholds

| Rule ID | Name | Trigger Condition | Severity | Action |
| :--- | :--- | :--- | :--- | :--- |
| `RAPID_TRANSACTIONS` | Rapid High-Frequency Bursts | $\ge 5$ interactions from the same address within 60 seconds | `MEDIUM` / `HIGH` | Flag for review; include tx hashes |
| `ABNORMAL_LARGE_TRANSFER` | Whale / Anomalous Transfer | Single AIX transfer $\ge 50,000$ AIX | `HIGH` / `CRITICAL` ($> 250,000$ AIX) | Flag for audit; verify sender & recipient |
| `SUSPICIOUS_TREASURY_ACTIVITY` | Suspicious Treasury Outflow | Single withdrawal $\ge 20,000$ AIX or $\ge 5$ ETH | `CRITICAL` | Flag immediately; audit owner authorization |
| `UNUSUAL_ROYALTY_PATTERN` | Abnormal Royalty Payout | Single royalty distribution to recipient $\ge 15,000$ AIX | `MEDIUM` | Flag for royalty accounting review |
| `REPEATED_FAILED_TRANSACTIONS` | Exploit / Revert Probing | $\ge 3$ failed transactions from the same address within window | `HIGH` | Flag for bot / exploit scanning review |

### 5.2 Flag Schema
```json
{
  "flagId": "FLAG_RAPID_TX_0x9999999999999999999999999999999999999999_1788613200000",
  "ruleId": "RAPID_TRANSACTIONS",
  "severity": "MEDIUM",
  "address": "0x9999999999999999999999999999999999999999",
  "transactionHash": "0xtx0",
  "timestamp": "2026-09-06T10:00:00.000Z",
  "description": "Address executed 5 transactions within 60s (threshold: 5)",
  "evidence": {
    "count": 5,
    "threshold": 5,
    "windowSeconds": 60,
    "transactionHashes": ["0xtx0", "0xtx1", "0xtx2", "0xtx3", "0xtx4"]
  }
}
```

> [!IMPORTANT]
> **Safety Invariant**:
> Fraud detection strictly generates audit flags and evidence. It **never** triggers automated account freezing or smart contract state changes, preserving user rights and system uptime.

---

## 6. Backend Handoff Specification (For Prabhu)

This section provides the complete technical contract for the backend teammate to integrate Phase 12 blockchain monitoring and fraud detection into the server and administrative dashboard.

### 6.1 Suggested Backend REST Endpoints

#### 1. `GET /api/v1/admin/blockchain/monitoring`
Query monitored blockchain events and filter by contract, event, or address.

**Query Parameters:**
- `contract`: Filter by contract name (e.g. `"AIXToken"`, `"Treasury"`).
- `eventName`: Filter by event (e.g. `"Transfer"`, `"ETHDeposited"`).
- `address`: Filter by wallet address.
- `startDate` / `endDate`: ISO timestamp range.
- `page` / `limit`: Pagination parameters.

#### 2. `GET /api/v1/admin/blockchain/treasury`
Real-time snapshot of the platform Treasury vault.

**Response Payload:**
```json
{
  "success": true,
  "data": {
    "ethBalance": { "raw": "2500000000000000000", "formatted": "2.5" },
    "tokens": {
      "0x5fbdb2315678afecb367f032d93f642f64180aa3": {
        "raw": "15000000000000000000000",
        "formatted": "15000.0"
      }
    },
    "activity": {
      "inflowsCount": 12,
      "outflowsCount": 3,
      "tokenInflow": { "formatted": "25000.0" },
      "tokenOutflow": { "formatted": "10000.0" },
      "ethInflow": { "formatted": "5.0" },
      "ethOutflow": { "formatted": "2.5" }
    }
  }
}
```

#### 3. `GET /api/v1/admin/blockchain/fraud-alerts`
Retrieve flagged anomalies detected on-chain.

**Query Parameters:**
- `severity`: Filter by severity (`"LOW"`, `"MEDIUM"`, `"HIGH"`, `"CRITICAL"`).
- `ruleId`: Filter by triggered rule.
- `address`: Filter by wallet address.

**Response Payload:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "flagId": "FLAG_LARGE_TRANSFER_0xbbb1",
        "ruleId": "ABNORMAL_LARGE_TRANSFER",
        "severity": "HIGH",
        "address": "0x1111...",
        "targetAddress": "0x2222...",
        "transactionHash": "0xbbb1",
        "description": "Transfer of 15000.0 AIX exceeds threshold of 10000.0 AIX",
        "evidence": {
          "amountFormatted": "15000.0",
          "thresholdFormatted": "10000.0"
        }
      }
    ],
    "total": 1
  }
}
```

---

## 7. Verification & Automated Test Results

- **Smart Contract Test Suite**: `245 / 245` passing tests (`npx hardhat test` inside `blockchain/`).
  - 14 Treasury tests (including new `depositToken` assertions).
  - 5 `EventMonitor` multi-contract & fault-tolerance tests.
  - 3 `TreasuryMonitor` balance & activity tests.
  - 7 `FraudEngine` rule, severity, and determinism tests.
  - 216 tests across Phases 3–10 without regressions.
- **Server Folder Integrity**: `git diff -- server/` confirms **0 files modified in `server/`**.
