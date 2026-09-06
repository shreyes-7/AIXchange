import { ethers } from "ethers";

import env from "./env.js";
import { PURCHASE_ENGINE_ABI } from "./purchase-abi.js";

const requiredAddress = (value, name) => {
    if (typeof value === "string" && value.startsWith("0xYOUR_DEPLOYED_")) {
        const fallback =
            name === "AIX_TOKEN_ADDRESS"
                ? "0x5FbDB2315678afecb367f032d93F642f64180aa3"
                : "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        return ethers.getAddress(fallback);
    }

    if (!ethers.isAddress(value || "")) {
        throw new Error(`${name} is invalid or not configured`);
    }
    return ethers.getAddress(value);
};

export const configuredChainId = env.BLOCKCHAIN_CHAIN_ID || 31337;
export const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL, undefined, {
    staticNetwork: ethers.Network.from(configuredChainId),
});
export const aixTokenAddress = requiredAddress(
    env.AIX_TOKEN_ADDRESS,
    "AIX_TOKEN_ADDRESS"
);

export const AIX_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event TokensMinted(address indexed to, uint256 amount)",
    "event TokensBurned(address indexed from, uint256 amount)",
];

export { PURCHASE_ENGINE_ABI } from "./purchase-abi.js";

export const aixTokenContract = new ethers.Contract(
    aixTokenAddress,
    AIX_TOKEN_ABI,
    provider
);

export const treasuryAddress = env.TREASURY_ADDRESS
    ? requiredAddress(env.TREASURY_ADDRESS, "TREASURY_ADDRESS")
    : null;

export const purchaseEngineAddress = env.PURCHASE_ENGINE_ADDRESS
    ? requiredAddress(env.PURCHASE_ENGINE_ADDRESS, "PURCHASE_ENGINE_ADDRESS")
    : null;

export const purchaseEngineContract = purchaseEngineAddress
    ? new ethers.Contract(purchaseEngineAddress, PURCHASE_ENGINE_ABI, provider)
    : null;
