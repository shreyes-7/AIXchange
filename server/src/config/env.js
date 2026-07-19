import dotenv from "dotenv";

dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",

    PORT: process.env.PORT || 5000,

    MONGODB_URI:
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/aixchange",

    JWT_SECRET: process.env.JWT_SECRET,

    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

    CLIENT_URL: process.env.CLIENT_URL,

    API_PREFIX: process.env.API_PREFIX || "/api/v1",
};

export default env;