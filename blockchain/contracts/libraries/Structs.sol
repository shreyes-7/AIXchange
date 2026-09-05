// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Structs
 * @dev Data structure definitions for AIXchange smart contracts.
 */
library Structs {
    /// @dev Structure describing token metadata information.
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address owner;
    }

    /// @dev Structure describing a Treasury transaction record.
    struct TreasuryTransaction {
        address token;
        address target;
        uint256 amount;
        uint256 timestamp;
        bool isWithdrawal;
    }

    /// @dev Structure describing an on-chain dataset registration record.
    struct Dataset {
        uint256 datasetId;
        address owner;
        string cid;
        string license;
        uint256 royalty; // In basis points: 500 = 5.00%, max 10000 = 100%
        uint256 createdAt;
        bool active;
    }

    /// @dev Supported license types.
    enum LicenseType {
        ACADEMIC,       // Non-commercial, research, educational
        COMMERCIAL,     // Commercial exploitation, production deployment
        EXCLUSIVE,      // Single exclusive licensee terms
        CUSTOM          // Custom tailored license terms
    }

    /// @dev Pricing models for license terms.
    enum PricingModel {
        FIXED,          // One-time fixed fee in AIX token units
        ROYALTY         // Percentage royalty rate in basis points (0-10000)
    }

    /// @dev Target asset types supported by the licensing registry.
    enum AssetType {
        DATASET,        // AI training/evaluation dataset (Phase 4 integration)
        MODEL           // AI model / weights (future Phase 8 integration)
    }

    /// @dev Lifecycle states for registered licenses.
    enum LicenseStatus {
        ACTIVE,         // License offer is active and enforceable
        REVOKED,        // Licensor revoked this license offer
        EXPIRED         // License validity period has lapsed
    }

    /// @dev Explicit rights granted by a license.
    struct LicenseRights {
        bool canView;
        bool canDownload;
        bool canModify;
        bool canTrain;
        bool canInfer;
        bool canCommercialUse;
        bool canDistribute;
        bool canSublicense;
    }

    /// @dev Full on-chain license record.
    struct License {
        uint256 licenseId;
        uint256 assetId;
        AssetType assetType;
        address licensor;
        LicenseType licenseType;
        PricingModel pricingModel;
        uint256 fixedPrice;         // In AIX token units (wei), 0 if pricingModel == ROYALTY
        uint256 royaltyRate;        // In basis points (0-10000), 0 if pricingModel == FIXED
        string metadataURI;         // IPFS CID or metadata hash for legal document / detailed terms
        LicenseRights rights;       // Explicit permissions
        string restrictions;        // Summary or reference to specific restrictions
        uint256 validFrom;          // Start timestamp (0 = immediate)
        uint256 validUntil;         // Expiration timestamp (0 = perpetual)
        LicenseStatus status;       // ACTIVE, REVOKED, EXPIRED
        uint256 createdAt;          // Creation timestamp
        uint256 updatedAt;          // Last update timestamp
        uint256 version;            // Version counter (starts at 1)
    }

    /// @dev Parameter struct for creating a new license.
    struct LicenseParams {
        uint256 assetId;
        AssetType assetType;
        LicenseType licenseType;
        PricingModel pricingModel;
        uint256 fixedPrice;
        uint256 royaltyRate;
        string metadataURI;
        LicenseRights rights;
        string restrictions;
        uint256 validFrom;
        uint256 validUntil;
    }

    /// @dev Record of a completed on-chain purchase transaction.
    struct PurchaseRecord {
        uint256 purchaseId;
        uint256 assetId;
        AssetType assetType;
        uint256 licenseId;
        address buyer;
        address licensor;
        uint256 price;
        uint256 feeAmount;
        uint256 licensorAmount;
        uint256 timestamp;
        bool active;
    }

    // ==========================================
    // Phase 8 Model Registry Structs
    // ==========================================

    /// @dev Structure describing an individual model version record.
    struct ModelVersion {
        uint256 versionNumber;
        string modelHash;      // Cryptographic SHA-256 digest or artifact hash
        string metadataURI;    // IPFS CID or metadata URI
        uint256 createdAt;     // Creation timestamp of this version
        bool active;           // Status of this version
    }

    /// @dev Structure describing an on-chain AI model registration.
    struct Model {
        uint256 modelId;
        address owner;
        string name;
        string metadataURI;
        uint256 currentVersion;
        uint256 totalVersions;
        uint256 createdAt;
        bool active;
    }

    // ==========================================
    // Phase 9 Provenance Engine Structs
    // ==========================================

    /// @dev Structure describing an on-chain lineage/provenance link between Dataset, Execution, and Model.
    struct ProvenanceRecord {
        uint256 provenanceId;     // Unique sequential identifier
        uint256 datasetId;        // Reference to DatasetRegistry datasetId
        uint256 modelId;          // Reference to ModelRegistry modelId
        uint256 modelVersion;     // Reference to ModelRegistry versionNumber
        string executionId;       // Off-chain execution/sandbox identifier
        bytes32 metadataHash;     // Cryptographic commitment/hash of model_metadata.json
        address registrant;       // Account that anchored the provenance record
        uint256 createdAt;        // Timestamp when record was committed
        bool active;              // Status flag (true = active, false = deprecated/revoked)
    }

    // ==========================================
    // Phase 10 Royalty Engine Structs
    // ==========================================

    /// @dev Supported revenue sources for royalty distributions.
    enum RoyaltySourceType {
        PURCHASE,       // Phase 6 dataset or model purchase
        DERIVATIVE,     // Downstream derivative model/dataset revenue
        INFERENCE,      // Model inference fee distribution
        DIRECT          // Direct contributor tip, grant, or settlement
    }

    /// @dev Lifecycle states for a royalty distribution.
    enum DistributionStatus {
        NONE,           // Nonexistent
        PENDING,        // Allocated but awaiting execution
        DISTRIBUTED,    // Tokens transferred successfully
        CANCELLED       // Cancelled prior to token execution
    }

    /// @dev Input parameter struct specifying an individual recipient share.
    struct RecipientShare {
        address recipient;
        uint256 shareBps;       // Share in basis points (1 - 10000)
    }

    /// @dev On-chain record describing a completed or pending royalty distribution.
    struct DistributionRecord {
        uint256 distributionId;
        bytes32 sourceKey;          // keccak256(abi.encodePacked(sourceType, sourceId))
        RoyaltySourceType sourceType;
        uint256 sourceId;           // Context-dependent identifier (e.g. purchaseId)
        address payer;              // Payer account that funded the distribution
        uint256 totalRevenue;       // Total revenue distributed in AIX tokens
        uint256 treasuryAmount;     // Allocation routed to platform Treasury
        uint256 recipientCount;     // Number of recipients in this distribution
        DistributionStatus status;  // Distribution lifecycle state
        uint256 timestamp;          // Block timestamp when executed
    }

    /// @dev Record describing the specific payout made to an individual recipient.
    struct RecipientAllocation {
        address recipient;
        uint256 shareBps;
        uint256 amount;
        bool paid;
    }
}

