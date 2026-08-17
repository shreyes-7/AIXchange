/**
 * ============================================================================
 * AIXchange - DatasetRegistry Contract ABI
 * ----------------------------------------------------------------------------
 * Human-readable ABI for interacting with the AIXchange DatasetRegistry contract.
 * Conforms to IDatasetRegistry.sol and compiled Hardhat artifacts.
 * ============================================================================
 */

export const DATASET_REGISTRY_ABI = [
  "function MAX_ROYALTY_BPS() view returns (uint256)",
  "function registerDataset(string calldata cid, string calldata license, uint256 royalty) returns (uint256)",
  "function getDataset(uint256 datasetId) view returns (tuple(uint256 datasetId, address owner, string cid, string license, uint256 royalty, uint256 createdAt, bool active))",
  "function getDatasetOwner(uint256 datasetId) view returns (address)",
  "function getDatasetsByOwner(address owner) view returns (uint256[])",
  "function getTotalDatasets() view returns (uint256)",
  "function updateDataset(uint256 datasetId, string calldata newCid, string calldata newLicense, uint256 newRoyalty)",
  "function setDatasetStatus(uint256 datasetId, bool active)",
  "function transferDatasetOwnership(uint256 datasetId, address newOwner)",
  "event DatasetRegistered(uint256 indexed datasetId, address indexed owner, string cid, string license, uint256 royalty, uint256 createdAt)",
  "event DatasetUpdated(uint256 indexed datasetId, string newCid, string newLicense, uint256 newRoyalty)",
  "event DatasetStatusChanged(uint256 indexed datasetId, bool active)",
  "event DatasetOwnershipTransferred(uint256 indexed datasetId, address indexed previousOwner, address indexed newOwner)"
];
