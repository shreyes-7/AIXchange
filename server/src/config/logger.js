import winston from "winston";
import env from "./env.js";

const { combine, timestamp, colorize, printf, errors } = winston.format;

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        verbose: "cyan",
        debug: "blue",
        silly: "grey",
    },
};

winston.addColors(customLevels.colors);

const consoleFormat = printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;

    let log = `${timestamp} ${level}: ${stack || message}`;

    // Remove internal Symbol keys before checking metadata
    const metadata = Object.fromEntries(
        Object.entries(meta).filter(([key]) => !key.startsWith("Symbol("))
    );

    if (Object.keys(metadata).length > 0) {
        log += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return log;
});

const logger = winston.createLogger({
    levels: customLevels.levels,

    level: env.NODE_ENV === "production" ? "info" : "debug",

    format: combine(
        errors({ stack: true }),
        timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        })
    ),

    transports: [
        new winston.transports.Console({
            format: combine(
                colorize({ level: true }),
                consoleFormat
            ),
        }),
    ],

    exitOnError: false,
});

export default logger;