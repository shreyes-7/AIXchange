# State Management

## Overview

State management in the AIXchange frontend is handled via React's built-in hooks (`useState`, `useEffect`, `useCallback`) alongside direct browser provider caching via **Ethers.js v6**.

---

## State Layers

### 1. Web3 Wallet State (`metamask.service.js` & Local Page State)
- **Active Account**: Current Ethereum address retrieved via `eth_requestAccounts` or `eth_accounts`.
- **Chain ID & Network**: Detected chain ID compared against supported chains (Hardhat Local `31337`, Sepolia `11155111`).
- **Connection Status**: Enum representing `DISCONNECTED`, `CONNECTING`, `CONNECTED`, `WRONG_NETWORK`.
- **Event Listeners**:
  - `window.ethereum.on('accountsChanged', handler)`: Automatically updates the UI when the user switches accounts in MetaMask.
  - `window.ethereum.on('chainChanged', handler)`: Re-validates network compatibility when the user changes chains.

### 2. Form & Transaction Lifecycle State (`RegisterDataset.jsx`)
- **Multi-Step Form State**: Encapsulates `title`, `description`, `category`, `tags`, `ipfsCid`, `format`, `sizeBytes`, `defaultLicense`, `royaltyBps`.
- **Transaction Flow State**:
  - `IDLE`: Form is being filled.
  - `CHECKING_WALLET`: Verifying MetaMask connection and network.
  - `WAITING_FOR_SIGNATURE`: Transaction dispatched to MetaMask, awaiting user confirmation.
  - `SUBMITTED`: Transaction broadcasted to the network, awaiting block mining.
  - `CONFIRMED`: Transaction receipt confirmed, dataset ID assigned.
  - `ERROR`: Transaction reverted or rejected by user.

### 3. Catalog & Query State (`DatasetMarketplace.jsx`)
- **Search Query**: Text string filtering titles, descriptions, and tags.
- **Category Filter**: Selected category filter (`all`, `computer-vision`, `nlp`, `audio`, `tabular`, `multimodal`).
- **License Filter**: Selected license type filter (`all`, `ACADEMIC`, `COMMERCIAL`, `EXCLUSIVE`, `CUSTOM`).
- **Active Modal**: ID of dataset currently opened in the IPFS Preview modal.
