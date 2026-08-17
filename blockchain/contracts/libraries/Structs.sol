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

    /// @dev Structure describing an on-chain dataset registration record.
    struct Dataset {
        uint256 datasetId;
        address owner;
        string cid;
        string license;
        uint256 royalty; // In basis points: 500 = 5.00%, max 10000 = 100%
        uint256 createdAt;
        bool active;
    }
}
