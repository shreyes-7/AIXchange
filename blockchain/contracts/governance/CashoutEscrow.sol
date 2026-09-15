// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ICashoutEscrow.sol";
import "../interfaces/IAIXToken.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";

/**
 * @title CashoutEscrow
 * @dev On-chain escrow contract for AIXchange creator cash-out settlements.
 * Locks creator AIX tokens while off-chain fiat payouts are processed.
 * Permanently burns tokens upon successful payout, or safely refunds tokens
 * back to the creator wallet if the bank payout fails.
 */
contract CashoutEscrow is Ownable, ReentrancyGuard, ICashoutEscrow {
    using SafeERC20 for IAIXToken;

    /// @notice Reference to the AIX token contract.
    IAIXToken public immutable aixToken;

    /// @dev Internal mapping from cashout ID to EscrowRecord.
    mapping(bytes32 => EscrowRecord) private _escrows;

    /**
     * @notice Initializes the CashoutEscrow contract.
     * @param aixTokenAddress Address of the deployed AIXToken contract.
     * @param initialOwner Address of contract administrator.
     */
    constructor(
        address aixTokenAddress,
        address initialOwner
    ) Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {
        if (aixTokenAddress == address(0)) {
            revert Errors.ZeroAddress();
        }
        aixToken = IAIXToken(aixTokenAddress);
    }

    /**
     * @notice Locks creator AIX tokens into escrow for a cashout request.
     * @dev Can be called by creator directly or by owner/relayer on creator's behalf with approval.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     * @param creator Address of the dataset creator requesting fiat cashout.
     * @param amount Amount of AIX tokens to lock into escrow.
     */
    function lockTokens(
        bytes32 cashoutId,
        address creator,
        uint256 amount
    ) external override nonReentrant {
        if (cashoutId == bytes32(0)) {
            revert Errors.ZeroAmount();
        }
        if (creator == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }

        if (_escrows[cashoutId].status != EscrowStatus.NONE) {
            revert Errors.EscrowAlreadyExists(cashoutId);
        }

        // Pull tokens from creator wallet into escrow contract
        aixToken.safeTransferFrom(creator, address(this), amount);

        _escrows[cashoutId] = EscrowRecord({
            cashoutId: cashoutId,
            creator: creator,
            tokenAmount: amount,
            timestamp: block.timestamp,
            status: EscrowStatus.LOCKED
        });

        emit Events.CashoutEscrowLocked(cashoutId, creator, amount);
    }

    /**
     * @notice Finalizes a successful fiat cashout by burning the escrowed AIX tokens.
     * @dev Restricted to contract owner (`onlyOwner`), called after bank payout confirms.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     */
    function completeAndBurn(
        bytes32 cashoutId
    ) external override onlyOwner nonReentrant {
        EscrowRecord storage record = _escrows[cashoutId];

        if (record.status == EscrowStatus.NONE) {
            revert Errors.EscrowNotFound(cashoutId);
        }
        if (record.status != EscrowStatus.LOCKED) {
            revert Errors.InvalidEscrowStatus(cashoutId, uint8(record.status));
        }

        record.status = EscrowStatus.BURNED;

        // Permanently burn the locked tokens from this escrow contract's balance
        aixToken.burn(record.tokenAmount);

        emit Events.CashoutEscrowBurned(cashoutId, record.creator, record.tokenAmount);
    }

    /**
     * @notice Releases escrowed AIX tokens back to the creator if the fiat payout fails.
     * @dev Restricted to contract owner (`onlyOwner`), called if bank payout fails or is rejected.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     */
    function releaseTokens(
        bytes32 cashoutId
    ) external override onlyOwner nonReentrant {
        EscrowRecord storage record = _escrows[cashoutId];

        if (record.status == EscrowStatus.NONE) {
            revert Errors.EscrowNotFound(cashoutId);
        }
        if (record.status != EscrowStatus.LOCKED) {
            revert Errors.InvalidEscrowStatus(cashoutId, uint8(record.status));
        }

        record.status = EscrowStatus.RELEASED;

        // Return tokens safely back to the creator wallet
        aixToken.safeTransfer(record.creator, record.tokenAmount);

        emit Events.CashoutEscrowReleased(cashoutId, record.creator, record.tokenAmount);
    }

    /**
     * @notice Returns the escrow record for a given cashout ID.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     * @return Full EscrowRecord struct.
     */
    function getEscrow(
        bytes32 cashoutId
    ) external view override returns (EscrowRecord memory) {
        EscrowRecord memory record = _escrows[cashoutId];
        if (record.status == EscrowStatus.NONE) {
            revert Errors.EscrowNotFound(cashoutId);
        }
        return record;
    }

    /**
     * @notice Returns the total AIX token balance held in escrow.
     * @return Total tokens locked in the escrow contract.
     */
    function getLockedBalance() external view override returns (uint256) {
        return aixToken.balanceOf(address(this));
    }
}
