# Token Implementation

## Overview

The AIXchange platform utilizes **AIX Token (`AIXToken.sol`)** as its canonical ERC-20 utility currency for dataset purchases, licensing fees, creator royalty payouts, and protocol governance.

---

## Token Specifications

- **Contract Path**: `blockchain/contracts/tokens/AIXToken.sol`
- **Interface**: `blockchain/contracts/interfaces/IAIXToken.sol`
- **Standard**: ERC-20 (`@openzeppelin/contracts/token/ERC20/ERC20.sol`)
- **Extensions**:
  - `ERC20Burnable`: Allows token holders to permanently destroy tokens.
  - `Ownable`: Protects administrative minting functions.
- **Token Name**: `AIXchange Token`
- **Symbol**: `AIX`
- **Decimals**: `18`
- **Initial Total Supply**: `1,000,000,000` AIX ($10^9 \times 10^{18}$ wei units) minted to the contract deployer upon initialization.

---

## Implementation Code (`AIXToken.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAIXToken.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";

contract AIXToken is ERC20, ERC20Burnable, Ownable, IAIXToken {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    constructor() ERC20("AIXchange Token", "AIX") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert Errors.InvalidAddress();
        if (amount == 0) revert Errors.ZeroAmount();
        _mint(to, amount);
        emit Events.TokensMinted(to, amount);
    }
}
```

---

## Verification & Unit Testing

- Tested in `blockchain/test/tokens/AIXToken.test.js` (15 passing tests):
  - Correct deployment parameters (name, symbol, decimals, initial supply).
  - Standard transfers and balance assertions.
  - Allowance approval and `transferFrom`.
  - Owner-restricted minting with zero address/amount checks.
  - User self-burning and approved spender `burnFrom`.
