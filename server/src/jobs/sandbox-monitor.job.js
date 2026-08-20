import env from "../config/env.js";
import logger from "../config/logger.js";
import monitoringService from "../services/monitoring.service.js";

class SandboxMonitorJob {
    constructor() {
        this.running = false;
        this.timer = null;
    }

    async runOnce() {
        if (this.running) return;
        this.running = true;
        try {
            await monitoringService.syncAllActive();
        } catch (error) {
            logger.error(`Sandbox monitor job cycle error: ${error.message}`);
        } finally {
            this.running = false;
        }
    }

    start() {
        logger.info(`Starting Sandbox Monitor Job (interval: ${env.SANDBOX_MONITOR_INTERVAL_MS}ms)`);
        this.runOnce().catch((error) => logger.error(`Sandbox monitor runOnce failed: ${error.message}`));
        this.timer = setInterval(
            () => this.runOnce().catch((error) => logger.error(`Sandbox monitor job failed: ${error.message}`)),
            env.SANDBOX_MONITOR_INTERVAL_MS
        );
        return this.timer;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            logger.info("Stopped Sandbox Monitor Job.");
        }
    }
}

export default new SandboxMonitorJob();
