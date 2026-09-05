# Phase 13: Blockchain API Testing & Gas Benchmarks Master Report

## Executive Summary

**Phase 13** focuses on the comprehensive API testing and verification of the AIXchange decentralized substrate prior to frontend marketplace construction. This report provides authoritative evidence for the **Blockchain / Smart Contract Workstream** owned by **Shreyes Jaiswal**.

In strict accordance with `ARCHITECT_RULES.md` and `TASKS.md`:
- **Server Directory Integrity**: The `server/` directory was **NOT modified** under any circumstance (`git diff -- server/` produced zero output).
- **Backend Defects**: All observed backend discrepancies or schema nuances are documented as findings for the backend owner (Prabhu), rather than altered directly in backend code.
- **Test Integrity**: Zero tests were removed or weakened. The suite expanded from 245 to **279 passing automated tests** (100% passing rate).

---

## 1. Master Test Matrix

| Component | Positive Tests | Negative Tests | Event Verification | State Diff Check | Gas Benchmarked | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **AIX Token** | 6 | 4 | `Transfer`, `Approval`, `TokensMinted`, `TokensBurned` | $\Delta \text{bal} = \pm \text{amt}$ | 51,610 gas | **PASS** |
| **Treasury** | 5 | 5 | `ETHDeposited`, `TokenDeposited`, `TokenWithdrawn` | Vault balance diff | 57,594 gas | **PASS** |
| **Dataset Registry** | 4 | 4 | `DatasetRegistered`, `DatasetUpdated` | Index & mapping updates | 280,498 gas | **PASS** |
| **Model Registry** | 5 | 5 | `ModelRegistered`, `ModelVersionAdded` | Version array & hash anchor | 443,495 gas | **PASS** |
| **License Registry** | 4 | 4 | `LicenseCreated`, `LicenseUpdated` | License rights & terms | 386,427 gas | **PASS** |
| **Purchase Engine** | 4 | 5 | `DatasetPurchased`, `RoyaltyTriggered` | Buyer/Creator/Treasury split | 482,112 gas | **PASS** |
| **Royalty Engine** | 5 | 5 | `RoyaltyDistributed`, `RecipientPaid` | Contributor + Treasury Invariant | 641,770 gas | **PASS** |
| **Provenance Registry** | 4 | 4 | `ProvenanceRegistered`, `StatusChanged` | Directed acyclic graph edge | 483,396 gas | **PASS** |
| **Cross-Contract Monitoring** | 5 | 2 | Normalized Log Ingestion | Multi-contract deduplication | — | **PASS** |
| **Fraud Detection Engine** | 5 | 2 | 5 Explainable Rule Evaluations | State-independent detection | — | **PASS** |

---

## 2. Gas Consumption Benchmark & Transaction Evidence

Representative state-changing operations executed on the local Ethereum network (`hardhat` node, Chain ID `31337`) with verified transaction receipts:

| Operation | Contract | Transaction Hash | Block | Gas Consumed | Gas Limit Ceiling | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `transfer` | `AIXToken` | `0x9db60c7b3ab85e9e841e0f5c7372f647c97466704c4061dcbb7d096b144e76f7` | 10 | **51,610** | 70,000 | **CONFIRMED** |
| `approve` | `AIXToken` | `0x3a51df460932019fe94d85a59d72519c308d9f5a950b941d76175596c674ac9c` | 11 | **46,394** | 60,000 | **CONFIRMED** |
| `depositToken` | `Treasury` | `0x49c1924ed4cc5b35c89dde9aea4a324db62e71154a678b40a76b5dbdc51c00ac` | 13 | **57,594** | 100,000 | **CONFIRMED** |
| `withdrawToken` | `Treasury` | `0xadecf95384559084bb8480ca0016c8be851bf49c0d1ef07cdfc946a7ed53a7d9` | 14 | **43,254** | 70,000 | **CONFIRMED** |
| `registerDataset` | `DatasetRegistry` | `0x8e354a44ba5ac83ea30aa581b956e6e12a3bcf3c2d0489e4c78a8e685a0207f8` | 15 | **280,498** | 350,000 | **CONFIRMED** |
| `updateDataset` | `DatasetRegistry` | `0x50976c6680d69d4ea77795c04674e683cd0dd183d37376865d5d9fa4fb6414ca` | 16 | **47,612** | 90,000 | **CONFIRMED** |
| `createLicense` | `LicenseRegistry` | `0xeb08f2efb51085dfe1ea7b8e8b42f69be39ed53d85f10858a88f7043931ae113` | 17 | **386,427** | 450,000 | **CONFIRMED** |
| `registerModel` | `ModelRegistry` | `0x8be2c815d50ba51f124f178adb834f1613770ab8978cf342d97244cb9baf5374` | 18 | **443,495** | 500,000 | **CONFIRMED** |
| `addModelVersion` | `ModelRegistry` | `0x2fd7633e19807e233adadfb4c44305ff629282f90d97e9f78b7b66b5d469e543` | 19 | **208,402** | 250,000 | **CONFIRMED** |
| `purchaseDataset` | `PurchaseEngine` | `0x34513f9fa737e15b74867cae4c4861fd24c36d62fb412e313d7f28194705c205` | 21 | **482,112** | 600,000 | **CONFIRMED** |
| `distributeRoyalty` | `RoyaltyEngine` | `0x719d5571afa3fcbc201cd36f8d137c5b32d2d04e7c1ff3132a9e687bec7eabd3` | 23 | **641,770** | 750,000 | **CONFIRMED** |
| `registerProvenance` | `ProvenanceRegistry` | `0x1216815fd0e7912c887a39ad28a85b9b813e7efb086f1adf479d9bbf962ebde7` | 24 | **483,396** | 600,000 | **CONFIRMED** |

---

## 3. Multi-Contract Lifecycle & Integration Verification

The integration test suite ([blockchain/test/integration/BlockchainApiIntegration.test.js](file:///d:/AIXchange/blockchain/test/integration/BlockchainApiIntegration.test.js)) validates the end-to-end lifecycle corresponding to user API requests:

```text
1. User signs EIP-191 Auth Nonce
      ↓
2. Mint / Fund AIX Tokens to Buyer
      ↓
3. Creator registers Dataset in DatasetRegistry (datasetId = 1)
      ↓
4. Creator publishes Fixed Commercial License in LicenseRegistry (licenseId = 1, price = 1000 AIX)
      ↓
5. Buyer approves PurchaseEngine & calls purchaseDataset(1, 1)
      ├── Buyer Balance: -1000 AIX
      ├── Creator Balance: +975 AIX (97.5%)
      ├── Treasury Vault: +25 AIX (2.5% platform fee)
      └── Entitlement granted: hasAccess(buyer, 1, 1) == true
      ↓
6. Creator publishes Model in ModelRegistry (modelId = 1) & adds ModelVersion (v2)
      ↓
7. Provenance recorded in ProvenanceRegistry (dataset 1 + execution "exec-sandbox-001" -> model 1, v1)
      ↓
8. RoyaltyEngine executes multi-party secondary distribution (60% to Contributor 1, 37.5% to Contributor 2, 2.5% Treasury)
      └── Invariant verified: totalDistributed == revenue (remainder dust absorbed into Treasury)
      ↓
9. EventMonitor fetches, normalizes, and deduplicates all 8 contract events
      ↓
10. FraudEngine evaluates stream with zero false positives on normal transactions
```

---

## 4. Swagger / OpenAPI vs Blockchain Schema Conformance Audit

A comparative audit was conducted between the backend Swagger OpenAPI specifications (`server/src/config/swagger.js`, `server/src/routes/*.js`) and the authoritative Solidity contracts.

### Findings & Schema Alignments

1. **Transaction Hash Representation**:
   - *Swagger Spec*: Expected string format representing 32-byte hexadecimal hash.
   - *On-Chain Real-world*: Lowercase or mixed-case hex string matching `^0x[a-fA-F0-9]{64}$`.
   - *Result*: **PASS**. All receipts in `blockchain/test/integration/` match this pattern.

2. **Ethereum Address Format**:
   - *Swagger Spec*: 20-byte hexadecimal address.
   - *On-Chain Real-world*: Verified against `^0x[a-fA-F0-9]{40}$`.
   - *Result*: **PASS**.

3. **Numeric Precision (Token Units & BigInt)**:
   - *Swagger Spec*: Some query parameters in `server/src/routes/token.route.js` and `blockchain-analytics.routes.js` handle token amounts as strings or integer limits.
   - *Contract Reality*: ERC20 token units use 18 decimal places ($10^{18}$ wei units), producing 50–78 bit integers that overflow standard JavaScript 53-bit `Number.MAX_SAFE_INTEGER`.
   - *Recommendation for Prabhu*: Ensure backend controllers always stringify BigInt values before returning JSON payloads to avoid floating-point truncations.

4. **Basis Points Representation**:
   - *Contract Standard*: All rates (royalties, platform fees) are integer basis points where $10{,}000 = 100.00\%$ and $250 = 2.50\%$.
   - *Swagger Spec*: Should document `minimum: 0, maximum: 10000` for all royalty and fee inputs.

---

## 5. Backend Issues & Discrepancies Log (For Prabhu)

The following items were identified during API boundary inspection. Per Rule 1, **no files in `server/` were modified**; these are provided as actionable notes for the backend owner:

| Issue ID | Affected Endpoint / File | Description | Recommended Backend Action |
| :--- | :--- | :--- | :--- |
| **BACKEND-01** | `server/src/routes/purchase.route.js` | Joi validator schema `purchaseRequestSchema` validates request body for purchases. | Ensure parameter names in body match `datasetId` and `licenseId` as strings or numbers, converted to BigInt before calling contract interfaces. |
| **BACKEND-02** | `server/src/controllers/token.controller.js` | `getTreasuryBalance` retrieves Treasury balance. | With Phase 12's `depositToken` SafeERC20 addition, Treasury can hold arbitrary ERC20 tokens in addition to native ETH and AIX. Consider supporting an optional query parameter `?tokenAddress=` to query multi-token vault holdings. |
| **BACKEND-03** | `server/src/routes/dataset.route.js` | Struct field name in `DatasetRegistry.sol` is `active` (boolean), whereas some frontend mockups anticipated `isActive`. | Ensure serializer maps on-chain `dataset.active` to `isActive` if backward compatibility with client DTOs is desired. |
| **BACKEND-04** | `server/src/models/BlockchainEvent.js` | Compound index `{ transactionHash: 1, logIndex: 1 }` prevents duplicates. | Maintain this compound index when indexing multi-contract transactions (e.g. `PurchaseEngine` emitting both `DatasetPurchased` and `RoyaltyTriggered` in a single transaction). |

---

## 6. Server Integrity Verification

To ensure strict compliance with project constraints, the server directory was audited:

```bash
git diff -- server/
# Output: (empty - 0 lines modified)
```

No files inside `server/` were added, edited, deleted, formatted, or touched.

---

## 7. Final Status

- **Phase Status**: **`COMPLETE`**
- **Test Results**: **279 / 279 Tests Passing** (100% passing rate)
- **Benchmarking**: 12/12 representative operations benchmarked and bounded with gas regression tests.
