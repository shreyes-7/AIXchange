const { ethers } = require("ethers");
const { DEFAULT_MONITORING_CONFIG } = require("./config");

/**
 * FraudEngine: Deterministic, explainable blockchain fraud detection
 */
class FraudEngine {
    constructor(config = {}) {
        this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    }

    /**
     * Evaluates an array of normalized blockchain events against configured fraud rules
     * @param {Array} events Normalized events from EventMonitor
     * @param {Array} failedTransactions Optional array of observed failed transaction receipts { from, txHash, timestamp }
     * @returns {Array} Array of flagged suspicious activities with evidence
     */
    analyze(events = [], failedTransactions = []) {
        const flags = [];

        // 1. Evaluate Large Transfer Rule
        flags.push(...this.checkLargeTransfers(events));

        // 2. Evaluate Rapid Transaction Bursts / High Frequency Rule
        flags.push(...this.checkRapidTransactions(events));

        // 3. Evaluate Suspicious Treasury Activity
        flags.push(...this.checkSuspiciousTreasuryActivity(events));

        // 4. Evaluate Unusual Royalty Activity
        flags.push(...this.checkUnusualRoyaltyActivity(events));

        // 5. Evaluate Repeated Failed Transactions
        flags.push(...this.checkFailedTransactions(failedTransactions));

        return flags;
    }

    /**
     * Rule 1: Abnormally large token transfer
     */
    checkLargeTransfers(events) {
        const flags = [];
        for (const ev of events) {
            if (ev.contractName === "AIXToken" && ev.eventName === "Transfer" && ev.amount) {
                const amountBig = BigInt(ev.amount);
                if (amountBig >= this.config.MAX_TRANSFER_THRESHOLD) {
                    const isCritical = amountBig >= this.config.MAX_TRANSFER_THRESHOLD * 5n;
                    flags.push({
                        flagId: `FLAG_LARGE_TRANSFER_${ev.transactionHash}`,
                        ruleId: "ABNORMAL_LARGE_TRANSFER",
                        severity: isCritical ? "CRITICAL" : "HIGH",
                        address: ev.from,
                        targetAddress: ev.to,
                        transactionHash: ev.transactionHash,
                        timestamp: ev.timestamp,
                        description: `Transfer of ${ethers.formatEther(amountBig)} AIX exceeds threshold of ${ethers.formatEther(this.config.MAX_TRANSFER_THRESHOLD)} AIX`,
                        evidence: {
                            amountRaw: ev.amount,
                            amountFormatted: ethers.formatEther(amountBig),
                            thresholdFormatted: ethers.formatEther(this.config.MAX_TRANSFER_THRESHOLD),
                            from: ev.from,
                            to: ev.to,
                        },
                    });
                }
            }
        }
        return flags;
    }

    /**
     * Rule 2: Rapid transaction bursts / abnormally high frequency
     */
    checkRapidTransactions(events) {
        const flags = [];
        // Group transactions by participant wallet address
        const walletTxs = new Map();

        for (const ev of events) {
            const sender = ev.from;
            if (!sender) continue;
            if (!walletTxs.has(sender)) {
                walletTxs.set(sender, []);
            }
            walletTxs.get(sender).push(ev);
        }

        for (const [address, txList] of walletTxs.entries()) {
            if (txList.length < this.config.HIGH_FREQUENCY_THRESHOLD) continue;

            // Sort chronologically
            const sorted = [...txList].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Sliding window check
            for (let i = 0; i < sorted.length; i++) {
                const windowStart = new Date(sorted[i].timestamp).getTime();
                const windowEnd = windowStart + this.config.RAPID_TRANSACTION_WINDOW_MS;
                const inWindow = sorted.slice(i).filter(
                    (tx) => new Date(tx.timestamp).getTime() <= windowEnd
                );

                if (inWindow.length >= this.config.HIGH_FREQUENCY_THRESHOLD) {
                    flags.push({
                        flagId: `FLAG_RAPID_TX_${address}_${windowStart}`,
                        ruleId: "RAPID_TRANSACTIONS",
                        severity: inWindow.length >= this.config.HIGH_FREQUENCY_THRESHOLD * 2 ? "HIGH" : "MEDIUM",
                        address,
                        transactionHash: sorted[i].transactionHash,
                        timestamp: sorted[i].timestamp,
                        description: `Address executed ${inWindow.length} transactions within ${this.config.RAPID_TRANSACTION_WINDOW_MS / 1000}s (threshold: ${this.config.HIGH_FREQUENCY_THRESHOLD})`,
                        evidence: {
                            count: inWindow.length,
                            threshold: this.config.HIGH_FREQUENCY_THRESHOLD,
                            windowSeconds: this.config.RAPID_TRANSACTION_WINDOW_MS / 1000,
                            transactionHashes: inWindow.map((tx) => tx.transactionHash),
                        },
                    });
                    break; // Flag once per address cluster
                }
            }
        }
        return flags;
    }

    /**
     * Rule 3: Suspicious Treasury Activity
     */
    checkSuspiciousTreasuryActivity(events) {
        const flags = [];
        for (const ev of events) {
            if (ev.contractName === "Treasury") {
                if (ev.eventName === "TokenWithdrawn" && ev.amount) {
                    const amountBig = BigInt(ev.amount);
                    if (amountBig >= this.config.SUSPICIOUS_TREASURY_TOKEN_OUTFLOW_THRESHOLD) {
                        flags.push({
                            flagId: `FLAG_TREASURY_OUTFLOW_${ev.transactionHash}`,
                            ruleId: "SUSPICIOUS_TREASURY_ACTIVITY",
                            severity: "CRITICAL",
                            address: ev.to,
                            transactionHash: ev.transactionHash,
                            timestamp: ev.timestamp,
                            description: `Treasury token withdrawal of ${ethers.formatEther(amountBig)} AIX exceeds safety ceiling of ${ethers.formatEther(this.config.SUSPICIOUS_TREASURY_TOKEN_OUTFLOW_THRESHOLD)} AIX`,
                            evidence: {
                                token: ev.arguments?.token,
                                recipient: ev.to,
                                amountFormatted: ethers.formatEther(amountBig),
                                threshold: ethers.formatEther(this.config.SUSPICIOUS_TREASURY_TOKEN_OUTFLOW_THRESHOLD),
                            },
                        });
                    }
                } else if (ev.eventName === "ETHWithdrawn" && ev.amount) {
                    const amountBig = BigInt(ev.amount);
                    if (amountBig >= this.config.SUSPICIOUS_TREASURY_ETH_OUTFLOW_THRESHOLD) {
                        flags.push({
                            flagId: `FLAG_TREASURY_ETH_OUTFLOW_${ev.transactionHash}`,
                            ruleId: "SUSPICIOUS_TREASURY_ACTIVITY",
                            severity: "CRITICAL",
                            address: ev.to,
                            transactionHash: ev.transactionHash,
                            timestamp: ev.timestamp,
                            description: `Treasury ETH withdrawal of ${ethers.formatEther(amountBig)} ETH exceeds safety ceiling of ${ethers.formatEther(this.config.SUSPICIOUS_TREASURY_ETH_OUTFLOW_THRESHOLD)} ETH`,
                            evidence: {
                                recipient: ev.to,
                                amountFormatted: ethers.formatEther(amountBig),
                                threshold: ethers.formatEther(this.config.SUSPICIOUS_TREASURY_ETH_OUTFLOW_THRESHOLD),
                            },
                        });
                    }
                }
            }
        }
        return flags;
    }

    /**
     * Rule 4: Unusual Royalty Activity
     */
    checkUnusualRoyaltyActivity(events) {
        const flags = [];
        for (const ev of events) {
            if (ev.contractName === "RoyaltyEngine") {
                if (ev.eventName === "RecipientPaid" && ev.amount) {
                    const amountBig = BigInt(ev.amount);
                    if (amountBig >= this.config.UNUSUAL_ROYALTY_THRESHOLD) {
                        flags.push({
                            flagId: `FLAG_ROYALTY_ANOMALY_${ev.transactionHash}_${ev.logIndex}`,
                            ruleId: "UNUSUAL_ROYALTY_PATTERN",
                            severity: "MEDIUM",
                            address: ev.to,
                            transactionHash: ev.transactionHash,
                            timestamp: ev.timestamp,
                            description: `Royalty distribution of ${ethers.formatEther(amountBig)} AIX to recipient exceeds monitoring threshold of ${ethers.formatEther(this.config.UNUSUAL_ROYALTY_THRESHOLD)} AIX`,
                            evidence: {
                                distributionId: ev.arguments?.distributionId,
                                recipient: ev.to,
                                amountFormatted: ethers.formatEther(amountBig),
                                shareBps: ev.arguments?.shareBps,
                            },
                        });
                    }
                }
            }
        }
        return flags;
    }

    /**
     * Rule 5: Repeated Failed Transactions (Exploit Probing)
     */
    checkFailedTransactions(failedTransactions = []) {
        const flags = [];
        const walletFails = new Map();

        for (const fail of failedTransactions) {
            const addr = fail.from?.toLowerCase();
            if (!addr) continue;
            if (!walletFails.has(addr)) {
                walletFails.set(addr, []);
            }
            walletFails.get(addr).push(fail);
        }

        for (const [address, fails] of walletFails.entries()) {
            if (fails.length >= this.config.FAILED_TRANSACTION_THRESHOLD) {
                flags.push({
                    flagId: `FLAG_FAILED_PROBING_${address}`,
                    ruleId: "REPEATED_FAILED_TRANSACTIONS",
                    severity: "HIGH",
                    address,
                    transactionHash: fails[fails.length - 1].txHash,
                    timestamp: fails[fails.length - 1].timestamp || new Date(),
                    description: `Address produced ${fails.length} failed transaction attempts (threshold: ${this.config.FAILED_TRANSACTION_THRESHOLD})`,
                    evidence: {
                        failureCount: fails.length,
                        threshold: this.config.FAILED_TRANSACTION_THRESHOLD,
                        transactionHashes: fails.map((f) => f.txHash),
                    },
                });
            }
        }

        return flags;
    }
}

module.exports = {
    FraudEngine,
};
