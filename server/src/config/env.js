import dotenv from "dotenv";

dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",

    PORT: process.env.PORT || 5000,

    MONGODB_URI:
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        "mongodb://localhost:27017/aixchange",

    ACCESS_TOKEN_SECRET:
        process.env.ACCESS_TOKEN_SECRET ||
        process.env.JWT_SECRET ||
        "aixchange_access_token_secret_key_development_12345",

    REFRESH_TOKEN_SECRET:
        process.env.REFRESH_TOKEN_SECRET ||
        "aixchange_refresh_token_secret_key_development_12345",

    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",

    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",

    CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173",

    API_PREFIX: process.env.API_PREFIX || "/api/v1",
};

export default env;