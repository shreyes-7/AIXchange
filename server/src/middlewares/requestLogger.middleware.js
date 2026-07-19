import logger from "../config/logger.js";

const requestLogger = (req, res, next) => {
    if (
        !req.originalUrl.startsWith("/api/v1") ||
        req.originalUrl.startsWith("/api/docs")
    ) {
        return next();
    }

    const startTime = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - startTime;

        logger.http(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};

export default requestLogger;