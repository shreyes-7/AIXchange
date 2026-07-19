import logger from "../config/logger.js";
import env from "../config/env.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        logger.error(err.stack || err.message);
    } else {
        logger.warn(err.message);
    }

    const response = {
        success: false,
        statusCode,
        message:
            env.NODE_ENV === "production" && statusCode >= 500
                ? "Internal Server Error"
                : err.message,
    };

    if (env.NODE_ENV !== "production" && statusCode >= 500) {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};

export default errorHandler;