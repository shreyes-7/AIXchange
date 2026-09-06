import * as repository from "../repositories/royalty.repository.js";
import blockchain from "./royaltyBlockchain.service.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";
import royaltyEventIndexer from "../jobs/royalty-event-indexer.js";

class RoyaltyService {
    async getByDistributionId(distributionId, options = {}) {
        const idStr = String(distributionId).trim();
        let doc = await repository.findByDistributionId(idStr);

        if (!doc && !options.verifyOnChain) {
            // Check on-chain as fallback if not yet indexed
            try {
                const onChainRecord = await blockchain.getDistribution(idStr);
                const onChainAllocations = await blockchain.getDistributionAllocations(idStr);
                return {
                    source: "blockchain",
                    distribution: onChainRecord,
                    recipients: onChainAllocations,
                    reconciled: false,
                };
            } catch {
                throw new ApiError(404, `Royalty distribution #${idStr} not found.`);
            }
        }

        if (!doc) {
            throw new ApiError(404, `Royalty distribution #${idStr} not found.`);
        }

        if (options.verifyOnChain) {
            const reconciliation = await this.reconcileDistribution(idStr);
            return {
                distribution: doc,
                reconciliation,
            };
        }

        return doc;
    }

    async getAllocations(distributionId) {
        const idStr = String(distributionId).trim();
        const doc = await repository.findByDistributionId(idStr);
        if (doc) {
            return {
                distributionId: doc.distributionId,
                totalRevenue: doc.totalRevenue,
                treasuryAmount: doc.treasuryAmount,
                treasuryFeeBps: doc.treasuryFeeBps,
                recipientCount: doc.recipientCount,
                recipients: doc.recipients,
            };
        }

        // Query on-chain fallback
        const allocations = await blockchain.getDistributionAllocations(idStr);
        const dist = await blockchain.getDistribution(idStr);
        return {
            distributionId: idStr,
            totalRevenue: dist.totalRevenue,
            treasuryAmount: dist.treasuryAmount,
            treasuryFeeBps: dist.treasuryFeeBps || 0,
            recipientCount: allocations.length,
            recipients: allocations,
        };
    }

    async getByRecipient(recipientAddress, options = {}) {
        const cleanAddress = recipientAddress.trim().toLowerCase();
        const history = await repository.findByRecipient(cleanAddress, options);

        // Optionally fetch on-chain claimed total
        let onChainTotalClaimed = null;
        try {
            onChainTotalClaimed = await blockchain.getRecipientTotalClaimed(cleanAddress);
        } catch {
            // Blockchain provider may be offline or address unused
        }

        return {
            recipient: cleanAddress,
            onChainTotalClaimed,
            ...history,
        };
    }

    async getBySource(sourceType, sourceId) {
        const typeStr = String(sourceType).toUpperCase();
        const idStr = String(sourceId).trim();

        const doc = await repository.findBySource(typeStr, idStr);
        let onChainDistributed = null;
        try {
            onChainDistributed = await blockchain.isSourceDistributed(typeStr, idStr);
        } catch {
            // Optional read
        }

        if (!doc) {
            return {
                sourceType: typeStr,
                sourceId: idStr,
                isDistributedOnChain: onChainDistributed,
                distribution: null,
            };
        }

        return {
            sourceType: typeStr,
            sourceId: idStr,
            isDistributedOnChain: onChainDistributed,
            distribution: doc,
        };
    }

    async getHistory(filters = {}, options = {}) {
        return repository.findHistory(filters, options);
    }

    async getSummary(filters = {}) {
        const summary = await repository.getSummary(filters);
        let onChainCumulative = null;
        try {
            const [totalDistributions, totalDistributed, totalTreasury] = await Promise.all([
                blockchain.getTotalDistributions(),
                blockchain.getTotalDistributedAmount(),
                blockchain.getTotalTreasuryDistributed(),
            ]);
            onChainCumulative = {
                totalDistributions,
                totalDistributed,
                totalTreasury,
            };
        } catch {
            // Optional on-chain metadata
        }

        return {
            ...summary,
            onChainCumulative,
        };
    }

    async getReports(options = {}) {
        return repository.getReports(options);
    }

    async previewSplit(payload) {
        const { totalRevenue, treasuryFeeBps, recipients } = payload;
        return blockchain.calculateSplit(totalRevenue, treasuryFeeBps, recipients);
    }

    async reconcileDistribution(distributionId) {
        const idStr = String(distributionId).trim();
        const doc = await repository.findByDistributionId(idStr);
        if (!doc) {
            throw new ApiError(404, `Cannot reconcile: Distribution #${idStr} not found in database.`);
        }

        const [onChainRecord, onChainAllocations] = await Promise.all([
            blockchain.getDistribution(idStr),
            blockchain.getDistributionAllocations(idStr),
        ]);

        const mismatches = [];

        // 1. Total Revenue check
        if (doc.totalRevenue !== onChainRecord.totalRevenue) {
            mismatches.push({
                field: "totalRevenue",
                expectedOnChain: onChainRecord.totalRevenue,
                foundInDb: doc.totalRevenue,
            });
        }

        // 2. Treasury Amount check
        if (doc.treasuryAmount !== onChainRecord.treasuryAmount) {
            mismatches.push({
                field: "treasuryAmount",
                expectedOnChain: onChainRecord.treasuryAmount,
                foundInDb: doc.treasuryAmount,
            });
        }

        // 3. Payer check
        if (doc.payer.toLowerCase() !== onChainRecord.payer.toLowerCase()) {
            mismatches.push({
                field: "payer",
                expectedOnChain: onChainRecord.payer.toLowerCase(),
                foundInDb: doc.payer.toLowerCase(),
            });
        }

        // 4. Source Type and ID check
        if (doc.sourceType.toUpperCase() !== onChainRecord.sourceType.toUpperCase()) {
            mismatches.push({
                field: "sourceType",
                expectedOnChain: onChainRecord.sourceType,
                foundInDb: doc.sourceType,
            });
        }
        if (String(doc.sourceId) !== String(onChainRecord.sourceId)) {
            mismatches.push({
                field: "sourceId",
                expectedOnChain: onChainRecord.sourceId,
                foundInDb: doc.sourceId,
            });
        }

        // 5. Recipient Allocations check
        if (doc.recipients.length !== onChainAllocations.length) {
            mismatches.push({
                field: "recipientCount",
                expectedOnChain: onChainAllocations.length,
                foundInDb: doc.recipients.length,
            });
        } else {
            for (let i = 0; i < onChainAllocations.length; i++) {
                const onChainAlloc = onChainAllocations[i];
                const dbAlloc = doc.recipients.find(
                    (r) => r.recipient.toLowerCase() === onChainAlloc.recipient.toLowerCase()
                );

                if (!dbAlloc) {
                    mismatches.push({
                        field: `recipients[${onChainAlloc.recipient}]`,
                        message: "Recipient allocation present on-chain but missing in database projection.",
                    });
                } else {
                    if (dbAlloc.amount !== onChainAlloc.amount) {
                        mismatches.push({
                            field: `recipients[${onChainAlloc.recipient}].amount`,
                            expectedOnChain: onChainAlloc.amount,
                            foundInDb: dbAlloc.amount,
                        });
                    }
                    if (dbAlloc.shareBps !== onChainAlloc.shareBps) {
                        mismatches.push({
                            field: `recipients[${onChainAlloc.recipient}].shareBps`,
                            expectedOnChain: onChainAlloc.shareBps,
                            foundInDb: dbAlloc.shareBps,
                        });
                    }
                }
            }
        }

        const isMatched = mismatches.length === 0;

        await repository.updateReconciliation(idStr, {
            reconciled: isMatched,
            reconciledAt: new Date(),
            reconciliationDetails: isMatched ? { matched: true } : { matched: false, mismatches },
        });

        if (!isMatched) {
            logger.warn(`Reconciliation mismatch on distribution #${idStr}: ${JSON.stringify(mismatches)}`);
        } else {
            logger.info(`Distribution #${idStr} reconciled successfully against on-chain state.`);
        }

        return {
            distributionId: idStr,
            reconciled: isMatched,
            reconciledAt: new Date(),
            mismatches,
        };
    }

    async reconcileAll(options = {}) {
        const limit = Math.min(100, options.limit || 50);
        const { records } = await repository.findHistory({}, { limit });

        const results = [];
        for (const doc of records) {
            try {
                const res = await this.reconcileDistribution(doc.distributionId);
                results.push(res);
            } catch (err) {
                results.push({
                    distributionId: doc.distributionId,
                    reconciled: false,
                    error: err.message,
                });
            }
        }

        const totalReconciled = results.filter((r) => r.reconciled).length;
        return {
            audited: results.length,
            reconciled: totalReconciled,
            discrepancies: results.length - totalReconciled,
            results,
        };
    }

    // Zero-custody transaction calldata preparation
    async prepareDistribution(user, payload) {
        const callerWallet = blockchain.wallet(user);
        const { sourceType = "DIRECT", sourceId = "0", totalRevenue, recipients, purchaseId } = payload;

        if (purchaseId !== undefined && purchaseId !== null) {
            const prep = await blockchain.prepareDistributePurchaseRoyalty(
                purchaseId,
                recipients,
                callerWallet
            );
            return {
                state: "PREPARED",
                operation: "distributePurchaseRoyalty",
                transaction: prep,
            };
        }

        const prep = await blockchain.prepareDistributeRoyalty(
            sourceType,
            sourceId,
            totalRevenue,
            recipients,
            callerWallet
        );

        return {
            state: "PREPARED",
            operation: "distributeRoyalty",
            transaction: prep,
        };
    }

    // Verifying /sync operation
    async syncTransaction(user, payload) {
        const { txHash } = payload;
        const confirmation = await blockchain.confirmTransaction(txHash);

        if (confirmation.state !== "CONFIRMED") {
            return confirmation;
        }

        // Trigger indexer pass to ensure event is indexed immediately
        await royaltyEventIndexer.runOnce();

        let doc = null;
        if (confirmation.distributionId) {
            doc = await repository.findByDistributionId(confirmation.distributionId);
        } else {
            doc = await repository.findByTransactionHash(txHash);
        }

        return {
            state: "CONFIRMED",
            txHash: confirmation.txHash,
            blockNumber: confirmation.blockNumber,
            distributionId: confirmation.distributionId,
            distribution: doc,
        };
    }
}

export default new RoyaltyService();
