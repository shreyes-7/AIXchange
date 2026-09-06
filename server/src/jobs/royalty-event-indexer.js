import env from "../config/env.js";
import blockchain from "../services/royaltyBlockchain.service.js";
import * as stateRepository from "../repositories/indexer-state.repository.js";
import * as royaltyRepository from "../repositories/royalty.repository.js";
import BlockchainEvent from "../models/blockchain-event.model.js";
import logger from "../config/logger.js";

class RoyaltyEventIndexer {
    constructor() {
        this.running = false;
        this.timer = null;
    }

    async runOnce() {
        if (this.running) return;
        let contractAddress;
        try {
            contractAddress = blockchain.config.royaltyEngine;
        } catch {
            // Contract not configured or offline; skip silently
            return;
        }

        this.running = true;
        try {
            const provider = blockchain.provider();
            await blockchain.validateNetwork(provider);
            const address = contractAddress;
            const iface = blockchain.interface;

            const head = await provider.getBlockNumber();
            const confirmations = (process.env.NODE_ENV === "test" || Number(env.BLOCKCHAIN_CHAIN_ID) === 31337)
                ? 0
                : (env.BLOCKCHAIN_CONFIRMATIONS || 0);
            const safeBlock = head - confirmations;
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) {
                this.running = false;
                return;
            }

            const identity = {
                chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                contractAddress: address.toLowerCase(),
                indexer: "royalty-engine-events",
            };

            const state = await stateRepository.get(identity);
            let fromBlock = state ? state.lastIndexedBlock + 1 : (env.BLOCKCHAIN_START_BLOCK || 0);

            const eventNames = [
                "DistributionCreated",
                "RecipientPaid",
                "TreasuryPaid",
                "DistributionCompleted",
                "TreasuryUpdated",
                "TreasuryFeeUpdated",
            ];

            const topics = eventNames
                .map((name) => {
                    try {
                        return iface.getEvent(name).topicHash;
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);

            while (fromBlock <= safeBlock) {
                const toBlock = Math.min(fromBlock + (env.INDEXER_BATCH_SIZE || 1000) - 1, safeBlock);
                let logs;
                try {
                    logs = await provider.getLogs({
                        address,
                        fromBlock,
                        toBlock,
                        topics: [topics],
                    });
                } catch (rpcErr) {
                    logger.warn(
                        `Royalty indexer getLogs failed for blocks [${fromBlock}, ${toBlock}]: ${rpcErr.message}`
                    );
                    break;
                }

                for (const log of logs) {
                    let parsed;
                    try {
                        parsed = iface.parseLog(log);
                    } catch {
                        continue;
                    }
                    if (!parsed) continue;

                    const logIndex = log.index !== undefined ? log.index : (log.logIndex || 0);
                    const txHash = log.transactionHash.toLowerCase();

                    // Check if event already indexed in BlockchainEvent (log-level idempotency)
                    const existingEvent = await BlockchainEvent.findOne({
                        transactionHash: txHash,
                        logIndex,
                    });

                    if (existingEvent) {
                        continue;
                    }

                    // Fetch block timestamp
                    let blockTimestamp = new Date();
                    let blockTimestampUnix = Math.floor(Date.now() / 1000).toString();
                    try {
                        const block = await provider.getBlock(log.blockNumber);
                        if (block && block.timestamp) {
                            blockTimestamp = new Date(Number(block.timestamp) * 1000);
                            blockTimestampUnix = block.timestamp.toString();
                        }
                    } catch {
                        // Fallback to current time
                    }

                    const distributionId = parsed.args.distributionId
                        ? parsed.args.distributionId.toString()
                        : null;

                    // 1. Process Event and update RoyaltyDistribution projection
                    if (parsed.name === "DistributionCreated") {
                        const sourceKey = parsed.args.sourceKey ? parsed.args.sourceKey.toLowerCase() : "";
                        const sourceTypeNum = Number(parsed.args.sourceType);
                        const sourceTypeName = blockchain.mapSourceTypeName(sourceTypeNum);
                        const sourceId = parsed.args.sourceId ? parsed.args.sourceId.toString() : "0";
                        const payer = parsed.args.payer ? parsed.args.payer.toLowerCase() : "";
                        const totalRevenue = parsed.args.totalRevenue ? parsed.args.totalRevenue.toString() : "0";

                        await royaltyRepository.createOrUpsertDistribution({
                            distributionId,
                            sourceKey,
                            sourceType: sourceTypeName,
                            sourceTypeNum,
                            sourceId,
                            payer,
                            totalRevenue,
                            status: "DISTRIBUTED",
                            blockchain: {
                                chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                                contractAddress: address.toLowerCase(),
                                transactionHash: txHash,
                                blockNumber: log.blockNumber,
                                transactionIndex: log.transactionIndex !== undefined ? log.transactionIndex : 0,
                                logIndex,
                                state: "CONFIRMED",
                            },
                            blockTimestamp,
                            blockTimestampUnix,
                            reconciled: false,
                        });

                        logger.info(`Royalty distribution #${distributionId} created and indexed from tx ${txHash}`);
                    } else if (parsed.name === "RecipientPaid") {
                        const recipient = parsed.args.recipient ? parsed.args.recipient.toLowerCase() : "";
                        const amount = parsed.args.amount ? parsed.args.amount.toString() : "0";
                        const shareBps = parsed.args.shareBps ? Number(parsed.args.shareBps) : 0;

                        await royaltyRepository.addRecipientAllocation(distributionId, {
                            recipient,
                            amount,
                            shareBps,
                            paid: true,
                        });

                        logger.debug(`RecipientPaid recorded for distribution #${distributionId}: ${recipient} (${amount} wei)`);
                    } else if (parsed.name === "TreasuryPaid") {
                        const amount = parsed.args.amount ? parsed.args.amount.toString() : "0";
                        const feeBps = parsed.args.feeBps ? Number(parsed.args.feeBps) : 0;

                        await royaltyRepository.updateTreasuryAllocation(distributionId, {
                            treasuryAmount: amount,
                            feeBps,
                        });

                        logger.debug(`TreasuryPaid recorded for distribution #${distributionId}: ${amount} wei`);
                    } else if (parsed.name === "DistributionCompleted") {
                        const totalDistributed = parsed.args.totalDistributed
                            ? parsed.args.totalDistributed.toString()
                            : undefined;
                        const recipientCount = parsed.args.recipientCount
                            ? Number(parsed.args.recipientCount)
                            : undefined;
                        const timestamp = parsed.args.timestamp
                            ? parsed.args.timestamp.toString()
                            : undefined;

                        await royaltyRepository.markDistributionCompleted(distributionId, {
                            totalDistributed,
                            recipientCount,
                            timestamp,
                        });

                        logger.info(`DistributionCompleted recorded for distribution #${distributionId}`);
                    } else if (parsed.name === "TreasuryUpdated") {
                        logger.info(`RoyaltyEngine Treasury updated: old=${parsed.args.oldTreasury}, new=${parsed.args.newTreasury}`);
                    } else if (parsed.name === "TreasuryFeeUpdated") {
                        logger.info(`RoyaltyEngine Treasury fee updated: old=${parsed.args.oldFeeBps}, new=${parsed.args.newFeeBps}`);
                    }

                    // 2. Record event in BlockchainEvent for log-level idempotency
                    try {
                        await BlockchainEvent.create({
                            chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                            contractAddress: address.toLowerCase(),
                            contractName: "RoyaltyEngine",
                            eventName: parsed.name,
                            transactionHash: txHash,
                            blockNumber: log.blockNumber,
                            blockHash: log.blockHash ? log.blockHash.toLowerCase() : "0x",
                            blockTimestamp,
                            logIndex,
                            distributionId,
                            amount: parsed.args.amount ? parsed.args.amount.toString() : (parsed.args.totalRevenue ? parsed.args.totalRevenue.toString() : undefined),
                            from: parsed.args.payer ? parsed.args.payer.toLowerCase() : undefined,
                            to: parsed.args.recipient ? parsed.args.recipient.toLowerCase() : undefined,
                            arguments: {
                                ...parsed.args,
                            },
                        });
                    } catch (dupErr) {
                        logger.debug(`BlockchainEvent already logged for tx ${txHash}:${logIndex}`);
                    }
                }

                await stateRepository.saveLastIndexedBlock(identity, toBlock);
                fromBlock = toBlock + 1;
            }
        } catch (error) {
            logger.error(`Royalty event indexer error: ${error.message}`);
        } finally {
            this.running = false;
        }
    }

    start() {
        if (this.timer) return this.timer;
        const interval = env.INDEXER_INTERVAL_MS || 15000;
        this.runOnce().catch(() => {});
        this.timer = setInterval(() => {
            this.runOnce().catch(() => {});
        }, interval);
        logger.info(`Royalty event indexer started (interval: ${interval}ms)`);
        return this.timer;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            logger.info("Royalty event indexer stopped");
        }
    }
}

export default new RoyaltyEventIndexer();
