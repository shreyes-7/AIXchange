import { ethers } from "ethers";
import {
    aixTokenAddress,
    aixTokenContract,
    purchaseEngineContract,
    purchaseEngineAddress,
    treasuryAddress,
} from "../config/blockchain.js";
import blockchainService from "./blockchain.service.js";
import transactionRepository from "../repositories/transaction.repository.js";
import ApiError from "../utils/ApiError.js";

class TokenService {
    getVerifiedWallet(user) {
        if (!user?.wallet?.address || !user.wallet.verified) {
            throw new ApiError(403, "A verified wallet is required.");
        }
        return blockchainService.validateAddress(user.wallet.address);
    }

    async getBalance(user) {
        const walletAddress = this.getVerifiedWallet(user);
        const [balance, decimals, symbol] = await Promise.all([
            aixTokenContract.balanceOf(walletAddress), aixTokenContract.decimals(), aixTokenContract.symbol(),
        ]);
        return { walletAddress, tokenAddress: aixTokenAddress, symbol, decimals: Number(decimals), balance: balance.toString(), balanceFormatted: ethers.formatUnits(balance, decimals) };
    }

    async getTokenMetadata() {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            aixTokenContract.name(), aixTokenContract.symbol(), aixTokenContract.decimals(), aixTokenContract.totalSupply(),
        ]);
        return { address: aixTokenAddress, name, symbol, decimals: Number(decimals), totalSupply: totalSupply.toString(), totalSupplyFormatted: ethers.formatUnits(totalSupply, decimals) };
    }

    async getTotalSupply() {
        const [totalSupply, decimals, symbol] = await Promise.all([aixTokenContract.totalSupply(), aixTokenContract.decimals(), aixTokenContract.symbol()]);
        return { symbol, decimals: Number(decimals), totalSupply: totalSupply.toString(), totalSupplyFormatted: ethers.formatUnits(totalSupply, decimals) };
    }

    getTransactionHistory(user, options) {
        return transactionRepository.findByWallet(this.getVerifiedWallet(user), options);
    }

    async getTransactionByHash(user, txHash) {
        const walletAddress = this.getVerifiedWallet(user);
        const indexedEvents = await transactionRepository.findByHashForWallet(txHash, walletAddress);
        return { txHash, indexedEvents };
    }

    async createPurchaseTransaction(user, { datasetId, licenseId }) {
        const walletAddress = this.getVerifiedWallet(user);
        if (!purchaseEngineContract || !purchaseEngineAddress) {
            throw new ApiError(503, "Purchase engine is not configured.");
        }
        await blockchainService.validateNetwork();
        const transaction = await purchaseEngineContract.purchaseDataset.populateTransaction(datasetId, licenseId);
        return { from: walletAddress, to: purchaseEngineAddress, data: transaction.data, value: "0", chainId: (await purchaseEngineContract.runner.provider.getNetwork()).chainId.toString() };
    }

    async getTreasuryBalance() {
        if (!treasuryAddress) throw new ApiError(503, "Treasury is not configured.");
        const [balance, decimals, symbol] = await Promise.all([aixTokenContract.balanceOf(treasuryAddress), aixTokenContract.decimals(), aixTokenContract.symbol()]);
        return { treasuryAddress, tokenAddress: aixTokenAddress, symbol, decimals: Number(decimals), balance: balance.toString(), balanceFormatted: ethers.formatUnits(balance, decimals) };
    }

    async getWalletDashboard(user) {
        const [balance, history] = await Promise.all([this.getBalance(user), this.getTransactionHistory(user, { page: 1, limit: 10 })]);
        return { walletAddress: balance.walletAddress, balance, recentTransactions: history.transactions };
    }
}

export default new TokenService();
