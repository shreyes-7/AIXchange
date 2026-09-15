// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICashoutEscrow
 * @dev Interface for the AIXchange creator cash-out escrow smart contract.
 */
interface ICashoutEscrow {
    enum EscrowStatus {
        NONE,
        LOCKED,
        RELEASED,
        BURNED
    }

    struct EscrowRecord {
        bytes32 cashoutId;
        address creator;
        uint256 tokenAmount;
        uint256 timestamp;
        EscrowStatus status;
    }

    /**
     * @notice Locks creator AIX tokens into escrow for a cashout request.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     * @param creator Address of the dataset creator requesting fiat cashout.
     * @param amount Amount of AIX tokens to lock into escrow.
     */
    function lockTokens(
        bytes32 cashoutId,
        address creator,
        uint256 amount
    ) external;

    /**
     * @notice Finalizes a successful fiat cashout by burning the escrowed AIX tokens.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     */
    function completeAndBurn(bytes32 cashoutId) external;

    /**
     * @notice Releases escrowed AIX tokens back to the creator if the fiat payout fails.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     */
    function releaseTokens(bytes32 cashoutId) external;

    /**
     * @notice Returns the escrow record for a given cashout ID.
     * @param cashoutId Unique 32-byte identifier for the cashout request.
     * @return Full EscrowRecord struct.
     */
    function getEscrow(bytes32 cashoutId) external view returns (EscrowRecord memory);

    /**
     * @notice Returns the total AIX token balance held in escrow.
     * @return Total tokens locked in the escrow contract.
     */
    function getLockedBalance() external view returns (uint256);
}
