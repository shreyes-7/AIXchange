// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";

/**
 * @title IPurchaseEngine
 * @dev Interface for the AIXchange Purchase Engine smart contract.
 * Coordinates on-chain license purchases, AIX token settlement, platform fee splitting,
 * royalty triggers, and entitlement tracking.
 */
interface IPurchaseEngine {
    /**
     * @notice Executes the purchase of an AI dataset license using AIX tokens.
     * @param datasetId Unique identifier of the target dataset.
     * @param licenseId Unique identifier of the license to purchase.
     * @return purchaseId Unique assigned identifier for this purchase transaction.
     */
    function purchaseDataset(
        uint256 datasetId,
        uint256 licenseId
    ) external returns (uint256 purchaseId);

    /**
     * @notice Retrieves the full record of a completed purchase.
     * @param purchaseId Unique identifier of the purchase record.
     * @return record Struct containing the purchase metadata.
     */
    function getPurchase(
        uint256 purchaseId
    ) external view returns (Structs.PurchaseRecord memory record);

    /**
     * @notice Retrieves all purchase IDs associated with a specific buyer.
     * @param buyer Address of the buyer.
     * @return purchaseIds Array of purchase record IDs.
     */
    function getPurchasesByBuyer(
        address buyer
    ) external view returns (uint256[] memory purchaseIds);

    /**
     * @notice Retrieves all purchase IDs associated with a specific dataset.
     * @param datasetId Unique identifier of the dataset.
     * @return purchaseIds Array of purchase record IDs.
     */
    function getPurchasesByDataset(
        uint256 datasetId
    ) external view returns (uint256[] memory purchaseIds);

    /**
     * @notice Checks whether an address holds valid, active access entitlement for a dataset license.
     * @param buyer Address of the user/account.
     * @param datasetId Unique identifier of the dataset.
     * @param licenseId Unique identifier of the license.
     * @return granted Boolean indicating if active access is granted.
     */
    function hasAccess(
        address buyer,
        uint256 datasetId,
        uint256 licenseId
    ) external view returns (bool granted);

    /**
     * @notice Returns the total count of completed purchases on-chain.
     * @return total Total number of purchases.
     */
    function getTotalPurchases() external view returns (uint256 total);

    /**
     * @notice Checks if an exclusive license has already been purchased and locked.
     * @param licenseId Unique identifier of the license.
     * @return sold Boolean indicating if the exclusive license is already sold.
     */
    function isExclusiveLicenseSold(uint256 licenseId) external view returns (bool sold);

    /**
     * @notice Returns the current platform fee in basis points (e.g. 250 = 2.50%).
     * @return feeBps Platform fee basis points.
     */
    function getPlatformFee() external view returns (uint256 feeBps);

    /**
     * @notice Updates the platform fee in basis points.
     * @dev Restricted to contract owner.
     * @param newFeeBps New platform fee in basis points (max 1000 = 10.00%).
     */
    function setPlatformFee(uint256 newFeeBps) external;
}
