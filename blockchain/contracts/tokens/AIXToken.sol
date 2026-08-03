// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAIXToken.sol";
import "../libraries/Errors.sol";
import "../libraries/Events.sol";

/**
 * @title AIXToken
 * @dev Implementation of the native ERC20 utility token for the AIXchange platform.
 * Inherits OpenZeppelin ERC20, ERC20Burnable, and Ownable.
 */
contract AIXToken is ERC20, ERC20Burnable, Ownable, IAIXToken {
    /**
     * @notice Initializes the AIXchange Token contract.
     * @param initialSupply Initial token amount to mint (in wei / 10**18 units).
     * @param initialOwner Address of the contract owner and recipient of initial supply.
     */
    constructor(
        uint256 initialSupply,
        address initialOwner
    ) ERC20("AIXchange Token", "AIX") Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {
        address recipient = initialOwner == address(0) ? msg.sender : initialOwner;
        if (initialSupply > 0) {
            _mint(recipient, initialSupply);
            emit Events.TokensMinted(recipient, initialSupply);
        }
    }

    /**
     * @notice Mints new AIX tokens to a target recipient address.
     * @dev Restricted to contract owner (`onlyOwner`).
     * @param to Recipient address for newly minted tokens.
     * @param amount Amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external override onlyOwner {
        if (to == address(0)) {
            revert Errors.ZeroAddress();
        }
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }
        _mint(to, amount);
        emit Events.TokensMinted(to, amount);
    }

    /**
     * @notice Burns AIX tokens from caller's balance.
     * @param amount Amount of tokens to burn.
     */
    function burn(uint256 amount) public override(ERC20Burnable, IAIXToken) {
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }
        super.burn(amount);
        emit Events.TokensBurned(msg.sender, amount);
    }

    /**
     * @notice Burns AIX tokens from account balance using caller allowance.
     * @param account Target account to burn tokens from.
     * @param amount Amount of tokens to burn.
     */
    function burnFrom(address account, uint256 amount) public override(ERC20Burnable, IAIXToken) {
        if (amount == 0) {
            revert Errors.ZeroAmount();
        }
        super.burnFrom(account, amount);
        emit Events.TokensBurned(account, amount);
    }
}