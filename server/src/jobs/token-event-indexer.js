import { ethers } from "ethers";
import env from "../config/env.js";
import { aixTokenAddress, AIX_TOKEN_ABI, configuredChainId, provider, purchaseEngineAddress, PURCHASE_ENGINE_ABI } from "../config/blockchain.js";
import transactionRepository from "../repositories/transaction.repository.js";
import * as indexerStateRepository from "../repositories/indexer-state.repository.js";
import logger from "../config/logger.js";

const sources = [
    { name: "aix-token-events", address: aixTokenAddress, interface: new ethers.Interface(AIX_TOKEN_ABI), events: ["Transfer", "TokensMinted", "TokensBurned"] },
    ...(purchaseEngineAddress ? [{ name: "purchase-engine-events", address: purchaseEngineAddress, interface: new ethers.Interface(PURCHASE_ENGINE_ABI), events: ["DatasetPurchased"] }] : []),
];

class TokenEventIndexer {
    constructor() { this.running = false; this.timestamps = new Map(); }

    async timestamp(blockNumber) {
        if (!this.timestamps.has(blockNumber)) {
            const block = await provider.getBlock(blockNumber);
            if (!block) throw new Error(`Block ${blockNumber} not found`);
            this.timestamps.set(blockNumber, new Date(Number(block.timestamp) * 1000));
        }
        return this.timestamps.get(blockNumber);
    }

    eventData(source, log, parsed) {
        const base = { txHash: log.transactionHash, logIndex: log.index, blockNumber: log.blockNumber, contractAddress: source.address.toLowerCase() };
        if (parsed.name === "Transfer") return { ...base, eventType: "Transfer", from: parsed.args.from.toLowerCase(), to: parsed.args.to.toLowerCase(), amount: parsed.args.value.toString() };
        if (parsed.name === "TokensMinted") return { ...base, eventType: "TokensMinted", to: parsed.args.to.toLowerCase(), amount: parsed.args.amount.toString() };
        if (parsed.name === "TokensBurned") return { ...base, eventType: "TokensBurned", from: parsed.args.from.toLowerCase(), amount: parsed.args.amount.toString() };
        if (parsed.name === "DatasetPurchased") return { ...base, eventType: "DatasetPurchased", from: parsed.args.buyer.toLowerCase(), to: parsed.args.licensor.toLowerCase(), amount: parsed.args.price.toString() };
        return null;
    }

    async indexSource(source, safeBlock) {
        const identity = { chainId: configuredChainId, contractAddress: source.address, indexer: source.name };
        const state = await indexerStateRepository.get(identity);
        let fromBlock = state ? state.lastIndexedBlock + 1 : env.BLOCKCHAIN_START_BLOCK;
        while (fromBlock <= safeBlock) {
            const toBlock = Math.min(fromBlock + env.INDEXER_BATCH_SIZE - 1, safeBlock);
            const logs = await provider.getLogs({ address: source.address, fromBlock, toBlock, topics: [source.events.map((name) => source.interface.getEvent(name).topicHash)] });
            for (const log of logs) {
                const parsed = source.interface.parseLog(log);
                const data = this.eventData(source, log, parsed);
                if (data) await transactionRepository.upsert({ ...data, timestamp: await this.timestamp(log.blockNumber) });
            }
            await indexerStateRepository.saveLastIndexedBlock(identity, toBlock);
            fromBlock = toBlock + 1;
        }
    }

    async runOnce() {
        if (this.running) return;
        this.running = true;
        try {
            const head = await provider.getBlockNumber();
            const safeBlock = head - env.BLOCKCHAIN_CONFIRMATIONS;
            if (safeBlock >= env.BLOCKCHAIN_START_BLOCK) await Promise.all(sources.map((source) => this.indexSource(source, safeBlock)));
        } finally { this.running = false; this.timestamps.clear(); }
    }

    start() {
        this.runOnce().catch((error) => logger.error(`Token event indexer failed: ${error.message}`));
        return setInterval(() => this.runOnce().catch((error) => logger.error(`Token event indexer failed: ${error.message}`)), env.INDEXER_INTERVAL_MS);
    }
}

export default new TokenEventIndexer();
