// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITreasury
 * @dev Interface for the AIXchange platform Treasury.
 */
interface ITreasury {
    /**
     * @notice Withdraws ERC20 tokens held in the treasury to a recipient.
     * @param token Address of the ERC20 token to withdraw.
     * @param to Recipient address.
     * @param amount Amount of tokens to withdraw.
     */
    function withdrawToken(address token, address to, uint256 amount) external;

    /**
     * @notice Withdraws native ETH held in the treasury to a recipient.
     * @param to Recipient address.
     * @param amount Amount of ETH in wei to withdraw.
     */
    function withdrawETH(address payable to, uint256 amount) external;

    /**
     * @notice Returns the treasury balance of a specific ERC20 token.
     * @param token Address of the ERC20 token.
     * @return Balance of the token held by the treasury.
     */
    function getTokenBalance(address token) external view returns (uint256);

    /**
     * @notice Returns the treasury balance of native ETH.
     * @return Balance of ETH in wei held by the treasury.
     */
    function getETHBalance() external view returns (uint256);
}
