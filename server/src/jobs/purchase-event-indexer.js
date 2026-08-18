import env from "../config/env.js";
import purchaseBlockchain from "../services/purchaseBlockchain.service.js";
import * as stateRepository from "../repositories/indexer-state.repository.js";
import * as purchaseRepository from "../repositories/purchase.repository.js";
import logger from "../config/logger.js";

class PurchaseEventIndexer {
    constructor() { this.running = false; }

    async runOnce() {
        if (this.running || !env.PURCHASE_ENGINE_ADDRESS) return;
        this.running = true;
        try {
            const provider = purchaseBlockchain.provider();
            await purchaseBlockchain.validateNetwork(provider);
            const address = purchaseBlockchain.purchaseAddress;
            const head = await provider.getBlockNumber();
            const safeBlock = head - env.BLOCKCHAIN_CONFIRMATIONS;
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) return;
            const identity = { chainId: env.BLOCKCHAIN_CHAIN_ID, contractAddress: address, indexer: "purchase-engine-events" };
            const state = await stateRepository.get(identity);
            let fromBlock = state ? state.lastIndexedBlock + 1 : env.BLOCKCHAIN_START_BLOCK;
            const topics = ["DatasetPurchased", "RoyaltyTriggered"].map((name) => purchaseBlockchain.interface.getEvent(name).topicHash);
            while (fromBlock <= safeBlock) {
                const toBlock = Math.min(fromBlock + env.INDEXER_BATCH_SIZE - 1, safeBlock);
                const logs = await provider.getLogs({ address, fromBlock, toBlock, topics: [topics] });
                for (const log of logs) {
                    const parsed = purchaseBlockchain.interface.parseLog(log);
                    if (!parsed) continue;
                    if (parsed.name === "DatasetPurchased") {
                        const chain = await purchaseBlockchain.getPurchase(Number(parsed.args.purchaseId), provider);
                        await purchaseRepository.saveConfirmed({ ...chain, transactionHash: log.transactionHash.toLowerCase(), logIndex: log.index, blockNumber: log.blockNumber, chainId: env.BLOCKCHAIN_CHAIN_ID, contractAddress: address, status: "CONFIRMED" });
                        logger.info("PURCHASE_EVENT_INDEXED", { purchaseId: Number(parsed.args.purchaseId), transactionHash: log.transactionHash });
                    } else if (parsed.name === "RoyaltyTriggered") {
                        await purchaseRepository.saveRoyalty(Number(parsed.args.purchaseId), { purchaseId: Number(parsed.args.purchaseId), assetId: Number(parsed.args.assetId), licenseId: Number(parsed.args.licenseId), licensorWallet: parsed.args.licensor, licensorAmount: parsed.args.licensorAmount.toString(), feeAmount: parsed.args.feeAmount.toString(), transactionHash: log.transactionHash.toLowerCase(), logIndex: log.index, blockNumber: log.blockNumber, timestamp: new Date(Number(parsed.args.timestamp) * 1000) });
                        logger.info("ROYALTY_TRIGGERED_INDEXED", { purchaseId: Number(parsed.args.purchaseId), transactionHash: log.transactionHash });
                    }
                }
                await stateRepository.saveLastIndexedBlock(identity, toBlock);
                fromBlock = toBlock + 1;
            }
        } finally { this.running = false; }
    }

    start() {
        if (!env.PURCHASE_ENGINE_ADDRESS) return null;
        this.runOnce().catch((error) => logger.error(`Purchase event indexer failed: ${error.message}`));
        return setInterval(() => this.runOnce().catch((error) => logger.error(`Purchase event indexer failed: ${error.message}`)), env.INDEXER_INTERVAL_MS);
    }
}

export default new PurchaseEventIndexer();
