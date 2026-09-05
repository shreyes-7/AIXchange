// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";

/**
 * @title IModelRegistry
 * @dev Public interface for the AIXchange on-chain AI Model Registry.
 * Provides on-chain tracking for model identity, ownership, cryptographic artifact hash,
 * versioning, and status management. Does NOT store raw model binaries on-chain.
 */
interface IModelRegistry {
    /**
     * @notice Registers a new AI model on-chain with an initial version (v1).
     * @param name Name / title of the model (must be non-empty and unique per owner).
     * @param metadataURI IPFS CID or URI to off-chain model metadata.
     * @param modelHash Cryptographic SHA-256 hash of the exported model artifact.
     * @return modelId The assigned unique model identifier.
     */
    function registerModel(
        string calldata name,
        string calldata metadataURI,
        string calldata modelHash
    ) external returns (uint256 modelId);

    /**
     * @notice Adds a new version to an existing model.
     * @dev Restricted to the model owner.
     * @param modelId Unique identifier of the model.
     * @param metadataURI IPFS CID or URI for the new version's metadata.
     * @param modelHash Cryptographic SHA-256 hash of the new version's model artifact.
     * @return versionNumber The assigned sequential version number.
     */
    function addModelVersion(
        uint256 modelId,
        string calldata metadataURI,
        string calldata modelHash
    ) external returns (uint256 versionNumber);

    /**
     * @notice Toggles the active status of a model.
     * @dev Restricted to the model owner.
     * @param modelId Unique identifier of the model.
     * @param active New active status boolean.
     */
    function setModelStatus(uint256 modelId, bool active) external;

    /**
     * @notice Transfers ownership of a model to a new address.
     * @dev Restricted to the current model owner.
     * @param modelId Unique identifier of the model.
     * @param newOwner Address of the new owner.
     */
    function transferModelOwnership(uint256 modelId, address newOwner) external;

    /**
     * @notice Retrieves full model details for a given model ID.
     * @param modelId Unique identifier of the model.
     * @return model The Model record struct.
     */
    function getModel(uint256 modelId) external view returns (Structs.Model memory model);

    /**
     * @notice Retrieves the owner address for a given model ID.
     * @param modelId Unique identifier of the model.
     * @return owner Address of the model owner.
     */
    function getModelOwner(uint256 modelId) external view returns (address owner);

    /**
     * @notice Retrieves all model IDs registered by a specific owner.
     * @param owner Address of the model owner.
     * @return modelIds Array of model IDs owned by the address.
     */
    function getModelsByOwner(address owner) external view returns (uint256[] memory modelIds);

    /**
     * @notice Returns the total count of registered models.
     * @return total Total number of registered models.
     */
    function getTotalModels() external view returns (uint256 total);

    /**
     * @notice Retrieves a specific version record for a model.
     * @param modelId Unique identifier of the model.
     * @param versionNumber Version number to query.
     * @return version The ModelVersion record struct.
     */
    function getVersion(
        uint256 modelId,
        uint256 versionNumber
    ) external view returns (Structs.ModelVersion memory version);

    /**
     * @notice Retrieves the latest (current) version record for a model.
     * @param modelId Unique identifier of the model.
     * @return version The latest ModelVersion record struct.
     */
    function getLatestVersion(uint256 modelId) external view returns (Structs.ModelVersion memory version);

    /**
     * @notice Returns the total number of versions registered for a model.
     * @param modelId Unique identifier of the model.
     * @return count Total version count.
     */
    function getVersionCount(uint256 modelId) external view returns (uint256 count);

    /**
     * @notice Retrieves all version records for a model.
     * @param modelId Unique identifier of the model.
     * @return versions Array of ModelVersion structs.
     */
    function getModelVersions(uint256 modelId) external view returns (Structs.ModelVersion[] memory versions);

    /**
     * @notice Checks whether a model is active.
     * @param modelId Unique identifier of the model.
     * @return active Boolean active status.
     */
    function isModelActive(uint256 modelId) external view returns (bool active);

    /**
     * @notice Verifies if a given hash matches the stored model hash for a specific version.
     * @param modelId Unique identifier of the model.
     * @param versionNumber Version number to verify.
     * @param expectedHash Hash string to compare against.
     * @return matches True if hashes match, false otherwise.
     */
    function verifyModelHash(
        uint256 modelId,
        uint256 versionNumber,
        string calldata expectedHash
    ) external view returns (bool matches);
}
