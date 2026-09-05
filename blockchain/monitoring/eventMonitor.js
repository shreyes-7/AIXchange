const { ethers } = require("ethers");
const { DEFAULT_MONITORING_CONFIG } = require("./config");

/**
 * Normalizes raw contract log and parsed ethers event into an auditable activity record
 */
function normalizeEvent(log, parsed, contractName, blockTimestamp) {
    const rawArgs = parsed.args || {};
    const sanitizedArgs = {};

    for (const [key, value] of Object.entries(rawArgs)) {
        if (!isNaN(Number(key))) continue; // Skip numeric positional keys
        if (typeof value === "bigint") {
            sanitizedArgs[key] = value.toString();
        } else if (Array.isArray(value)) {
            sanitizedArgs[key] = value.map((v) => (typeof v === "bigint" ? v.toString() : v));
        } else {
            sanitizedArgs[key] = value;
        }
    }

    let from = undefined;
    let to = undefined;
    let amount = undefined;
    let datasetId = undefined;
    let modelId = undefined;
    let royaltyAmount = undefined;

    const eventName = parsed.name;

    // AIX Token events
    if (contractName === "AIXToken") {
        if (eventName === "Transfer") {
            from = rawArgs.from?.toLowerCase();
            to = rawArgs.to?.toLowerCase();
            amount = rawArgs.value?.toString();
        } else if (eventName === "TokensMinted") {
            to = rawArgs.to?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokensBurned") {
            from = rawArgs.from?.toLowerCase();
            amount = rawArgs.amount?.toString();
        }
    }

    // Treasury events
    if (contractName === "Treasury") {
        if (eventName === "ETHDeposited") {
            from = rawArgs.sender?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "ETHWithdrawn") {
            to = rawArgs.recipient?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokenDeposited") {
            from = rawArgs.sender?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokenWithdrawn") {
            to = rawArgs.recipient?.toLowerCase();
            amount = rawArgs.amount?.toString();
        }
    }

    // PurchaseEngine events
    if (contractName === "PurchaseEngine") {
        if (eventName === "DatasetPurchased") {
            from = rawArgs.buyer?.toLowerCase();
            to = rawArgs.licensor?.toLowerCase();
            amount = rawArgs.price?.toString();
            datasetId = rawArgs.datasetId?.toString();
        } else if (eventName === "RoyaltyTriggered") {
            to = rawArgs.licensor?.toLowerCase();
            royaltyAmount = rawArgs.licensorAmount?.toString();
        }
    }

    // RoyaltyEngine events
    if (contractName === "RoyaltyEngine") {
        if (eventName === "DistributionCreated") {
            from = rawArgs.payer?.toLowerCase();
            amount = rawArgs.totalRevenue?.toString();
        } else if (eventName === "RecipientPaid") {
            to = rawArgs.recipient?.toLowerCase();
            royaltyAmount = rawArgs.amount?.toString();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TreasuryPaid") {
            to = rawArgs.treasury?.toLowerCase();
            amount = rawArgs.amount?.toString();
        }
    }

    // Registries
    if (rawArgs.datasetId !== undefined) datasetId = rawArgs.datasetId.toString();
    if (rawArgs.modelId !== undefined) modelId = rawArgs.modelId.toString();

    return {
        id: `${log.transactionHash.toLowerCase()}-${log.index}`,
        transactionHash: log.transactionHash.toLowerCase(),
        blockNumber: Number(log.blockNumber),
        logIndex: Number(log.index),
        contractName,
        contractAddress: log.address.toLowerCase(),
        eventName,
        arguments: sanitizedArgs,
        from,
        to,
        amount,
        datasetId,
        modelId,
        royaltyAmount,
        timestamp: blockTimestamp ? new Date(blockTimestamp) : new Date(),
    };
}

/**
 * EventMonitor: Read-only blockchain event observation layer
 */
class EventMonitor {
    constructor(provider, contracts = {}, config = DEFAULT_MONITORING_CONFIG) {
        this.provider = provider;
        this.contracts = contracts; // map of { [name]: { address, interface } }
        this.config = config;
        this.blockTimestamps = new Map();
    }

    /**
     * Cache block timestamps to minimize RPC calls
     */
    async getBlockTimestamp(blockNumber) {
        if (!this.provider) return new Date();
        if (!this.blockTimestamps.has(blockNumber)) {
            try {
                const block = await this.provider.getBlock(blockNumber);
                if (block) {
                    this.blockTimestamps.set(blockNumber, new Date(Number(block.timestamp) * 1000));
                } else {
                    return new Date();
                }
            } catch {
                return new Date();
            }
        }
        return this.blockTimestamps.get(blockNumber);
    }

    /**
     * Fetches and normalizes events across registered contracts for a given block range
     */
    async fetchEvents({ fromBlock, toBlock, contractNames } = {}) {
        const events = [];
        const seenEventIds = new Set();

        const targets = contractNames
            ? Object.entries(this.contracts).filter(([name]) => contractNames.includes(name))
            : Object.entries(this.contracts);

        for (const [name, contractInfo] of targets) {
            if (!contractInfo.address || !contractInfo.interface) continue;

            try {
                const logs = await this.provider.getLogs({
                    address: contractInfo.address,
                    fromBlock: fromBlock || 0,
                    toBlock: toBlock || "latest",
                });

                for (const log of logs) {
                    let parsed = null;
                    try {
                        parsed = contractInfo.interface.parseLog(log);
                    } catch {
                        continue; // Unknown log signature or external log
                    }

                    if (!parsed) continue;

                    const timestamp = await this.getBlockTimestamp(log.blockNumber);
                    const normalized = normalizeEvent(log, parsed, name, timestamp);

                    // Deduplication check
                    if (!seenEventIds.has(normalized.id)) {
                        seenEventIds.add(normalized.id);
                        events.push(normalized);
                    }
                }
            } catch (error) {
                // Return gracefully without crashing, recording partial events
                console.warn(`[EventMonitor] Warning fetching logs for ${name}: ${error.message}`);
            }
        }

        // Return sorted chronologically
        return events.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);
    }

    /**
     * Filters events by wallet address, event name, or contract
     */
    filterEvents(events, { address, eventName, contractName, minAmount } = {}) {
        return events.filter((ev) => {
            if (address) {
                const addr = address.toLowerCase();
                if (ev.from !== addr && ev.to !== addr) return false;
            }
            if (eventName && ev.eventName !== eventName) return false;
            if (contractName && ev.contractName !== contractName) return false;
            if (minAmount && ev.amount) {
                if (BigInt(ev.amount) < BigInt(minAmount)) return false;
            }
            return true;
        });
    }
}

module.exports = {
    EventMonitor,
    normalizeEvent,
};
