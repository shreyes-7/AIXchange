// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";

/**
 * @title IRoyaltyEngine
 * @dev Interface for the AIXchange Royalty Engine smart contract.
 * Governs multi-party revenue splitting, platform treasury allocation,
 * atomic token distributions, duplicate prevention, and auditable accounting.
 */
interface IRoyaltyEngine {
    /**
     * @notice Distributes revenue across multiple recipients and platform Treasury.
     * @dev Pulls `totalRevenue` AIX tokens from `msg.sender` and atomically pays all recipients and Treasury.
     * @param sourceType Revenue source category (PURCHASE, DERIVATIVE, INFERENCE, DIRECT).
     * @param sourceId Source reference identifier (e.g. purchaseId, modelId, executionId hash).
     * @param totalRevenue Total AIX token amount to distribute (in wei units).
     * @param recipients Array of recipient addresses and basis point shares.
     * @return distributionId Unique sequential identifier assigned to this distribution.
     */
    function distributeRoyalty(
        Structs.RoyaltySourceType sourceType,
        uint256 sourceId,
        uint256 totalRevenue,
        Structs.RecipientShare[] calldata recipients
    ) external returns (uint256 distributionId);

    /**
     * @notice Distributes downstream or secondary royalties for a verified Phase 6 purchase.
     * @dev Validates that purchaseId exists in PurchaseEngine and has not yet been distributed.
     * @param purchaseId Unique purchase record ID from PurchaseEngine.
     * @param recipients Array of recipient addresses and basis point shares.
     * @return distributionId Unique sequential identifier assigned to this distribution.
     */
    function distributePurchaseRoyalty(
        uint256 purchaseId,
        Structs.RecipientShare[] calldata recipients
    ) external returns (uint256 distributionId);

    /**
     * @notice Simulates/previews a revenue split calculation without executing state changes.
     * @param totalRevenue Total AIX token amount to be split.
     * @param treasuryFeeBps Platform treasury fee in basis points (10000 = 100%).
     * @param recipients Array of recipient shares.
     * @return treasuryAmount Total amount allocated to the platform Treasury (including rounding remainder).
     * @return recipientAmounts Array of amounts allocated to each respective recipient.
     * @return remainder Rounding remainder from integer division added to the treasury allocation.
     */
    function calculateSplit(
        uint256 totalRevenue,
        uint256 treasuryFeeBps,
        Structs.RecipientShare[] calldata recipients
    )
        external
        pure
        returns (
            uint256 treasuryAmount,
            uint256[] memory recipientAmounts,
            uint256 remainder
        );

    /**
     * @notice Retrieves the full record of a completed distribution.
     * @param distributionId Unique identifier of the distribution.
     * @return record Struct containing the distribution record metadata.
     */
    function getDistribution(
        uint256 distributionId
    ) external view returns (Structs.DistributionRecord memory record);

    /**
     * @notice Retrieves the detailed recipient allocations for a given distribution.
     * @param distributionId Unique identifier of the distribution.
     * @return allocations Array of recipient payout allocations.
     */
    function getDistributionAllocations(
        uint256 distributionId
    ) external view returns (Structs.RecipientAllocation[] memory allocations);

    /**
     * @notice Checks whether a given revenue source has already been distributed.
     * @param sourceType Revenue source category.
     * @param sourceId Source reference identifier.
     * @return distributed True if revenue from this source has already been distributed.
     */
    function isSourceDistributed(
        Structs.RoyaltySourceType sourceType,
        uint256 sourceId
    ) external view returns (bool distributed);

    /**
     * @notice Returns the total count of completed distributions on-chain.
     * @return total Total number of distributions.
     */
    function getTotalDistributions() external view returns (uint256 total);

    /**
     * @notice Returns the cumulative total amount of AIX tokens distributed through the engine.
     * @return totalAmount Total cumulative tokens distributed.
     */
    function getTotalDistributedAmount() external view returns (uint256 totalAmount);

    /**
     * @notice Returns the cumulative total amount routed to the platform Treasury.
     * @return totalTreasury Total cumulative tokens routed to Treasury.
     */
    function getTotalTreasuryDistributed() external view returns (uint256 totalTreasury);

    /**
     * @notice Returns the cumulative amount of AIX tokens claimed/received by a specific recipient.
     * @param recipient Address of the recipient account.
     * @return totalReceived Total cumulative tokens received by recipient.
     */
    function getRecipientTotalClaimed(
        address recipient
    ) external view returns (uint256 totalReceived);

    /**
     * @notice Returns the default platform treasury fee in basis points (e.g. 250 = 2.50%).
     * @return feeBps Default treasury fee in basis points.
     */
    function getDefaultTreasuryFeeBps() external view returns (uint256 feeBps);

    /**
     * @notice Returns the address of the platform Treasury vault.
     * @return treasury Address of the Treasury contract.
     */
    function getTreasury() external view returns (address treasury);

    /**
     * @notice Returns the address of the AIX utility token contract.
     * @return token Address of the AIXToken contract.
     */
    function getAixToken() external view returns (address token);

    /**
     * @notice Returns the address of the Phase 6 PurchaseEngine contract.
     * @return engine Address of the PurchaseEngine contract.
     */
    function getPurchaseEngine() external view returns (address engine);

    /**
     * @notice Updates the platform Treasury vault address.
     * @dev Restricted to contract owner.
     * @param newTreasury New address of the Treasury contract.
     */
    function setTreasury(address newTreasury) external;

    /**
     * @notice Updates the default platform treasury fee in basis points.
     * @dev Restricted to contract owner.
     * @param newFeeBps New default fee in basis points (max 2000 = 20.00%).
     */
    function setDefaultTreasuryFeeBps(uint256 newFeeBps) external;

    /**
     * @notice Pauses distribution operations in an emergency.
     * @dev Restricted to contract owner.
     */
    function pause() external;

    /**
     * @notice Resumes distribution operations.
     * @dev Restricted to contract owner.
     */
    function unpause() external;
}
