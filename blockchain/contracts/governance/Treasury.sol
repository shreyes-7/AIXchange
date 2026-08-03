// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITreasury.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";

/**
 * @title Treasury
 * @dev Secure treasury vault smart contract for AIXchange. Holds AIX tokens and ETH,
 * enforcing access controls for withdrawals and logging all transaction activities.
 */
contract Treasury is Ownable, ITreasury {
    using SafeERC20 for IERC20;

    /**
     * @notice Initializes the Treasury contract.
     * @param initialOwner Address assigned as initial owner of the treasury vault.
     */
    constructor(
        address initialOwner
    ) Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {}

    /**
     * @notice Receive function to accept native ETH deposits.
     */
    receive() external payable {
        emit Events.ETHDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Fallback function to accept native ETH deposits.
     */
    fallback() external payable {
        if (msg.value > 0) {
            emit Events.ETHDeposited(msg.sender, msg.value);
        }
    }

    /**
     * @notice Withdraws ERC20 tokens held in the treasury to a recipient address.
     * @dev Restricted to contract owner (`onlyOwner`).
     * @param token Address of the ERC20 token to withdraw.
     * @param to Recipient address.
     * @param amount Amount of tokens to withdraw.
     */
    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external override onlyOwner {
        if (token == address(0) || to == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }

        uint256 currentBalance = IERC20(token).balanceOf(address(this));
        if (currentBalance < amount) {
            revert Errors.InsufficientBalance(currentBalance, amount);
        }

        IERC20(token).safeTransfer(to, amount);
        emit Events.TokenWithdrawn(token, to, amount);
    }

    /**
     * @notice Withdraws native ETH held in the treasury to a recipient address.
     * @dev Restricted to contract owner (`onlyOwner`).
     * @param to Recipient address.
     * @param amount Amount of ETH in wei to withdraw.
     */
    function withdrawETH(
        address payable to,
        uint256 amount
    ) external override onlyOwner {
        if (to == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }

        uint256 currentBalance = address(this).balance;
        if (currentBalance < amount) {
            revert Errors.InsufficientBalance(currentBalance, amount);
        }

        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert Errors.TransferFailed();
        }

        emit Events.ETHWithdrawn(to, amount);
    }

    /**
     * @notice Returns the treasury balance of a specific ERC20 token.
     * @param token Address of the ERC20 token.
     * @return Balance of tokens held by the treasury.
     */
    function getTokenBalance(address token) external view override returns (uint256) {
        if (token == address(0)) {
            revert Errors.ZeroAddress();
        }
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Returns the treasury balance of native ETH.
     * @return Balance of ETH in wei held by the treasury.
     */
    function getETHBalance() external view override returns (uint256) {
        return address(this).balance;
    }
}