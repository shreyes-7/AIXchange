import { ethers } from "ethers";
import tokenService from "./token.service.js";
import { provider, treasuryAddress, aixTokenAddress } from "../config/blockchain.js";
import BlockchainEvent from "../models/blockchain-event.model.js";

/**
 * Consumes authoritative treasury and monitoring information
 * without independently recalculating balances.
 */
export const getTreasuryOverview = async () => {
    let onChainBalance = null;
    let ethBalance = null;

    try {
        if (treasuryAddress) {
            onChainBalance = await tokenService.getTreasuryBalance();

            if (provider) {
                const ethWei = await provider.getBalance(treasuryAddress);
                ethBalance = {
                    raw: ethWei.toString(),
                    formatted: ethers.formatEther(ethWei),
                };
            }
        }
    } catch {
        onChainBalance = {
            treasuryAddress,
            tokenAddress: aixTokenAddress,
            symbol: "AIX",
            decimals: 18,
            balance: "0",
            balanceFormatted: "0.0",
            status: "OFFLINE_OR_UNREACHABLE",
        };
    }

    // Retrieve recent authoritative treasury-related blockchain events
    const recentEvents = await BlockchainEvent.find({
        $or: [
            { contractName: "Treasury" },
            { eventName: { $in: ["TreasuryPaid", "ETHDeposited", "TokenDeposited", "ETHWithdrawn", "TokenWithdrawn"] } },
        ],
    })
        .sort({ blockNumber: -1, logIndex: -1 })
        .limit(20)
        .lean();

    return {
        treasuryAddress,
        balance: onChainBalance,
        ethBalance,
        recentEvents,
        observedAt: new Date(),
    };
};
