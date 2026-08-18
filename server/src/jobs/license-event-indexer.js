import { ethers } from "ethers";
import env from "../config/env.js";
import blockchain from "../services/licenseBlockchain.service.js";
import * as stateRepository from "../repositories/indexer-state.repository.js";
import * as licenseRepository from "../repositories/license.repository.js";
import logger from "../config/logger.js";

class LicenseEventIndexer {
    constructor() { this.running = false; }

    async runOnce() {
        if (this.running || !env.LICENSE_REGISTRY_ADDRESS) return;
        this.running = true;
        try {
            const provider = blockchain.provider();
            await blockchain.validateNetwork(provider);
            const address = blockchain.config.registry;
            const iface = blockchain.interface;
            const head = await provider.getBlockNumber();
            const safeBlock = head - env.BLOCKCHAIN_CONFIRMATIONS;
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) return;
            const identity = { chainId: env.BLOCKCHAIN_CHAIN_ID, contractAddress: address, indexer: "license-registry-events" };
            const state = await stateRepository.get(identity);
            let fromBlock = state ? state.lastIndexedBlock + 1 : env.BLOCKCHAIN_START_BLOCK;
            const topics = ["LicenseCreated", "LicenseUpdated", "LicenseRevoked", "LicenseStatusChanged"].map((name) => iface.getEvent(name).topicHash);
            while (fromBlock <= safeBlock) {
                const toBlock = Math.min(fromBlock + env.INDEXER_BATCH_SIZE - 1, safeBlock);
                const logs = await provider.getLogs({ address, fromBlock, toBlock, topics: [topics] });
                for (const log of logs) {
                    const parsed = iface.parseLog(log);
                    if (!parsed) continue;
                    const licenseId = Number(parsed.args.licenseId);
                    const chain = await blockchain.getLicense(licenseId, provider);
                    const existing = await licenseRepository.findByLicenseId(licenseId);
                    const versions = parsed.name === "LicenseUpdated" && existing ? [...(existing.versions || []), { version: existing.version, fixedPrice: existing.fixedPrice, royaltyRate: existing.royaltyRate, metadataURI: existing.metadataURI, rights: existing.rights, restrictions: existing.restrictions, updatedAt: existing.updatedAt }] : (existing?.versions || []);
                    await licenseRepository.saveConfirmed(licenseId, { ...chain, versions, blockchain: { contractAddress: address.toLowerCase(), transactionHash: log.transactionHash.toLowerCase(), blockNumber: log.blockNumber, chainId: env.BLOCKCHAIN_CHAIN_ID, state: "CONFIRMED", lastSyncedAt: new Date() } });
                }
                await stateRepository.saveLastIndexedBlock(identity, toBlock);
                fromBlock = toBlock + 1;
            }
        } finally { this.running = false; }
    }

    start() {
        if (!env.LICENSE_REGISTRY_ADDRESS) return null;
        this.runOnce().catch((error) => logger.error(`License event indexer failed: ${error.message}`));
        return setInterval(() => this.runOnce().catch((error) => logger.error(`License event indexer failed: ${error.message}`)), env.INDEXER_INTERVAL_MS);
    }
}

export default new LicenseEventIndexer();
