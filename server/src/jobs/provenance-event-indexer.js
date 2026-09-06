import env from "../config/env.js";
import blockchain from "../services/provenanceBlockchain.service.js";
import * as stateRepository from "../repositories/indexer-state.repository.js";
import * as provenanceRepository from "../repositories/provenance.repository.js";
import logger from "../config/logger.js";

class ProvenanceEventIndexer {
    constructor() {
        this.running = false;
        this.timer = null;
    }

    async runOnce() {
        if (this.running) return;
        let contractAddress;
        try {
            contractAddress = blockchain.config.registry;
        } catch {
            // Contract not yet configured; silently skip cycle without crashing
            return;
        }

        this.running = true;
        try {
            const provider = blockchain.provider();
            await blockchain.validateNetwork(provider);
            const address = contractAddress;
            const iface = blockchain.interface;

            const head = await provider.getBlockNumber();
            const safeBlock = head - (env.BLOCKCHAIN_CONFIRMATIONS || 0);
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) {
                this.running = false;
                return;
            }

            const identity = {
                chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                contractAddress: address.toLowerCase(),
                indexer: "provenance-registry-events",
            };

            const state = await stateRepository.get(identity);
            let fromBlock = state ? state.lastIndexedBlock + 1 : (env.BLOCKCHAIN_START_BLOCK || 0);

            const eventNames = ["ProvenanceRegistered", "ProvenanceStatusChanged"];
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
                    logger.warn(`Provenance indexer getLogs failed for blocks [${fromBlock}, ${toBlock}]: ${rpcErr.message}`);
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

                    const provenanceId = Number(parsed.args.provenanceId);
                    const logIndex = log.index !== undefined ? log.index : (log.logIndex || 0);
                    const eventIdentity = `${Number(env.BLOCKCHAIN_CHAIN_ID)}:${address.toLowerCase()}:${log.transactionHash.toLowerCase()}:${logIndex}`;

                    const txMetadata = {
                        chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                        contractAddress: address.toLowerCase(),
                        transactionHash: log.transactionHash.toLowerCase(),
                        blockNumber: log.blockNumber,
                        transactionIndex: log.transactionIndex,
                        logIndex,
                        eventIdentity,
                        state: "CONFIRMED",
                    };

                    if (parsed.name === "ProvenanceRegistered") {
                        const datasetId = Number(parsed.args.datasetId);
                        const modelId = Number(parsed.args.modelId);
                        const modelVersion = Number(parsed.args.modelVersion);
                        const executionId = String(parsed.args.executionId);
                        const metadataHash = String(parsed.args.metadataHash).toLowerCase();
                        const registrant = String(parsed.args.registrant).toLowerCase();
                        const createdAtTimestamp = Number(parsed.args.createdAt);
                        const createdAt = new Date(createdAtTimestamp * 1000);

                        await provenanceRepository.createOrUpsertProjection({
                            provenanceId,
                            datasetId,
                            modelId,
                            modelVersion,
                            executionId,
                            metadataHash,
                            registrant,
                            createdAt,
                            createdAtTimestamp,
                            active: true,
                            blockchain: txMetadata,
                        });

                        logger.info(`Indexed ProvenanceRegistered: #${provenanceId} (Model: ${modelId}v${modelVersion}, Dataset: ${datasetId})`);
                    } else if (parsed.name === "ProvenanceStatusChanged") {
                        const active = Boolean(parsed.args.active);
                        await provenanceRepository.updateStatus(provenanceId, active, {
                            "blockchain.lastStatusTxHash": log.transactionHash.toLowerCase(),
                            "blockchain.lastStatusBlockNumber": log.blockNumber,
                        });
                        logger.info(`Indexed ProvenanceStatusChanged: #${provenanceId} -> active=${active}`);
                    }
                }

                await stateRepository.saveLastIndexedBlock(identity, toBlock);

                fromBlock = toBlock + 1;
            }
        } catch (error) {
            logger.error(`Provenance indexer error: ${error.message}`);
        } finally {
            this.running = false;
        }
    }

    start() {
        if (this.timer) return this.timer;
        const interval = env.INDEXER_INTERVAL_MS || 15000;
        this.runOnce().catch(() => {});
        this.timer = setInterval(() => this.runOnce().catch(() => {}), interval);
        logger.info(`Provenance event indexer registered (interval: ${interval}ms).`);
        return this.timer;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.running = false;
            logger.info("Provenance event indexer stopped.");
        }
    }
}

export default new ProvenanceEventIndexer();
export { ProvenanceEventIndexer };
