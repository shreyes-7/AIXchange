# Server Application

The server application provides the backend API and coordination layer for AIXchange.

## Purpose

- expose REST endpoints for marketplace operations
- manage authentication and authorization
- connect backend services with MongoDB and blockchain integrations
- support uploads, metadata handling, and shared business logic

## How to Run

```bash
cd server
npm install
npm run dev
```

## Important Folders

- src/: application entry points, controllers, services, and models
- src/routes/: API route definitions
- src/services/: business logic and integrations
- src/models/: database models

## Commands

- npm run dev: start the development server
- npm test: run backend tests

## Dependencies

The server uses Express, Mongoose, JWT, CORS, Helmet, Multer, and Ethers.
