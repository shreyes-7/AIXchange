import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import env from "./config/env.js";

import routes from "./routes/index.js";

import requestLogger from "./middlewares/requestLogger.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import swaggerDocs from "./config/swagger.js";

const app = express();

/* ------------------------- Security ------------------------- */

app.use(helmet());

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    })
);

/* ------------------------- Performance ------------------------- */

app.use(compression());

/* ------------------------- Parsers ------------------------- */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------------- Logging ------------------------- */

app.use(requestLogger);

/*----------------------Swagger-------------------------*/
swaggerDocs(app);

/* ------------------------- Routes ------------------------- */

app.use(env.API_PREFIX, routes);

/* ------------------------- 404 ------------------------- */

app.use(notFound);

/* ------------------------- Error Handler ------------------------- */

app.use(errorHandler);

export default app;