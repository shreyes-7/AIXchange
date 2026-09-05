// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../libraries/Structs.sol";
import "./IDatasetRegistry.sol";
import "./IModelRegistry.sol";

/**
 * @title IProvenanceRegistry
 * @dev Public interface for the AIXchange on-chain Provenance Engine.
 * Establishes immutable, verifiable lineage relationships linking:
 *   Dataset (Phase 4) -> Training / Execution (Phase 7) -> Model -> Model Version (Phase 8).
 * Provides on-chain verification without storing raw data, weights, or execution logs on-chain.
 */
interface IProvenanceRegistry {
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
    ) external returns (uint256 provenanceId);

    /**
     * @notice Toggles the active status of a provenance record (e.g. deprecation or revocation).
     * @dev Restricted to the original registrant of the provenance record or current model owner.
     * @param provenanceId Unique identifier of the provenance record.
     * @param active New active status boolean.
     */
    function setProvenanceStatus(uint256 provenanceId, bool active) external;

    /**
     * @notice Retrieves full provenance record details for a given provenance ID.
     * @param provenanceId Unique identifier of the provenance record.
     * @return record The ProvenanceRecord struct.
     */
    function getProvenance(
        uint256 provenanceId
    ) external view returns (Structs.ProvenanceRecord memory record);

    /**
     * @notice Returns the total count of registered provenance records.
     * @return total Total number of registered provenance records.
     */
    function getTotalProvenanceRecords() external view returns (uint256 total);

    /**
     * @notice Retrieves all provenance record IDs associated with a specific model.
     * @param modelId Unique identifier of the model.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByModel(
        uint256 modelId
    ) external view returns (uint256[] memory provenanceIds);

    /**
     * @notice Retrieves all provenance record IDs associated with a specific model version.
     * @param modelId Unique identifier of the model.
     * @param modelVersion Specific version number of the model.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByModelVersion(
        uint256 modelId,
        uint256 modelVersion
    ) external view returns (uint256[] memory provenanceIds);

    /**
     * @notice Retrieves all provenance record IDs where a specific dataset was used as training input.
     * @param datasetId Unique identifier of the dataset.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByDataset(
        uint256 datasetId
    ) external view returns (uint256[] memory provenanceIds);

    /**
     * @notice Retrieves all provenance record IDs associated with a specific execution ID.
     * @param executionId Execution identifier string.
     * @return provenanceIds Array of provenance record IDs.
     */
    function getProvenanceByExecution(
        string calldata executionId
    ) external view returns (uint256[] memory provenanceIds);

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
    ) external view returns (uint256 provenanceId);

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
    ) external view returns (bool isValid);

    /**
     * @notice Verifies whether a given metadata hash matches the recorded commitment for a provenance record.
     * @param provenanceId Identifier of the provenance record.
     * @param expectedMetadataHash Hash commitment to verify against.
     * @return isValid True if matching, false otherwise.
     */
    function verifyProvenanceHash(
        uint256 provenanceId,
        bytes32 expectedMetadataHash
    ) external view returns (bool isValid);

    /**
     * @notice Checks whether a provenance record is currently active.
     * @param provenanceId Identifier of the provenance record.
     * @return active Boolean active status.
     */
    function isProvenanceActive(uint256 provenanceId) external view returns (bool active);

    /**
     * @notice Returns the address of the linked Phase 4 DatasetRegistry contract.
     * @return registry Address of the DatasetRegistry contract.
     */
    function datasetRegistry() external view returns (IDatasetRegistry registry);

    /**
     * @notice Returns the address of the linked Phase 8 ModelRegistry contract.
     * @return registry Address of the ModelRegistry contract.
     */
    function modelRegistry() external view returns (IModelRegistry registry);
}

