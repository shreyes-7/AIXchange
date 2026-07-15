# Blockchain Module

The blockchain module contains the smart contracts and deployment tooling for AIXchange.

## Purpose

- define marketplace and royalty logic in Solidity
- manage token and ownership contracts
- support deployment and testing with Hardhat

## How to Run

```bash
cd blockchain
npm install
npx hardhat test
```

## Important Folders

- contracts/: Solidity smart contracts
- scripts/: deployment and helper scripts
- test/: contract tests

## Commands

- npx hardhat compile
- npx hardhat test
- npx hardhat node

## Dependencies

The blockchain stack uses Hardhat, Ethers.js, Solidity, and OpenZeppelin contracts.

