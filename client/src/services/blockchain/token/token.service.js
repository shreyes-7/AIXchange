/**
 * ============================================================================
 * AIXchange - AIX Token Frontend Blockchain Service
 * ----------------------------------------------------------------------------
 * Service layer for interacting with the AIXchange (AIX) ERC20 smart contract.
 * Standardized for use with ethers.js v6.
 * ============================================================================
 */

import { ethers } from "ethers";
import { AIX_TOKEN_ABI } from "./token.abi.js";

let cachedContract = null;

/**
 * Initializes and returns an ethers Contract instance for AIX Token.
 * @param {string} contractAddress - Address of deployed AIXToken contract.
 * @param {ethers.ContractRunner} runner - Ethers Signer or Provider instance.
 * @returns {ethers.Contract} Configured Contract instance.
 */
export function initializeContract(contractAddress, runner) {
  if (!contractAddress) {
    throw new Error("Contract address is required to initialize AIX Token service.");
  }
  if (!runner) {
    throw new Error("Contract runner (Signer or Provider) is required to initialize AIX Token service.");
  }
  cachedContract = new ethers.Contract(contractAddress, AIX_TOKEN_ABI, runner);
  return cachedContract;
}

/**
 * Gets the current active AIX Token contract instance.
 * @returns {ethers.Contract} Active contract instance.
 */
export function getContract() {
  if (!cachedContract) {
    throw new Error("AIX Token service contract is not initialized. Call initializeContract() first.");
  }
  return cachedContract;
}

/**
 * Fetches total token metadata (name, symbol, decimals, total supply).
 * @param {ethers.Contract} [contractOverride] Optional contract instance.
 * @returns {Promise<{ name: string, symbol: string, decimals: number, totalSupply: string }>}
 */
export async function getTokenMetadata(contractOverride) {
  const contract = contractOverride || getContract();
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);

  return {
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: ethers.formatUnits(totalSupply, decimals),
  };
}

/**
 * Fetches AIX token balance for a specific account.
 * @param {string} accountAddress - Address of the account.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<string>} Balance formatted in human-readable tokens.
 */
export async function getBalance(accountAddress, contractOverride) {
  const contract = contractOverride || getContract();
  if (!accountAddress) {
    throw new Error("Account address is required to fetch balance.");
  }
  const decimals = await contract.decimals();
  const rawBalance = await contract.balanceOf(accountAddress);
  return ethers.formatUnits(rawBalance, decimals);
}

/**
 * Executes token transfer from current signer to recipient.
 * @param {string} to - Recipient account address.
 * @param {string|number} amount - Amount of tokens to transfer.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt.
 */
export async function transfer(to, amount, contractOverride) {
  const contract = contractOverride || getContract();
  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

  const tx = await contract.transfer(to, parsedAmount);
  return await tx.wait();
}

/**
 * Approves spender to spend AIX tokens on behalf of the signer.
 * @param {string} spender - Spender address.
 * @param {string|number} amount - Amount of tokens to approve.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt.
 */
export async function approve(spender, amount, contractOverride) {
  const contract = contractOverride || getContract();
  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

  const tx = await contract.approve(spender, parsedAmount);
  return await tx.wait();
}

/**
 * Checks spender allowance for owner.
 * @param {string} owner - Owner address.
 * @param {string} spender - Spender address.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<string>} Approved allowance formatted in human-readable tokens.
 */
export async function allowance(owner, spender, contractOverride) {
  const contract = contractOverride || getContract();
  const decimals = await contract.decimals();
  const rawAllowance = await contract.allowance(owner, spender);
  return ethers.formatUnits(rawAllowance, decimals);
}

/**
 * Mints new AIX tokens to target address (admin function).
 * @param {string} to - Target recipient address.
 * @param {string|number} amount - Amount of tokens to mint.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt.
 */
export async function mint(to, amount, contractOverride) {
  const contract = contractOverride || getContract();
  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

  const tx = await contract.mint(to, parsedAmount);
  return await tx.wait();
}

/**
 * Burns AIX tokens from signer account balance.
 * @param {string|number} amount - Amount of tokens to burn.
 * @param {ethers.Contract} [contractOverride] - Optional contract instance.
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt.
 */
export async function burn(amount, contractOverride) {
  const contract = contractOverride || getContract();
  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

  const tx = await contract.burn(parsedAmount);
  return await tx.wait();
}
