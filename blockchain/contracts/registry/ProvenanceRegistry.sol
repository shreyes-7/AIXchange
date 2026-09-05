// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IProvenanceRegistry.sol";
import "../interfaces/IDatasetRegistry.sol";
import "../interfaces/IModelRegistry.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title ProvenanceRegistry
 * @dev Implementation of the AIXchange on-chain Provenance Engine for Phase 9.
 * Establishes immutable, verifiable lineage relationships linking:
 *   Dataset (Phase 4) -> Training / Execution (Phase 7) -> Model -> Model Version (Phase 8).
 * Provides on-chain verification without storing raw data, weights, or execution logs on-chain.
 */
contract ProvenanceRegistry is IProvenanceRegistry {
    /// @notice Reference to the Phase 4 DatasetRegistry contract.
    IDatasetRegistry public immutable override datasetRegistry;

    /// @notice Reference to the Phase 8 ModelRegistry contract.
    IModelRegistry public immutable override modelRegistry;

    /// @dev Internal auto-incrementing ID counter for provenance records.
    uint256 private _nextProvenanceId;

    /// @dev Mapping from provenance ID to ProvenanceRecord struct.
    mapping(uint256 => Structs.ProvenanceRecord) private _records;

    /// @dev Composite key mapping: keccak256(datasetId, executionId, modelId, modelVersion) => provenanceId.
    mapping(bytes32 => uint256) private _provenanceKeys;

    /// @dev Mapping from modelId => array of associated provenance IDs.
    mapping(uint256 => uint256[]) private _modelProvenance;

    /// @dev Mapping from modelId => modelVersion => array of associated provenance IDs.
    mapping(uint256 => mapping(uint256 => uint256[])) private _modelVersionProvenance;

    /// @dev Mapping from datasetId => array of associated provenance IDs.
    mapping(uint256 => uint256[]) private _datasetProvenance;

    /// @dev Mapping from executionId => array of associated provenance IDs.
    mapping(string => uint256[]) private _executionProvenance;

    /**
     * @notice Initializes the ProvenanceRegistry contract.
     * @param datasetRegistryAddress Address of the deployed DatasetRegistry contract.
     * @param modelRegistryAddress Address of the deployed ModelRegistry contract.
     */
    constructor(address datasetRegistryAddress, address modelRegistryAddress) {
        if (datasetRegistryAddress == address(0) || modelRegistryAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        datasetRegistry = IDatasetRegistry(datasetRegistryAddress);
        modelRegistry = IModelRegistry(modelRegistryAddress);
        _nextProvenanceId = 1;
    }

    /**
     * @notice Registers an immutable provenance record linking a dataset, execution, and model version.
     * @dev Restricted to the owner of the model in ModelRegistry.
     * @param datasetId Identifier of the source dataset in DatasetRegistry.
     * @param modelId Identifier of the target model in ModelRegistry.
     * @param modelVersion Specific version number of the target model.
     * @param executionId Unique identifier of the off-chain training execution / sandbox run.
     * @param metadataHash Cryptographic SHA-256 or keccak256 commitment of the execution metadata artifact.
     * @return provenanceId The assigned unique sequential provenance record identifier.
     */
    function registerProvenance(
        uint256 datasetId,
        uint256 modelId,
        uint256 modelVersion,
        string calldata executionId,
        bytes32 metadataHash
    ) external override returns (uint256 provenanceId) {
        if (datasetId == 0) {
            revert Errors.DatasetNotFound(0);
        }
        // Verify dataset exists in DatasetRegistry
        datasetRegistry.getDataset(datasetId);

        if (modelId == 0) {
            revert Errors.ModelNotFound(0);
        }
        // Verify model exists and check version bounds
        Structs.Model memory model = modelRegistry.getModel(modelId);
        if (modelVersion == 0 || modelVersion > model.totalVersions) {
            revert Errors.VersionNotFound(modelId, modelVersion);
        }

        // Authorization: caller must be current model owner
        if (msg.sender != model.owner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }

        if (bytes(executionId).length == 0) {
            revert Errors.InvalidExecutionId();
        }
        if (metadataHash == bytes32(0)) {
            revert Errors.InvalidMetadataHash();
        }

        // Prevent duplicate provenance registration for the same atomic relationship
        bytes32 key = keccak256(abi.encodePacked(datasetId, executionId, modelId, modelVersion));
        if (_provenanceKeys[key] != 0) {
            revert Errors.ProvenanceAlreadyExists(_provenanceKeys[key]);
        }

        provenanceId = _nextProvenanceId;
        _nextProvenanceId++;

        // Store immutable provenance record
        _records[provenanceId] = Structs.ProvenanceRecord({
            provenanceId: provenanceId,
            datasetId: datasetId,
            modelId: modelId,
            modelVersion: modelVersion,
            executionId: executionId,
            metadataHash: metadataHash,
            registrant: msg.sender,
            createdAt: block.timestamp,
            active: true
        });

        // Store indexed lookups
        _provenanceKeys[key] = provenanceId;
        _modelProvenance[modelId].push(provenanceId);
        _modelVersionProvenance[modelId][modelVersion].push(provenanceId);
        _datasetProvenance[datasetId].push(provenanceId);
        _executionProvenance[executionId].push(provenanceId);

        // Emit indexing event
        emit Events.ProvenanceRegistered(
            provenanceId,
            datasetId,
            modelId,
            modelVersion,
            executionId,
            metadataHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Toggles the active status of a provenance record (e.g. deprecation or revocation).
     * @dev Restricted to the original registrant of the provenance record or current model owner.
     * @param provenanceId Unique identifier of the provenance record.
     * @param active New active status boolean.
     */
    function setProvenanceStatus(uint256 provenanceId, bool active) external override {
        if (provenanceId == 0 || provenanceId >= _nextProvenanceId) {
            revert Errors.ProvenanceNotFound(provenanceId);
        }

        Structs.ProvenanceRecord storage record = _records[provenanceId];
        address currentModelOwner = modelRegistry.getModelOwner(record.modelId);

        if (msg.sender != record.registrant && msg.sender != currentModelOwner) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }

        record.active = active;

        emit Events.ProvenanceStatusChanged(provenanceId, active, block.timestamp);
    }

    /**
     * @notice Retrieves full provenance record details for a given provenance ID.
     * @param provenanceId Unique identifier of the provenance record.
     * @return record The ProvenanceRecord struct.
     */
    function getProvenance(
        uint256 provenanceId
    ) external view override returns (Structs.ProvenanceRecord memory record) {
        if (provenanceId == 0 || provenanceId >= _nextProvenanceId) {
            revert Errors.ProvenanceNotFound(provenanceId);
        }
        return _records[provenanceId];
    }

    /**
     * @notice Returns the total count of registered provenance records.
     * @return total Total number of registered provenance records.
     */
    function getTotalProvenanceRecords() external view override returns (uint256 total) {
        return _nextProvenanceId - 1;
    }

    /**
     * @notice Retrieves all provenance record IDs associated with a specific model.
     * @param modelId Unique identifier of the model.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByModel(
        uint256 modelId
    ) external view override returns (uint256[] memory provenanceIds) {
        return _modelProvenance[modelId];
    }

    /**
     * @notice Retrieves all provenance record IDs associated with a specific model version.
     * @param modelId Unique identifier of the model.
     * @param modelVersion Specific version number of the model.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByModelVersion(
        uint256 modelId,
        uint256 modelVersion
    ) external view override returns (uint256[] memory provenanceIds) {
        return _modelVersionProvenance[modelId][modelVersion];
    }

    /**
     * @notice Retrieves all provenance record IDs where a specific dataset was used as training input.
     * @param datasetId Unique identifier of the dataset.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByDataset(
        uint256 datasetId
    ) external view override returns (uint256[] memory provenanceIds) {
        return _datasetProvenance[datasetId];
    }

    /**
     * @notice Retrieves all provenance record IDs associated with a specific execution ID.
     * @param executionId Execution identifier string.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByExecution(
        string calldata executionId
    ) external view override returns (uint256[] memory provenanceIds) {
        return _executionProvenance[executionId];
    }

    /**
     * @notice Look up a provenance ID by its canonical relationship composite key.
     * @param datasetId Dataset identifier.
     * @param executionId Execution identifier.
     * @param modelId Model identifier.
     * @param modelVersion Model version number.
     * @return provenanceId The registered provenance identifier (or 0 if none registered).
     */
    function getProvenanceIdByKey(
        uint256 datasetId,
        string calldata executionId,
        uint256 modelId,
        uint256 modelVersion
    ) external view override returns (uint256 provenanceId) {
        bytes32 key = keccak256(abi.encodePacked(datasetId, executionId, modelId, modelVersion));
        return _provenanceKeys[key];
    }

    /**
     * @notice Performs a comprehensive read-only verification of a provenance claim.
     * @param provenanceId Identifier of the recorded provenance record.
     * @param expectedDatasetId Expected dataset ID used in training.
     * @param expectedExecutionId Expected off-chain execution ID.
     * @param expectedModelId Expected resulting model ID.
     * @param expectedModelVersion Expected resulting model version number.
     * @param expectedMetadataHash Expected metadata commitment hash.
     * @return isValid True if all parameters match the on-chain immutable record, false otherwise.
     */
    function verifyProvenance(
        uint256 provenanceId,
        uint256 expectedDatasetId,
        string calldata expectedExecutionId,
        uint256 expectedModelId,
        uint256 expectedModelVersion,
        bytes32 expectedMetadataHash
    ) external view override returns (bool isValid) {
        if (provenanceId == 0 || provenanceId >= _nextProvenanceId) {
            return false;
        }

        Structs.ProvenanceRecord storage rec = _records[provenanceId];
        if (!rec.active) {
            return false;
        }
        if (rec.datasetId != expectedDatasetId) {
            return false;
        }
        if (rec.modelId != expectedModelId) {
            return false;
        }
        if (rec.modelVersion != expectedModelVersion) {
            return false;
        }
        if (rec.metadataHash != expectedMetadataHash) {
            return false;
        }
        if (keccak256(bytes(rec.executionId)) != keccak256(bytes(expectedExecutionId))) {
            return false;
        }

        return true;
    }

    /**
     * @notice Verifies whether a given metadata hash matches the recorded commitment for a provenance record.
     * @param provenanceId Identifier of the provenance record.
     * @param expectedMetadataHash Hash commitment to verify against.
     * @return isValid True if matching, false otherwise.
     */
    function verifyProvenanceHash(
        uint256 provenanceId,
        bytes32 expectedMetadataHash
    ) external view override returns (bool isValid) {
        if (provenanceId == 0 || provenanceId >= _nextProvenanceId) {
            return false;
        }
        return _records[provenanceId].metadataHash == expectedMetadataHash && _records[provenanceId].active;
    }

    /**
     * @notice Checks whether a provenance record is currently active.
     * @param provenanceId Identifier of the provenance record.
     * @return active Boolean active status.
     */
    function isProvenanceActive(uint256 provenanceId) external view override returns (bool active) {
        if (provenanceId == 0 || provenanceId >= _nextProvenanceId) {
            revert Errors.ProvenanceNotFound(provenanceId);
        }
        return _records[provenanceId].active;
    }
}
