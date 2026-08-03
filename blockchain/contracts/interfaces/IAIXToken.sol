// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IAIXToken
 * @dev Interface for the AIXchange utility token (AIX).
 */
interface IAIXToken is IERC20 {
    /**
     * @notice Mints new AIX tokens to a target address.
     * @param to The recipient address.
     * @param amount The number of tokens to mint.
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Burns AIX tokens from the caller's balance.
     * @param amount The number of tokens to burn.
     */
    function burn(uint256 amount) external;

    /**
     * @notice Burns AIX tokens from a target address using caller allowance.
     * @param account The account to burn tokens from.
     * @param amount The number of tokens to burn.
     */
    function burnFrom(address account, uint256 amount) external;
}
