import * as repository from "../repositories/provenance.repository.js";
import blockchain from "./provenanceBlockchain.service.js";
import Dataset from "../models/dataset.model.js";
import Model from "../models/model.model.js";
import Sandbox from "../models/sandbox.model.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

class ProvenanceService {
    async create(user, payload) {
        const wallet = blockchain.wallet(user);
        const { datasetId, modelId, modelVersion, executionId, metadataHash } = payload;

        const prepared = await blockchain.prepareRegister(
            datasetId,
            modelId,
            modelVersion,
            executionId,
            metadataHash,
            wallet
        );

        // Optionally stage PREPARED projection in MongoDB
        try {
            await repository.createOrUpsertProjection({
                datasetId,
                modelId,
                modelVersion,
                executionId,
                metadataHash: metadataHash.toLowerCase(),
                registrant: wallet.toLowerCase(),
                createdAt: new Date(),
                createdAtTimestamp: Math.floor(Date.now() / 1000),
                active: true,
                blockchain: {
                    chainId: Number(prepared.chainId),
                    contractAddress: prepared.to.toLowerCase(),
                    state: "PREPARED",
                },
            });
        } catch (stageErr) {
            logger.warn(`Staging PREPARED provenance projection skipped: ${stageErr.message}`);
        }

        return {
            state: "PREPARED",
            operation: "register",
            transaction: prepared,
            provenance: {
                datasetId,
                modelId,
                modelVersion,
                executionId,
                metadataHash: metadataHash.toLowerCase(),
            },
        };
    }

    async sync(user, payload) {
        const wallet = blockchain.wallet(user);
        const { txHash, operation = "register" } = payload;

        const confirmation = await blockchain.confirmTransaction(
            txHash,
            { operation },
            wallet
        );

        if (confirmation.state !== "CONFIRMED") {
            return {
                state: "PENDING",
                txHash,
                message: "Transaction is pending confirmation on the blockchain.",
            };
        }

        const rec = confirmation.record;
        const saved = await repository.createOrUpsertProjection({
            provenanceId: confirmation.provenanceId,
            datasetId: rec.datasetId,
            modelId: rec.modelId,
            modelVersion: rec.modelVersion,
            executionId: rec.executionId,
            metadataHash: rec.metadataHash,
            registrant: rec.registrant,
            createdAt: rec.createdAt,
            createdAtTimestamp: rec.createdAtTimestamp,
            active: rec.active,
            blockchain: {
                chainId: confirmation.record.chainId || Number(process.env.BLOCKCHAIN_CHAIN_ID || 31337),
                contractAddress: blockchain.config.registry.toLowerCase(),
                transactionHash: confirmation.txHash,
                blockNumber: confirmation.blockNumber,
                transactionIndex: confirmation.transactionIndex,
                logIndex: confirmation.logIndex,
                eventIdentity: confirmation.eventIdentity,
                state: "CONFIRMED",
            },
        });

        return {
            state: "CONFIRMED",
            provenanceId: confirmation.provenanceId,
            provenance: saved,
        };
    }

    async getByProvenanceId(provenanceId) {
        const record = await repository.findByProvenanceId(provenanceId);
        if (!record) {
            throw new ApiError(404, `Provenance record #${provenanceId} not found.`);
        }
        return this._enrichRecord(record);
    }

    async getByMongoId(id) {
        const record = await repository.findByMongoId(id);
        if (!record) {
            throw new ApiError(404, `Provenance record with id '${id}' not found.`);
        }
        return this._enrichRecord(record);
    }

    async getByDataset(datasetId, options = {}) {
        const result = await repository.findByDataset(datasetId, options);
        result.records = await Promise.all(result.records.map((r) => this._enrichRecord(r)));
        return result;
    }

    async getByExecution(executionId, options = {}) {
        const result = await repository.findByExecution(executionId, options);
        result.records = await Promise.all(result.records.map((r) => this._enrichRecord(r)));
        return result;
    }

    async getByModel(modelId, options = {}) {
        const result = await repository.findByModel(modelId, options);
        result.records = await Promise.all(result.records.map((r) => this._enrichRecord(r)));
        return result;
    }

    async getByModelVersion(modelId, modelVersion, options = {}) {
        const result = await repository.findByModelVersion(modelId, modelVersion, options);
        result.records = await Promise.all(result.records.map((r) => this._enrichRecord(r)));
        return result;
    }

    async getGraph(modelId) {
        const records = await repository.listAllForModel(modelId);
        if (!records || records.length === 0) {
            // Check if model exists
            const model = await Model.findOne({ blockchainModelId: Number(modelId) }).catch(() => null);
            if (!model) {
                throw new ApiError(404, `Model #${modelId} has no provenance records or was not found.`);
            }
        }

        const nodesMap = new Map();
        const edges = [];
        const edgeSet = new Set();

        // Model Root Node
        const modelNodeId = `model:${modelId}`;
        nodesMap.set(modelNodeId, {
            id: modelNodeId,
            type: "model",
            entityId: String(modelId),
            label: `Model #${modelId}`,
        });

        for (const r of records) {
            // 1. Dataset Node
            const datasetNodeId = `dataset:${r.datasetId}`;
            if (!nodesMap.has(datasetNodeId)) {
                nodesMap.set(datasetNodeId, {
                    id: datasetNodeId,
                    type: "dataset",
                    entityId: String(r.datasetId),
                    label: `Dataset #${r.datasetId}`,
                });
            }

            // 2. Execution Node
            const executionNodeId = `execution:${r.executionId}`;
            if (!nodesMap.has(executionNodeId)) {
                nodesMap.set(executionNodeId, {
                    id: executionNodeId,
                    type: "execution",
                    entityId: r.executionId,
                    label: `Execution ${r.executionId}`,
                });
            }

            // 3. Model Version Node
            const versionNodeId = `model_version:${r.modelId}:${r.modelVersion}`;
            if (!nodesMap.has(versionNodeId)) {
                nodesMap.set(versionNodeId, {
                    id: versionNodeId,
                    type: "model_version",
                    entityId: `${r.modelId}:${r.modelVersion}`,
                    version: r.modelVersion,
                    label: `Model #${r.modelId} v${r.modelVersion}`,
                });
            }

            // Edge 1: Dataset -> USED_IN -> Execution
            const dToE = `${datasetNodeId}->${executionNodeId}:USED_IN`;
            if (!edgeSet.has(dToE)) {
                edgeSet.add(dToE);
                edges.push({
                    source: datasetNodeId,
                    target: executionNodeId,
                    type: "USED_IN",
                });
            }

            // Edge 2: Execution -> PRODUCED -> ModelVersion
            const eToV = `${executionNodeId}->${versionNodeId}:PRODUCED`;
            if (!edgeSet.has(eToV)) {
                edgeSet.add(eToV);
                edges.push({
                    source: executionNodeId,
                    target: versionNodeId,
                    type: "PRODUCED",
                    provenanceId: r.provenanceId,
                    metadataHash: r.metadataHash,
                });
            }

            // Edge 3: Model -> HAS_VERSION -> ModelVersion
            const mToV = `${modelNodeId}->${versionNodeId}:HAS_VERSION`;
            if (!edgeSet.has(mToV)) {
                edgeSet.add(mToV);
                edges.push({
                    source: modelNodeId,
                    target: versionNodeId,
                    type: "HAS_VERSION",
                    version: r.modelVersion,
                });
            }
        }

        // Optional Enrichment of graph nodes
        await this._enrichGraphNodes(nodesMap);

        return {
            modelId: Number(modelId),
            nodes: Array.from(nodesMap.values()),
            edges,
        };
    }

    async getTimeline(modelId) {
        const records = await repository.listAllForModel(modelId);
        if (!records || records.length === 0) {
            throw new ApiError(404, `No provenance events found for model #${modelId}.`);
        }

        const timeline = [];

        for (const r of records) {
            // Blockchain Provenance Registration Event
            timeline.push({
                timestamp: r.createdAt,
                timestampSeconds: r.createdAtTimestamp,
                source: "blockchain_provenance",
                eventType: "PROVENANCE_REGISTERED",
                provenanceId: r.provenanceId,
                datasetId: r.datasetId,
                modelId: r.modelId,
                modelVersion: r.modelVersion,
                executionId: r.executionId,
                metadataHash: r.metadataHash,
                registrant: r.registrant,
                active: r.active,
                blockchain: {
                    blockNumber: r.blockchain?.blockNumber ?? null,
                    transactionHash: r.blockchain?.transactionHash ?? null,
                    transactionIndex: r.blockchain?.transactionIndex ?? null,
                    logIndex: r.blockchain?.logIndex ?? null,
                },
            });

            // Optional Actual Phase 7 Execution Event (never fabricated)
            const sandbox = await Sandbox.findOne({ executionId: r.executionId }).catch(() => null);
            if (sandbox) {
                if (sandbox.createdAt) {
                    timeline.push({
                        timestamp: sandbox.createdAt,
                        timestampSeconds: Math.floor(new Date(sandbox.createdAt).getTime() / 1000),
                        source: "phase7_execution",
                        eventType: "TRAINING_STARTED",
                        executionId: sandbox.executionId,
                        sandboxId: sandbox.sandboxId,
                        status: sandbox.status,
                        datasetId: sandbox.datasetId,
                    });
                }
                if (sandbox.updatedAt && sandbox.status === "completed") {
                    timeline.push({
                        timestamp: sandbox.updatedAt,
                        timestampSeconds: Math.floor(new Date(sandbox.updatedAt).getTime() / 1000),
                        source: "phase7_execution",
                        eventType: "TRAINING_COMPLETED",
                        executionId: sandbox.executionId,
                        sandboxId: sandbox.sandboxId,
                        status: sandbox.status,
                        artifactHash: sandbox.artifact?.artifactHash,
                    });
                }
            }
        }

        // Sort deterministically: blockNumber ASC, txIndex ASC, logIndex ASC, timestamp ASC
        timeline.sort((a, b) => {
            const blockA = a.blockchain?.blockNumber ?? 0;
            const blockB = b.blockchain?.blockNumber ?? 0;
            if (blockA !== blockB) return blockA - blockB;

            const logA = a.blockchain?.logIndex ?? 0;
            const logB = b.blockchain?.logIndex ?? 0;
            if (logA !== logB) return logA - logB;

            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        return {
            modelId: Number(modelId),
            totalEvents: timeline.length,
            events: timeline,
        };
    }

    async verify(provenanceId, expectedParams = {}) {
        const idNum = Number(provenanceId);
        const projection = await repository.findByProvenanceId(idNum);

        let onChainRecord = null;
        let verifiedOnChain = false;

        try {
            onChainRecord = await blockchain.getProvenance(idNum);
            if (onChainRecord && onChainRecord.provenanceId === idNum && onChainRecord.active) {
                const expDataset = expectedParams.datasetId !== undefined ? Number(expectedParams.datasetId) : onChainRecord.datasetId;
                const expExec = expectedParams.executionId || onChainRecord.executionId;
                const expModel = expectedParams.modelId !== undefined ? Number(expectedParams.modelId) : onChainRecord.modelId;
                const expVer = expectedParams.modelVersion !== undefined ? Number(expectedParams.modelVersion) : onChainRecord.modelVersion;
                const expHash = expectedParams.metadataHash || onChainRecord.metadataHash;

                verifiedOnChain = await blockchain.verifyProvenance(
                    idNum,
                    expDataset,
                    expExec,
                    expModel,
                    expVer,
                    expHash
                );
            }
        } catch (chainErr) {
            logger.warn(`On-chain verification query failed for #${idNum}: ${chainErr.message}`);
        }

        return {
            provenanceId: idNum,
            verified_on_chain: verifiedOnChain,
            indexed: Boolean(projection),
            projectionFound: Boolean(projection),
            onChainFound: Boolean(onChainRecord),
            onChainRecord: onChainRecord || null,
            source: "blockchain",
        };
    }

    async verifyHash(provenanceId, metadataHash) {
        const idNum = Number(provenanceId);
        const isValid = await blockchain.verifyProvenanceHash(idNum, metadataHash);
        return {
            provenanceId: idNum,
            metadataHash,
            verified_on_chain: isValid,
            source: "blockchain",
        };
    }

    async setStatus(user, provenanceId, active) {
        const wallet = blockchain.wallet(user);
        const prepared = await blockchain.prepareSetStatus(provenanceId, active, wallet);

        return {
            state: "PREPARED",
            operation: "setStatus",
            provenanceId: Number(provenanceId),
            active: Boolean(active),
            transaction: prepared,
        };
    }

    async _enrichRecord(record) {
        const doc = record.toObject ? record.toObject() : { ...record };

        // Optional non-blocking enrichment
        try {
            const [dataset, model, sandbox] = await Promise.all([
                Dataset.findOne({ "blockchain.datasetId": String(doc.datasetId) }).lean().catch(() => null),
                Model.findOne({ blockchainModelId: doc.modelId }).lean().catch(() => null),
                Sandbox.findOne({ executionId: doc.executionId }).lean().catch(() => null),
            ]);

            doc.enrichment = {
                dataset: dataset ? { title: dataset.title, category: dataset.category, license: dataset.license } : null,
                model: model ? { name: model.name, category: model.category, currentOwner: model.ownerWallet } : null,
                execution: sandbox ? { status: sandbox.status, metrics: sandbox.metrics?.bestValAccuracy } : null,
            };
        } catch {
            doc.enrichment = null;
        }

        return doc;
    }

    async _enrichGraphNodes(nodesMap) {
        try {
            const datasetIds = [];
            const modelIds = [];
            const executionIds = [];

            for (const node of nodesMap.values()) {
                if (node.type === "dataset") datasetIds.push(node.entityId);
                if (node.type === "model") modelIds.push(Number(node.entityId));
                if (node.type === "execution") executionIds.push(node.entityId);
            }

            const [datasets, models, sandboxes] = await Promise.all([
                Dataset.find({ "blockchain.datasetId": { $in: datasetIds } }).lean().catch(() => []),
                Model.find({ blockchainModelId: { $in: modelIds } }).lean().catch(() => []),
                Sandbox.find({ executionId: { $in: executionIds } }).lean().catch(() => []),
            ]);

            const datasetMap = new Map(datasets.map((d) => [String(d.blockchain?.datasetId), d]));
            const modelMap = new Map(models.map((m) => [Number(m.blockchainModelId), m]));
            const sandboxMap = new Map(sandboxes.map((s) => [s.executionId, s]));

            for (const node of nodesMap.values()) {
                if (node.type === "dataset") {
                    const d = datasetMap.get(node.entityId);
                    if (d) node.label = d.title || node.label;
                } else if (node.type === "model") {
                    const m = modelMap.get(Number(node.entityId));
                    if (m) node.label = m.name || node.label;
                } else if (node.type === "execution") {
                    const s = sandboxMap.get(node.entityId);
                    if (s) node.status = s.status;
                }
            }
        } catch {
            // Optional enrichment fails gracefully
        }
    }
}

const serviceInstance = new ProvenanceService();
export default serviceInstance;
export { ProvenanceService };
