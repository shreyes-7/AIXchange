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

### 8. `model.route.js` (Phase 8)
- `POST /`: `authenticate -> checkRole -> modelController.create`
- `POST /sync`: `authenticate -> modelController.sync`
- `GET /`: `modelController.list`
- `GET /:id`: `modelController.get`
- `POST /:id/versions`: `authenticate -> checkRole -> modelController.addVersion`
- `GET /:id/versions/:version`: `modelController.getVersion`
- `POST /:id/verify-hash`: `validate(verifyHashSchema) -> modelController.verifyHash`
- `POST /:id/status`: `authenticate -> checkRole -> modelController.setStatus`
- `POST /:id/transfer`: `authenticate -> checkRole -> modelController.transferOwnership`
- `POST /:id/infer`: `authenticate -> validate(inferSchema) -> modelController.infer`

### 9. `provenance.route.js` (Phase 9)
- `POST /`: `authenticate -> checkRole -> validate(registerProvenanceSchema) -> provenanceController.create`
- `POST /sync`: `authenticate -> validate(syncProvenanceSchema) -> provenanceController.sync`
- `GET /:id`: `provenanceController.get`
- `GET /dataset/:datasetId`: `provenanceController.listByDataset`
- `GET /execution/:executionId`: `provenanceController.listByExecution`
- `GET /model/:modelId`: `provenanceController.listByModel`
- `GET /model/:modelId/version/:version`: `provenanceController.listByModelVersion`
- `GET /graph/:modelId`: `provenanceController.getGraph`
- `GET /timeline/:modelId`: `provenanceController.getTimeline`
- `POST /:id/verify`: `validate(verifyProvenanceSchema) -> provenanceController.verify`
- `GET /:id/verify`: `provenanceController.verify`
- `POST /:id/verify-hash`: `validate(verifyHashSchema) -> provenanceController.verifyHash`
- `POST /:id/status`: `authenticate -> checkRole -> validate(setStatusSchema) -> provenanceController.setStatus`

### 10. `royalty.route.js` (Phase 10)
- `GET /distributions/:distributionId`: `validate(distributionIdParamSchema, 'params') -> royaltyController.getDistribution`
- `GET /distributions/:distributionId/allocations`: `validate(distributionIdParamSchema, 'params') -> royaltyController.getAllocations`
- `GET /recipients/:address`: `validate(recipientParamSchema, 'params') -> royaltyController.getRecipientSummary`
- `GET /source/:sourceType/:sourceId`: `validate(sourceParamSchema, 'params') -> royaltyController.checkSourceDistributed`
- `GET /history`: `validate(historyQuerySchema, 'query') -> royaltyController.getHistory`
- `GET /summary`: `royaltyController.getSummary`
- `GET /reports`: `validate(reportQuerySchema, 'query') -> royaltyController.getReports`
- `POST /calculate-split`: `validate(calculateSplitSchema) -> royaltyController.calculateSplit`
- `POST /prepare`: `authenticate -> validate(prepareRoyaltySchema) -> royaltyController.prepareDistribution`
- `POST /sync`: `authenticate -> validate(syncRoyaltySchema) -> royaltyController.syncDistribution`
- `POST /reconcile`: `authenticate -> royaltyController.reconcile`
- `POST /reconcile/:distributionId`: `authenticate -> validate(distributionIdParamSchema, 'params') -> royaltyController.reconcile`

