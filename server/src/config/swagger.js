import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "AIXchange API",
            version: "1.0.0",
            description:
                "REST API documentation for the AIXchange Backend.",
        },

        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Development Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

        tags: [
            {
                name: "Health",
                description: "Health Check APIs",
            },
            {
                name: "Authentication",
                description: "Authentication APIs",
            },
            {
                name: "Users",
                description: "User Management APIs",
            },
            {
                name: "Datasets",
                description: "Dataset Marketplace APIs",
            },
            {
                name: "Models",
                description: "AI Model Marketplace APIs",
            },
            {
                name: "Licenses",
                description: "Licensing APIs",
            },
            {
                name: "Transactions",
                description: "Purchase & Royalty APIs",
            },
            {
                name: "Blockchain",
                description: "Blockchain Interaction APIs",
            },
            {
                name: "Wallet",
                description: "Wallet linking and verification endpoints",
            },
            {
                name: "Provenance",
                description: "AI Provenance, lineage tracking, and on-chain verification APIs",
            },
            {
                name: "Royalties",
                description: "On-chain royalty engine, revenue splits, reporting, and reconciliation APIs",
            },
            {
                name: "Sandbox",
                description: "Docker Sandbox and AI Training Orchestration APIs",
            },
        ],
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
    const prefix = process.env.API_PREFIX || "/api/v1";
    app.use(`${prefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
