import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MODEL_REGISTRY_HUMAN_ABI = [
    "function registerModel(string name, string metadataURI, string modelHash) returns (uint256 modelId)",
    "function addModelVersion(uint256 modelId, string metadataURI, string modelHash) returns (uint256 versionNumber)",
    "function setModelStatus(uint256 modelId, bool active)",
    "function transferModelOwnership(uint256 modelId, address newOwner)",
    "function getModel(uint256 modelId) view returns (tuple(uint256 modelId, address owner, string name, string metadataURI, uint256 currentVersion, uint256 totalVersions, uint256 createdAt, bool active))",
    "function getModelOwner(uint256 modelId) view returns (address)",
    "function getModelsByOwner(address owner) view returns (uint256[])",
    "function getTotalModels() view returns (uint256)",
    "function getVersion(uint256 modelId, uint256 versionNumber) view returns (tuple(uint256 versionNumber, string modelHash, string metadataURI, uint256 createdAt, bool active))",
    "function getLatestVersion(uint256 modelId) view returns (tuple(uint256 versionNumber, string modelHash, string metadataURI, uint256 createdAt, bool active))",
    "function getVersionCount(uint256 modelId) view returns (uint256)",
    "function getModelVersions(uint256 modelId) view returns (tuple(uint256 versionNumber, string modelHash, string metadataURI, uint256 createdAt, bool active)[])",
    "function isModelActive(uint256 modelId) view returns (bool)",
    "function verifyModelHash(uint256 modelId, uint256 versionNumber, string expectedHash) view returns (bool)",
    "event ModelRegistered(uint256 indexed modelId, address indexed owner, string name, string metadataURI, string modelHash, uint256 initialVersion, uint256 createdAt)",
    "event ModelVersionAdded(uint256 indexed modelId, uint256 indexed versionNumber, string modelHash, string metadataURI, uint256 createdAt)",
    "event ModelStatusChanged(uint256 indexed modelId, bool active)",
    "event ModelOwnershipTransferred(uint256 indexed modelId, address indexed previousOwner, address indexed newOwner)",
];

const loadArtifactAbi = () => {
    try {
        const artifactPath = path.resolve(
            __dirname,
            "../../../blockchain/artifacts/contracts/registry/ModelRegistry.sol/ModelRegistry.json"
        );
        if (fs.existsSync(artifactPath)) {
            const raw = fs.readFileSync(artifactPath, "utf8");
            const parsed = JSON.parse(raw);
            if (parsed && parsed.abi) {
                return parsed.abi;
            }
        }
    } catch {
        // fallback to human-readable ABI below
    }
    return MODEL_REGISTRY_HUMAN_ABI;
};

class ModelBlockchainService {
    constructor() {
        this.abi = loadArtifactAbi();
        this.interface = new ethers.Interface(this.abi);
    }

    get config() {
        const address =
            env.MODEL_REGISTRY_ADDRESS ||
            (Number(env.BLOCKCHAIN_CHAIN_ID) === 31337
                ? "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
                : null);

        if (!address || !ethers.isAddress(address)) {
            throw new ApiError(503, "MODEL_REGISTRY_ADDRESS is not configured or invalid.");
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
        if (!user?.wallet?.verified || !user.wallet.address) {
            throw new ApiError(403, "A verified wallet is required.");
        }
        try {
            return ethers.getAddress(user.wallet.address);
        } catch {
            throw new ApiError(403, "The authenticated wallet address is invalid.");
        }
    }

    normalizeModel(raw) {
        return {
            modelId: Number(raw.modelId),
            owner: raw.owner.toLowerCase(),
            name: raw.name,
            metadataURI: raw.metadataURI,
            currentVersion: Number(raw.currentVersion),
            totalVersions: Number(raw.totalVersions),
            createdAt: new Date(Number(raw.createdAt) * 1000),
            active: Boolean(raw.active),
        };
    }

    normalizeVersion(raw) {
        return {
            versionNumber: Number(raw.versionNumber),
            modelHash: raw.modelHash,
            metadataURI: raw.metadataURI,
            createdAt: new Date(Number(raw.createdAt) * 1000),
            active: Boolean(raw.active),
        };
    }

    async getModel(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const raw = await this.contract(provider).getModel(BigInt(modelId));
            return this.normalizeModel(raw);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Model #${modelId} was not found on-chain.`);
            }
            throw new ApiError(503, `ModelRegistry could not be queried: ${error.message}`);
        }
    }

    async getModelOwner(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const owner = await this.contract(provider).getModelOwner(BigInt(modelId));
            return ethers.getAddress(owner).toLowerCase();
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Model #${modelId} was not found on-chain.`);
            }
            throw new ApiError(503, `ModelRegistry could not be queried: ${error.message}`);
        }
    }

    async getModelsByOwner(ownerAddress, provider = this.provider()) {
        await this.validateNetwork(provider);
        const cleanAddress = ethers.getAddress(ownerAddress);
        try {
            const ids = await this.contract(provider).getModelsByOwner(cleanAddress);
            return ids.map((id) => Number(id));
        } catch (error) {
            throw new ApiError(503, `Failed to query models by owner: ${error.message}`);
        }
    }

    async getTotalModels(provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const total = await this.contract(provider).getTotalModels();
            return Number(total);
        } catch (error) {
            throw new ApiError(503, `Failed to query total models: ${error.message}`);
        }
    }

    async getVersion(modelId, versionNumber, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const raw = await this.contract(provider).getVersion(BigInt(modelId), BigInt(versionNumber));
            return this.normalizeVersion(raw);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Version ${versionNumber} for Model #${modelId} was not found on-chain.`);
            }
            throw new ApiError(503, `ModelRegistry could not be queried: ${error.message}`);
        }
    }

    async getLatestVersion(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const raw = await this.contract(provider).getLatestVersion(BigInt(modelId));
            return this.normalizeVersion(raw);
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Latest version for Model #${modelId} was not found on-chain.`);
            }
            throw new ApiError(503, `ModelRegistry could not be queried: ${error.message}`);
        }
    }

    async getModelVersions(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            const rawVersions = await this.contract(provider).getModelVersions(BigInt(modelId));
            return rawVersions.map((raw) => this.normalizeVersion(raw));
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Versions for Model #${modelId} could not be retrieved.`);
            }
            throw new ApiError(503, `ModelRegistry could not be queried: ${error.message}`);
        }
    }

    async isModelActive(modelId, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            return await this.contract(provider).isModelActive(BigInt(modelId));
        } catch {
            return false;
        }
    }

    async verifyModelHash(modelId, versionNumber, expectedHash, provider = this.provider()) {
        await this.validateNetwork(provider);
        try {
            return await this.contract(provider).verifyModelHash(
                BigInt(modelId),
                BigInt(versionNumber),
                String(expectedHash)
            );
        } catch (error) {
            if (error?.code === "CALL_EXCEPTION" || error?.code === "BAD_DATA") {
                throw new ApiError(404, `Model #${modelId} version ${versionNumber} was not found on-chain.`);
            }
            throw new ApiError(503, `Hash verification query failed: ${error.message}`);
        }
    }

    async prepareRegister(name, metadataURI, modelHash, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);

        const tx = await this.contract(provider).registerModel.populateTransaction(
            name,
            metadataURI,
            modelHash
        );

        return {
            from: cleanWallet,
            to: this.config.registry,
            data: tx.data,
            value: "0",
            chainId: String(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async prepareAddVersion(modelId, metadataURI, modelHash, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);

        const onChainOwner = await this.getModelOwner(modelId, provider);
        if (onChainOwner.toLowerCase() !== cleanWallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const active = await this.isModelActive(modelId, provider);
        if (!active) {
            throw new ApiError(409, `Model #${modelId} is inactive on-chain.`);
        }

        const tx = await this.contract(provider).addModelVersion.populateTransaction(
            BigInt(modelId),
            metadataURI,
            modelHash
        );

        return {
            from: cleanWallet,
            to: this.config.registry,
            data: tx.data,
            value: "0",
            chainId: String(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async prepareSetStatus(modelId, active, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);

        const onChainOwner = await this.getModelOwner(modelId, provider);
        if (onChainOwner.toLowerCase() !== cleanWallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const tx = await this.contract(provider).setModelStatus.populateTransaction(
            BigInt(modelId),
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

    async prepareTransferOwnership(modelId, newOwner, wallet) {
        const provider = this.provider();
        await this.validateNetwork(provider);
        const cleanWallet = ethers.getAddress(wallet);
        const cleanNewOwner = ethers.getAddress(newOwner);

        const onChainOwner = await this.getModelOwner(modelId, provider);
        if (onChainOwner.toLowerCase() !== cleanWallet.toLowerCase()) {
            throw new ApiError(403, "Authenticated wallet does not own this model on-chain.");
        }

        const tx = await this.contract(provider).transferModelOwnership.populateTransaction(
            BigInt(modelId),
            cleanNewOwner
        );

        return {
            from: cleanWallet,
            to: this.config.registry,
            data: tx.data,
            value: "0",
            chainId: String(env.BLOCKCHAIN_CHAIN_ID),
        };
    }

    async confirmTransaction(txHash, expected, wallet = null) {
        const provider = this.provider();
        await this.validateNetwork(provider);

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            return { state: "PENDING", txHash: txHash.toLowerCase() };
        }

        if (receipt.status !== 1) {
            throw new ApiError(502, `ModelRegistry transaction ${txHash} reverted on-chain.`);
        }

        if (receipt.to?.toLowerCase() !== this.config.registry.toLowerCase()) {
            throw new ApiError(400, "Transaction was not addressed to ModelRegistry contract.");
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
            target = events.find(({ parsed }) => parsed.name === "ModelRegistered");
        } else if (op === "addVersion") {
            target = events.find(
                ({ parsed }) =>
                    parsed.name === "ModelVersionAdded" &&
                    (!expected.modelId || parsed.args.modelId.toString() === String(expected.modelId))
            );
        } else if (op === "setStatus") {
            target = events.find(
                ({ parsed }) =>
                    parsed.name === "ModelStatusChanged" &&
                    (!expected.modelId || parsed.args.modelId.toString() === String(expected.modelId))
            );
        } else if (op === "transferOwnership") {
            target = events.find(
                ({ parsed }) =>
                    parsed.name === "ModelOwnershipTransferred" &&
                    (!expected.modelId || parsed.args.modelId.toString() === String(expected.modelId))
            );
        }

        if (!target) {
            throw new ApiError(
                400,
                `Transaction does not contain the expected ModelRegistry event for operation '${op}'.`
            );
        }

        if (wallet && op === "register") {
            const eventOwner = target.parsed.args.owner.toLowerCase();
            if (eventOwner !== wallet.toLowerCase()) {
                throw new ApiError(403, "Transaction signer does not match the authenticated wallet.");
            }
        }

        const modelId = Number(target.parsed.args.modelId);
        const onChainModel = await this.getModel(modelId, provider);

        return {
            state: "CONFIRMED",
            txHash: txHash.toLowerCase(),
            modelId,
            blockNumber: receipt.blockNumber,
            operation: op,
            event: {
                name: target.parsed.name,
                args: target.parsed.args,
            },
            model: onChainModel,
        };
    }
}

export default new ModelBlockchainService();
export { ModelBlockchainService };
