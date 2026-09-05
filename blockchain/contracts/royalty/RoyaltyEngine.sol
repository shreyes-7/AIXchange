// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IRoyaltyEngine.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IPurchaseEngine.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";
import "../libraries/Structs.sol";

/**
 * @title RoyaltyEngine
 * @dev On-chain royalty settlement and revenue split engine for AIXchange.
 * Governs multi-party revenue splitting, platform treasury allocation,
 * atomic token distributions, duplicate prevention, and auditable accounting.
 */
contract RoyaltyEngine is Ownable, ReentrancyGuard, Pausable, IRoyaltyEngine {
    using SafeERC20 for IERC20;

    /// @notice Basis points denominator (10000 = 100.00%).
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Maximum allowable platform treasury fee in basis points (2000 = 20.00%).
    uint256 public constant MAX_TREASURY_FEE_BPS = 2000;

    /// @notice Maximum number of recipients in a single distribution to prevent gas exhaustion.
    uint256 public constant MAX_RECIPIENTS = 50;

    /// @notice Reference to the AIX utility token contract.
    IERC20 public immutable aixToken;

    /// @notice Reference to the Phase 6 PurchaseEngine contract (optional integration).
    IPurchaseEngine public immutable purchaseEngine;

    /// @notice Reference to the platform Treasury vault.
    ITreasury public treasury;

    /// @notice Default platform treasury fee in basis points (e.g. 250 = 2.50%).
    uint256 public defaultTreasuryFeeBps;

    /// @dev Internal auto-incrementing distribution ID counter.
    uint256 private _nextDistributionId;

    /// @dev Cumulative total AIX tokens distributed through the engine.
    uint256 private _totalDistributedAmount;

    /// @dev Cumulative total AIX tokens routed to platform Treasury.
    uint256 private _totalTreasuryDistributed;

    /// @dev Mapping from distribution ID to full DistributionRecord.
    mapping(uint256 => Structs.DistributionRecord) private _distributions;

    /// @dev Mapping from distribution ID to array of RecipientAllocations.
    mapping(uint256 => Structs.RecipientAllocation[]) private _distributionAllocations;

    /// @dev Mapping tracking whether a given sourceKey has already been distributed.
    mapping(bytes32 => bool) private _distributedSources;

    /// @dev Mapping from recipient address to cumulative AIX tokens received.
    mapping(address => uint256) private _recipientTotalClaimed;

    /**
     * @notice Initializes the RoyaltyEngine smart contract.
     * @param aixTokenAddress Address of the deployed AIXToken contract.
     * @param treasuryAddress Address of the platform Treasury vault.
     * @param purchaseEngineAddress Address of the Phase 6 PurchaseEngine contract (optional, can be address(0)).
     * @param initialTreasuryFeeBps Initial platform treasury fee in basis points (max 2000 = 20.00%).
     * @param initialOwner Address assigned as initial contract owner/administrator.
     */
    constructor(
        address aixTokenAddress,
        address treasuryAddress,
        address purchaseEngineAddress,
        uint256 initialTreasuryFeeBps,
        address initialOwner
    ) Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {
        if (aixTokenAddress == address(0) || treasuryAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (initialTreasuryFeeBps > MAX_TREASURY_FEE_BPS) {
            revert Errors.TreasuryFeeExceedsMax(initialTreasuryFeeBps, MAX_TREASURY_FEE_BPS);
        }

        aixToken = IERC20(aixTokenAddress);
        treasury = ITreasury(treasuryAddress);
        purchaseEngine = IPurchaseEngine(purchaseEngineAddress);
        defaultTreasuryFeeBps = initialTreasuryFeeBps;

        _nextDistributionId = 1;
    }

    /**
     * @notice Distributes revenue across multiple recipients and platform Treasury.
     * @dev Pulls `totalRevenue` AIX tokens from `msg.sender` and atomically transfers allocations.
     * @param sourceType Revenue source category (PURCHASE, DERIVATIVE, INFERENCE, DIRECT).
     * @param sourceId Source reference identifier (e.g. purchaseId, modelId).
     * @param totalRevenue Total AIX token amount to distribute (in wei units).
     * @param recipients Array of recipient addresses and basis point shares.
     * @return distributionId Unique sequential identifier assigned to this distribution.
     */
    function distributeRoyalty(
        Structs.RoyaltySourceType sourceType,
        uint256 sourceId,
        uint256 totalRevenue,
        Structs.RecipientShare[] calldata recipients
    ) external override nonReentrant whenNotPaused returns (uint256 distributionId) {
        return _executeDistribution(sourceType, sourceId, totalRevenue, recipients);
    }

    /**
     * @notice Distributes downstream or secondary royalties for a verified Phase 6 purchase.
     * @dev Validates that purchaseId exists in PurchaseEngine and has not yet been distributed.
     * @param purchaseId Unique purchase record ID from PurchaseEngine.
     * @param recipients Array of recipient addresses and basis point shares.
     * @return distributionId Unique sequential identifier assigned to this distribution.
     */
    function distributePurchaseRoyalty(
        uint256 purchaseId,
        Structs.RecipientShare[] calldata recipients
    ) external override nonReentrant whenNotPaused returns (uint256 distributionId) {
        if (address(purchaseEngine) == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (purchaseId == 0) {
            revert Errors.PurchaseNotFound(purchaseId);
        }

        Structs.PurchaseRecord memory purchase = purchaseEngine.getPurchase(purchaseId);
        if (!purchase.active) {
            revert Errors.PurchaseNotFound(purchaseId);
        }

        uint256 distributableRevenue = purchase.licensorAmount;
        if (distributableRevenue == 0) {
            revert Errors.ZeroAmount();
        }

        return _executeDistribution(
            Structs.RoyaltySourceType.PURCHASE,
            purchaseId,
            distributableRevenue,
            recipients
        );
    }

    /**
     * @dev Internal distribution execution engine enforcing checks-effects-interactions and atomicity.
     */
    function _executeDistribution(
        Structs.RoyaltySourceType sourceType,
        uint256 sourceId,
        uint256 totalRevenue,
        Structs.RecipientShare[] calldata recipients
    ) internal returns (uint256 distributionId) {
        if (totalRevenue == 0) {
            revert Errors.ZeroAmount();
        }
        if (recipients.length == 0) {
            revert Errors.InvalidShareAllocation(0);
        }
        if (recipients.length > MAX_RECIPIENTS) {
            revert Errors.ExceedsMaxRecipients(recipients.length, MAX_RECIPIENTS);
        }

        // Generate composite source key for double-distribution protection
        bytes32 sourceKey;
        if (sourceType == Structs.RoyaltySourceType.DIRECT && sourceId == 0) {
            sourceKey = keccak256(abi.encodePacked(sourceType, _nextDistributionId, msg.sender));
        } else {
            sourceKey = keccak256(abi.encodePacked(sourceType, sourceId));
            if (_distributedSources[sourceKey]) {
                revert Errors.DistributionAlreadyCompleted(sourceKey);
            }
            _distributedSources[sourceKey] = true;
        }

        // Calculate allocations & validate recipients
        (
            uint256 treasuryAmount,
            uint256[] memory recipientAmounts,
            
        ) = calculateSplit(totalRevenue, defaultTreasuryFeeBps, recipients);

        // Record State (Checks-Effects)
        distributionId = _nextDistributionId;
        _nextDistributionId++;

        _distributions[distributionId] = Structs.DistributionRecord({
            distributionId: distributionId,
            sourceKey: sourceKey,
            sourceType: sourceType,
            sourceId: sourceId,
            payer: msg.sender,
            totalRevenue: totalRevenue,
            treasuryAmount: treasuryAmount,
            recipientCount: recipients.length,
            status: Structs.DistributionStatus.DISTRIBUTED,
            timestamp: block.timestamp
        });

        _totalDistributedAmount += totalRevenue;
        _totalTreasuryDistributed += treasuryAmount;

        for (uint256 i = 0; i < recipients.length; i++) {
            _distributionAllocations[distributionId].push(
                Structs.RecipientAllocation({
                    recipient: recipients[i].recipient,
                    shareBps: recipients[i].shareBps,
                    amount: recipientAmounts[i],
                    paid: true
                })
            );
            _recipientTotalClaimed[recipients[i].recipient] += recipientAmounts[i];
        }

        emit Events.DistributionCreated(
            distributionId,
            sourceKey,
            uint8(sourceType),
            sourceId,
            msg.sender,
            totalRevenue
        );

        // Execute Token Transfers (Interactions)
        // 1. Pull total revenue from payer
        aixToken.safeTransferFrom(msg.sender, address(this), totalRevenue);

        // 2. Pay each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipientAmounts[i] > 0) {
                aixToken.safeTransfer(recipients[i].recipient, recipientAmounts[i]);
            }
            emit Events.RecipientPaid(
                distributionId,
                recipients[i].recipient,
                recipientAmounts[i],
                recipients[i].shareBps
            );
        }

        // 3. Pay platform Treasury
        if (treasuryAmount > 0) {
            aixToken.safeTransfer(address(treasury), treasuryAmount);
            uint256 effectiveTreasuryBps = (treasuryAmount * BPS_DENOMINATOR) / totalRevenue;
            emit Events.TreasuryPaid(
                distributionId,
                address(treasury),
                treasuryAmount,
                effectiveTreasuryBps
            );
        }

        emit Events.DistributionCompleted(
            distributionId,
            totalRevenue,
            recipients.length,
            block.timestamp
        );
    }

    /**
     * @notice Simulates/previews a revenue split calculation without executing state changes.
     * @param totalRevenue Total AIX token amount to be split.
     * @param treasuryFeeBps Platform treasury fee in basis points (10000 = 100%).
     * @param recipients Array of recipient shares.
     * @return treasuryAmount Total amount allocated to the platform Treasury (including rounding remainder).
     * @return recipientAmounts Array of amounts allocated to each respective recipient.
     * @return remainder Rounding remainder from integer division added to the treasury allocation.
     */
    function calculateSplit(
        uint256 totalRevenue,
        uint256 treasuryFeeBps,
        Structs.RecipientShare[] calldata recipients
    )
        public
        pure
        override
        returns (
            uint256 treasuryAmount,
            uint256[] memory recipientAmounts,
            uint256 remainder
        )
    {
        if (totalRevenue == 0) {
            revert Errors.ZeroAmount();
        }
        if (recipients.length == 0) {
            revert Errors.InvalidShareAllocation(0);
        }
        if (recipients.length > MAX_RECIPIENTS) {
            revert Errors.ExceedsMaxRecipients(recipients.length, MAX_RECIPIENTS);
        }

        uint256 totalRecipientBps = 0;
        recipientAmounts = new uint256[](recipients.length);
        uint256 sumRecipientAmounts = 0;

        // Recipient validation and duplicate detection
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i].recipient;
            if (recipient == address(0)) {
                revert Errors.InvalidRecipient(address(0));
            }
            if (recipients[i].shareBps == 0) {
                revert Errors.InvalidShareAllocation(0);
            }

            // Check duplicate recipients
            for (uint256 j = 0; j < i; j++) {
                if (recipients[j].recipient == recipient) {
                    revert Errors.DuplicateRecipient(recipient);
                }
            }

            totalRecipientBps += recipients[i].shareBps;
            uint256 amount = (totalRevenue * recipients[i].shareBps) / BPS_DENOMINATOR;
            recipientAmounts[i] = amount;
            sumRecipientAmounts += amount;
        }

        if (totalRecipientBps + treasuryFeeBps > BPS_DENOMINATOR) {
            revert Errors.InvalidShareAllocation(totalRecipientBps + treasuryFeeBps);
        }

        // Strict Accounting Invariant:
        // treasuryAmount absorbs the configured treasury share + any integer division remainder
        treasuryAmount = totalRevenue - sumRecipientAmounts;

        uint256 nominalTreasuryAmount = (totalRevenue * treasuryFeeBps) / BPS_DENOMINATOR;
        if (treasuryAmount >= nominalTreasuryAmount) {
            remainder = treasuryAmount - nominalTreasuryAmount;
        } else {
            remainder = 0;
        }
    }

    /**
     * @notice Retrieves the full record of a completed distribution.
     * @param distributionId Unique identifier of the distribution.
     * @return record Struct containing the distribution record metadata.
     */
    function getDistribution(
        uint256 distributionId
    ) external view override returns (Structs.DistributionRecord memory record) {
        if (distributionId == 0 || distributionId >= _nextDistributionId) {
            revert Errors.DistributionNotFound(distributionId);
        }
        return _distributions[distributionId];
    }

    /**
     * @notice Retrieves the detailed recipient allocations for a given distribution.
     * @param distributionId Unique identifier of the distribution.
     * @return allocations Array of recipient payout allocations.
     */
    function getDistributionAllocations(
        uint256 distributionId
    ) external view override returns (Structs.RecipientAllocation[] memory allocations) {
        if (distributionId == 0 || distributionId >= _nextDistributionId) {
            revert Errors.DistributionNotFound(distributionId);
        }
        return _distributionAllocations[distributionId];
    }

    /**
     * @notice Checks whether a given revenue source has already been distributed.
     * @param sourceType Revenue source category.
     * @param sourceId Source reference identifier.
     * @return distributed True if revenue from this source has already been distributed.
     */
    function isSourceDistributed(
        Structs.RoyaltySourceType sourceType,
        uint256 sourceId
    ) external view override returns (bool distributed) {
        bytes32 sourceKey = keccak256(abi.encodePacked(sourceType, sourceId));
        return _distributedSources[sourceKey];
    }

    /**
     * @notice Returns the total count of completed distributions on-chain.
     * @return total Total number of distributions.
     */
    function getTotalDistributions() external view override returns (uint256 total) {
        return _nextDistributionId - 1;
    }

    /**
     * @notice Returns the cumulative total amount of AIX tokens distributed through the engine.
     * @return totalAmount Total cumulative tokens distributed.
     */
    function getTotalDistributedAmount() external view override returns (uint256 totalAmount) {
        return _totalDistributedAmount;
    }

    /**
     * @notice Returns the cumulative total amount routed to the platform Treasury.
     * @return totalTreasury Total cumulative tokens routed to Treasury.
     */
    function getTotalTreasuryDistributed() external view override returns (uint256 totalTreasury) {
        return _totalTreasuryDistributed;
    }

    /**
     * @notice Returns the cumulative amount of AIX tokens claimed/received by a specific recipient.
     * @param recipient Address of the recipient account.
     * @return totalReceived Total cumulative tokens received by recipient.
     */
    function getRecipientTotalClaimed(
        address recipient
    ) external view override returns (uint256 totalReceived) {
        if (recipient == address(0)) {
            revert Errors.ZeroAddress();
        }
        return _recipientTotalClaimed[recipient];
    }

    /**
     * @notice Returns the default platform treasury fee in basis points (e.g. 250 = 2.50%).
     * @return feeBps Default treasury fee in basis points.
     */
    function getDefaultTreasuryFeeBps() external view override returns (uint256 feeBps) {
        return defaultTreasuryFeeBps;
    }

    /**
     * @notice Returns the address of the platform Treasury vault.
     * @return treasuryAddress Address of the Treasury contract.
     */
    function getTreasury() external view override returns (address treasuryAddress) {
        return address(treasury);
    }

    /**
     * @notice Returns the address of the AIX utility token contract.
     * @return token Address of the AIXToken contract.
     */
    function getAixToken() external view override returns (address token) {
        return address(aixToken);
    }

    /**
     * @notice Returns the address of the Phase 6 PurchaseEngine contract.
     * @return engine Address of the PurchaseEngine contract.
     */
    function getPurchaseEngine() external view override returns (address engine) {
        return address(purchaseEngine);
    }

    /**
     * @notice Updates the platform Treasury vault address.
     * @dev Restricted to contract owner.
     * @param newTreasury New address of the Treasury contract.
     */
    function setTreasury(address newTreasury) external override onlyOwner {
        if (newTreasury == address(0)) {
            revert Errors.ZeroAddress();
        }
        address oldTreasury = address(treasury);
        treasury = ITreasury(newTreasury);
        emit Events.TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Updates the default platform treasury fee in basis points.
     * @dev Restricted to contract owner.
     * @param newFeeBps New default fee in basis points (max 2000 = 20.00%).
     */
    function setDefaultTreasuryFeeBps(uint256 newFeeBps) external override onlyOwner {
        if (newFeeBps > MAX_TREASURY_FEE_BPS) {
            revert Errors.TreasuryFeeExceedsMax(newFeeBps, MAX_TREASURY_FEE_BPS);
        }
        uint256 oldFee = defaultTreasuryFeeBps;
        defaultTreasuryFeeBps = newFeeBps;
        emit Events.TreasuryFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Pauses distribution operations in an emergency.
     * @dev Restricted to contract owner.
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @notice Resumes distribution operations.
     * @dev Restricted to contract owner.
     */
    function unpause() external override onlyOwner {
        _unpause();
    }
}