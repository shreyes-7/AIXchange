// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Events
 * @dev Shared event declarations for AIXchange smart contracts.
 */
library Events {
    /// @dev Emitted when tokens are minted to an address.
    event TokensMinted(address indexed to, uint256 amount);

    /// @dev Emitted when tokens are burned from an address.
    event TokensBurned(address indexed from, uint256 amount);

    /// @dev Emitted when ERC20 tokens are deposited into the Treasury.
    event TokenDeposited(address indexed token, address indexed sender, uint256 amount);

    /// @dev Emitted when ERC20 tokens are withdrawn from the Treasury.
    event TokenWithdrawn(address indexed token, address indexed recipient, uint256 amount);

    /// @dev Emitted when ETH is deposited into the Treasury.
    event ETHDeposited(address indexed sender, uint256 amount);

    /// @dev Emitted when ETH is withdrawn from the Treasury.
    event ETHWithdrawn(address indexed recipient, uint256 amount);
}
