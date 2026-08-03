// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * ============================================================================
 * AIXchange - Access Control
 * ----------------------------------------------------------------------------
 * Base contract providing role-based authorization.
 *
 * Roles:
 *  - Owner
 *  - Admin
 * ============================================================================
 */

abstract contract AccessControl {
    address public owner;

    mapping(address => bool) private admins;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    event AdminAdded(address indexed admin);

    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == owner || admins[msg.sender],
            "Only admin"
        );
        _;
    }

    constructor() {
        owner = msg.sender;

        emit OwnershipTransferred(address(0), owner);
    }

    /**
     * ------------------------------------------------------------------------
     * Transfer ownership
     * ------------------------------------------------------------------------
     */
    function transferOwnership(
        address newOwner
    ) external onlyOwner {
        require(
            newOwner != address(0),
            "Invalid owner"
        );

        emit OwnershipTransferred(owner, newOwner);

        owner = newOwner;
    }

    /**
     * ------------------------------------------------------------------------
     * Add admin
     * ------------------------------------------------------------------------
     */
    function addAdmin(
        address account
    ) external onlyOwner {
        require(
            account != address(0),
            "Invalid address"
        );

        admins[account] = true;

        emit AdminAdded(account);
    }

    /**
     * ------------------------------------------------------------------------
     * Remove admin
     * ------------------------------------------------------------------------
     */
    function removeAdmin(
        address account
    ) external onlyOwner {
        admins[account] = false;

        emit AdminRemoved(account);
    }

    /**
     * ------------------------------------------------------------------------
     * Check admin
     * ------------------------------------------------------------------------
     */
    function isAdmin(
        address account
    ) public view returns (bool) {
        return account == owner || admins[account];
    }
}