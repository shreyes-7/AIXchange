import env from "../config/env.js";
import blockchain from "../services/modelBlockchain.service.js";
import * as stateRepository from "../repositories/indexer-state.repository.js";
import * as modelRepository from "../repositories/model.repository.js";
import logger from "../config/logger.js";

class ModelEventIndexer {
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
            return;
        }

        this.running = true;
        try {
            const provider = blockchain.provider();
            await blockchain.validateNetwork(provider);
            const address = contractAddress;
            const iface = blockchain.interface;

            const head = await provider.getBlockNumber();
            const safeBlock = head - env.BLOCKCHAIN_CONFIRMATIONS;
            if (safeBlock < env.BLOCKCHAIN_START_BLOCK) return;

            const identity = {
                chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                contractAddress: address.toLowerCase(),
                indexer: "model-registry-events",
            };

            const state = await stateRepository.get(identity);
            let fromBlock = state ? state.lastIndexedBlock + 1 : env.BLOCKCHAIN_START_BLOCK;

            const eventNames = [
                "ModelRegistered",
                "ModelVersionAdded",
                "ModelStatusChanged",
                "ModelOwnershipTransferred",
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
                const toBlock = Math.min(fromBlock + env.INDEXER_BATCH_SIZE - 1, safeBlock);
                const logs = await provider.getLogs({
                    address,
                    fromBlock,
                    toBlock,
                    topics: [topics],
                });

                for (const log of logs) {
                    let parsed;
                    try {
                        parsed = iface.parseLog(log);
                    } catch {
                        continue;
                    }
                    if (!parsed) continue;

                    const modelId = Number(parsed.args.modelId);
                    const txMetadata = {
                        contractAddress: address.toLowerCase(),
                        transactionHash: log.transactionHash.toLowerCase(),
                        blockNumber: log.blockNumber,
                        chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
                        state: "CONFIRMED",
                        lastSyncedAt: new Date(),
                    };

                    if (parsed.name === "ModelRegistered") {
                        const ownerWallet = parsed.args.owner.toLowerCase();
                        const name = parsed.args.name;
                        const metadataURI = parsed.args.metadataURI;
                        const modelHash = parsed.args.modelHash.toLowerCase();
                        const initialVersion = Number(parsed.args.initialVersion || 1);
                        const createdAt = new Date(Number(parsed.args.createdAt) * 1000);

                        const existing = await modelRepository.findByBlockchainId(modelId);
                        const initialVer = {
                            versionNumber: initialVersion,
                            modelHash,
                            metadataURI,
                            artifactPath: null,
                            fileSize: 0,
                            changelog: "Initial version (v1)",
                            createdAt,
                            active: true,
                        };

                        const payload = {
                            blockchainModelId: modelId,
                            ownerWallet,
                            name: existing?.name || name,
                            description: existing?.description || "",
                            category: existing?.category || "general",
                            tags: existing?.tags || [],
                            framework: existing?.framework || "PyTorch",
                            modelType: existing?.modelType || "general",
                            metadataURI,
                            currentVersion: initialVersion,
                            totalVersions: 1,
                            active: true,
                            versions: existing?.versions?.length ? existing.versions : [initialVer],
                            blockchain: txMetadata,
                        };

                        const { blockchain: bcData, ...otherFields } = payload;
                        await modelRepository.saveConfirmed(modelId, {
                            ...otherFields,
                            "blockchain.contractAddress": bcData.contractAddress,
                            "blockchain.transactionHash": bcData.transactionHash,
                            "blockchain.blockNumber": bcData.blockNumber,
                            "blockchain.chainId": bcData.chainId,
                        });
                        logger.info("MODEL_REGISTERED_EVENT_INDEXED", {
                            modelId,
                            ownerWallet,
                            txHash: log.transactionHash,
                        });
                    } else if (parsed.name === "ModelVersionAdded") {
                        const versionNumber = Number(parsed.args.versionNumber);
                        const modelHash = parsed.args.modelHash.toLowerCase();
                        const metadataURI = parsed.args.metadataURI;
                        const createdAt = new Date(Number(parsed.args.createdAt) * 1000);

                        const existing = await modelRepository.findByBlockchainId(modelId);
                        if (existing) {
                            const versionExists = existing.versions?.some(
                                (v) => v.versionNumber === versionNumber
                            );
                            if (!versionExists) {
                                await modelRepository.addVersion(modelId, {
                                    versionNumber,
                                    modelHash,
                                    metadataURI,
                                    artifactPath: null,
                                    fileSize: 0,
                                    changelog: `Version v${versionNumber}`,
                                    createdAt,
                                    active: true,
                                });
                                logger.info("MODEL_VERSION_ADDED_EVENT_INDEXED", {
                                    modelId,
                                    versionNumber,
                                    txHash: log.transactionHash,
                                });
                            }
                        }
                    } else if (parsed.name === "ModelStatusChanged") {
                        const active = Boolean(parsed.args.active);
                        await modelRepository.updateStatus(modelId, active);
                        logger.info("MODEL_STATUS_CHANGED_EVENT_INDEXED", {
                            modelId,
                            active,
                            txHash: log.transactionHash,
                        });
                    } else if (parsed.name === "ModelOwnershipTransferred") {
                        const newOwner = parsed.args.newOwner.toLowerCase();
                        await modelRepository.updateOwnership(modelId, newOwner);
                        logger.info("MODEL_OWNERSHIP_TRANSFERRED_EVENT_INDEXED", {
                            modelId,
                            newOwner,
                            txHash: log.transactionHash,
                        });
                    }
                }

                await stateRepository.saveLastIndexedBlock(identity, toBlock);
                fromBlock = toBlock + 1;
            }
        } catch (error) {
            logger.error(`Model event indexer batch run failed: ${error.message}`);
        } finally {
            this.running = false;
        }
    }

    start() {
        try {
            if (!blockchain.config.registry) return null;
        } catch {
            return null;
        }

        this.runOnce().catch((error) =>
            logger.error(`Model event indexer initial run failed: ${error.message}`)
        );

        this.timer = setInterval(
            () =>
                this.runOnce().catch((error) =>
                    logger.error(`Model event indexer periodic run failed: ${error.message}`)
                ),
            env.INDEXER_INTERVAL_MS
        );
        return this.timer;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

export default new ModelEventIndexer();
export { ModelEventIndexer };
