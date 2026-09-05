const { ethers } = require("ethers");

/**
 * TreasuryMonitor: Dedicated observer for AIXchange platform Treasury
 */
class TreasuryMonitor {
    constructor(treasuryContract, provider) {
        this.treasury = treasuryContract;
        this.provider = provider || (treasuryContract ? treasuryContract.runner : null);
    }

    /**
     * Queries real-time balances of the Treasury vault
     */
    async getBalances(trackedTokenAddresses = []) {
        if (!this.treasury) {
            throw new Error("Treasury contract instance required");
        }

        const ethBalance = await this.treasury.getETHBalance();
        const tokenBalances = {};

        for (const tokenAddr of trackedTokenAddresses) {
            try {
                const bal = await this.treasury.getTokenBalance(tokenAddr);
                tokenBalances[tokenAddr.toLowerCase()] = {
                    raw: bal.toString(),
                    formatted: ethers.formatEther(bal),
                };
            } catch (err) {
                tokenBalances[tokenAddr.toLowerCase()] = {
                    raw: "0",
                    formatted: "0.0",
                    error: err.message,
                };
            }
        }

        return {
            ethBalance: {
                raw: ethBalance.toString(),
                formatted: ethers.formatEther(ethBalance),
            },
            tokens: tokenBalances,
            timestamp: new Date(),
        };
    }

    /**
     * Classifies a normalized blockchain event as a Treasury inflow, outflow, or neutral
     */
    classifyEvent(event) {
        const eventName = event.eventName;
        const contractName = event.contractName;

        if (contractName === "Treasury") {
            if (eventName === "ETHDeposited" || eventName === "TokenDeposited") {
                return {
                    type: "INFLOW",
                    asset: eventName === "ETHDeposited" ? "ETH" : "TOKEN",
                    amount: event.amount,
                    sender: event.from,
                    txHash: event.transactionHash,
                };
            }
            if (eventName === "ETHWithdrawn" || eventName === "TokenWithdrawn") {
                return {
                    type: "OUTFLOW",
                    asset: eventName === "ETHWithdrawn" ? "ETH" : "TOKEN",
                    amount: event.amount,
                    recipient: event.to,
                    txHash: event.transactionHash,
                };
            }
        }

        if (contractName === "RoyaltyEngine" && eventName === "TreasuryPaid") {
            return {
                type: "INFLOW",
                asset: "TOKEN",
                amount: event.amount,
                source: "ROYALTY_ENGINE",
                recipient: event.to,
                txHash: event.transactionHash,
            };
        }

        if (contractName === "PurchaseEngine" && eventName === "DatasetPurchased") {
            const feeAmount = event.arguments ? event.arguments.feeAmount : null;
            if (feeAmount && BigInt(feeAmount) > 0n) {
                return {
                    type: "INFLOW",
                    asset: "TOKEN",
                    amount: feeAmount,
                    source: "PURCHASE_PLATFORM_FEE",
                    txHash: event.transactionHash,
                };
            }
        }

        return null;
    }

    /**
     * Summarizes treasury activity from an array of normalized events
     */
    summarizeActivity(events) {
        let totalTokenInflow = 0n;
        let totalTokenOutflow = 0n;
        let totalEthInflow = 0n;
        let totalEthOutflow = 0n;
        const inflows = [];
        const outflows = [];

        for (const ev of events) {
            const classified = this.classifyEvent(ev);
            if (!classified) continue;

            if (classified.type === "INFLOW") {
                inflows.push(classified);
                if (classified.asset === "TOKEN" && classified.amount) {
                    totalTokenInflow += BigInt(classified.amount);
                } else if (classified.asset === "ETH" && classified.amount) {
                    totalEthInflow += BigInt(classified.amount);
                }
            } else if (classified.type === "OUTFLOW") {
                outflows.push(classified);
                if (classified.asset === "TOKEN" && classified.amount) {
                    totalTokenOutflow += BigInt(classified.amount);
                } else if (classified.asset === "ETH" && classified.amount) {
                    totalEthOutflow += BigInt(classified.amount);
                }
            }
        }

        return {
            inflowsCount: inflows.length,
            outflowsCount: outflows.length,
            tokenInflow: {
                raw: totalTokenInflow.toString(),
                formatted: ethers.formatEther(totalTokenInflow),
            },
            tokenOutflow: {
                raw: totalTokenOutflow.toString(),
                formatted: ethers.formatEther(totalTokenOutflow),
            },
            ethInflow: {
                raw: totalEthInflow.toString(),
                formatted: ethers.formatEther(totalEthInflow),
            },
            ethOutflow: {
                raw: totalEthOutflow.toString(),
                formatted: ethers.formatEther(totalEthOutflow),
            },
            inflows,
            outflows,
        };
    }
}

module.exports = {
    TreasuryMonitor,
};
