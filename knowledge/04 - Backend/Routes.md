# Routes

## Overview

The routing layer in `server/src/routes/` maps incoming HTTP paths and methods to validation middlewares and controller handlers.

---

## Route Modules

### 1. `index.js` (Master Router)
Mounts sub-routers onto `/api/v1`:
```javascript
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/datasets', datasetRoutes);
router.use('/licenses', licenseRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/token', tokenRoutes);
router.use('/treasury', treasuryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
```

### 2. `auth.routes.js`
- `POST /register`: `validate(registerSchema) -> authController.register`
- `POST /login`: `validate(loginSchema) -> authController.login`
- `POST /logout`: `authenticate -> authController.logout`
- `GET /me`: `authenticate -> authController.getMe`
- `POST /change-password`: `authenticate -> validate(changePasswordSchema) -> authController.changePassword`
- `POST /refresh-token`: `authController.refreshToken`

### 3. `wallet.route.js`
- `GET /nonce`: `validate(getNonceSchema) -> walletController.getNonce`
- `POST /verify`: `validate(verifyWalletSchema) -> walletController.verifyWallet`
- `POST /connect`: `authenticate -> validate(connectWalletSchema) -> walletController.connectWallet`

### 4. `dataset.route.js`
- `GET /`: `validate(queryDatasetSchema) -> datasetController.getDatasets`
- `GET /featured`: `datasetController.getFeaturedDatasets`
- `GET /:id`: `datasetController.getDatasetById`
- `POST /`: `authenticate -> validate(createDatasetSchema) -> datasetController.createDataset`
- `PUT /:id`: `authenticate -> validate(updateDatasetSchema) -> datasetController.updateDataset`
- `DELETE /:id`: `authenticate -> datasetController.deleteDataset`

### 5. `license.route.js`
- `GET /asset/:assetId`: `licenseController.getLicensesByAsset`
- `GET /:id`: `licenseController.getLicenseById`
- `POST /`: `authenticate -> validate(createLicenseSchema) -> licenseController.createLicense`
- `POST /:id/revoke`: `authenticate -> licenseController.revokeLicense`

### 6. `purchase.route.js`
- `POST /`: `authenticate -> validate(recordPurchaseSchema) -> purchaseController.recordPurchase`
- `GET /my-purchases`: `authenticate -> purchaseController.getMyPurchases`
- `GET /receipt/:id`: `authenticate -> purchaseController.getReceipt`
- `GET /check-access/:datasetId`: `authenticate -> purchaseController.checkAccess`

### 7. `token.route.js`
- `GET /stats`: `tokenController.getTokenStats`
- `GET /balance/:address`: `tokenController.getBalance`
- `POST /faucet`: `validate(faucetSchema) -> tokenController.requestFaucet`
