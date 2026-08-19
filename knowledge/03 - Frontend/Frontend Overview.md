# Frontend Overview

## Overview

The AIXchange frontend is a Single Page Application (SPA) developed using **React 19**, **Vite 8**, and **Tailwind CSS 4**. It provides a web interface for Web3 wallet authentication, browsing decentralized dataset listings, inspecting cryptographic provenance, registering new datasets with MetaMask, and executing diagnostic wallet tests.

---

## Technical Specifications

- **Framework**: React `^19.0.0`
- **Build Tool / Bundler**: Vite `^8.1.4`
- **CSS Framework**: Tailwind CSS `^4.0.6`
- **Routing**: React Router DOM `^7.1.5`
- **Web3 Library**: Ethers.js `^6.13.5`
- **Icons**: Lucide React `^0.475.0`
- **HTTP Client**: Axios `^1.7.9`
- **Target Browser Standard**: Modern ES modules (`esnext`) with MetaMask browser extension injection (`window.ethereum`).

---

## Directory Organization (`client/src/`)

```text
client/src/
├── App.jsx                     # Route configuration and root page container
├── main.jsx                    # React 19 createRoot entrypoint
├── index.css                   # Global styles & Tailwind imports
├── components/
│   └── Navbar.jsx              # Navigation header with wallet trigger and status
├── pages/
│   ├── DatasetMarketplace.jsx  # Dataset marketplace catalog
│   ├── DatasetDetails.jsx      # Dataset provenance & creator controls
│   ├── RegisterDataset.jsx     # Multi-step dataset publishing form
│   └── WalletTest.jsx          # Developer wallet diagnostic dashboard
├── services/
│   ├── api/
│   │   ├── datasetApi.service.js # Backend REST client
│   │   └── index.js
│   └── blockchain/
│       ├── dataset/            # DatasetRegistry contract client & ABI
│       ├── token/              # AIXToken contract client & ABI
│       └── wallet/             # MetaMask provider, signer, network switcher
└── types/
    └── dataset.types.js        # JSDoc type definitions
```
