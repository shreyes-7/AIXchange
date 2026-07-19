import mongoose from "mongoose";

import env from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(env.MONGODB_URI);

        logger.info(
            `MongoDB connected successfully | Host: ${connection.connection.host}`
        );
    } catch (error) {
        logger.error(`MongoDB connection failed | ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;