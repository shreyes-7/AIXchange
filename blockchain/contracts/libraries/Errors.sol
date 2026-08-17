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

    // ==========================================
    // Phase 5 Licensing Errors
    // ==========================================

    /// @dev Thrown when an invalid or zero asset ID is supplied.
    error InvalidAsset(uint256 assetId);

    /// @dev Thrown when a caller is not authorized to create/modify licenses for an asset.
    error UnauthorizedLicensor(address caller, uint256 assetId);

    /// @dev Thrown when a queried license ID does not exist.
    error LicenseNotFound(uint256 licenseId);

    /// @dev Thrown when an operation requires an active license but the license is inactive or expired.
    error LicenseInactive(uint256 licenseId);

    /// @dev Thrown when an invalid fixed price is provided for a FIXED pricing model.
    error InvalidFixedPrice();

    /// @dev Thrown when an invalid royalty rate is provided (e.g. > 10000 basis points or 0 when ROYALTY model).
    error InvalidRoyaltyRate(uint256 rate);

    /// @dev Thrown when the validity end timestamp precedes the start timestamp.
    error InvalidValidityPeriod(uint256 validFrom, uint256 validUntil);

    /// @dev Thrown when attempting to revoke an already revoked license.
    error LicenseAlreadyRevoked(uint256 licenseId);

    /// @dev Thrown when an empty or invalid metadata URI/CID is passed for a license.
    error InvalidMetadataURI();

    /// @dev Thrown when an unsupported asset type is queried or registered.
    error AssetTypeNotSupported(uint8 assetType);
}
