const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("LicenseRegistry Smart Contract", function () {
  let DatasetRegistry;
  let datasetRegistry;
  let LicenseRegistry;
  let licenseRegistry;

  let owner;
  let creator1;
  let creator2;
  let buyer;

  const validDatasetCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validMetadataURI = "ipfs://QmLicenseMetadataHash123456789";

  // License Type Enums
  const LicenseType = {
    ACADEMIC: 0,
    COMMERCIAL: 1,
    EXCLUSIVE: 2,
    CUSTOM: 3,
  };

  // Pricing Model Enums
  const PricingModel = {
    FIXED: 0,
    ROYALTY: 1,
  };

  // Asset Type Enums
  const AssetType = {
    DATASET: 0,
    MODEL: 1,
  };

  // License Status Enums
  const LicenseStatus = {
    ACTIVE: 0,
    REVOKED: 1,
    EXPIRED: 2,
  };

  const defaultRights = {
    canView: true,
    canDownload: true,
    canModify: false,
    canTrain: true,
    canInfer: true,
    canCommercialUse: false,
    canDistribute: false,
    canSublicense: false,
  };

  const commercialRights = {
    canView: true,
    canDownload: true,
    canModify: true,
    canTrain: true,
    canInfer: true,
    canCommercialUse: true,
    canDistribute: true,
    canSublicense: false,
  };

  beforeEach(async function () {
    [owner, creator1, creator2, buyer] = await ethers.getSigners();

    // 1. Deploy Phase 4 DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();

    // 2. Deploy Phase 5 LicenseRegistry linking DatasetRegistry
    LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
    licenseRegistry = await LicenseRegistry.deploy(await datasetRegistry.getAddress());
    await licenseRegistry.waitForDeployment();

    // 3. Register a test dataset owned by creator1 (datasetId = 1)
    await datasetRegistry
      .connect(creator1)
      .registerDataset(validDatasetCID, "MIT", 500);

    // 4. Register a second dataset owned by creator2 (datasetId = 2)
    await datasetRegistry
      .connect(creator2)
      .registerDataset("QmAnotherCID987654321", "Apache-2.0", 1000);
  });

  describe("Deployment", function () {
    it("Should initialize with zero total licenses", async function () {
      expect(await licenseRegistry.getTotalLicenses()).to.equal(0);
    });

    it("Should correctly reference the DatasetRegistry contract", async function () {
      expect(await licenseRegistry.datasetRegistry()).to.equal(
        await datasetRegistry.getAddress()
      );
    });

    it("Should revert if deployed with zero address for DatasetRegistry", async function () {
      await expect(
        LicenseRegistry.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(licenseRegistry, "ZeroAddress");
    });

    it("Should have MAX_ROYALTY_BPS set to 10000 (100%)", async function () {
      expect(await licenseRegistry.MAX_ROYALTY_BPS()).to.equal(10000);
    });
  });

  describe("License Creation — Authorization & Asset Ownership", function () {
    it("Should allow the authorized dataset owner to create a FIXED price Commercial license", async function () {
      const fixedPrice = ethers.parseEther("500"); // 500 AIX

      const tx = await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.COMMERCIAL,
        pricingModel: PricingModel.FIXED,
        fixedPrice: fixedPrice,
        royaltyRate: 0,
        metadataURI: validMetadataURI,
        rights: commercialRights,
        restrictions: "No resale of raw unaugmented weights.",
        validFrom: 0,
        validUntil: 0,
      });

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(licenseRegistry, "LicenseCreated")
        .withArgs(
          1,
          1,
          AssetType.DATASET,
          creator1.address,
          LicenseType.COMMERCIAL,
          PricingModel.FIXED,
          fixedPrice,
          0,
          block.timestamp
        );

      expect(await licenseRegistry.getTotalLicenses()).to.equal(1);

      const lic = await licenseRegistry.getLicense(1);
      expect(lic.licenseId).to.equal(1);
      expect(lic.assetId).to.equal(1);
      expect(lic.licensor).to.equal(creator1.address);
      expect(lic.fixedPrice).to.equal(fixedPrice);
      expect(lic.royaltyRate).to.equal(0);
      expect(lic.status).to.equal(LicenseStatus.ACTIVE);
      expect(lic.version).to.equal(1);
    });

    it("Should allow the authorized dataset owner to create a ROYALTY price Academic license", async function () {
      const royaltyBps = 1000; // 10%

      const tx = await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.ACADEMIC,
        pricingModel: PricingModel.ROYALTY,
        fixedPrice: 0,
        royaltyRate: royaltyBps,
        metadataURI: validMetadataURI,
        rights: defaultRights,
        restrictions: "Academic & research use only.",
        validFrom: 0,
        validUntil: 0,
      });

      await expect(tx)
        .to.emit(licenseRegistry, "LicenseCreated")
        .withArgs(
          1,
          1,
          AssetType.DATASET,
          creator1.address,
          LicenseType.ACADEMIC,
          PricingModel.ROYALTY,
          0,
          royaltyBps,
          (await ethers.provider.getBlock("latest")).timestamp
        );

      const lic = await licenseRegistry.getLicense(1);
      expect(lic.pricingModel).to.equal(PricingModel.ROYALTY);
      expect(lic.royaltyRate).to.equal(royaltyBps);
      expect(lic.fixedPrice).to.equal(0);
    });

    it("Should prevent an unauthorized non-owner from creating a license for another user's dataset", async function () {
      await expect(
        licenseRegistry.connect(buyer).createLicense({
          assetId: 1, // Owned by creator1
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "UnauthorizedLicensor")
        .withArgs(buyer.address, 1);
    });

    it("Should revert if creating a license for a non-existent dataset ID", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 999, // Does not exist
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound")
        .withArgs(999);
    });

    it("Should revert if assetId is 0", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 0,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "InvalidAsset")
        .withArgs(0);
    });

    it("Should revert for unsupported asset types (e.g. MODEL before Phase 8)", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.MODEL,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "AssetTypeNotSupported")
        .withArgs(AssetType.MODEL);
    });
  });

  describe("License Creation — Pricing Validations", function () {
    it("Should revert if FIXED model is configured with a non-zero royalty rate", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("500"),
          royaltyRate: 500, // Invalid when model is FIXED
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "InvalidRoyaltyRate")
        .withArgs(500);
    });

    it("Should revert if ROYALTY model is configured with a non-zero fixed price", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.ROYALTY,
          fixedPrice: ethers.parseEther("100"), // Invalid when model is ROYALTY
          royaltyRate: 500,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      ).to.be.revertedWithCustomError(licenseRegistry, "InvalidFixedPrice");
    });

    it("Should revert if ROYALTY model is configured with 0 royalty rate", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.ROYALTY,
          fixedPrice: 0,
          royaltyRate: 0, // Must be > 0
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "InvalidRoyaltyRate")
        .withArgs(0);
    });

    it("Should revert if royalty exceeds 10000 basis points (100%)", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.ROYALTY,
          fixedPrice: 0,
          royaltyRate: 10001, // > 100%
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      )
        .to.be.revertedWithCustomError(licenseRegistry, "InvalidRoyaltyRate")
        .withArgs(10001);
    });

    it("Should accept boundary royalty of exactly 10000 basis points (100%)", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.EXCLUSIVE,
          pricingModel: PricingModel.ROYALTY,
          fixedPrice: 0,
          royaltyRate: 10000,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "Exclusive total royalty model.",
          validFrom: 0,
          validUntil: 0,
        })
      ).to.not.be.reverted;
    });
  });

  describe("License Creation — Validity & Metadata Validations", function () {
    it("Should revert if metadata URI is empty", async function () {
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: "", // Empty
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: 0,
        })
      ).to.be.revertedWithCustomError(licenseRegistry, "InvalidMetadataURI");
    });

    it("Should revert if validUntil is in the past", async function () {
      const pastTime = (await ethers.provider.getBlock("latest")).timestamp - 100;
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: 0,
          validUntil: pastTime,
        })
      ).to.be.revertedWithCustomError(licenseRegistry, "InvalidValidityPeriod");
    });

    it("Should revert if validUntil precedes validFrom", async function () {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      await expect(
        licenseRegistry.connect(creator1).createLicense({
          assetId: 1,
          assetType: AssetType.DATASET,
          licenseType: LicenseType.COMMERCIAL,
          pricingModel: PricingModel.FIXED,
          fixedPrice: ethers.parseEther("100"),
          royaltyRate: 0,
          metadataURI: validMetadataURI,
          rights: commercialRights,
          restrictions: "",
          validFrom: now + 500,
          validUntil: now + 200, // Precedes validFrom
        })
      ).to.be.revertedWithCustomError(licenseRegistry, "InvalidValidityPeriod");
    });
  });

  describe("License Lifecycle & Expiration Checking", function () {
    let licenseId;
    let expirationTime;

    beforeEach(async function () {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      expirationTime = now + 3600; // 1 hour from now

      const tx = await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.COMMERCIAL,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("300"),
        royaltyRate: 0,
        metadataURI: validMetadataURI,
        rights: commercialRights,
        restrictions: "Valid for 1 hour.",
        validFrom: 0,
        validUntil: expirationTime,
      });
      const receipt = await tx.wait();
      licenseId = 1;
    });

    it("Should report license as active before expiration", async function () {
      expect(await licenseRegistry.isLicenseActive(licenseId)).to.be.true;
    });

    it("Should report license as inactive after expiration time passes", async function () {
      await time.increase(3601);
      expect(await licenseRegistry.isLicenseActive(licenseId)).to.be.false;
    });

    it("Should allow the licensor to revoke an active license", async function () {
      const tx = await licenseRegistry.connect(creator1).revokeLicense(licenseId);
      await expect(tx)
        .to.emit(licenseRegistry, "LicenseRevoked")
        .withArgs(licenseId, creator1.address, (await ethers.provider.getBlock("latest")).timestamp);

      const lic = await licenseRegistry.getLicense(licenseId);
      expect(lic.status).to.equal(LicenseStatus.REVOKED);
      expect(await licenseRegistry.isLicenseActive(licenseId)).to.be.false;
    });

    it("Should prevent non-licensor from revoking a license", async function () {
      await expect(
        licenseRegistry.connect(buyer).revokeLicense(licenseId)
      )
        .to.be.revertedWithCustomError(licenseRegistry, "UnauthorizedLicensor")
        .withArgs(buyer.address, 1);
    });

    it("Should revert if revoking an already revoked license", async function () {
      await licenseRegistry.connect(creator1).revokeLicense(licenseId);
      await expect(
        licenseRegistry.connect(creator1).revokeLicense(licenseId)
      )
        .to.be.revertedWithCustomError(licenseRegistry, "LicenseAlreadyRevoked")
        .withArgs(licenseId);
    });

    it("Should allow licensor to set custom license status", async function () {
      const tx = await licenseRegistry
        .connect(creator1)
        .setLicenseStatus(licenseId, LicenseStatus.EXPIRED);

      await expect(tx)
        .to.emit(licenseRegistry, "LicenseStatusChanged")
        .withArgs(licenseId, LicenseStatus.ACTIVE, LicenseStatus.EXPIRED);

      const lic = await licenseRegistry.getLicense(licenseId);
      expect(lic.status).to.equal(LicenseStatus.EXPIRED);
    });
  });

  describe("License Updates & Versioning", function () {
    let licenseId;

    beforeEach(async function () {
      await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.COMMERCIAL,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("500"),
        royaltyRate: 0,
        metadataURI: validMetadataURI,
        rights: commercialRights,
        restrictions: "Original restrictions.",
        validFrom: 0,
        validUntil: 0,
      });
      licenseId = 1;
    });

    it("Should allow licensor to update price, metadata, and rights, incrementing version counter", async function () {
      const newPrice = ethers.parseEther("750");
      const newMetadataURI = "ipfs://QmUpdatedMetadataHash999";
      const updatedRights = { ...commercialRights, canSublicense: true };
      const newRestrictions = "Updated terms with sublicensing permission.";

      const tx = await licenseRegistry.connect(creator1).updateLicense(
        licenseId,
        newPrice,
        0,
        newMetadataURI,
        updatedRights,
        newRestrictions
      );

      await expect(tx)
        .to.emit(licenseRegistry, "LicenseUpdated")
        .withArgs(
          licenseId,
          newPrice,
          0,
          newMetadataURI,
          2, // Version incremented to 2
          (await ethers.provider.getBlock("latest")).timestamp
        );

      const lic = await licenseRegistry.getLicense(licenseId);
      expect(lic.fixedPrice).to.equal(newPrice);
      expect(lic.metadataURI).to.equal(newMetadataURI);
      expect(lic.rights.canSublicense).to.be.true;
      expect(lic.restrictions).to.equal(newRestrictions);
      expect(lic.version).to.equal(2);
    });

    it("Should prevent non-licensor from updating a license", async function () {
      await expect(
        licenseRegistry.connect(buyer).updateLicense(
          licenseId,
          ethers.parseEther("100"),
          0,
          validMetadataURI,
          commercialRights,
          ""
        )
      )
        .to.be.revertedWithCustomError(licenseRegistry, "UnauthorizedLicensor")
        .withArgs(buyer.address, 1);
    });

    it("Should revert update if license is revoked", async function () {
      await licenseRegistry.connect(creator1).revokeLicense(licenseId);

      await expect(
        licenseRegistry.connect(creator1).updateLicense(
          licenseId,
          ethers.parseEther("600"),
          0,
          validMetadataURI,
          commercialRights,
          ""
        )
      )
        .to.be.revertedWithCustomError(licenseRegistry, "LicenseAlreadyRevoked")
        .withArgs(licenseId);
    });
  });

  describe("Read Queries & Phase 6/10 Integration Hooks", function () {
    beforeEach(async function () {
      // Create 2 licenses for Dataset 1
      await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.ACADEMIC,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("50"),
        royaltyRate: 0,
        metadataURI: "ipfs://QmAcademic1",
        rights: defaultRights,
        restrictions: "Academic only",
        validFrom: 0,
        validUntil: 0,
      });

      await licenseRegistry.connect(creator1).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.COMMERCIAL,
        pricingModel: PricingModel.ROYALTY,
        fixedPrice: 0,
        royaltyRate: 750, // 7.5%
        metadataURI: "ipfs://QmCommercial1",
        rights: commercialRights,
        restrictions: "Commercial royalty",
        validFrom: 0,
        validUntil: 0,
      });

      // Create 1 license for Dataset 2
      await licenseRegistry.connect(creator2).createLicense({
        assetId: 2,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.EXCLUSIVE,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("10000"),
        royaltyRate: 0,
        metadataURI: "ipfs://QmExclusive2",
        rights: commercialRights,
        restrictions: "Exclusive full rights",
        validFrom: 0,
        validUntil: 0,
      });
    });

    it("Should return all licenses associated with a specific asset", async function () {
      const dataset1Licenses = await licenseRegistry.getLicensesByAsset(
        AssetType.DATASET,
        1
      );
      expect(dataset1Licenses.length).to.equal(2);
      expect(dataset1Licenses[0]).to.equal(1n);
      expect(dataset1Licenses[1]).to.equal(2n);

      const dataset2Licenses = await licenseRegistry.getLicensesByAsset(
        AssetType.DATASET,
        2
      );
      expect(dataset2Licenses.length).to.equal(1);
      expect(dataset2Licenses[0]).to.equal(3n);
    });

    it("Should return all licenses created by a specific licensor", async function () {
      const creator1Licenses = await licenseRegistry.getLicensesByLicensor(
        creator1.address
      );
      expect(creator1Licenses.length).to.equal(2);

      const creator2Licenses = await licenseRegistry.getLicensesByLicensor(
        creator2.address
      );
      expect(creator2Licenses.length).to.equal(1);
    });

    it("Should provide getLicensePricing helper for purchase/royalty engines", async function () {
      const [model1, fixedPrice1, royalty1] = await licenseRegistry.getLicensePricing(1);
      expect(model1).to.equal(PricingModel.FIXED);
      expect(fixedPrice1).to.equal(ethers.parseEther("50"));
      expect(royalty1).to.equal(0);

      const [model2, fixedPrice2, royalty2] = await licenseRegistry.getLicensePricing(2);
      expect(model2).to.equal(PricingModel.ROYALTY);
      expect(fixedPrice2).to.equal(0);
      expect(royalty2).to.equal(750);
    });

    it("Should provide getLicenseRights and getLicenseType queries", async function () {
      const [rights, restrictions] = await licenseRegistry.getLicenseRights(1);
      expect(rights.canTrain).to.be.true;
      expect(rights.canCommercialUse).to.be.false;
      expect(restrictions).to.equal("Academic only");

      expect(await licenseRegistry.getLicenseType(1)).to.equal(LicenseType.ACADEMIC);
      expect(await licenseRegistry.getLicenseType(2)).to.equal(LicenseType.COMMERCIAL);
      expect(await licenseRegistry.getLicenseType(3)).to.equal(LicenseType.EXCLUSIVE);
    });

    it("Should revert on querying non-existent license ID", async function () {
      await expect(licenseRegistry.getLicense(999)).to.be.revertedWithCustomError(
        licenseRegistry,
        "LicenseNotFound"
      ).withArgs(999);

      await expect(licenseRegistry.getLicensePricing(0)).to.be.revertedWithCustomError(
        licenseRegistry,
        "LicenseNotFound"
      ).withArgs(0);
    });
  });
});
