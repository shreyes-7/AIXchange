// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";

/**
 * @title ILicenseRegistry
 * @dev Interface for the AIXchange Licensing Registry smart contract.
 * Manages verifiable license terms, pricing models (Fixed / Royalty), rights, and validity periods for AI assets.
 */
interface ILicenseRegistry {
    /**
     * @notice Creates a new license definition for an authorized AI asset.
     * @param params License creation parameters struct.
     * @return licenseId The assigned unique identifier for the created license.
     */
    function createLicense(
        Structs.LicenseParams calldata params
    ) external returns (uint256 licenseId);

    /**
     * @notice Updates the commercial terms, metadata, and rights for an existing license.
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license to update.
     * @param fixedPrice Updated fixed price in AIX wei (if FIXED model).
     * @param royaltyRate Updated royalty rate in basis points (if ROYALTY model).
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
    ) external;

    /**
     * @notice Revokes an active license offer.
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license to revoke.
     */
    function revokeLicense(uint256 licenseId) external;

    /**
     * @notice Explicitly sets the status of a license (e.g. active / revoked / expired).
     * @dev Restricted to the original licensor.
     * @param licenseId Unique identifier of the license.
     * @param status New status enum value.
     */
    function setLicenseStatus(
        uint256 licenseId,
        Structs.LicenseStatus status
    ) external;

    /**
     * @notice Retrieves full license details by ID.
     * @param licenseId Unique identifier of the license.
     * @return licenseRecord Full license record struct.
     */
    function getLicense(
        uint256 licenseId
    ) external view returns (Structs.License memory licenseRecord);

    /**
     * @notice Retrieves all license IDs associated with a specific asset.
     * @param assetType Type of asset (DATASET or MODEL).
     * @param assetId Unique identifier of the asset.
     * @return licenseIds Array of license IDs associated with the asset.
     */
    function getLicensesByAsset(
        Structs.AssetType assetType,
        uint256 assetId
    ) external view returns (uint256[] memory licenseIds);

    /**
     * @notice Retrieves all license IDs created by a specific licensor.
     * @param licensor Address of the licensor.
     * @return licenseIds Array of license IDs created by the licensor.
     */
    function getLicensesByLicensor(
        address licensor
    ) external view returns (uint256[] memory licenseIds);

    /**
     * @notice Returns the total count of registered licenses.
     * @return total Total number of licenses created on-chain.
     */
    function getTotalLicenses() external view returns (uint256 total);

    /**
     * @notice Checks if a license is currently active and within its validity window.
     * @param licenseId Unique identifier of the license.
     * @return active Boolean indicating if the license is valid and active.
     */
    function isLicenseActive(uint256 licenseId) external view returns (bool active);

    /**
     * @notice Helper query for purchase (Phase 6) and royalty (Phase 10) engines to read pricing terms.
     * @param licenseId Unique identifier of the license.
     * @return model Pricing model (FIXED or ROYALTY).
     * @return fixedPrice Fixed price in AIX units (if FIXED).
     * @return royaltyRate Royalty rate in basis points (if ROYALTY).
     */
    function getLicensePricing(
        uint256 licenseId
    ) external view returns (Structs.PricingModel model, uint256 fixedPrice, uint256 royaltyRate);

    /**
     * @notice Retrieves the explicit rights and restrictions defined by a license.
     * @param licenseId Unique identifier of the license.
     * @return rights Explicit permissions struct.
     * @return restrictions Restrictions description string.
     */
    function getLicenseRights(
        uint256 licenseId
    ) external view returns (Structs.LicenseRights memory rights, string memory restrictions);

    /**
     * @notice Retrieves the license type (ACADEMIC, COMMERCIAL, EXCLUSIVE, CUSTOM).
     * @param licenseId Unique identifier of the license.
     * @return licenseType License type enum.
     */
    function getLicenseType(
        uint256 licenseId
    ) external view returns (Structs.LicenseType licenseType);
}
