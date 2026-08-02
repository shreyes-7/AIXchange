import dotenv from "dotenv";

dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",

    PORT: process.env.PORT || 5000,

    MONGODB_URI:
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/aixchange",

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,

    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

    CLIENT_URL: process.env.CLIENT_URL,

    API_PREFIX: process.env.API_PREFIX || "/api/v1",
};

export default env;