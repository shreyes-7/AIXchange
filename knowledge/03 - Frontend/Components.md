# Components

This document catalogs the shared and reusable UI components in the AIXchange client.

---

## 1. `Navbar.jsx` (`client/src/components/Navbar.jsx`)

- **Purpose**: Global sticky navigation bar rendered across all application routes.
- **Visual Elements**:
  - **Brand Logo & Title**: AIXchange logo linking to root `/`.
  - **Navigation Links**:
    - `Marketplace` $\to$ `/datasets`
    - `Register Dataset` $\to$ `/datasets/register`
    - `Wallet Test` $\to$ `/wallet-test`
  - **Wallet Connection Button / Status**:
    - *Disconnected*: Displays "Connect Wallet" with a Lucide wallet icon.
    - *Connecting*: Animated loading spinner with "Connecting...".
    - *Connected*: Truncated wallet address (e.g. `0x71C...98F`) with a green active status dot and network indicator badge.
    - *Network Error*: Amber warning if connected to an unsupported chain with a one-click "Switch Network" prompt.

---

## 2. Page-Specific Subcomponents

- **Dataset Marketplace (`DatasetMarketplace.jsx`)**:
  - `DatasetCard`: Reusable card component displaying category badge, price in AIX, format, and author.
  - `StatsBanner`: Metric counters showing total listings and volume.
  - `IpfsPreviewModal`: Modal dialog displaying raw JSON metadata and IPFS gateway links.
- **Register Dataset (`RegisterDataset.jsx`)**:
  - `StepIndicator`: Progress stepper highlighting current step (1, 2, or 3).
  - `LivePreviewCard`: Real-time rendering of the card preview as form fields change.
  - `TransactionModal`: Multi-stage modal displaying current blockchain submission state (`CHECKING_WALLET`, `WAITING_FOR_SIGNATURE`, `SUBMITTED`, `CONFIRMED`).
- **Dataset Details (`DatasetDetails.jsx`)**:
  - `ProvenanceCard`: Cryptographic verification card detailing block numbers, timestamps, and creator addresses.
  - `EditMetadataModal`: Modal for updating dataset details.
  - `TransferOwnershipModal`: Confirmation modal for transferring contract ownership.
