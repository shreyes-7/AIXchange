# Token Economy

## Overview

The **Token Economy** establishes the native financial infrastructure of AIXchange, powered by the ERC-20 utility token [[Blockchain Architecture|AIXToken.sol]] and protocol vault [[Blockchain Architecture|Treasury.sol]].

---

## 1. AIX Token (`AIXToken.sol`)

- **Token Name**: AIXchange Token
- **Symbol**: `AIX`
- **Decimals**: `18`
- **Initial Supply**: `1,000,000,000` (1 Billion AIX = $10^9 \times 10^{18}$ wei) minted to the contract deployer on deployment.
- **ERC-20 Capabilities**:
  - `transfer(recipient, amount)`: Standard token transfers.
  - `approve(spender, amount)` / `transferFrom(sender, recipient, amount)`: Allowance-based transfers used by `PurchaseEngine`.
  - `burn(amount)` / `burnFrom(account, amount)`: Deflationary token burning.
  - `mint(to, amount)`: Owner-restricted token minting for staking or ecosystem incentives.

---

## 2. Platform Treasury (`Treasury.sol`)

- **Vault Role**: Holds accumulated protocol fees in native ETH and ERC-20 tokens (AIX).
- **Inflows**:
  - Marketplace settlement platform fees (default 2.50% / 250 BPS) routed from `PurchaseEngine`.
  - Direct ETH deposits via `receive() external payable` and `depositETH()`.
  - Direct ERC-20 token transfers and `depositERC20()`.
- **Outflows & Governance**:
  - `withdrawETH(recipient, amount)`: Withdraws accumulated ETH to authorized platform governance addresses.
  - `withdrawERC20(token, recipient, amount)`: Withdraws collected AIX tokens to community reserves, staking pools, or team vaults.
  - Restricted to contract `onlyOwner`.

---

## 3. Frontend & Backend Integration

- **Client Token Service (`client/src/services/blockchain/token/token.service.js`)**:
  - `getBalance(address)`: Fetches current AIX balance in human-readable units.
  - `getAllowance(owner, spender)`: Checks approved allowance for the PurchaseEngine.
  - `approve(spender, amount)`: Sets token allowance before executing purchases.
- **Backend Token Endpoints (`server/src/routes/token.route.js`)**:
  - `GET /api/v1/token/stats`: Supply and distribution statistics.
  - `GET /api/v1/token/balance/:address`: Cached AIX token balance.
  - `POST /api/v1/token/faucet`: Test token distributor for development environments.
