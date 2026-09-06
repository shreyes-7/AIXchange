import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_TYPE_MAP = {
    PURCHASE: 0,
    DERIVATIVE: 1,
    INFERENCE: 2,
    DIRECT: 3,
};

const SOURCE_TYPE_NAMES = ["PURCHASE", "DERIVATIVE", "INFERENCE", "DIRECT"];

const STATUS_NAMES = ["NONE", "PENDING", "DISTRIBUTED", "CANCELLED"];

const loadArtifactAbi = () => {
    const artifactPath = path.resolve(
        __dirname,
        "../../../blockchain/artifacts/contracts/royalty/RoyaltyEngine.sol/RoyaltyEngine.json"
    );
    if (!fs.existsSync(artifactPath)) {
        throw new Error(
            `RoyaltyEngine artifact not found at ${artifactPath}. Run 'npx hardhat compile' in blockchain directory.`
        );
    }
    const raw = fs.readFileSync(artifactPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.abi) {
        throw new Error("Invalid RoyaltyEngine artifact: ABI missing.");
    }
    return parsed.abi;
};

class RoyaltyBlockchainService {
    constructor() {
        this.abi = loadArtifactAbi();
        this.interface = new ethers.Interface(this.abi);
    }

    get config() {
        const address = env.ROYALTY_ENGINE_ADDRESS;
        if (!address || !ethers.isAddress(address)) {
            throw new ApiError(
                503,
                "ROYALTY_ENGINE_ADDRESS is not configured or is an invalid Ethereum address."
            );
        }
        return {
            royaltyEngine: ethers.getAddress(address),
        };
    }

    provider() {
        if (!env.BLOCKCHAIN_RPC_URL || !env.BLOCKCHAIN_CHAIN_ID) {
            throw new ApiError(503, "Blockchain RPC is not configured.");
        }
        return new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    }

    async validateNetwork(provider = this.provider()) {
        try {
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== Number(env.BLOCKCHAIN_CHAIN_ID)) {
                throw new ApiError(
                    503,
                    `Blockchain network chainId ${network.chainId} does not match configured chain ${env.BLOCKCHAIN_CHAIN_ID}.`
                );
            }
            return network;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(503, `Failed to connect to blockchain RPC: ${error.message}`);
        }
    }

    contract(provider = this.provider()) {
        return new ethers.Contract(this.config.royaltyEngine, this.abi, provider);
    }

    wallet(user) {
        if (typeof user === "string") {
            try {
                return ethers.getAddress(user);
            } catch {
                throw new ApiError(400, "The provided wallet address is invalid.");
            }
        }
        if (!user?.wallet?.verified || !user.wallet.address) {
            throw new ApiError(403, "A verified linked Web3 wallet is required.");
        }
        try {
            return ethers.getAddress(user.wallet.address);
        } catch {
            throw new ApiError(403, "The authenticated wallet address is invalid.");
        }
    }

    mapSourceType(sourceType) {
        if (typeof sourceType === "number") return sourceType;
        const upper = String(sourceType).toUpperCase();
        if (SOURCE_TYPE_MAP[upper] !== undefined) return SOURCE_TYPE_MAP[upper];
        throw new ApiError(400, `Invalid sourceType: ${sourceType}. Supported: PURCHASE, DERIVATIVE, INFERENCE, DIRECT`);
    }

    mapSourceTypeName(sourceTypeNum) {
        return SOURCE_TYPE_NAMES[Number(sourceTypeNum)] || "DIRECT";
    }

    mapStatusName(statusNum) {
        return STATUS_NAMES[Number(statusNum)] || "DISTRIBUTED";
    }

    async getDistribution(distributionId) {
        try {
            const contract = this.contract();
            const record = await contract.getDistribution(distributionId);

            return {
                distributionId: record.distributionId.toString(),
                sourceKey: record.sourceKey,
                sourceType: this.mapSourceTypeName(record.sourceType),
                sourceTypeNum: Number(record.sourceType),
                sourceId: record.sourceId.toString(),
                payer: record.payer.toLowerCase(),
                totalRevenue: record.totalRevenue.toString(),
                treasuryAmount: record.treasuryAmount.toString(),
                recipientCount: Number(record.recipientCount),
                status: this.mapStatusName(record.status),
                statusNum: Number(record.status),
                timestamp: record.timestamp.toString(),
            };
        } catch (error) {
            if (error.message && error.message.includes("DistributionNotFound")) {
                throw new ApiError(404, `Distribution #${distributionId} not found on blockchain.`);
            }
            throw new ApiError(500, `Failed to query distribution on-chain: ${error.message}`);
        }
    }

    async getDistributionAllocations(distributionId) {
        try {
            const contract = this.contract();
            const allocations = await contract.getDistributionAllocations(distributionId);

            return allocations.map((a) => ({
                recipient: a.recipient.toLowerCase(),
                shareBps: Number(a.shareBps),
                amount: a.amount.toString(),
                paid: Boolean(a.paid),
            }));
        } catch (error) {
            if (error.message && error.message.includes("DistributionNotFound")) {
                throw new ApiError(404, `Allocations for distribution #${distributionId} not found on blockchain.`);
            }
            throw new ApiError(500, `Failed to query allocations on-chain: ${error.message}`);
        }
    }

    async isSourceDistributed(sourceType, sourceId) {
        try {
            const contract = this.contract();
            const typeNum = this.mapSourceType(sourceType);
            return await contract.isSourceDistributed(typeNum, sourceId);
        } catch (error) {
            throw new ApiError(500, `Failed to check if source is distributed on-chain: ${error.message}`);
        }
    }

    async getRecipientTotalClaimed(recipientAddress) {
        try {
            const contract = this.contract();
            const addr = ethers.getAddress(recipientAddress);
            const claimed = await contract.getRecipientTotalClaimed(addr);
            return claimed.toString();
        } catch (error) {
            throw new ApiError(500, `Failed to query recipient claimed total: ${error.message}`);
        }
    }

    async getTotalDistributions() {
        try {
            const contract = this.contract();
            const total = await contract.getTotalDistributions();
            return total.toString();
        } catch (error) {
            throw new ApiError(500, `Failed to query total distributions on-chain: ${error.message}`);
        }
    }

    async getTotalDistributedAmount() {
        try {
            const contract = this.contract();
            const total = await contract.getTotalDistributedAmount();
            return total.toString();
        } catch (error) {
            throw new ApiError(500, `Failed to query total distributed amount on-chain: ${error.message}`);
        }
    }

    async getTotalTreasuryDistributed() {
        try {
            const contract = this.contract();
            const total = await contract.getTotalTreasuryDistributed();
            return total.toString();
        } catch (error) {
            throw new ApiError(500, `Failed to query total treasury distributed on-chain: ${error.message}`);
        }
    }

    async getDefaultTreasuryFeeBps() {
        try {
            const contract = this.contract();
            const fee = await contract.getDefaultTreasuryFeeBps();
            return Number(fee);
        } catch (error) {
            throw new ApiError(500, `Failed to query default treasury fee BPS on-chain: ${error.message}`);
        }
    }

    async calculateSplit(totalRevenue, treasuryFeeBps, recipients) {
        try {
            const contract = this.contract();
            const formattedRecipients = recipients.map((r) => ({
                recipient: ethers.getAddress(r.recipient),
                shareBps: Number(r.shareBps),
            }));

            const [treasuryAmount, recipientAmounts, remainder] = await contract.calculateSplit(
                totalRevenue,
                treasuryFeeBps,
                formattedRecipients
            );

            return {
                treasuryAmount: treasuryAmount.toString(),
                recipientAmounts: recipientAmounts.map((a) => a.toString()),
                remainder: remainder.toString(),
                totalRevenue: totalRevenue.toString(),
                treasuryFeeBps: Number(treasuryFeeBps),
                recipients: formattedRecipients.map((r, idx) => ({
                    recipient: r.recipient.toLowerCase(),
                    shareBps: r.shareBps,
                    amount: recipientAmounts[idx].toString(),
                })),
            };
        } catch (error) {
            throw new ApiError(400, `Split calculation failed: ${error.message}`);
        }
    }

    // Zero-custody calldata preparation
    async prepareDistributeRoyalty(sourceType, sourceId, totalRevenue, recipients, callerAddress) {
        const typeNum = this.mapSourceType(sourceType);
        const formattedRecipients = recipients.map((r) => ({
            recipient: ethers.getAddress(r.recipient),
            shareBps: Number(r.shareBps),
        }));

        const calldata = this.interface.encodeFunctionData("distributeRoyalty", [
            typeNum,
            sourceId,
            totalRevenue,
            formattedRecipients,
        ]);

        return {
            to: this.config.royaltyEngine,
            from: ethers.getAddress(callerAddress),
            data: calldata,
            value: "0",
            chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async prepareDistributePurchaseRoyalty(purchaseId, recipients, callerAddress) {
        const formattedRecipients = recipients.map((r) => ({
            recipient: ethers.getAddress(r.recipient),
            shareBps: Number(r.shareBps),
        }));

        const calldata = this.interface.encodeFunctionData("distributePurchaseRoyalty", [
            purchaseId,
            formattedRecipients,
        ]);

        return {
            to: this.config.royaltyEngine,
            from: ethers.getAddress(callerAddress),
            data: calldata,
            value: "0",
            chainId: Number(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    // Verified /sync operation
    async confirmTransaction(txHash) {
        if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
            throw new ApiError(400, "Invalid transaction hash format.");
        }

        const provider = this.provider();
        await this.validateNetwork(provider);

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            return {
                state: "PENDING",
                txHash,
                message: "Transaction has not yet been mined into a block.",
            };
        }

        if (receipt.status !== 1) {
            return {
                state: "FAILED",
                txHash,
                blockNumber: receipt.blockNumber,
                message: "Transaction execution reverted on-chain.",
            };
        }

        const targetAddress = this.config.royaltyEngine.toLowerCase();
        const parsedEvents = [];
        let distributionId = null;

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() !== targetAddress) continue;
            try {
                const parsed = this.interface.parseLog(log);
                if (parsed) {
                    parsedEvents.push({
                        name: parsed.name,
                        args: parsed.args,
                        logIndex: log.index !== undefined ? log.index : log.logIndex,
                    });
                    if (parsed.args.distributionId !== undefined) {
                        distributionId = parsed.args.distributionId.toString();
                    }
                }
            } catch {
                // Not an event from RoyaltyEngine or unparseable log
            }
        }

        return {
            state: "CONFIRMED",
            txHash: receipt.hash.toLowerCase(),
            blockNumber: receipt.blockNumber,
            transactionIndex: receipt.index !== undefined ? receipt.index : receipt.transactionIndex,
            distributionId,
            events: parsedEvents,
            receipt,
        };
    }
}

export default new RoyaltyBlockchainService();
