# AIXchange Review III — Panel Presentation Outline (18 Slides)

**Project Title**: AIXchange: Decentralized AI Training, Dataset Marketplace, and Immutable Provenance Substrate  
**Student Team**: Prabhu Pachisia & Shreyes Jaiswal  
**Review Target**: Review III – Final Technical Evaluation (20 Marks)  
**Evaluation Rubric Alignment**:
1. Implementation (5 Marks)
2. Technical Accuracy (5 Marks)
3. Results Obtained (5 Marks)
4. Presentation & Clarity (5 Marks)

---

## Slide 1: Title Slide & Team
- **Title**: AIXchange — Decentralized Substrate for Trustless AI Training & Provenance
- **Subtitle**: Solving Data Privacy, Intermediary Rent-Seeking, and Lineage Black-Boxes in Artificial Intelligence
- **Team**: Prabhu Pachisia & Shreyes Jaiswal
- **Affiliation**: Department of Computer Science & Engineering
- **Key Badges**: 8 On-Chain EVM Smart Contracts · Zero-Leakage Isolated Containers · Full-Stack Web3 Application

---

## Slide 2: Problem Statement & Motivation
- **Central Paradox in Modern AI**: High-quality private data is siloed due to fear of theft; model buyers cannot verify training data authenticity; creators receive zero ongoing royalties.
- **Three Critical Vulnerabilities in Existing Solutions**:
  1. *Data Exfiltration*: Centralized marketplaces require plain-text data uploads.
  2. *Lineage Amnesia*: Once a model is trained, verifying whether training adhered to license permissions is impossible.
  3. *Unfair Economic Extraction*: Intermediary brokers take 30–50% cuts and offer zero cryptographic guarantees.

---

## Slide 3: AIXchange Solution Architecture
- **Unified 4-Tier Decentralized Substrate**:
  - **Tier 1: Decentralized Storage & Encryption**: AES-256-GCM Envelope Encryption + IPFS CID Content Addressing.
  - **Tier 2: EVM Smart Contract Layer**: 8 Solidity Contracts on Hardhat/EVM handling token economics, registry, purchases, royalties, and provenance.
  - **Tier 3: Isolated AI Compute Substrate**: Docker/gVisor sandboxes with air-gapped network isolation and PyTorch runtime.
  - **Tier 4: Cyber-Scientific Frontend**: React 18, Vite, Ethers.js v6, Redux Toolkit, Tailwind CSS.

---

## Slide 4: AIX Token Economics & Treasury
- **Token Contract**: `AIXToken.sol` (ERC-20, 1 Billion Fixed Supply, 18 Decimals).
- **Core Utility Functions**:
  - Medium of Exchange for dataset purchases and compute leasing.
  - Staking collateral for verifiable compute providers.
  - Native fee settlement avoiding third-party volatility.
- **Treasury Vault**: `Treasury.sol` receiving protocol fees to fund community grants and decentralized node incentives.

---

## Slide 5: Cryptographic Dataset Registration
- **Contract**: `DatasetRegistry.sol`
- **Key Innovation**: Automatic Client-Side Hashing (No manual IPFS strings!).
- **Workflow**:
  - File selected in browser $\to$ SHA-256 calculated via WebCrypto $\to$ Ingested into decentralized IPFS storage $\to$ On-chain anchor emitted with immutable owner binding.
- **Gas Benchmark**: 235,613 gas per registration.

---

## Slide 6: Dynamic Licensing & Entitlement Policy
- **Contract**: `LicenseRegistry.sol`
- **Supported License Tiers**:
  - Academic / Non-Commercial (Low cost / Research rights).
  - Commercial Derivative AI Training (Full commercial rights, royalty-bearing).
  - Exclusive Enterprise Use.
- **Immutable State Machine**: License parameters are validated on-chain prior to settlement.

---

## Slide 7: Atomic Settlement & Royalty Distribution
- **Contract**: `PurchaseEngine.sol` & `RoyaltyEngine.sol`
- **The 97.5% / 2.5% Smart Contract Policy**:
  - **Data Creator**: Receives 97.5% of purchase fee immediately upon transaction inclusion.
  - **DAO Treasury**: Receives 2.5% protocol fee.
- **Zero Custodial Escrow**: Transaction is 100% atomic in 1 EVM block (reverts if any transfer fails).
- **Gas Benchmark**: 26,506 gas (approval), 96,320 gas (atomic settlement).

---

## Slide 8: Air-Gapped AI Sandbox Training
- **FastAPI Substrate + Docker Isolation**:
  - Ephemeral container instantiation with `SECCOMP` and `APPARMOR` security profiles.
  - Dataset decrypted in RAM temporary volume (`tmpfs`); network egress blocked (air-gapped).
  - PyTorch 2.4.0 training pipeline with live streaming stdout terminal logs.
  - Memory sanitized immediately upon completion.

---

## Slide 9: Model Registration & Weight Fingerprinting
- **Contract**: `ModelRegistry.sol`
- **Cryptographic Model Verification**:
  - Serialized model weights (`weights.pth` / ONNX) hashed to SHA-256.
  - Checksum permanently anchored to EVM smart contract along with metadata URI and parent dataset lineage.
- **Gas Benchmark**: 443,507 gas (registration), 208,534 gas (versioning).

---

## Slide 10: Cryptographic Provenance DAG
- **Contract**: `ProvenanceRegistry.sol`
- **Directed Acyclic Graph (DAG) Pipeline**:
  - `Dataset #1` $\longrightarrow$ `License Policy` $\longrightarrow$ `Sandbox Run` $\longrightarrow$ `Model v1.0`.
- **Merkle Lineage Root**: Links training execution receipt with model weights and dataset hash into a single immutable root hash.
- **On-Chain Verification**: Anyone can independently audit whether a model was lawfully trained.

---

## Slide 11: Real-Time Decentralized Inference Playground
- **Features**:
  - Real-time neural forward-pass execution.
  - Sensor telemetry presets (Normal vs Anomaly vs Voltage Sag).
  - Sub-millisecond forward-pass execution (**0.078 ms mean latency** in PyTorch).
  - Cryptographic execution nonce receipts.

---

## Slide 12: Quantitative Results: Test Suite Verifications
- **Unified Test Suite Execution**:
  - **Solidity Smart Contracts**: 279 / 279 Tests Passing (100%).
  - **Python AI Substrate (Pytest)**: 22 / 22 Tests Passing (100%).
  - **AI Sandbox Client SDK (Jest)**: 10 / 10 Tests Passing (100%).
  - **Backend Server API**: 45+ Tests Passing.
  - **Total Passing Automated Tests**: **356+ verified tests**.

---

## Slide 13: Quantitative Results: Gas Benchmarks
- **Live Measured Hardhat EVM Gas Usage**:
  | Smart Contract Operation | Contract | Actual Gas Units | Est. Cost (1 Gwei) |
  | :--- | :--- | :--- | :--- |
  | AIX Token Transfer | `AIXToken.sol` | 34,510 gas | 0.000034 ETH |
  | Token Approval | `AIXToken.sol` | 26,506 gas | 0.000026 ETH |
  | Dataset Registration | `DatasetRegistry.sol` | 235,613 gas | 0.000235 ETH |
  | Model Weight Anchoring | `ModelRegistry.sol` | 443,507 gas | 0.000443 ETH |
  | Model Version Upgrade | `ModelRegistry.sol` | 208,534 gas | 0.000208 ETH |
  | Provenance Lineage Commit | `ProvenanceRegistry.sol` | 483,356 gas | 0.000483 ETH |
- **Average Gas Per Transaction**: **238,671 gas**.

---

## Slide 14: Quantitative Results: API & Network Latency
- **Measured Roundtrip Latencies**:
  - Backend Health Check: **0.87 ms**
  - Dataset Catalog Listing: **2.97 ms**
  - Model Marketplace Listing: **2.83 ms**
  - License Policy Fetch: **0.96 ms**
  - AI Python Substrate Ping: **1.43 ms**
  - Web3 Nonce Generation: **1.16 ms**
  - **Overall Average REST Latency**: **1.77 ms** (Sub-50ms SLA: 100% Passed).

---

## Slide 15: Quantitative Results: PyTorch Training Convergence
- **Actual 5-Epoch Telemetry Classifier Training**:
  - Epoch 1: Loss = 0.3441, Accuracy = 86.80%
  - Epoch 2: Loss = 0.1682, Accuracy = 93.40%
  - Epoch 3: Loss = 0.1275, Accuracy = 94.50%
  - Epoch 4: Loss = 0.1362, Accuracy = 94.30%
  - Epoch 5: Loss = 0.1576, Accuracy = 93.30%
- **Convergence Time**: 1.28 seconds.
- **Inference Latency**: Mean = **0.078 ms**, p99 = **0.425 ms**.

---

## Slide 16: Live Demonstration Walkthrough (Summary)
- Presentation of the live browser demo spanning all 23 steps:
  - Register $\to$ MetaMask Login $\to$ Claim AIX $\to$ Drag & Drop Dataset (Auto-IPFS) $\to$ Buy License $\to$ Royalty Split $\to$ Launch Sandbox $\to$ PyTorch Training $\to$ Anchor Model $\to$ Audit Provenance DAG $\to$ Run Inference $\to$ Telemetry Dashboard.

---

## Slide 17: Comparison with State-of-the-Art
| Feature | Centralized Platforms (Kaggle/HuggingFace) | Ocean Protocol | **AIXchange** |
| :--- | :--- | :--- | :--- |
| **Data Privacy** | None (Plaintext upload) | Compute-to-Data (Heavy) | **Air-gapped Ephemeral RAM Containers** |
| **Model Verification** | Unverified file upload | Partial | **Cryptographic SHA-256 On-Chain Anchor** |
| **Provenance Lineage** | None | Limited Metadata | **Full Directed Acyclic Graph + Merkle Root** |
| **Royalty Settlement** | High Intermediary Fees | Manual distribution | **Atomic 97.5% / 2.5% Smart Contract Split** |
| **Inference Latency** | Centralized API | High gas overhead | **Hybrid Sub-Millisecond Native Inference** |

---

## Slide 18: Conclusion & Future Work
- **Review III Milestone Achieved**: Complete, production-grade implementation of all 12 planned phases.
- **Future Enhancements**:
  - Zero-Knowledge Machine Learning (zk-SNARKs for training validation).
  - Cross-Chain Layer-2 deployment (Arbitrum / Optimism).
  - Federated Learning orchestration across multi-party nodes.
- **Q&A Session**: Ready for live technical inspection and code walkthrough.
