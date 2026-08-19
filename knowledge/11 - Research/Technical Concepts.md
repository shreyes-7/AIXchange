# Technical Concepts

This document explains key cryptographic, blockchain, and storage concepts utilized in AIXchange.

---

## 1. Basis Points (BPS)
- A unit equal to $\frac{1}{100}\text{ of }1\%$ ($0.01\%$).
- $10,000 \text{ BPS} = 100.00\%$.
- $250 \text{ BPS} = 2.50\%$ (Platform fee).
- $1,000 \text{ BPS} = 10.00\%$.
- Used for gas-efficient fixed-point percentage math in Solidity without floating-point arithmetic.

---

## 2. IPFS Content Identifiers (CID)
- Cryptographic hash representing the contents of a file or directory on the InterPlanetary File System.
- Ensures immutability: if the dataset payload changes by a single bit, the CID changes entirely.

---

## 3. EIP-191 & EIP-1193 Standards
- **EIP-1193**: JavaScript Ethereum Provider API standard (`window.ethereum`) for browser wallet integration.
- **EIP-191**: Signed Data Standard for personal message signing (`personal_sign`), used in challenge-response wallet authentication without gas costs.

---

## 4. ReentrancyGuard & Checks-Effects-Interactions
- OpenZeppelin security pattern preventing malicious smart contracts from recursively re-entering a function before internal state changes are recorded.
