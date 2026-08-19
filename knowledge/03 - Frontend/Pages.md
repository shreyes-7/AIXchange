# Pages

This document details all implemented view pages in `client/src/pages/`.

---

## 1. `DatasetMarketplace.jsx` (`/datasets` or `/`)

- **Purpose**: Main dataset catalog for discovering, searching, and filtering on-chain datasets.
- **Key Features**:
  - **Metrics Stats Bar**: Displays total datasets, registered creators, and active licenses.
  - **Search & Filter Bar**: Real-time filtering by dataset name, description, tags, and license model (`ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`).
  - **Card Grid**: Renders dataset cards with title, owner address, price in AIX tokens, format badge, and IPFS status.
  - **IPFS Preview Modal**: Opens an interactive modal fetching dataset metadata directly from the IPFS gateway.

---

## 2. `DatasetDetails.jsx` (`/datasets/:id`)

- **Purpose**: Full provenance view, verification badge, and owner-only dataset lifecycle controls.
- **Key Features**:
  - **On-Chain Verification**: Displays creation block, timestamp, creator address, IPFS CID, and default royalty BPS.
  - **IPFS Gateway Direct Link**: Clickable link to view raw dataset payload on IPFS.
  - **Owner Management Panel** (Rendered only when connected wallet matches dataset owner):
    - *Edit Metadata Modal*: Update dataset title, description, and metadata URI.
    - *Status Toggle*: One-click active/inactive delisting switch.
    - *Ownership Transfer*: Form to securely transfer dataset ownership to a new Ethereum address.

---

## 3. `RegisterDataset.jsx` (`/datasets/register`)

- **Purpose**: 3-step dataset registration wizard with live card preview and blockchain transaction tracker.
- **Wizard Steps**:
  1. *Basic Details*: Title, category, description, and search tags.
  2. *Storage & Licensing*: IPFS CID, file format, sample count, default license type, and royalty rate (BPS).
  3. *Review & Submit*: Live visual preview of the dataset card as it will appear in the marketplace.
- **Transaction Progress Modal**:
  - Visual status indicator tracking:
    `CHECKING_WALLET` $\to$ `WAITING_FOR_SIGNATURE` $\to$ `SUBMITTED` $\to$ `CONFIRMED`.
  - Displays transaction hash with block explorer link upon confirmation.

---

## 4. `WalletTest.jsx` (`/wallet-test`)

- **Purpose**: Developer diagnostics and automated test suite for Web3 wallet interactions.
- **Interactive Action Panels**:
  - *MetaMask Check*: Verify `window.ethereum` presence.
  - *Account Connection*: Request account connection and display active address.
  - *Network Detection*: Identify active chain ID and test network switching to Localhost (`31337`) or Sepolia (`11155111`).
  - *Message Signing*: Sign challenge text using EIP-191 `personal_sign`.
  - *Signature Verification*: Cryptographically verify signature against public address.
  - *Nonce Generator*: Generate and verify challenge nonces.
  - *Token Diagnostics*: Read AIX token name, symbol, total supply, and user balance.
