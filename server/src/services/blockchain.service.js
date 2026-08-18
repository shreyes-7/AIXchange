import { ethers } from "ethers";
import { configuredChainId, provider } from "../config/blockchain.js";
import ApiError from "../utils/ApiError.js";

class BlockchainService {
    async validateNetwork() {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== configuredChainId) {
            throw new ApiError(503, `Blockchain network mismatch. Expected ${configuredChainId}, got ${network.chainId}`);
        }
        return network;
    }

    validateAddress(address) {
        if (!ethers.isAddress(address)) throw new ApiError(400, "Invalid Ethereum wallet address.");
        return ethers.getAddress(address);
    }
}

export default new BlockchainService();
