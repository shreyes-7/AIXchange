import dotenv from "dotenv";

dotenv.config();

const number = (value, fallback) => Number(value ?? fallback);

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: number(process.env.PORT, 5000),
    MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/aixchange",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "aixchange_access_token_secret_key_development_12345",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "aixchange_refresh_token_secret_key_development_12345",
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173",
    API_PREFIX: process.env.API_PREFIX || "/api/v1",
    BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL,
    BLOCKCHAIN_CHAIN_ID: number(process.env.BLOCKCHAIN_CHAIN_ID, 0),
    AIX_TOKEN_ADDRESS: process.env.AIX_TOKEN_ADDRESS,
    TREASURY_ADDRESS: process.env.TREASURY_ADDRESS,
    PURCHASE_ENGINE_ADDRESS: process.env.PURCHASE_ENGINE_ADDRESS,
    DATASET_REGISTRY_ADDRESS: process.env.DATASET_REGISTRY_ADDRESS,
    LICENSE_REGISTRY_ADDRESS: process.env.LICENSE_REGISTRY_ADDRESS,
    PINATA_JWT: process.env.PINATA_JWT,
    PINATA_API_URL: process.env.PINATA_API_URL || "https://api.pinata.cloud/pinning/pinFileToIPFS",
    PINATA_GATEWAY_URL: process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs",
    DATASET_ENCRYPTION_KEY: process.env.DATASET_ENCRYPTION_KEY,
    DATASET_MAX_UPLOAD_BYTES: number(process.env.DATASET_MAX_UPLOAD_BYTES, 50 * 1024 * 1024),
    BLOCKCHAIN_CONFIRMATIONS: number(process.env.BLOCKCHAIN_CONFIRMATIONS, 1),
    BLOCKCHAIN_START_BLOCK: number(process.env.BLOCKCHAIN_START_BLOCK, 0),
    INDEXER_INTERVAL_MS: number(process.env.INDEXER_INTERVAL_MS, 15000),
    INDEXER_BATCH_SIZE: number(process.env.INDEXER_BATCH_SIZE, 1000),
};

if (!env.BLOCKCHAIN_RPC_URL || !env.BLOCKCHAIN_CHAIN_ID) {
    throw new Error("BLOCKCHAIN_RPC_URL and BLOCKCHAIN_CHAIN_ID must be configured");
}

export default env;
