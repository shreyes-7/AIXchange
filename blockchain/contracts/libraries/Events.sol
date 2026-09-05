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

    // ==========================================
    // Phase 6 Purchase Engine Events
    // ==========================================

    /// @dev Emitted when an asset license purchase is successfully executed on-chain.
    event DatasetPurchased(
        uint256 indexed purchaseId,
        uint256 indexed datasetId,
        uint256 licenseId,
        address indexed buyer,
        address licensor,
        uint256 price,
        uint256 feeAmount,
        uint256 licensorAmount,
        uint256 timestamp
    );

    /// @dev Emitted when purchase settlement triggers royalty and platform fee splits.
    event RoyaltyTriggered(
        uint256 indexed purchaseId,
        uint256 indexed assetId,
        uint256 licenseId,
        address indexed licensor,
        uint256 licensorAmount,
        uint256 feeAmount,
        uint256 timestamp
    );

    /// @dev Emitted when the platform fee basis points are modified by admin.
    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    // ==========================================
    // Phase 8 Model Registry Events
    // ==========================================

    /// @dev Emitted when a new AI model is registered on-chain.
    event ModelRegistered(
        uint256 indexed modelId,
        address indexed owner,
        string name,
        string metadataURI,
        string modelHash,
        uint256 initialVersion,
        uint256 createdAt
    );

    /// @dev Emitted when a new version is added to an existing model.
    event ModelVersionAdded(
        uint256 indexed modelId,
        uint256 indexed versionNumber,
        string modelHash,
        string metadataURI,
        uint256 createdAt
    );

    /// @dev Emitted when a model's active status is changed.
    event ModelStatusChanged(uint256 indexed modelId, bool active);

    /// @dev Emitted when model ownership is transferred.
    event ModelOwnershipTransferred(
        uint256 indexed modelId,
        address indexed previousOwner,
        address indexed newOwner
    );

    // ==========================================
    // Phase 9 Provenance Engine Events
    // ==========================================

    /// @dev Emitted when a new provenance record is registered linking Dataset, Execution, and Model Version.
    event ProvenanceRegistered(
        uint256 indexed provenanceId,
        uint256 indexed datasetId,
        uint256 indexed modelId,
        uint256 modelVersion,
        string executionId,
        bytes32 metadataHash,
        address registrant,
        uint256 createdAt
    );

    /// @dev Emitted when the status of a provenance record is updated (e.g. active / revoked).
    event ProvenanceStatusChanged(
        uint256 indexed provenanceId,
        bool active,
        uint256 timestamp
    );
}

