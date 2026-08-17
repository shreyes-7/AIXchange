// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Errors
 * @dev Custom error definitions for AIXchange smart contracts.
 */
library Errors {
    /// @dev Thrown when a zero address is passed where a non-zero address is required.
    error ZeroAddress();

    /// @dev Thrown when an amount of zero is passed to a function requiring a positive value.
    error ZeroAmount();

    /// @dev Thrown when an account does not have sufficient balance for an operation.
    error InsufficientBalance(uint256 available, uint256 required);

    /// @dev Thrown when an unauthorized caller attempts an admin or restricted operation.
    error UnauthorizedAccount(address account);

    /// @dev Thrown when a transfer operation fails.
    error TransferFailed();

    /// @dev Thrown when a queried dataset ID does not exist in the registry.
    error DatasetNotFound(uint256 datasetId);

    /// @dev Thrown when an empty or invalid IPFS CID/hash is provided.
    error InvalidCID();

    /// @dev Thrown when an empty license identifier is provided.
    error InvalidLicense();

    /// @dev Thrown when an invalid royalty value is provided (e.g. > 10000 basis points).
    error InvalidRoyalty(uint256 royalty);

    /// @dev Thrown when an operation is attempted on an inactive dataset.
    error DatasetInactive(uint256 datasetId);

    /// @dev Thrown when a caller is not authorized for a dataset modification.
    error UnauthorizedCaller(address caller);
}
