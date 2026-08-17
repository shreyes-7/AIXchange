// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IDatasetRegistry.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title DatasetRegistry
 * @dev Implementation of the AIXchange on-chain Dataset Registry.
 * Maintains verifiable records for AI datasets including owner, IPFS CID/hash, license terms,
 * and royalty parameters. Does NOT store raw dataset payloads on-chain.
 */
contract DatasetRegistry is IDatasetRegistry {
    /// @notice Maximum allowed royalty in basis points (10000 = 100.00%).
    uint256 public constant MAX_ROYALTY_BPS = 10000;

    /// @dev Internal auto-incrementing ID counter for dataset registrations.
    uint256 private _nextDatasetId;

    /// @dev Mapping from dataset ID to Dataset record.
    mapping(uint256 => Structs.Dataset) private _datasets;

    /// @dev Mapping from owner address to list of registered dataset IDs.
    mapping(address => uint256[]) private _ownerDatasets;

    /// @dev Mapping from dataset ID to its index in the owner's dataset array.
    mapping(uint256 => uint256) private _datasetOwnerIndex;

    /**
     * @notice Initializes the DatasetRegistry contract.
     */
    constructor() {
        _nextDatasetId = 1;
    }

    /**
     * @notice Registers a new dataset on-chain.
     * @dev Generates an incremental datasetId and associates ownership with msg.sender.
     * @param cid IPFS Content Identifier (CID) or cryptographic dataset hash.
     * @param license License identifier (e.g. "MIT", "CC-BY-4.0", "Custom-Commercial").
     * @param royalty Royalty percentage in basis points (e.g., 500 = 5%, max 10000).
     * @return datasetId The assigned unique dataset identifier.
     */
    function registerDataset(
        string calldata cid,
        string calldata license,
        uint256 royalty
    ) external override returns (uint256 datasetId) {
        if (bytes(cid).length == 0) {
            revert Errors.InvalidCID();
        }
        if (bytes(license).length == 0) {
            revert Errors.InvalidLicense();
        }
        if (royalty > MAX_ROYALTY_BPS) {
            revert Errors.InvalidRoyalty(royalty);
        }

        datasetId = _nextDatasetId;
        _nextDatasetId++;

        _datasets[datasetId] = Structs.Dataset({
            datasetId: datasetId,
            owner: msg.sender,
            cid: cid,
            license: license,
            royalty: royalty,
            createdAt: block.timestamp,
            active: true
        });

        _ownerDatasets[msg.sender].push(datasetId);
        _datasetOwnerIndex[datasetId] = _ownerDatasets[msg.sender].length - 1;

        emit Events.DatasetRegistered(
            datasetId,
            msg.sender,
            cid,
            license,
            royalty,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves full dataset details for a given dataset ID.
     * @param datasetId Unique identifier of the dataset.
     * @return dataset The dataset record struct.
     */
    function getDataset(
        uint256 datasetId
    ) external view override returns (Structs.Dataset memory dataset) {
        if (datasetId == 0 || datasetId >= _nextDatasetId) {
            revert Errors.DatasetNotFound(datasetId);
        }
        return _datasets[datasetId];
    }

    /**
     * @notice Retrieves the owner address for a given dataset ID.
     * @param datasetId Unique identifier of the dataset.
     * @return owner Address of the dataset owner.
     */
    function getDatasetOwner(
        uint256 datasetId
    ) external view override returns (address owner) {
        if (datasetId == 0 || datasetId >= _nextDatasetId) {
            revert Errors.DatasetNotFound(datasetId);
        }
        return _datasets[datasetId].owner;
    }

    /**
     * @notice Retrieves all dataset IDs registered by a specific owner.
     * @param owner Address of the dataset owner.
     * @return datasetIds Array of dataset IDs owned by the address.
     */
    function getDatasetsByOwner(
        address owner
    ) external view override returns (uint256[] memory datasetIds) {
        if (owner == address(0)) {
            revert Errors.ZeroAddress();
        }
        return _ownerDatasets[owner];
    }

    /**
     * @notice Returns the total count of registered datasets.
     * @return total Total number of registered datasets.
     */
    function getTotalDatasets() external view override returns (uint256 total) {
        return _nextDatasetId - 1;
    }

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
    ) external override {
        if (datasetId == 0 || datasetId >= _nextDatasetId) {
            revert Errors.DatasetNotFound(datasetId);
        }
        if (msg.sender != _datasets[datasetId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }
        if (bytes(newCid).length == 0) {
            revert Errors.InvalidCID();
        }
        if (bytes(newLicense).length == 0) {
            revert Errors.InvalidLicense();
        }
        if (newRoyalty > MAX_ROYALTY_BPS) {
            revert Errors.InvalidRoyalty(newRoyalty);
        }

        Structs.Dataset storage dataset = _datasets[datasetId];
        dataset.cid = newCid;
        dataset.license = newLicense;
        dataset.royalty = newRoyalty;

        emit Events.DatasetUpdated(datasetId, newCid, newLicense, newRoyalty);
    }

    /**
     * @notice Toggles the active status of a dataset.
     * @dev Restricted to the dataset owner.
     * @param datasetId Unique identifier of the dataset.
     * @param active New active status boolean.
     */
    function setDatasetStatus(
        uint256 datasetId,
        bool active
    ) external override {
        if (datasetId == 0 || datasetId >= _nextDatasetId) {
            revert Errors.DatasetNotFound(datasetId);
        }
        if (msg.sender != _datasets[datasetId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }

        _datasets[datasetId].active = active;

        emit Events.DatasetStatusChanged(datasetId, active);
    }

    /**
     * @notice Transfers dataset registration ownership to a new account.
     * @dev Restricted to the current dataset owner.
     * @param datasetId Unique identifier of the dataset.
     * @param newOwner Address of the new dataset owner.
     */
    function transferDatasetOwnership(
        uint256 datasetId,
        address newOwner
    ) external override {
        if (datasetId == 0 || datasetId >= _nextDatasetId) {
            revert Errors.DatasetNotFound(datasetId);
        }
        if (msg.sender != _datasets[datasetId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }
        if (newOwner == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (newOwner == msg.sender) {
            return;
        }

        address previousOwner = msg.sender;

        // Remove datasetId from previous owner's list using swap-and-pop
        uint256[] storage prevList = _ownerDatasets[previousOwner];
        uint256 indexToRemove = _datasetOwnerIndex[datasetId];
        uint256 lastIndex = prevList.length - 1;

        if (indexToRemove != lastIndex) {
            uint256 lastDatasetId = prevList[lastIndex];
            prevList[indexToRemove] = lastDatasetId;
            _datasetOwnerIndex[lastDatasetId] = indexToRemove;
        }
        prevList.pop();

        // Add datasetId to new owner's list
        _ownerDatasets[newOwner].push(datasetId);
        _datasetOwnerIndex[datasetId] = _ownerDatasets[newOwner].length - 1;

        // Update dataset record owner
        _datasets[datasetId].owner = newOwner;

        emit Events.DatasetOwnershipTransferred(datasetId, previousOwner, newOwner);
    }
}