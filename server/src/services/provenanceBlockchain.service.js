import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadArtifactAbi = () => {
    const artifactPath = path.resolve(
        __dirname,
        "../../../blockchain/artifacts/contracts/registry/ProvenanceRegistry.sol/ProvenanceRegistry.json"
    );
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`ProvenanceRegistry artifact not found at ${artifactPath}. Run 'hardhat compile' in blockchain directory.`);
    }
    const raw = fs.readFileSync(artifactPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.abi) {
        throw new Error("Invalid ProvenanceRegistry artifact: ABI missing.");
    }
    return parsed.abi;
};

export const normalizeBytes32 = (hash) => {
    if (!hash || typeof hash !== "string") {
        throw new ApiError(400, "Metadata hash is required and must be a string.");
    }
    const clean = hash.trim().toLowerCase();
    if (/^0x[0-9a-f]{64}$/.test(clean)) {
        return clean;
    }
    if (/^[0-9a-f]{64}$/.test(clean)) {
        return `0x${clean}`;
    }
    throw new ApiError(400, "Metadata hash must be a 32-byte hexadecimal string (0x + 64 hex characters).");
};

class ProvenanceBlockchainService {
    constructor() {
        this.abi = loadArtifactAbi();
        this.interface = new ethers.Interface(this.abi);
    }

    get config() {
        const address = env.PROVENANCE_REGISTRY_ADDRESS;
        if (!address || !ethers.isAddress(address)) {
            throw new ApiError(503, "PROVENANCE_REGISTRY_ADDRESS is not configured or is an invalid Ethereum address.");
        }
        return {
            registry: ethers.getAddress(address),
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
        return new ethers.Contract(this.config.registry, this.abi, provider);
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

    normalizeRecord(raw) {
        const createdAtSec = Number(raw.createdAt);
        return {
            provenanceId: Number(raw.provenanceId),
            datasetId: Number(raw.datasetId),
            modelId: Number(raw.modelId),
            modelVersion: Number(raw.modelVersion),
            executionId: String(raw.executionId),
            metadataHash: String(raw.metadataHash).toLowerCase(),
            registrant: ethers.getAddress(raw.registrant).toLowerCase(),
            createdAtTimestamp: createdAtSec,
            createdAt: new Date(createdAtSec * 1000),
            active: Boolean(raw.active),
        };
    }

    async getProvenance(provenanceId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const raw = await this.contract(provider).getProvenance(BigInt(provenanceId));
            return this.normalizeRecord(raw);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Provenance record #${provenanceId} was not found on-chain.`);
            }
            throw new ApiError(503, `ProvenanceRegistry query failed: ${error.message}`);
        }
    }

    async getTotalProvenanceRecords(provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const total = await this.contract(provider).getTotalProvenanceRecords();
            return Number(total);
        } catch (error) {
            throw new ApiError(503, `Failed to get total provenance count: ${error.message}`);
        }
    }

    async getProvenanceByModel(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const ids = await this.contract(provider).getProvenanceByModel(BigInt(modelId));
            return ids.map((id) => Number(id));
        } catch (error) {
            throw new ApiError(503, `Failed to query provenance by model: ${error.message}`);
        }
    }

    async getProvenanceByModelVersion(modelId, modelVersion, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const ids = await this.contract(provider).getProvenanceByModelVersion(
                BigInt(modelId),
                BigInt(modelVersion)
            );
            return ids.map((id) => Number(id));
        } catch (error) {
            throw new ApiError(503, `Failed to query provenance by model version: ${error.message}`);
        }
    }

    async getProvenanceByDataset(datasetId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const ids = await this.contract(provider).getProvenanceByDataset(BigInt(datasetId));
            return ids.map((id) => Number(id));
        } catch (error) {
            throw new ApiError(503, `Failed to query provenance by dataset: ${error.message}`);
        }
    }

    async getProvenanceByExecution(executionId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const ids = await this.contract(provider).getProvenanceByExecution(String(executionId));
            return ids.map((id) => Number(id));
        } catch (error) {
            throw new ApiError(503, `Failed to query provenance by execution: ${error.message}`);
        }
    }

    async getProvenanceIdByKey(datasetId, executionId, modelId, modelVersion, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const id = await this.contract(provider).getProvenanceIdByKey(
                BigInt(datasetId),
                String(executionId),
                BigInt(modelId),
                BigInt(modelVersion)
            );
            return Number(id);
        } catch (error) {
            throw new ApiError(503, `Failed to query provenance by key: ${error.message}`);
        }
    }

    async verifyProvenance(
        provenanceId,
        expectedDatasetId,
        expectedExecutionId,
        expectedModelId,
        expectedModelVersion,
        expectedMetadataHash,
        provider = this.provider()
    ) {
        await this.validateNetwork(provider);
        try {
            const formattedHash = normalizeBytes32(expectedMetadataHash);
            const isValid = await this.contract(provider).verifyProvenance(
                BigInt(provenanceId),
                BigInt(expectedDatasetId),
                String(expectedExecutionId),
                BigInt(expectedModelId),
                BigInt(expectedModelVersion),
                formattedHash
            );
            return Boolean(isValid);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION") return false;
            throw new ApiError(503, `On-chain provenance verification call failed: ${error.message}`);
        }
    }

    async verifyProvenanceHash(provenanceId, expectedMetadataHash, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const formattedHash = normalizeBytes32(expectedMetadataHash);
            const isValid = await this.contract(provider).verifyProvenanceHash(
                BigInt(provenanceId),
                formattedHash
            );
            return Boolean(isValid);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION") return false;
            throw new ApiError(503, `On-chain hash verification call failed: ${error.message}`);
        }
    }

    async isProvenanceActive(provenanceId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const active = await this.contract(provider).isProvenanceActive(BigInt(provenanceId));
            return Boolean(active);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION") return false;
            throw new ApiError(503, `Active status query failed: ${error.message}`);
        }
    }

    async prepareRegister(datasetId, modelId, modelVersion, executionId, metadataHash, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);
        const cleanHash = normalizeBytes32(metadataHash);

        const tx = await this.contract(provider).registerProvenance.populateTransaction(
            BigInt(datasetId),
            BigInt(modelId),
            BigInt(modelVersion),
            String(executionId),
            cleanHash
        );

        return {
            from: cleanWallet,
            to: this.config.registry,
            data: tx.data,
            value: "0",
            chainId: String(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async prepareSetStatus(provenanceId, active, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);

        const tx = await this.contract(provider).setProvenanceStatus.populateTransaction(
            BigInt(provenanceId),
            Boolean(active)
        );

        return {
            from: cleanWallet,
            to: this.config.registry,
            data: tx.data,
            value: "0",
            chainId: String(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async confirmTransaction(txHash, expected = {}, wallet = null) {
        const provider = this.provider();
        await this.validateNetwork(provider);

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            return { state: "PENDING", txHash: txHash.toLowerCase() };
        }

        if (receipt.status !== 1) {
            throw new ApiError(502, `Provenance transaction ${txHash} reverted on-chain.`);
        }

        if (receipt.to?.toLowerCase() !== this.config.registry.toLowerCase()) {
            throw new ApiError(400, "Transaction was not addressed to ProvenanceRegistry contract.");
        }

        const events = receipt.logs
            .filter((log) => log.address.toLowerCase() === this.config.registry.toLowerCase())
            .map((log) => {
                try {
                    return { parsed: this.interface.parseLog(log), log };
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        const op = expected.operation || "register";
        let target = null;

        if (op === "register") {
            target = events.find(({ parsed }) => parsed.name === "ProvenanceRegistered");
        } else if (op === "setStatus") {
            target = events.find(
                ({ parsed }) =>
                    parsed.name === "ProvenanceStatusChanged" &&
                    (!expected.provenanceId || parsed.args.provenanceId.toString() === String(expected.provenanceId))
            );
        }

        if (!target) {
            throw new ApiError(
                400,
                `Transaction does not contain the expected Provenance event for operation '${op}'.`
            );
        }

        if (wallet && op === "register") {
            const eventRegistrant = target.parsed.args.registrant.toLowerCase();
            if (eventRegistrant !== wallet.toLowerCase()) {
                throw new ApiError(403, "Transaction signer does not match the authenticated wallet.");
            }
        }

        const provenanceId = Number(target.parsed.args.provenanceId);
        const record = await this.getProvenance(provenanceId, provider);
        const eventIdentity = `${Number(env.BLOCKCHAIN_CHAIN_ID)}:${this.config.registry.toLowerCase()}:${txHash.toLowerCase()}:${target.log.index}`;

        return {
            state: "CONFIRMED",
            txHash: txHash.toLowerCase(),
            blockNumber: receipt.blockNumber,
            transactionIndex: receipt.index,
            logIndex: target.log.index,
            eventIdentity,
            operation: op,
            provenanceId,
            event: {
                name: target.parsed.name,
                args: target.parsed.args,
            },
            record,
        };
    }
}

export default new ProvenanceBlockchainService();
export { ProvenanceBlockchainService };
