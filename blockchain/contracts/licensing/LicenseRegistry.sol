// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/ILicenseRegistry.sol";
import "../interfaces/IDatasetRegistry.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title LicenseRegistry
 * @dev Implementation of the AIXchange on-chain Licensing Registry smart contract.
 * Enables asset creators to define, update, and manage licensing rules, commercial pricing models,
 * explicit rights, restrictions, and validity periods for AI assets.
 * Integrates directly with Phase 4's DatasetRegistry for verified asset ownership.
 */
contract LicenseRegistry is ILicenseRegistry {
    /// @notice Maximum allowed royalty rate in basis points (10000 = 100.00%).
    uint256 public constant MAX_ROYALTY_BPS = 10000;

    /// @notice Reference to the Phase 4 DatasetRegistry contract.
    IDatasetRegistry public immutable datasetRegistry;

    /// @dev Internal auto-incrementing license ID counter.
    uint256 private _nextLicenseId;

    /// @dev Mapping from license ID to full License record.
    mapping(uint256 => Structs.License) private _licenses;

    /// @dev Mapping from assetType => assetId => array of associated license IDs.
    mapping(Structs.AssetType => mapping(uint256 => uint256[])) private _assetLicenses;

    /// @dev Mapping from licensor address => array of created license IDs.
    mapping(address => uint256[]) private _licensorLicenses;

    /**
     * @notice Initializes the LicenseRegistry contract.
     * @param datasetRegistryAddress Address of the deployed DatasetRegistry contract.
     */
    constructor(address datasetRegistryAddress) {
        if (datasetRegistryAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        datasetRegistry = IDatasetRegistry(datasetRegistryAddress);
        _nextLicenseId = 1;
    }

    /**
     * @notice Creates a new license definition for an authorized AI asset.
     * @param params Struct containing all license parameters.
     * @return licenseId The unique assigned license identifier.
     */
    function createLicense(
        Structs.LicenseParams calldata params
    ) external override returns (uint256 licenseId) {
        if (params.assetId == 0) {
            revert Errors.InvalidAsset(params.assetId);
        }
        if (bytes(params.metadataURI).length == 0) {
            revert Errors.InvalidMetadataURI();
        }

        // Validate validity timestamps
        if (params.validUntil > 0) {
            if (params.validFrom > 0 && params.validUntil < params.validFrom) {
                revert Errors.InvalidValidityPeriod(params.validFrom, params.validUntil);
            }
            if (params.validUntil <= block.timestamp) {
                revert Errors.InvalidValidityPeriod(params.validFrom, params.validUntil);
            }
        }

        // Verify asset ownership
        if (params.assetType == Structs.AssetType.DATASET) {
            address assetOwner = datasetRegistry.getDatasetOwner(params.assetId);
            if (msg.sender != assetOwner) {
                revert Errors.UnauthorizedLicensor(msg.sender, params.assetId);
            }
        } else {
            // Extensible for ModelRegistry in Phase 8
            revert Errors.AssetTypeNotSupported(uint8(params.assetType));
        }

        // Validate pricing model consistency
        if (params.pricingModel == Structs.PricingModel.FIXED) {
            if (params.royaltyRate != 0) {
                revert Errors.InvalidRoyaltyRate(params.royaltyRate);
            }
        } else if (params.pricingModel == Structs.PricingModel.ROYALTY) {
            if (params.fixedPrice != 0) {
                revert Errors.InvalidFixedPrice();
            }
            if (params.royaltyRate == 0 || params.royaltyRate > MAX_ROYALTY_BPS) {
                revert Errors.InvalidRoyaltyRate(params.royaltyRate);
            }
        }

        licenseId = _nextLicenseId;
        _nextLicenseId++;

        uint256 startTimestamp = params.validFrom == 0 ? block.timestamp : params.validFrom;

        _licenses[licenseId] = Structs.License({
            licenseId: licenseId,
            assetId: params.assetId,
            assetType: params.assetType,
            licensor: msg.sender,
            licenseType: params.licenseType,
            pricingModel: params.pricingModel,
            fixedPrice: params.fixedPrice,
            royaltyRate: params.royaltyRate,
            metadataURI: params.metadataURI,
            rights: params.rights,
            restrictions: params.restrictions,
            validFrom: startTimestamp,
            validUntil: params.validUntil,
            status: Structs.LicenseStatus.ACTIVE,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            version: 1
        });

        _assetLicenses[params.assetType][params.assetId].push(licenseId);
        _licensorLicenses[msg.sender].push(licenseId);

        emit Events.LicenseCreated(
            licenseId,
            params.assetId,
            uint8(params.assetType),
            msg.sender,
            uint8(params.licenseType),
            uint8(params.pricingModel),
            params.fixedPrice,
            params.royaltyRate,
            block.timestamp
        );
    }

    /**
     * @notice Updates terms and metadata for an existing active license.
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license to update.
     * @param fixedPrice Updated fixed price in AIX wei.
     * @param royaltyRate Updated royalty rate in basis points.
     * @param metadataURI Updated metadata IPFS CID / URI.
     * @param rights Updated rights permissions struct.
     * @param restrictions Updated restrictions string.
     */
    function updateLicense(
        uint256 licenseId,
        uint256 fixedPrice,
        uint256 royaltyRate,
        string calldata metadataURI,
        Structs.LicenseRights calldata rights,
        string calldata restrictions
    ) external override {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }

        Structs.License storage lic = _licenses[licenseId];

        if (msg.sender != lic.licensor) {
            revert Errors.UnauthorizedLicensor(msg.sender, lic.assetId);
        }
        if (lic.status == Structs.LicenseStatus.REVOKED) {
            revert Errors.LicenseAlreadyRevoked(licenseId);
        }
        if (bytes(metadataURI).length == 0) {
            revert Errors.InvalidMetadataURI();
        }

        // Validate pricing matching existing model
        if (lic.pricingModel == Structs.PricingModel.FIXED) {
            if (royaltyRate != 0) {
                revert Errors.InvalidRoyaltyRate(royaltyRate);
            }
            lic.fixedPrice = fixedPrice;
        } else if (lic.pricingModel == Structs.PricingModel.ROYALTY) {
            if (fixedPrice != 0) {
                revert Errors.InvalidFixedPrice();
            }
            if (royaltyRate == 0 || royaltyRate > MAX_ROYALTY_BPS) {
                revert Errors.InvalidRoyaltyRate(royaltyRate);
            }
            lic.royaltyRate = royaltyRate;
        }

        lic.metadataURI = metadataURI;
        lic.rights = rights;
        lic.restrictions = restrictions;
        lic.version++;
        lic.updatedAt = block.timestamp;

        emit Events.LicenseUpdated(
            licenseId,
            lic.fixedPrice,
            lic.royaltyRate,
            metadataURI,
            lic.version,
            block.timestamp
        );
    }

    /**
     * @notice Revokes an active license offer.
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license to revoke.
     */
    function revokeLicense(uint256 licenseId) external override {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }

        Structs.License storage lic = _licenses[licenseId];

        if (msg.sender != lic.licensor) {
            revert Errors.UnauthorizedLicensor(msg.sender, lic.assetId);
        }
        if (lic.status == Structs.LicenseStatus.REVOKED) {
            revert Errors.LicenseAlreadyRevoked(licenseId);
        }

        lic.status = Structs.LicenseStatus.REVOKED;
        lic.updatedAt = block.timestamp;

        emit Events.LicenseRevoked(licenseId, msg.sender, block.timestamp);
    }

    /**
     * @notice Explicitly sets the status of a license.
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license.
     * @param status New status value.
     */
    function setLicenseStatus(
        uint256 licenseId,
        Structs.LicenseStatus status
    ) external override {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }

        Structs.License storage lic = _licenses[licenseId];

        if (msg.sender != lic.licensor) {
            revert Errors.UnauthorizedLicensor(msg.sender, lic.assetId);
        }

        Structs.LicenseStatus prevStatus = lic.status;
        lic.status = status;
        lic.updatedAt = block.timestamp;

        emit Events.LicenseStatusChanged(licenseId, uint8(prevStatus), uint8(status));
    }

    /**
     * @notice Retrieves full license details by ID.
     * @param licenseId Unique identifier of the license.
     * @return licenseRecord Full license record struct.
     */
    function getLicense(
        uint256 licenseId
    ) external view override returns (Structs.License memory licenseRecord) {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }
        return _licenses[licenseId];
    }

    /**
     * @notice Retrieves all license IDs associated with a specific asset.
     * @param assetType Type of asset (DATASET or MODEL).
     * @param assetId Unique identifier of the asset.
     * @return licenseIds Array of license IDs associated with the asset.
     */
    function getLicensesByAsset(
        Structs.AssetType assetType,
        uint256 assetId
    ) external view override returns (uint256[] memory licenseIds) {
        return _assetLicenses[assetType][assetId];
    }

    /**
     * @notice Retrieves all license IDs created by a specific licensor.
     * @param licensor Address of the licensor.
     * @return licenseIds Array of license IDs created by the licensor.
     */
    function getLicensesByLicensor(
        address licensor
    ) external view override returns (uint256[] memory licenseIds) {
        if (licensor == address(0)) {
            revert Errors.ZeroAddress();
        }
        return _licensorLicenses[licensor];
    }

    /**
     * @notice Returns the total count of registered licenses.
     * @return total Total number of licenses created on-chain.
     */
    function getTotalLicenses() external view override returns (uint256 total) {
        return _nextLicenseId - 1;
    }

    /**
     * @notice Checks if a license is currently active and within its validity window.
     * @param licenseId Unique identifier of the license.
     * @return active Boolean indicating if the license is valid and active.
     */
    function isLicenseActive(
        uint256 licenseId
    ) external view override returns (bool active) {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            return false;
        }

        Structs.License memory lic = _licenses[licenseId];

        if (lic.status != Structs.LicenseStatus.ACTIVE) {
            return false;
        }
        if (block.timestamp < lic.validFrom) {
            return false;
        }
        if (lic.validUntil > 0 && block.timestamp > lic.validUntil) {
            return false;
        }

        return true;
    }

    /**
     * @notice Helper query for purchase (Phase 6) and royalty (Phase 10) engines to read pricing terms.
     * @param licenseId Unique identifier of the license.
     * @return model Pricing model (FIXED or ROYALTY).
     * @return fixedPrice Fixed price in AIX units (if FIXED).
     * @return royaltyRate Royalty rate in basis points (if ROYALTY).
     */
    function getLicensePricing(
        uint256 licenseId
    )
        external
        view
        override
        returns (
            Structs.PricingModel model,
            uint256 fixedPrice,
            uint256 royaltyRate
        )
    {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }
        Structs.License memory lic = _licenses[licenseId];
        return (lic.pricingModel, lic.fixedPrice, lic.royaltyRate);
    }

    /**
     * @notice Retrieves the explicit rights and restrictions defined by a license.
     * @param licenseId Unique identifier of the license.
     * @return rights Explicit permissions struct.
     * @return restrictions Restrictions description string.
     */
    function getLicenseRights(
        uint256 licenseId
    )
        external
        view
        override
        returns (
            Structs.LicenseRights memory rights,
            string memory restrictions
        )
    {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }
        Structs.License memory lic = _licenses[licenseId];
        return (lic.rights, lic.restrictions);
    }

    /**
     * @notice Retrieves the license type (ACADEMIC, COMMERCIAL, EXCLUSIVE, CUSTOM).
     * @param licenseId Unique identifier of the license.
     * @return licenseType License type enum.
     */
    function getLicenseType(
        uint256 licenseId
    ) external view override returns (Structs.LicenseType licenseType) {
        if (licenseId == 0 || licenseId >= _nextLicenseId) {
            revert Errors.LicenseNotFound(licenseId);
        }
        return _licenses[licenseId].licenseType;
    }
}
