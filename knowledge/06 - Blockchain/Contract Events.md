# Contract Events

This document details all EVM events declared in `blockchain/contracts/libraries/Events.sol` and emitted by AIXchange smart contracts.

---

## 1. Token & Treasury Events

```solidity
// AIXToken.sol
event TokensMinted(address indexed to, uint256 amount);
event TokensBurned(address indexed burner, uint256 amount);

// Treasury.sol
event ETHDeposited(address indexed sender, uint256 amount);
event ETHWithdrawn(address indexed recipient, uint256 amount);
event ERC20Deposited(address indexed token, address indexed sender, uint256 amount);
event ERC20Withdrawn(address indexed token, address indexed recipient, uint256 amount);
```

---

## 2. Dataset Registry Events

```solidity
event DatasetRegistered(
    uint256 indexed datasetId,
    address indexed owner,
    string cid,
    string name,
    uint256 defaultRoyaltyBps,
    uint256 timestamp
);

event DatasetUpdated(
    uint256 indexed datasetId,
    string name,
    string description,
    string metadataUri,
    uint256 timestamp
);

event DatasetCIDUpdated(
    uint256 indexed datasetId,
    string oldCid,
    string newCid,
    uint256 timestamp
);

event DatasetStatusChanged(
    uint256 indexed datasetId,
    bool isActive,
    uint256 timestamp
);

event DatasetOwnershipTransferred(
    uint256 indexed datasetId,
    address indexed previousOwner,
    address indexed newOwner,
    uint256 timestamp
);
```

---

## 3. License Registry Events

```solidity
event LicenseCreated(
    uint256 indexed licenseId,
    uint256 indexed assetId,
    address indexed licensor,
    Structs.LicenseType licenseType,
    Structs.PricingModel pricingModel,
    uint256 fixedPrice,
    uint256 royaltyBps,
    uint256 timestamp
);

event LicenseUpdated(
    uint256 indexed licenseId,
    uint256 version,
    uint256 fixedPrice,
    string metadataUri,
    uint256 timestamp
);

event LicenseRevoked(
    uint256 indexed licenseId,
    address indexed licensor,
    uint256 timestamp
);
```

---

## 4. Purchase Engine Events

```solidity
event DatasetPurchased(
    uint256 indexed purchaseId,
    uint256 indexed datasetId,
    address indexed buyer,
    uint256 licenseId,
    address licensor,
    uint256 price,
    uint256 platformFee,
    uint256 licensorShare,
    uint256 timestamp
);

event RoyaltyTriggered(
    uint256 indexed assetId,
    uint256 indexed licenseId,
    address indexed licensor,
    address buyer,
    uint256 royaltyAmount,
    uint256 timestamp
);

event PlatformFeeUpdated(
    uint256 oldFeeBps,
    uint256 newFeeBps,
    uint256 timestamp
);
```

---

## 5. Model Registry Events

```solidity
event ModelRegistered(
    uint256 indexed modelId,
    address indexed owner,
    string name,
    string metadataURI,
    string modelHash,
    uint256 initialVersion,
    uint256 createdAt
);

event ModelVersionAdded(
    uint256 indexed modelId,
    uint256 indexed versionNumber,
    string modelHash,
    string metadataURI,
    uint256 createdAt
);

event ModelStatusChanged(
    uint256 indexed modelId,
    bool active
);

event ModelOwnershipTransferred(
    uint256 indexed modelId,
    address indexed previousOwner,
    address indexed newOwner
);
```

