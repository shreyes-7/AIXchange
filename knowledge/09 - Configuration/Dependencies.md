# Dependencies

This document provides a consolidated catalog of package dependencies verified across the repository.

---

## 1. Root Workspace (`package.json`)

```json
{
  "devDependencies": {
    "concurrently": "^10.0.3",
    "eslint": "^10.7.0",
    "husky": "^9.1.7",
    "lint-staged": "^17.0.8",
    "prettier": "^3.9.5"
  }
}
```

---

## 2. Blockchain Package (`blockchain/package.json`)

```json
{
  "dependencies": {
    "@nomicfoundation/hardhat-ignition-ethers": "^0.15.9",
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@openzeppelin/contracts": "^5.2.0",
    "dotenv": "^16.4.7",
    "ethers": "^6.13.5",
    "hardhat": "^2.22.19"
  }
}
```

---

## 3. Server Package (`server/package.json`)

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "compression": "^1.8.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "ethers": "^6.17.0",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "helmet": "^8.3.0",
    "joi": "^18.2.3",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.7.4",
    "morgan": "^1.11.0",
    "multer": "^2.2.0",
    "nodemailer": "^9.0.3",
    "swagger-jsdoc": "^6.3.0",
    "swagger-ui-express": "^5.0.1",
    "uuid": "^11.1.0",
    "winston": "^3.19.0"
  },
  "devDependencies": {
    "eslint": "^10.7.0",
    "nodemon": "^3.1.14",
    "prettier": "^3.9.5"
  }
}
```

---

## 4. Client Package (`client/package.json`)

```json
{
  "dependencies": {
    "@tailwindcss/vite": "^4.0.6",
    "axios": "^1.7.9",
    "ethers": "^6.13.5",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5",
    "tailwindcss": "^4.0.6"
  },
  "devDependencies": {
    "@eslint/js": "^9.19.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.19.0",
    "eslint-plugin-react": "^7.37.4",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "vite": "^8.1.4"
  }
}
```
