# Database Schema

## Overview

This document details the MongoDB schemas, data types, constraints, and indexes across all models in `server/src/models/`.

---

## 1. Schema Specifications

### `User`
```typescript
interface IUser {
  _id: ObjectId;
  username: string;          // unique, trimmed, indexed
  email: string;             // unique, lowercase, trimmed, indexed
  password?: string;         // bcrypt hash, hidden by default
  role: 'buyer' | 'creator' | 'validator' | 'admin';
  walletAddress?: string;    // lowercase, unique sparse index
  nonce?: string;            // EIP-191 authentication challenge
  isEmailVerified: boolean;  // default: false
  reputationScore: number;   // default: 100
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### `Dataset`
```typescript
interface IDataset {
  _id: ObjectId;
  datasetId?: number;        // on-chain integer ID, unique sparse index
  title: string;             // trimmed, text index
  description: string;
  category: 'computer-vision' | 'nlp' | 'audio' | 'tabular' | 'multimodal' | 'other';
  tags: string[];            // indexed
  owner?: ObjectId;          // ref: User
  ownerAddress: string;      // lowercase, indexed
  ipfsCid: string;           // immutable IPFS hash
  metadataUri?: string;
  format?: string;           // 'csv' | 'json' | 'parquet' | etc.
  sizeBytes?: number;
  numSamples?: number;
  price: number;             // fixed price in AIX units
  defaultLicense?: string;
  royaltyBps: number;        // basis points (0-10000)
  isActive: boolean;         // default: true
  viewCount: number;
  downloadCount: number;
  purchaseCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### `License`
```typescript
interface ILicense {
  _id: ObjectId;
  licenseId: number;         // on-chain integer ID, unique index
  assetId: number;           // dataset ID, indexed
  assetType: 'DATASET' | 'MODEL';
  licensorAddress: string;   // lowercase, indexed
  licenseType: 'ACADEMIC' | 'COMMERCIAL' | 'EXCLUSIVE' | 'CUSTOM';
  pricingModel: 'FIXED' | 'ROYALTY';
  fixedPrice: string;        // AIX token units
  royaltyBps: number;        // 0-10000
  rights: {
    canView: boolean;
    canDownload: boolean;
    canModify: boolean;
    canTrain: boolean;
    canInfer: boolean;
    canCommercialUse: boolean;
    canDistribute: boolean;
    canSublicense: boolean;
  };
  restrictions?: string;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  isRevoked: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### `Purchase`
```typescript
interface IPurchase {
  _id: ObjectId;
  purchaseId: number;        // on-chain purchase ID, unique index
  datasetId: number;         // indexed
  licenseId: number;         // indexed
  buyerAddress: string;      // lowercase, indexed
  sellerAddress: string;     // lowercase
  pricePaid: string;         // AIX units
  feePaid: string;           // Platform fee
  creatorShare: string;      // Net creator revenue
  txHash: string;            // unique index
  blockNumber: number;
  purchasedAt: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
