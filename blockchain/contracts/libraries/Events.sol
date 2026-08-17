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

    /// @dev Emitted when a new dataset is registered on-chain.
    event DatasetRegistered(
        uint256 indexed datasetId,
        address indexed owner,
        string cid,
        string license,
        uint256 royalty,
        uint256 createdAt
    );

    /// @dev Emitted when an existing dataset's metadata/CID/license/royalty is updated.
    event DatasetUpdated(
        uint256 indexed datasetId,
        string newCid,
        string newLicense,
        uint256 newRoyalty
    );

    /// @dev Emitted when a dataset's active status is toggled.
    event DatasetStatusChanged(uint256 indexed datasetId, bool active);

    /// @dev Emitted when dataset ownership is transferred.
    event DatasetOwnershipTransferred(
        uint256 indexed datasetId,
        address indexed previousOwner,
        address indexed newOwner
    );

    // ==========================================
    // Phase 5 Licensing Events
    // ==========================================

    /// @dev Emitted when a new license is created.
    event LicenseCreated(
        uint256 indexed licenseId,
        uint256 indexed assetId,
        uint8 assetType,
        address indexed licensor,
        uint8 licenseType,
        uint8 pricingModel,
        uint256 fixedPrice,
        uint256 royaltyRate,
        uint256 createdAt
    );

    /// @dev Emitted when an existing license's terms are updated.
    event LicenseUpdated(
        uint256 indexed licenseId,
        uint256 fixedPrice,
        uint256 royaltyRate,
        string metadataURI,
        uint256 version,
        uint256 updatedAt
    );

    /// @dev Emitted when a license is revoked by the licensor.
    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed licensor,
        uint256 updatedAt
    );

    /// @dev Emitted when a license status is explicitly changed.
    event LicenseStatusChanged(
        uint256 indexed licenseId,
        uint8 previousStatus,
        uint8 newStatus
    );
}
