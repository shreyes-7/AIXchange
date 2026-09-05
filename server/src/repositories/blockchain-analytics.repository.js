import { ethers } from "ethers";
import BlockchainEvent from "../models/blockchain-event.model.js";
import BlockchainGasTx from "../models/blockchain-gas-tx.model.js";

/**
 * Idempotently saves or updates a blockchain event
 */
export const upsertEvent = async (eventData) => {
    return BlockchainEvent.findOneAndUpdate(
        {
            transactionHash: eventData.transactionHash.toLowerCase(),
            logIndex: eventData.logIndex,
        },
        { $set: eventData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

/**
 * Idempotently saves or updates a gas transaction record
 */
export const upsertGasTx = async (gasData) => {
    return BlockchainGasTx.findOneAndUpdate(
        { transactionHash: gasData.transactionHash.toLowerCase() },
        { $set: gasData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

/**
 * Queries indexed blockchain events with pagination and filters
 */
export const queryEvents = async ({
    page = 1,
    limit = 20,
    contract,
    eventName,
    address,
    fromBlock,
    toBlock,
    startDate,
    endDate,
    datasetId,
    modelId,
} = {}) => {
    const filter = {};

    if (contract) {
        if (ethers.isAddress(contract)) {
            filter.contractAddress = contract.toLowerCase();
        } else {
            filter.contractName = new RegExp(`^${contract}$`, "i");
        }
    }

    if (eventName) {
        filter.eventName = eventName;
    }

    if (address && ethers.isAddress(address)) {
        const addr = address.toLowerCase();
        filter.$or = [{ from: addr }, { to: addr }];
    }

    if (fromBlock !== undefined || toBlock !== undefined) {
        filter.blockNumber = {};
        if (fromBlock !== undefined) filter.blockNumber.$gte = Number(fromBlock);
        if (toBlock !== undefined) filter.blockNumber.$lte = Number(toBlock);
    }

    if (startDate || endDate) {
        filter.blockTimestamp = {};
        if (startDate) filter.blockTimestamp.$gte = new Date(startDate);
        if (endDate) filter.blockTimestamp.$lte = new Date(endDate);
    }

    if (datasetId) filter.datasetId = String(datasetId);
    if (modelId) filter.modelId = String(modelId);

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        BlockchainEvent.find(filter)
            .sort({ blockNumber: -1, logIndex: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        BlockchainEvent.countDocuments(filter),
    ]);

    return {
        events,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

/**
 * Aggregates AIX Token analytics with strict BigInt integer arithmetic
 */
export const aggregateTokenAnalytics = async ({ startDate, endDate, interval = "day" } = {}) => {
    const filter = {
        contractName: "AIXToken",
        eventName: "Transfer",
    };

    if (startDate || endDate) {
        filter.blockTimestamp = {};
        if (startDate) filter.blockTimestamp.$gte = new Date(startDate);
        if (endDate) filter.blockTimestamp.$lte = new Date(endDate);
    }

    // Fetch matching transfers
    const transfers = await BlockchainEvent.find(filter)
        .select("from to amount blockTimestamp transactionHash")
        .lean();

    let totalVolumeWei = 0n;
    const senders = new Set();
    const receivers = new Set();

    for (const tx of transfers) {
        if (tx.amount) {
            try {
                totalVolumeWei += BigInt(tx.amount);
            } catch {
                // Ignore parsing errors for malformed legacy data
            }
        }
        if (tx.from) senders.add(tx.from.toLowerCase());
        if (tx.to) receivers.add(tx.to.toLowerCase());
    }

    const participants = new Set([...senders, ...receivers]);

    // Categorized Spending metrics
    const categoryFilter = {};
    if (startDate || endDate) {
        categoryFilter.blockTimestamp = filter.blockTimestamp;
    }

    const [datasetPurchases, royaltyDistributions, treasuryTransfers] = await Promise.all([
        BlockchainEvent.find({
            ...categoryFilter,
            contractName: "PurchaseEngine",
            eventName: "DatasetPurchased",
        }).select("amount").lean(),
        BlockchainEvent.find({
            ...categoryFilter,
            $or: [
                { contractName: "RoyaltyEngine", eventName: "RecipientPaid" },
                { contractName: "PurchaseEngine", eventName: "RoyaltyTriggered" },
            ],
        }).select("amount royaltyAmount").lean(),
        BlockchainEvent.find({
            ...categoryFilter,
            $or: [
                { contractName: "RoyaltyEngine", eventName: "TreasuryPaid" },
                { contractName: "Treasury", eventName: "TokenDeposited" },
                { contractName: "Treasury", eventName: "ETHDeposited" },
            ],
        }).select("amount feeAmount").lean(),
    ]);

    let datasetSpentWei = 0n;
    for (const p of datasetPurchases) {
        if (p.amount) datasetSpentWei += BigInt(p.amount);
    }

    let royaltyDistributedWei = 0n;
    for (const r of royaltyDistributions) {
        const amt = r.royaltyAmount || r.amount;
        if (amt) royaltyDistributedWei += BigInt(amt);
    }

    let treasuryTransferredWei = 0n;
    for (const t of treasuryTransfers) {
        const amt = t.feeAmount || t.amount;
        if (amt) treasuryTransferredWei += BigInt(amt);
    }

    // Time-based aggregation
    const timeBuckets = new Map();
    for (const tx of transfers) {
        const date = new Date(tx.blockTimestamp);
        let key;
        if (interval === "month") {
            key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        } else if (interval === "week") {
            const oneJan = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
            const weekNum = Math.ceil(((date - oneJan) / 86400000 + oneJan.getUTCDay() + 1) / 7);
            key = `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
        } else {
            key = date.toISOString().slice(0, 10);
        }

        if (!timeBuckets.has(key)) {
            timeBuckets.set(key, { period: key, transferCount: 0, volumeWei: 0n });
        }
        const b = timeBuckets.get(key);
        b.transferCount += 1;
        if (tx.amount) b.volumeWei += BigInt(tx.amount);
    }

    const timeActivity = Array.from(timeBuckets.values()).map((b) => ({
        period: b.period,
        transferCount: b.transferCount,
        volumeRaw: b.volumeWei.toString(),
        volumeFormatted: parseFloat(ethers.formatEther(b.volumeWei)),
    })).sort((a, b) => a.period.localeCompare(b.period));

    return {
        summary: {
            transferCount: transfers.length,
            totalVolumeRaw: totalVolumeWei.toString(),
            totalVolumeFormatted: parseFloat(ethers.formatEther(totalVolumeWei)),
            uniqueSendersCount: senders.size,
            uniqueReceiversCount: receivers.size,
            uniqueParticipantsCount: participants.size,
        },
        categorizedSpending: {
            spentOnDatasetsRaw: datasetSpentWei.toString(),
            spentOnDatasetsFormatted: parseFloat(ethers.formatEther(datasetSpentWei)),
            distributedAsRoyaltiesRaw: royaltyDistributedWei.toString(),
            distributedAsRoyaltiesFormatted: parseFloat(ethers.formatEther(royaltyDistributedWei)),
            transferredToTreasuryRaw: treasuryTransferredWei.toString(),
            transferredToTreasuryFormatted: parseFloat(ethers.formatEther(treasuryTransferredWei)),
        },
        timeActivity,
    };
};

/**
 * Aggregates Gas metrics grouped by contract and time intervals
 */
export const aggregateGasAnalytics = async ({ startDate, endDate, contract, interval = "day" } = {}) => {
    const filter = {};

    if (contract) {
        if (ethers.isAddress(contract)) {
            filter.contractAddress = contract.toLowerCase();
        } else {
            filter.contractName = new RegExp(`^${contract}$`, "i");
        }
    }

    if (startDate || endDate) {
        filter.blockTimestamp = {};
        if (startDate) filter.blockTimestamp.$gte = new Date(startDate);
        if (endDate) filter.blockTimestamp.$lte = new Date(endDate);
    }

    const records = await BlockchainGasTx.find(filter)
        .select("transactionHash blockNumber blockTimestamp contractName contractAddress gasUsed effectiveGasPrice gasCost gasUsedNum gasCostEth")
        .lean();

    if (records.length === 0) {
        return {
            summary: {
                transactionCount: 0,
                totalGasUsed: "0",
                averageGasUsed: 0,
                minGasUsed: "0",
                maxGasUsed: "0",
                totalGasCostWei: "0",
                totalGasCostEth: 0,
                averageGasCostWei: "0",
                averageGasCostEth: 0,
            },
            byContract: [],
            timeActivity: [],
        };
    }

    let totalGasUsedWei = 0n;
    let totalGasCostWei = 0n;
    let minGasUsed = BigInt(records[0].gasUsed);
    let maxGasUsed = BigInt(records[0].gasUsed);

    const contractMap = new Map();
    const timeBuckets = new Map();

    for (const r of records) {
        const gasUsed = BigInt(r.gasUsed);
        const gasCost = BigInt(r.gasCost);

        totalGasUsedWei += gasUsed;
        totalGasCostWei += gasCost;

        if (gasUsed < minGasUsed) minGasUsed = gasUsed;
        if (gasUsed > maxGasUsed) maxGasUsed = gasUsed;

        // Group by contract
        const cKey = r.contractName || r.contractAddress || "Unknown";
        if (!contractMap.has(cKey)) {
            contractMap.set(cKey, {
                contractName: r.contractName || "Unknown",
                contractAddress: r.contractAddress || null,
                transactionCount: 0,
                gasUsedWei: 0n,
                gasCostWei: 0n,
            });
        }
        const c = contractMap.get(cKey);
        c.transactionCount += 1;
        c.gasUsedWei += gasUsed;
        c.gasCostWei += gasCost;

        // Time aggregation
        const date = new Date(r.blockTimestamp);
        let tKey;
        if (interval === "month") {
            tKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        } else if (interval === "week") {
            const oneJan = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
            const weekNum = Math.ceil(((date - oneJan) / 86400000 + oneJan.getUTCDay() + 1) / 7);
            tKey = `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
        } else {
            tKey = date.toISOString().slice(0, 10);
        }

        if (!timeBuckets.has(tKey)) {
            timeBuckets.set(tKey, {
                period: tKey,
                transactionCount: 0,
                gasUsedWei: 0n,
                gasCostWei: 0n,
            });
        }
        const tb = timeBuckets.get(tKey);
        tb.transactionCount += 1;
        tb.gasUsedWei += gasUsed;
        tb.gasCostWei += gasCost;
    }

    const txCount = BigInt(records.length);
    const avgGasUsedWei = totalGasUsedWei / txCount;
    const avgGasCostWei = totalGasCostWei / txCount;

    const byContract = Array.from(contractMap.values()).map((c) => ({
        contractName: c.contractName,
        contractAddress: c.contractAddress,
        transactionCount: c.transactionCount,
        totalGasUsedRaw: c.gasUsedWei.toString(),
        totalGasUsedNum: Number(c.gasUsedWei),
        totalGasCostWei: c.gasCostWei.toString(),
        totalGasCostEth: parseFloat(ethers.formatEther(c.gasCostWei)),
    }));

    const timeActivity = Array.from(timeBuckets.values()).map((tb) => ({
        period: tb.period,
        transactionCount: tb.transactionCount,
        gasUsedRaw: tb.gasUsedWei.toString(),
        gasUsedNum: Number(tb.gasUsedWei),
        gasCostWei: tb.gasCostWei.toString(),
        gasCostEth: parseFloat(ethers.formatEther(tb.gasCostWei)),
    })).sort((a, b) => a.period.localeCompare(b.period));

    return {
        summary: {
            transactionCount: records.length,
            totalGasUsed: totalGasUsedWei.toString(),
            averageGasUsed: Number(avgGasUsedWei),
            minGasUsed: minGasUsed.toString(),
            maxGasUsed: maxGasUsed.toString(),
            totalGasCostWei: totalGasCostWei.toString(),
            totalGasCostEth: parseFloat(ethers.formatEther(totalGasCostWei)),
            averageGasCostWei: avgGasCostWei.toString(),
            averageGasCostEth: parseFloat(ethers.formatEther(avgGasCostWei)),
        },
        byContract,
        timeActivity,
    };
};

/**
 * Returns a high-level blockchain overview
 */
export const getBlockchainOverview = async ({ startDate, endDate } = {}) => {
    const timeFilter = {};
    if (startDate || endDate) {
        timeFilter.blockTimestamp = {};
        if (startDate) timeFilter.blockTimestamp.$gte = new Date(startDate);
        if (endDate) timeFilter.blockTimestamp.$lte = new Date(endDate);
    }

    const [eventCount, gasSummary, tokenSummary] = await Promise.all([
        BlockchainEvent.countDocuments(timeFilter),
        aggregateGasAnalytics({ startDate, endDate }),
        aggregateTokenAnalytics({ startDate, endDate }),
    ]);

    return {
        transactionCount: gasSummary.summary.transactionCount,
        eventCount,
        tokenVolume: {
            raw: tokenSummary.summary.totalVolumeRaw,
            formatted: tokenSummary.summary.totalVolumeFormatted,
        },
        royaltyVolume: {
            raw: tokenSummary.categorizedSpending.distributedAsRoyaltiesRaw,
            formatted: tokenSummary.categorizedSpending.distributedAsRoyaltiesFormatted,
        },
        gasUsed: {
            raw: gasSummary.summary.totalGasUsed,
            average: gasSummary.summary.averageGasUsed,
        },
        gasCost: {
            wei: gasSummary.summary.totalGasCostWei,
            eth: gasSummary.summary.totalGasCostEth,
        },
    };
};
