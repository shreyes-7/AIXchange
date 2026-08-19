# Ownership

## Overview

AIXchange implements strict on-chain asset ownership management in [[Dataset Marketplace|DatasetRegistry.sol]].

Asset ownership defines who has administrative rights to update dataset metadata, modify IPFS content CIDs, toggle active status, issue commercial licenses, and transfer asset ownership.

---

## 1. Ownership State Tracking

- `_datasets[datasetId].owner`: Stores the authoritative Ethereum address of the dataset owner.
- `_ownerDatasets[owner]`: Maintains an array of dataset IDs owned by each address.
- `_ownerDatasetIndex[datasetId]`: Stores the array index of each dataset within the owner's list, enabling $O(1)$ gas-efficient deletions and transfers via swap-and-pop.

---

## 2. Ownership Transfer Implementation (`DatasetRegistry.sol`)

```solidity
function transferDatasetOwnership(uint256 datasetId, address newOwner) external {
    if (newOwner == address(0)) revert Errors.InvalidAddress();
    Dataset storage dataset = _datasets[datasetId];
    if (dataset.id == 0) revert Errors.DatasetNotFound();
    if (dataset.owner != msg.sender) revert Errors.UnauthorizedDatasetOwner();
    if (dataset.owner == newOwner) return;

    address previousOwner = dataset.owner;

    // Remove from previous owner's list using O(1) swap-and-pop
    uint256 indexToRemove = _ownerDatasetIndex[datasetId];
    uint256 lastDatasetId = _ownerDatasets[previousOwner][_ownerDatasets[previousOwner].length - 1];

    _ownerDatasets[previousOwner][indexToRemove] = lastDatasetId;
    _ownerDatasetIndex[lastDatasetId] = indexToRemove;
    _ownerDatasets[previousOwner].pop();
    delete _ownerDatasetIndex[datasetId];

    // Assign new owner
    dataset.owner = newOwner;
    dataset.updatedAt = block.timestamp;

    // Add to new owner's list
    _ownerDatasetIndex[datasetId] = _ownerDatasets[newOwner].length;
    _ownerDatasets[newOwner].push(datasetId);

    emit Events.DatasetOwnershipTransferred(datasetId, previousOwner, newOwner, block.timestamp);
}
```

---

## 3. Ownership vs. Usage Entitlements

| Characteristic | Dataset Ownership | Purchased License Access |
| :--- | :--- | :--- |
| **Granted By** | `DatasetRegistry.registerDataset()` | `PurchaseEngine.purchaseDataset()` |
| **Right to Modify / Delist** | Yes (`onlyOwner`) | No |
| **Right to Issue Licenses** | Yes (`LicenseRegistry.createLicense()`) | No (unless sublicensing is explicitly enabled) |
| **Revenue Beneficiary** | Receives 97.50% creator payout | Pays purchase price |
| **Query Function** | `DatasetRegistry.getDatasetOwner(datasetId)` | `PurchaseEngine.hasAccess(buyer, datasetId, licenseId)` |
