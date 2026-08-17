// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IPurchaseEngine.sol";
import "../interfaces/IDatasetRegistry.sol";
import "../interfaces/ILicenseRegistry.sol";
import "../interfaces/ITreasury.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title PurchaseEngine
 * @dev On-chain decentralized purchase settlement engine for AIXchange.
 * Handles dataset license purchases, AIX token settlement, platform fee routing to Treasury,
 * creator royalty triggers, exclusivity enforcement, and buyer entitlement tracking.
 */
contract PurchaseEngine is Ownable, ReentrancyGuard, Pausable, IPurchaseEngine {
    using SafeERC20 for IERC20;

    /// @notice Maximum allowable platform fee in basis points (1000 = 10.00%).
    uint256 public constant MAX_FEE_BPS = 1000;

    /// @notice Basis points denominator (10000 = 100.00%).
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Reference to the AIX utility token contract.
    IERC20 public immutable aixToken;

    /// @notice Reference to the Phase 4 DatasetRegistry contract.
    IDatasetRegistry public immutable datasetRegistry;

    /// @notice Reference to the Phase 5 LicenseRegistry contract.
    ILicenseRegistry public immutable licenseRegistry;

    /// @notice Reference to the platform Treasury vault.
    ITreasury public immutable treasury;

    /// @notice Current platform fee in basis points (e.g. 250 = 2.50%).
    uint256 public platformFeeBps;

    /// @dev Internal auto-incrementing purchase ID counter.
    uint256 private _nextPurchaseId;

    /// @dev Mapping from purchase ID to full PurchaseRecord.
    mapping(uint256 => Structs.PurchaseRecord) private _purchases;

    /// @dev Mapping from buyer address to array of purchase IDs.
    mapping(address => uint256[]) private _buyerPurchases;

    /// @dev Mapping from dataset ID to array of purchase IDs.
    mapping(uint256 => uint256[]) private _datasetPurchases;

    /// @dev Mapping from buyer => datasetId => licenseId => access entitlement boolean.
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) private _accessEntitlements;

    /// @dev Mapping tracking whether an exclusive license has already been purchased.
    mapping(uint256 => bool) private _exclusiveLicensesSold;

    /**
     * @notice Initializes the PurchaseEngine contract.
     * @param aixTokenAddress Address of the deployed AIXToken contract.
     * @param datasetRegistryAddress Address of the deployed DatasetRegistry contract.
     * @param licenseRegistryAddress Address of the deployed LicenseRegistry contract.
     * @param treasuryAddress Address of the platform Treasury vault.
     * @param initialFeeBps Initial platform fee in basis points (e.g. 250 = 2.50%).
     * @param initialOwner Address of contract administrator.
     */
    constructor(
        address aixTokenAddress,
        address datasetRegistryAddress,
        address licenseRegistryAddress,
        address treasuryAddress,
        uint256 initialFeeBps,
        address initialOwner
    ) Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {
        if (
            aixTokenAddress == address(0) ||
            datasetRegistryAddress == address(0) ||
            licenseRegistryAddress == address(0) ||
            treasuryAddress == address(0)
        ) {
            revert Errors.ZeroAddress();
        }

        if (initialFeeBps > MAX_FEE_BPS) {
            revert Errors.InvalidFeeRate(initialFeeBps);
        }

        aixToken = IERC20(aixTokenAddress);
        datasetRegistry = IDatasetRegistry(datasetRegistryAddress);
        licenseRegistry = ILicenseRegistry(licenseRegistryAddress);
        treasury = ITreasury(treasuryAddress);

        platformFeeBps = initialFeeBps;
        _nextPurchaseId = 1;
    }

    /**
     * @notice Executes the purchase of an AI dataset license using AIX tokens.
     * @param datasetId Unique identifier of the target dataset.
     * @param licenseId Unique identifier of the license to purchase.
     * @return purchaseId Unique assigned identifier for this purchase transaction.
     */
    function purchaseDataset(
        uint256 datasetId,
        uint256 licenseId
    ) external override nonReentrant whenNotPaused returns (uint256 purchaseId) {
        if (datasetId == 0) {
            revert Errors.InvalidAsset(datasetId);
        }
        if (licenseId == 0) {
            revert Errors.LicenseNotFound(licenseId);
        }

        // 1. Validate Dataset
        Structs.Dataset memory dataset = datasetRegistry.getDataset(datasetId);
        if (!dataset.active) {
            revert Errors.DatasetInactive(datasetId);
        }

        address licensor = dataset.owner;
        if (msg.sender == licensor) {
            revert Errors.SelfPurchaseNotAllowed(msg.sender);
        }

        // 2. Validate License
        Structs.License memory license = licenseRegistry.getLicense(licenseId);
        if (
            license.assetId != datasetId ||
            license.assetType != Structs.AssetType.DATASET
        ) {
            revert Errors.InvalidLicenseForAsset(licenseId, datasetId);
        }

        if (!licenseRegistry.isLicenseActive(licenseId)) {
            revert Errors.LicenseInactive(licenseId);
        }

        // 3. Enforce Exclusivity
        if (license.licenseType == Structs.LicenseType.EXCLUSIVE) {
            if (_exclusiveLicensesSold[licenseId]) {
                revert Errors.ExclusiveLicenseSold(licenseId);
            }
            _exclusiveLicensesSold[licenseId] = true;
        }

        // 4. Enforce Duplicate Purchase Rules
        if (_accessEntitlements[msg.sender][datasetId][licenseId]) {
            revert Errors.AlreadyPurchased(msg.sender, datasetId, licenseId);
        }

        // 5. Authoritative On-Chain Price Validation
        (
            Structs.PricingModel pricingModel,
            uint256 fixedPrice,
            
        ) = licenseRegistry.getLicensePricing(licenseId);

        uint256 price;
        if (pricingModel == Structs.PricingModel.FIXED) {
            if (fixedPrice == 0) {
                revert Errors.InvalidFixedPrice();
            }
            price = fixedPrice;
        } else {
            // For ROYALTY pricing model, fixedPrice must be set or fallback to configured terms
            if (license.fixedPrice > 0) {
                price = license.fixedPrice;
            } else {
                revert Errors.InvalidFixedPrice();
            }
        }

        // 6. Calculate Platform Fee & Licensor Share
        uint256 feeAmount = (price * platformFeeBps) / BPS_DENOMINATOR;
        uint256 licensorAmount = price - feeAmount;

        // 7. Verify Balance & Allowance
        uint256 buyerBalance = aixToken.balanceOf(msg.sender);
        if (buyerBalance < price) {
            revert Errors.InsufficientBalance(buyerBalance, price);
        }

        uint256 buyerAllowance = aixToken.allowance(msg.sender, address(this));
        if (buyerAllowance < price) {
            revert Errors.InsufficientBalance(buyerAllowance, price);
        }

        // 8. Record State (Checks-Effects-Interactions)
        purchaseId = _nextPurchaseId;
        _nextPurchaseId++;

        _purchases[purchaseId] = Structs.PurchaseRecord({
            purchaseId: purchaseId,
            assetId: datasetId,
            assetType: Structs.AssetType.DATASET,
            licenseId: licenseId,
            buyer: msg.sender,
            licensor: licensor,
            price: price,
            feeAmount: feeAmount,
            licensorAmount: licensorAmount,
            timestamp: block.timestamp,
            active: true
        });

        _buyerPurchases[msg.sender].push(purchaseId);
        _datasetPurchases[datasetId].push(purchaseId);
        _accessEntitlements[msg.sender][datasetId][licenseId] = true;

        // 9. Execute Payments
        if (feeAmount > 0) {
            aixToken.safeTransferFrom(msg.sender, address(treasury), feeAmount);
        }
        aixToken.safeTransferFrom(msg.sender, licensor, licensorAmount);

        // 10. Emit Events for Backend Indexer & Royalty Triggers
        emit Events.DatasetPurchased(
            purchaseId,
            datasetId,
            licenseId,
            msg.sender,
            licensor,
            price,
            feeAmount,
            licensorAmount,
            block.timestamp
        );

        emit Events.RoyaltyTriggered(
            purchaseId,
            datasetId,
            licenseId,
            licensor,
            licensorAmount,
            feeAmount,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves the full record of a completed purchase.
     * @param purchaseId Unique identifier of the purchase record.
     * @return record Struct containing the purchase metadata.
     */
    function getPurchase(
        uint256 purchaseId
    ) external view override returns (Structs.PurchaseRecord memory record) {
        if (purchaseId == 0 || purchaseId >= _nextPurchaseId) {
            revert Errors.PurchaseNotFound(purchaseId);
        }
        return _purchases[purchaseId];
    }

    /**
     * @notice Retrieves all purchase IDs associated with a specific buyer.
     * @param buyer Address of the buyer.
     * @return purchaseIds Array of purchase record IDs.
     */
    function getPurchasesByBuyer(
        address buyer
    ) external view override returns (uint256[] memory purchaseIds) {
        if (buyer == address(0)) {
            revert Errors.ZeroAddress();
        }
        return _buyerPurchases[buyer];
    }

    /**
     * @notice Retrieves all purchase IDs associated with a specific dataset.
     * @param datasetId Unique identifier of the dataset.
     * @return purchaseIds Array of purchase record IDs.
     */
    function getPurchasesByDataset(
        uint256 datasetId
    ) external view override returns (uint256[] memory purchaseIds) {
        if (datasetId == 0) {
            revert Errors.InvalidAsset(datasetId);
        }
        return _datasetPurchases[datasetId];
    }

    /**
     * @notice Checks whether an address holds valid, active access entitlement for a dataset license.
     * @param buyer Address of the user/account.
     * @param datasetId Unique identifier of the dataset.
     * @param licenseId Unique identifier of the license.
     * @return granted Boolean indicating if active access is granted.
     */
    function hasAccess(
        address buyer,
        uint256 datasetId,
        uint256 licenseId
    ) external view override returns (bool granted) {
        if (buyer == address(0) || datasetId == 0 || licenseId == 0) {
            return false;
        }

        // Dataset owner always has natural access
        address datasetOwner = datasetRegistry.getDatasetOwner(datasetId);
        if (buyer == datasetOwner) {
            return true;
        }

        // Check if buyer has an entitlement and license is still active
        if (_accessEntitlements[buyer][datasetId][licenseId]) {
            return licenseRegistry.isLicenseActive(licenseId);
        }

        return false;
    }

    /**
     * @notice Returns the total count of completed purchases on-chain.
     * @return total Total number of purchases.
     */
    function getTotalPurchases() external view override returns (uint256 total) {
        return _nextPurchaseId - 1;
    }

    /**
     * @notice Checks if an exclusive license has already been purchased and locked.
     * @param licenseId Unique identifier of the license.
     * @return sold Boolean indicating if the exclusive license is already sold.
     */
    function isExclusiveLicenseSold(
        uint256 licenseId
    ) external view override returns (bool sold) {
        return _exclusiveLicensesSold[licenseId];
    }

    /**
     * @notice Returns the current platform fee in basis points (e.g. 250 = 2.50%).
     * @return feeBps Platform fee basis points.
     */
    function getPlatformFee() external view override returns (uint256 feeBps) {
        return platformFeeBps;
    }

    /**
     * @notice Updates the platform fee in basis points.
     * @dev Restricted to contract owner (`onlyOwner`).
     * @param newFeeBps New platform fee in basis points (max 1000 = 10.00%).
     */
    function setPlatformFee(uint256 newFeeBps) external override onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) {
            revert Errors.InvalidFeeRate(newFeeBps);
        }
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit Events.PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Pauses purchase operations in an emergency.
     * @dev Restricted to contract owner (`onlyOwner`).
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resumes purchase operations.
     * @dev Restricted to contract owner (`onlyOwner`).
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
