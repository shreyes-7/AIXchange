// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";

/**
 * @title IDatasetRegistry
 * @dev Interface for the AIXchange Dataset Registry smart contract.
 * Manages verifiable on-chain metadata references, ownership records, and royalty policies for datasets.
 */
interface IDatasetRegistry {
    /**
     * @notice Registers a new dataset on-chain.
     * @param cid IPFS Content Identifier (CID) or dataset hash.
     * @param license License type/identifier (e.g. "MIT", "CC-BY-4.0").
     * @param royalty Royalty percentage represented in basis points (0-10000).
     * @return datasetId The assigned unique dataset ID.
     */
    function registerDataset(
        string calldata cid,
        string calldata license,
        uint256 royalty
    ) external returns (uint256 datasetId);

    /**
     * @notice Retrieves full dataset details for a given dataset ID.
     * @param datasetId Unique identifier of the dataset.
     * @return dataset The dataset record struct.
     */
    function getDataset(uint256 datasetId) external view returns (Structs.Dataset memory dataset);

    /**
     * @notice Retrieves the owner address for a given dataset ID.
     * @param datasetId Unique identifier of the dataset.
     * @return owner Address of the dataset owner.
     */
    function getDatasetOwner(uint256 datasetId) external view returns (address owner);

    /**
     * @notice Retrieves all dataset IDs registered by a specific owner.
     * @param owner Address of the dataset owner.
     * @return datasetIds Array of dataset IDs owned by the address.
     */
    function getDatasetsByOwner(address owner) external view returns (uint256[] memory datasetIds);

    /**
     * @notice Returns the total count of registered datasets.
     * @return total Total number of registered datasets.
     */
    function getTotalDatasets() external view returns (uint256 total);

    /**
     * @notice Updates the CID, license, and royalty for an existing dataset.
     * @dev Restricted to the dataset owner.
     * @param datasetId Unique identifier of the dataset to update.
     * @param newCid Updated IPFS CID / dataset hash.
     * @param newLicense Updated license identifier.
     * @param newRoyalty Updated royalty in basis points (0-10000).
     */
    function updateDataset(
        uint256 datasetId,
        string calldata newCid,
        string calldata newLicense,
        uint256 newRoyalty
    ) external;

    /**
     * @notice Toggles the active status of a dataset.
     * @dev Restricted to the dataset owner.
     * @param datasetId Unique identifier of the dataset.
     * @param active New active status boolean.
     */
    function setDatasetStatus(uint256 datasetId, bool active) external;

    /**
     * @notice Transfers dataset registration ownership to a new account.
     * @dev Restricted to the current dataset owner.
     * @param datasetId Unique identifier of the dataset.
     * @param newOwner Address of the new dataset owner.
     */
    function transferDatasetOwnership(uint256 datasetId, address newOwner) external;
}
