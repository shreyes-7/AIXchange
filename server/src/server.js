import app from "./app.js";

import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB from "./config/database.js";

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(
                `Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`
            );
        });


        const shutdown = (signal) => {
            logger.info(`${signal} received. Shutting down server...`);

            server.close(() => {
                logger.info("Server closed successfully.");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();