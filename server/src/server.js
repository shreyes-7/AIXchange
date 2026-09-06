import app from "./app.js";

import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB from "./config/database.js";
import tokenEventIndexer from "./jobs/token-event-indexer.js";
import licenseEventIndexer from "./jobs/license-event-indexer.js";
import purchaseEventIndexer from "./jobs/purchase-event-indexer.js";
import sandboxMonitorJob from "./jobs/sandbox-monitor.job.js";
import blockchainAnalyticsIndexer from "./jobs/blockchain-analytics.indexer.js";
import modelEventIndexer from "./jobs/model-event-indexer.js";
import provenanceEventIndexer from "./jobs/provenance-event-indexer.js";

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(
                `Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`
            );
        });

        const indexerTimer = tokenEventIndexer.start();
        const licenseIndexerTimer = licenseEventIndexer.start();
        const purchaseIndexerTimer = purchaseEventIndexer.start();
        const sandboxMonitorTimer = sandboxMonitorJob.start();
        const analyticsIndexerTimer = blockchainAnalyticsIndexer.start();
        const modelIndexerTimer = modelEventIndexer.start();
        const provenanceIndexerTimer = provenanceEventIndexer.start();

        const shutdown = (signal) => {
            logger.info(`${signal} received. Shutting down server...`);

            server.close(() => {
                clearInterval(indexerTimer);
                if (licenseIndexerTimer) clearInterval(licenseIndexerTimer);
                if (purchaseIndexerTimer) clearInterval(purchaseIndexerTimer);
                if (sandboxMonitorTimer) clearInterval(sandboxMonitorTimer);
                if (analyticsIndexerTimer) clearInterval(analyticsIndexerTimer);
                if (modelIndexerTimer) clearInterval(modelIndexerTimer);
                if (provenanceIndexerTimer) clearInterval(provenanceIndexerTimer);
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
