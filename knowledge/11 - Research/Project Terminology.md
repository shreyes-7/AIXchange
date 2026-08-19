# Project Terminology

| Term | Definition in AIXchange |
| :--- | :--- |
| **AIX** | The native ERC-20 utility token ("AIXchange Token") used for payments and settlement. |
| **Asset** | A digital artifact (either a `DATASET` or `MODEL`) registered on-chain. |
| **CID** | Content Identifier; cryptographic IPFS hash referencing raw dataset payloads. |
| **DatasetRegistry** | Solidity smart contract storing dataset ownership, metadata URIs, and CIDs. |
| **LicenseRegistry** | Solidity smart contract defining licensing types, permissions, validity, and prices. |
| **PurchaseEngine** | Solidity smart contract executing atomic payments, fee splits, and access checks. |
| **Treasury** | Protocol vault contract collecting platform fees in ETH and AIX tokens. |
| **Licensor** | The verified owner/creator of a dataset who issues licenses. |
| **Buyer** | An entity that purchases license entitlements for a dataset using AIX tokens. |
| **Entitlement** | An on-chain record granting a buyer permission to access, view, or download an asset (`hasAccess`). |
| **BPS** | Basis Points ($1\text{ BPS} = 0.01\%$, $10000\text{ BPS} = 100\%$). |
