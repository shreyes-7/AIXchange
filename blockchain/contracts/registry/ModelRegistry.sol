// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IModelRegistry.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title ModelRegistry
 * @dev Implementation of the AIXchange on-chain Model Registry for Phase 8.
 * Provides on-chain tracking for AI model identity, ownership, cryptographic artifact hash,
 * versioning, and status management. Does NOT store raw model binaries on-chain.
 */
contract ModelRegistry is IModelRegistry {
    /// @dev Internal auto-incrementing ID counter for model registrations.
    uint256 private _nextModelId;

    /// @dev Mapping from model ID to Model record.
    mapping(uint256 => Structs.Model) private _models;

    /// @dev Mapping from model ID => version number => ModelVersion record.
    mapping(uint256 => mapping(uint256 => Structs.ModelVersion)) private _modelVersions;

    /// @dev Mapping from owner address to list of registered model IDs.
    mapping(address => uint256[]) private _ownerModels;

    /// @dev Mapping from model ID to its index in the owner's model array.
    mapping(uint256 => uint256) private _modelOwnerIndex;

    /// @dev Mapping from owner address => model name => model ID (duplicate name prevention per owner).
    mapping(address => mapping(string => uint256)) private _ownerModelNameToId;

    /**
     * @notice Initializes the ModelRegistry contract.
     */
    constructor() {
        _nextModelId = 1;
    }

    /**
     * @notice Registers a new AI model on-chain with an initial version (v1).
     * @dev Generates an incremental modelId and associates ownership with msg.sender.
     * @param name Name / title of the model (must be non-empty and unique per owner).
     * @param metadataURI IPFS CID or URI to off-chain model metadata.
     * @param modelHash Cryptographic SHA-256 hash of the exported model artifact.
     * @return modelId The assigned unique model identifier.
     */
    function registerModel(
        string calldata name,
        string calldata metadataURI,
        string calldata modelHash
    ) external override returns (uint256 modelId) {
        if (bytes(name).length == 0) {
            revert Errors.InvalidModelName();
        }
        if (bytes(metadataURI).length == 0) {
            revert Errors.InvalidMetadataURI();
        }
        if (bytes(modelHash).length == 0) {
            revert Errors.InvalidModelHash();
        }
        if (_ownerModelNameToId[msg.sender][name] != 0) {
            revert Errors.ModelAlreadyExists(name);
        }

        modelId = _nextModelId;
        _nextModelId++;

        // Store Model record
        _models[modelId] = Structs.Model({
            modelId: modelId,
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            currentVersion: 1,
            totalVersions: 1,
            createdAt: block.timestamp,
            active: true
        });

        // Store initial Version 1
        _modelVersions[modelId][1] = Structs.ModelVersion({
            versionNumber: 1,
            modelHash: modelHash,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            active: true
        });

        // Track ownership
        _ownerModels[msg.sender].push(modelId);
        _modelOwnerIndex[modelId] = _ownerModels[msg.sender].length - 1;
        _ownerModelNameToId[msg.sender][name] = modelId;

        // Emit registration event
        emit Events.ModelRegistered(
            modelId,
            msg.sender,
            name,
            metadataURI,
            modelHash,
            1,
            block.timestamp
        );

        // Also emit version added event for v1
        emit Events.ModelVersionAdded(
            modelId,
            1,
            modelHash,
            metadataURI,
            block.timestamp
        );
    }

    /**
     * @notice Adds a new version to an existing model.
     * @dev Restricted to the model owner. Reverts if model is inactive or hash is identical to latest.
     * @param modelId Unique identifier of the model.
     * @param metadataURI IPFS CID or URI for the new version's metadata.
     * @param modelHash Cryptographic SHA-256 hash of the new version's model artifact.
     * @return versionNumber The assigned sequential version number.
     */
    function addModelVersion(
        uint256 modelId,
        string calldata metadataURI,
        string calldata modelHash
    ) external override returns (uint256 versionNumber) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        if (msg.sender != _models[modelId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }
        if (!_models[modelId].active) {
            revert Errors.ModelInactive(modelId);
        }
        if (bytes(metadataURI).length == 0) {
            revert Errors.InvalidMetadataURI();
        }
        if (bytes(modelHash).length == 0) {
            revert Errors.InvalidModelHash();
        }

        uint256 currentVer = _models[modelId].currentVersion;
        if (keccak256(bytes(_modelVersions[modelId][currentVer].modelHash)) == keccak256(bytes(modelHash))) {
            revert Errors.DuplicateModelVersion(modelId, currentVer);
        }

        versionNumber = currentVer + 1;

        _modelVersions[modelId][versionNumber] = Structs.ModelVersion({
            versionNumber: versionNumber,
            modelHash: modelHash,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            active: true
        });

        _models[modelId].currentVersion = versionNumber;
        _models[modelId].totalVersions = versionNumber;

        emit Events.ModelVersionAdded(
            modelId,
            versionNumber,
            modelHash,
            metadataURI,
            block.timestamp
        );
    }

    /**
     * @notice Toggles the active status of a model.
     * @dev Restricted to the model owner.
     * @param modelId Unique identifier of the model.
     * @param active New active status boolean.
     */
    function setModelStatus(uint256 modelId, bool active) external override {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        if (msg.sender != _models[modelId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }

        _models[modelId].active = active;

        emit Events.ModelStatusChanged(modelId, active);
    }

    /**
     * @notice Transfers ownership of a model to a new address.
     * @dev Restricted to the current model owner.
     * @param modelId Unique identifier of the model.
     * @param newOwner Address of the new owner.
     */
    function transferModelOwnership(uint256 modelId, address newOwner) external override {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        if (msg.sender != _models[modelId].owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }
        if (newOwner == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (newOwner == msg.sender) {
            return;
        }

        string memory modelName = _models[modelId].name;
        if (_ownerModelNameToId[newOwner][modelName] != 0) {
            revert Errors.ModelAlreadyExists(modelName);
        }

        address previousOwner = msg.sender;

        // Remove modelId from previous owner's list using swap-and-pop
        uint256[] storage prevList = _ownerModels[previousOwner];
        uint256 indexToRemove = _modelOwnerIndex[modelId];
        uint256 lastIndex = prevList.length - 1;

        if (indexToRemove != lastIndex) {
            uint256 lastModelId = prevList[lastIndex];
            prevList[indexToRemove] = lastModelId;
            _modelOwnerIndex[lastModelId] = indexToRemove;
        }
        prevList.pop();
        delete _ownerModelNameToId[previousOwner][modelName];

        // Add modelId to new owner's list
        _ownerModels[newOwner].push(modelId);
        _modelOwnerIndex[modelId] = _ownerModels[newOwner].length - 1;
        _ownerModelNameToId[newOwner][modelName] = modelId;

        // Update model record owner
        _models[modelId].owner = newOwner;

        emit Events.ModelOwnershipTransferred(modelId, previousOwner, newOwner);
    }

    /**
     * @notice Retrieves full model details for a given model ID.
     * @param modelId Unique identifier of the model.
     * @return model The Model record struct.
     */
    function getModel(
        uint256 modelId
    ) external view override returns (Structs.Model memory model) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        return _models[modelId];
    }

    /**
     * @notice Retrieves the owner address for a given model ID.
     * @param modelId Unique identifier of the model.
     * @return owner Address of the model owner.
     */
    function getModelOwner(
        uint256 modelId
    ) external view override returns (address owner) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        return _models[modelId].owner;
    }

    /**
     * @notice Retrieves all model IDs registered by a specific owner.
     * @param owner Address of the model owner.
     * @return modelIds Array of model IDs owned by the address.
     */
    function getModelsByOwner(
        address owner
    ) external view override returns (uint256[] memory modelIds) {
        if (owner == address(0)) {
            revert Errors.ZeroAddress();
        }
        return _ownerModels[owner];
    }

    /**
     * @notice Returns the total count of registered models.
     * @return total Total number of registered models.
     */
    function getTotalModels() external view override returns (uint256 total) {
        return _nextModelId - 1;
    }

    /**
     * @notice Retrieves a specific version record for a model.
     * @param modelId Unique identifier of the model.
     * @param versionNumber Version number to query.
     * @return version The ModelVersion record struct.
     */
    function getVersion(
        uint256 modelId,
        uint256 versionNumber
    ) external view override returns (Structs.ModelVersion memory version) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        if (versionNumber == 0 || versionNumber > _models[modelId].totalVersions) {
            revert Errors.VersionNotFound(modelId, versionNumber);
        }
        return _modelVersions[modelId][versionNumber];
    }

    /**
     * @notice Retrieves the latest (current) version record for a model.
     * @param modelId Unique identifier of the model.
     * @return version The latest ModelVersion record struct.
     */
    function getLatestVersion(
        uint256 modelId
    ) external view override returns (Structs.ModelVersion memory version) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        uint256 currentVer = _models[modelId].currentVersion;
        return _modelVersions[modelId][currentVer];
    }

    /**
     * @notice Returns the total number of versions registered for a model.
     * @param modelId Unique identifier of the model.
     * @return count Total version count.
     */
    function getVersionCount(uint256 modelId) external view override returns (uint256 count) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        return _models[modelId].totalVersions;
    }

    /**
     * @notice Retrieves all version records for a model.
     * @param modelId Unique identifier of the model.
     * @return versions Array of ModelVersion structs.
     */
    function getModelVersions(
        uint256 modelId
    ) external view override returns (Structs.ModelVersion[] memory versions) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }

        uint256 total = _models[modelId].totalVersions;
        versions = new Structs.ModelVersion[](total);

        for (uint256 i = 1; i <= total; i++) {
            versions[i - 1] = _modelVersions[modelId][i];
        }
        return versions;
    }

    /**
     * @notice Checks whether a model is active.
     * @param modelId Unique identifier of the model.
     * @return active Boolean active status.
     */
    function isModelActive(uint256 modelId) external view override returns (bool active) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        return _models[modelId].active;
    }

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
    ) external view override returns (bool matches) {
        if (modelId == 0 || modelId >= _nextModelId) {
            revert Errors.ModelNotFound(modelId);
        }
        if (versionNumber == 0 || versionNumber > _models[modelId].totalVersions) {
            revert Errors.VersionNotFound(modelId, versionNumber);
        }
        return keccak256(bytes(_modelVersions[modelId][versionNumber].modelHash)) == keccak256(bytes(expectedHash));
    }
}