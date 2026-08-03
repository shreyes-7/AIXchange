// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Structs
 * @dev Data structure definitions for AIXchange smart contracts.
 */
library Structs {
    /// @dev Structure describing token metadata information.
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address owner;
    }

    /// @dev Structure describing a Treasury transaction record.
    struct TreasuryTransaction {
        address token;
        address target;
        uint256 amount;
        uint256 timestamp;
        bool isWithdrawal;
    }
}
