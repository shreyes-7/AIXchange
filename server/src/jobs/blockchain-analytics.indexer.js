import { ethers } from "ethers";
import env from "../config/env.js";
import { provider, configuredChainId } from "../config/blockchain.js";
import { getActiveContractSources } from "../config/contracts.config.js";
import { normalizeEvent } from "../utils/event-normalizer.js";
import * as analyticsRepository from "../repositories/blockchain-analytics.repository.js";
import IndexerState from "../models/indexer-state.model.js";
import logger from "../config/logger.js";

class BlockchainAnalyticsIndexer {
    constructor() {
        this.running = false;
        this.blockCache = new Map();
        this.txReceiptCache = new Map();
        this.intervalTimer = null;
    }

    async getBlockData(blockNumber) {
        if (!this.blockCache.has(blockNumber)) {
            const block = await provider.getBlock(blockNumber);
            if (!block) throw new Error(`Block ${blockNumber} not found on provider`);
            this.blockCache.set(blockNumber, {
                timestamp: new Date(Number(block.timestamp) * 1000),
                hash: block.hash,
            });
        }
        return this.blockCache.get(blockNumber);
    }

    async getReceiptData(txHash) {
        const hashLower = txHash.toLowerCase();
        if (!this.txReceiptCache.has(hashLower)) {
            const receipt = await provider.getTransactionReceipt(txHash);
            this.txReceiptCache.set(hashLower, receipt);
        }
        return this.txReceiptCache.get(hashLower);
    }

    async indexContractSource(source, safeBlock) {
        const identity = {
            chainId: configuredChainId,
            contractAddress: source.address.toLowerCase(),
            indexer: "blockchain-analytics",
        };

        const state = await IndexerState.findOne(identity).lean();
        let fromBlock = state ? state.lastIndexedBlock + 1 : env.BLOCKCHAIN_START_BLOCK;

        if (fromBlock > safeBlock) {
            return;
        }

        while (fromBlock <= safeBlock) {
            const toBlock = Math.min(fromBlock + env.INDEXER_BATCH_SIZE - 1, safeBlock);

            try {
                const logs = await provider.getLogs({
                    address: source.address,
                    fromBlock,
                    toBlock,
                });

                for (const log of logs) {
                    let parsed = null;
                    try {
                        parsed = source.interface.parseLog(log);
                    } catch {
                        continue;
                    }

                    if (!parsed) continue;

                    const blockData = await this.getBlockData(log.blockNumber);

                    // 1. Normalize and persist event
                    const normalized = normalizeEvent({
                        log,
                        parsed,
                        contractName: source.contractName,
                        contractAddress: source.address,
                        chainId: configuredChainId,
                        blockTimestamp: blockData.timestamp,
                        blockHash: blockData.hash,
                    });

                    await analyticsRepository.upsertEvent(normalized);

                    // 2. Obtain transaction receipt for gas analytics
                    try {
                        const receipt = await this.getReceiptData(log.transactionHash);
                        if (receipt) {
                            const gasUsed = BigInt(receipt.gasUsed.toString());
                            const effectiveGasPrice = BigInt(
                                (receipt.effectiveGasPrice ?? receipt.gasPrice ?? 0n).toString()
                            );
                            const gasCost = gasUsed * effectiveGasPrice;

                            await analyticsRepository.upsertGasTx({
                                chainId: configuredChainId,
                                transactionHash: log.transactionHash.toLowerCase(),
                                blockNumber: Number(log.blockNumber),
                                blockHash: (blockData.hash || log.blockHash || "").toLowerCase(),
                                blockTimestamp: blockData.timestamp,
                                contractAddress: source.address.toLowerCase(),
                                contractName: source.contractName,
                                from: receipt.from ? receipt.from.toLowerCase() : normalized.from || "",
                                to: receipt.to ? receipt.to.toLowerCase() : source.address.toLowerCase(),
                                gasUsed: gasUsed.toString(),
                                effectiveGasPrice: effectiveGasPrice.toString(),
                                gasCost: gasCost.toString(),
                                gasUsedNum: Number(gasUsed),
                                gasCostEth: parseFloat(ethers.formatEther(gasCost)),
                            });
                        }
                    } catch (receiptError) {
                        logger.warn(`Failed to process gas receipt for tx ${log.transactionHash}: ${receiptError.message}`);
                    }
                }

                // Checkpoint only after successful batch processing
                await IndexerState.findOneAndUpdate(
                    identity,
                    {
                        $set: {
                            lastIndexedBlock: toBlock,
                            lastSuccessfulSync: new Date(),
                            status: "synced",
                        },
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                fromBlock = toBlock + 1;
            } catch (batchError) {
                await IndexerState.findOneAndUpdate(
                    identity,
                    { $set: { status: "error" } },
                    { upsert: true }
                );
                logger.error(
                    `Batch indexing failed for contract ${source.contractName} [${fromBlock}-${toBlock}]: ${batchError.message}`
                );
                throw batchError;
            }
        }
    }

    async runOnce() {
        if (this.running) return;
        this.running = true;

        try {
            const head = await provider.getBlockNumber();
            const safeBlock = head - env.BLOCKCHAIN_CONFIRMATIONS;
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) return;

            const sources = getActiveContractSources(env);
            for (const source of sources) {
                await this.indexContractSource(source, safeBlock);
            }
        } catch (error) {
            logger.error(`Blockchain analytics indexer run failed: ${error.message}`);
        } finally {
            this.running = false;
            this.blockCache.clear();
            this.txReceiptCache.clear();
        }
    }

    start() {
        this.runOnce().catch((err) =>
            logger.error(`Initial blockchain analytics indexing run failed: ${err.message}`)
        );

        this.intervalTimer = setInterval(() => {
            this.runOnce().catch((err) =>
                logger.error(`Periodic blockchain analytics indexing run failed: ${err.message}`)
            );
        }, env.INDEXER_INTERVAL_MS);

        return this.intervalTimer;
    }

    stop() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
    }
}

export default new BlockchainAnalyticsIndexer();
