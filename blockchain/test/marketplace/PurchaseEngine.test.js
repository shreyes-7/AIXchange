const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PurchaseEngine Smart Contract", function () {
  let AIXToken, aixToken;
  let Treasury, treasury;
  let DatasetRegistry, datasetRegistry;
  let LicenseRegistry, licenseRegistry;
  let PurchaseEngine, purchaseEngine;

  let owner;
  let creator;
  let buyer1;
  let buyer2;
  let platformAdmin;

  const validDatasetCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validMetadataURI = "ipfs://QmLicenseMetadataHash123456789";

  const LicenseType = {
    ACADEMIC: 0,
    COMMERCIAL: 1,
    EXCLUSIVE: 2,
    CUSTOM: 3,
  };

  const PricingModel = {
    FIXED: 0,
    ROYALTY: 1,
  };

  const AssetType = {
    DATASET: 0,
    MODEL: 1,
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
    [owner, creator, buyer1, buyer2, platformAdmin] = await ethers.getSigners();

    // 1. Deploy Phase 3 AIXToken
    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(ethers.parseEther("1000000"), owner.address);
    await aixToken.waitForDeployment();

    // 2. Deploy Phase 3 Treasury
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(owner.address);
    await treasury.waitForDeployment();

    // 3. Deploy Phase 4 DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();

    // 4. Deploy Phase 5 LicenseRegistry
    LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
    licenseRegistry = await LicenseRegistry.deploy(await datasetRegistry.getAddress());
    await licenseRegistry.waitForDeployment();

    // 5. Deploy Phase 6 PurchaseEngine (2.5% platform fee = 250 BPS)
    PurchaseEngine = await ethers.getContractFactory("PurchaseEngine");
    purchaseEngine = await PurchaseEngine.deploy(
      await aixToken.getAddress(),
      await datasetRegistry.getAddress(),
      await licenseRegistry.getAddress(),
      await treasury.getAddress(),
      250, // 2.50%
      owner.address
    );
    await purchaseEngine.waitForDeployment();

    // Setup: Fund buyers with AIX tokens
    await aixToken.transfer(buyer1.address, ethers.parseEther("10000"));
    await aixToken.transfer(buyer2.address, ethers.parseEther("10000"));

    // Register a dataset owned by creator (datasetId = 1)
    await datasetRegistry
      .connect(creator)
      .registerDataset(validDatasetCID, "MIT", 500);

    // Create a Commercial Fixed License for dataset 1 (licenseId = 1, 500 AIX)
    await licenseRegistry.connect(creator).createLicense({
      assetId: 1,
      assetType: AssetType.DATASET,
      licenseType: LicenseType.COMMERCIAL,
      pricingModel: PricingModel.FIXED,
      fixedPrice: ethers.parseEther("500"),
      royaltyRate: 0,
      metadataURI: validMetadataURI,
      rights: commercialRights,
      restrictions: "Standard commercial terms.",
      validFrom: 0,
      validUntil: 0,
    });
  });

  describe("Deployment", function () {
    it("Should initialize with zero total purchases", async function () {
      expect(await purchaseEngine.getTotalPurchases()).to.equal(0);
    });

    it("Should set the correct platform fee basis points (250 BPS)", async function () {
      expect(await purchaseEngine.getPlatformFee()).to.equal(250);
    });

    it("Should link correct contract references", async function () {
      expect(await purchaseEngine.aixToken()).to.equal(await aixToken.getAddress());
      expect(await purchaseEngine.datasetRegistry()).to.equal(
        await datasetRegistry.getAddress()
      );
      expect(await purchaseEngine.licenseRegistry()).to.equal(
        await licenseRegistry.getAddress()
      );
      expect(await purchaseEngine.treasury()).to.equal(await treasury.getAddress());
    });

    it("Should revert if deployed with zero address for any dependency", async function () {
      await expect(
        PurchaseEngine.deploy(
          ethers.ZeroAddress,
          await datasetRegistry.getAddress(),
          await licenseRegistry.getAddress(),
          await treasury.getAddress(),
          250,
          owner.address
        )
      ).to.be.revertedWithCustomError(purchaseEngine, "ZeroAddress");
    });

    it("Should revert if deployed with invalid initial fee rate (> 1000 BPS)", async function () {
      await expect(
        PurchaseEngine.deploy(
          await aixToken.getAddress(),
          await datasetRegistry.getAddress(),
          await licenseRegistry.getAddress(),
          await treasury.getAddress(),
          1001, // > 10%
          owner.address
        )
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InvalidFeeRate")
        .withArgs(1001);
    });
  });

  describe("Purchase Execution — Happy Path", function () {
    const price = ethers.parseEther("500");
    const feeAmount = ethers.parseEther("12.5"); // 2.5% of 500
    const licensorAmount = ethers.parseEther("487.5"); // 97.5% of 500

    beforeEach(async function () {
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), price);
    });

    it("Should successfully execute purchase and transfer AIX tokens correctly", async function () {
      const buyerInitialBalance = await aixToken.balanceOf(buyer1.address);
      const creatorInitialBalance = await aixToken.balanceOf(creator.address);
      const treasuryInitialBalance = await aixToken.balanceOf(
        await treasury.getAddress()
      );

      const tx = await purchaseEngine.connect(buyer1).purchaseDataset(1, 1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      // Verify token balances
      expect(await aixToken.balanceOf(buyer1.address)).to.equal(
        buyerInitialBalance - price
      );
      expect(await aixToken.balanceOf(creator.address)).to.equal(
        creatorInitialBalance + licensorAmount
      );
      expect(
        await aixToken.balanceOf(await treasury.getAddress())
      ).to.equal(treasuryInitialBalance + feeAmount);

      // Verify purchase record
      expect(await purchaseEngine.getTotalPurchases()).to.equal(1);
      const record = await purchaseEngine.getPurchase(1);
      expect(record.purchaseId).to.equal(1);
      expect(record.assetId).to.equal(1);
      expect(record.licenseId).to.equal(1);
      expect(record.buyer).to.equal(buyer1.address);
      expect(record.licensor).to.equal(creator.address);
      expect(record.price).to.equal(price);
      expect(record.feeAmount).to.equal(feeAmount);
      expect(record.licensorAmount).to.equal(licensorAmount);
      expect(record.active).to.be.true;

      // Verify access entitlement
      expect(await purchaseEngine.hasAccess(buyer1.address, 1, 1)).to.be.true;

      // Verify events
      await expect(tx)
        .to.emit(purchaseEngine, "DatasetPurchased")
        .withArgs(
          1,
          1,
          1,
          buyer1.address,
          creator.address,
          price,
          feeAmount,
          licensorAmount,
          block.timestamp
        );

      await expect(tx)
        .to.emit(purchaseEngine, "RoyaltyTriggered")
        .withArgs(
          1,
          1,
          1,
          creator.address,
          licensorAmount,
          feeAmount,
          block.timestamp
        );
    });
  });

  describe("Purchase Execution — Validation Failures", function () {
    const price = ethers.parseEther("500");

    beforeEach(async function () {
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), price);
    });

    it("Should revert if dataset ID is 0", async function () {
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(0, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InvalidAsset")
        .withArgs(0);
    });

    it("Should revert if license ID is 0", async function () {
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 0)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "LicenseNotFound")
        .withArgs(0);
    });

    it("Should revert if dataset does not exist", async function () {
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(999, 1)
      )
        .to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound")
        .withArgs(999);
    });

    it("Should revert if dataset is inactive", async function () {
      await datasetRegistry.connect(creator).setDatasetStatus(1, false);

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "DatasetInactive")
        .withArgs(1);
    });

    it("Should revert if license does not exist", async function () {
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 999)
      )
        .to.be.revertedWithCustomError(licenseRegistry, "LicenseNotFound")
        .withArgs(999);
    });

    it("Should revert if license belongs to another dataset", async function () {
      // Register dataset 2 owned by creator
      await datasetRegistry
        .connect(creator)
        .registerDataset("QmAnotherCID", "Apache-2.0", 500);

      // Create license for dataset 2 (licenseId = 2)
      await licenseRegistry.connect(creator).createLicense({
        assetId: 2,
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
      });

      // Try to purchase dataset 1 with license 2
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 2)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InvalidLicenseForAsset")
        .withArgs(2, 1);
    });

    it("Should revert if license is revoked / inactive", async function () {
      await licenseRegistry.connect(creator).revokeLicense(1);

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "LicenseInactive")
        .withArgs(1);
    });

    it("Should revert if license is expired", async function () {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      // Create license with 100s validity (licenseId = 2)
      await licenseRegistry.connect(creator).createLicense({
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
        validUntil: now + 100,
      });

      await time.increase(101); // Expire license

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 2)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "LicenseInactive")
        .withArgs(2);
    });

    it("Should prevent creator from purchasing their own dataset (Self-Purchase)", async function () {
      await aixToken
        .connect(creator)
        .approve(await purchaseEngine.getAddress(), price);

      await expect(
        purchaseEngine.connect(creator).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "SelfPurchaseNotAllowed")
        .withArgs(creator.address);
    });
  });

  describe("Payment Failures — Balance & Allowance", function () {
    it("Should revert if buyer has insufficient AIX balance", async function () {
      const poorBuyer = platformAdmin;
      // poorBuyer has 0 AIX
      await aixToken
        .connect(poorBuyer)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));

      await expect(
        purchaseEngine.connect(poorBuyer).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InsufficientBalance")
        .withArgs(0, ethers.parseEther("500"));
    });

    it("Should revert if buyer has insufficient allowance", async function () {
      // Buyer has balance but only approved 100 AIX instead of 500
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("100"));

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InsufficientBalance")
        .withArgs(ethers.parseEther("100"), ethers.parseEther("500"));
    });
  });

  describe("Duplicate Purchases & Exclusivity Enforcement", function () {
    it("Should prevent buyer from duplicate purchases of the same active license", async function () {
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("1000"));

      // First purchase succeeds
      await purchaseEngine.connect(buyer1).purchaseDataset(1, 1);

      // Second purchase attempt reverts
      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "AlreadyPurchased")
        .withArgs(buyer1.address, 1, 1);
    });

    it("Should lock Exclusive licenses after first purchase and reject subsequent buyers", async function () {
      // Create Exclusive license (licenseId = 2)
      await licenseRegistry.connect(creator).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.EXCLUSIVE,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("2000"),
        royaltyRate: 0,
        metadataURI: validMetadataURI,
        rights: commercialRights,
        restrictions: "Sole exclusive buyer.",
        validFrom: 0,
        validUntil: 0,
      });

      expect(await purchaseEngine.isExclusiveLicenseSold(2)).to.be.false;

      // Buyer 1 purchases exclusive license
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("2000"));
      await purchaseEngine.connect(buyer1).purchaseDataset(1, 2);

      expect(await purchaseEngine.isExclusiveLicenseSold(2)).to.be.true;

      // Buyer 2 attempts to purchase the same exclusive license
      await aixToken
        .connect(buyer2)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("2000"));

      await expect(
        purchaseEngine.connect(buyer2).purchaseDataset(1, 2)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "ExclusiveLicenseSold")
        .withArgs(2);
    });
  });

  describe("Access Queries & Entitlements", function () {
    it("Should grant dataset creator natural access without requiring purchase", async function () {
      expect(await purchaseEngine.hasAccess(creator.address, 1, 1)).to.be.true;
    });

    it("Should return false for a non-buyer who has not purchased", async function () {
      expect(await purchaseEngine.hasAccess(buyer1.address, 1, 1)).to.be.false;
    });

    it("Should return true for buyer after valid purchase", async function () {
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));
      await purchaseEngine.connect(buyer1).purchaseDataset(1, 1);

      expect(await purchaseEngine.hasAccess(buyer1.address, 1, 1)).to.be.true;
    });

    it("Should return false if purchased license is subsequently revoked or expired", async function () {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      await licenseRegistry.connect(creator).createLicense({
        assetId: 1,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.ACADEMIC,
        pricingModel: PricingModel.FIXED,
        fixedPrice: ethers.parseEther("50"),
        royaltyRate: 0,
        metadataURI: validMetadataURI,
        rights: defaultRights,
        restrictions: "",
        validFrom: 0,
        validUntil: now + 500,
      });

      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("50"));
      await purchaseEngine.connect(buyer1).purchaseDataset(1, 2);

      expect(await purchaseEngine.hasAccess(buyer1.address, 1, 2)).to.be.true;

      // Fast forward time past expiration
      await time.increase(501);
      expect(await purchaseEngine.hasAccess(buyer1.address, 1, 2)).to.be.false;
    });
  });

  describe("Admin Controls & Emergency Pause", function () {
    it("Should allow owner to update platform fee rate within bounds", async function () {
      const tx = await purchaseEngine.connect(owner).setPlatformFee(500); // 5.00%
      await expect(tx)
        .to.emit(purchaseEngine, "PlatformFeeUpdated")
        .withArgs(250, 500);

      expect(await purchaseEngine.getPlatformFee()).to.equal(500);
    });

    it("Should revert if non-owner attempts to update platform fee", async function () {
      await expect(
        purchaseEngine.connect(buyer1).setPlatformFee(500)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "OwnableUnauthorizedAccount")
        .withArgs(buyer1.address);
    });

    it("Should revert if platform fee exceeds MAX_FEE_BPS (1000 BPS)", async function () {
      await expect(
        purchaseEngine.connect(owner).setPlatformFee(1001)
      )
        .to.be.revertedWithCustomError(purchaseEngine, "InvalidFeeRate")
        .withArgs(1001);
    });

    it("Should allow owner to pause and unpause contract", async function () {
      await purchaseEngine.connect(owner).pause();

      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      ).to.be.revertedWithCustomError(purchaseEngine, "EnforcedPause");

      await purchaseEngine.connect(owner).unpause();

      await expect(
        purchaseEngine.connect(buyer1).purchaseDataset(1, 1)
      ).to.not.be.reverted;
    });
  });

  describe("Lookups and Query Functions", function () {
    beforeEach(async function () {
      await aixToken
        .connect(buyer1)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));
      await purchaseEngine.connect(buyer1).purchaseDataset(1, 1);
    });

    it("Should return purchases by buyer", async function () {
      const purchases = await purchaseEngine.getPurchasesByBuyer(buyer1.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(1n);
    });

    it("Should return purchases by dataset", async function () {
      const purchases = await purchaseEngine.getPurchasesByDataset(1);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(1n);
    });

    it("Should revert getPurchase on invalid purchase IDs", async function () {
      await expect(purchaseEngine.getPurchase(0)).to.be.revertedWithCustomError(
        purchaseEngine,
        "PurchaseNotFound"
      ).withArgs(0);

      await expect(purchaseEngine.getPurchase(999)).to.be.revertedWithCustomError(
        purchaseEngine,
        "PurchaseNotFound"
      ).withArgs(999);
    });
  });
});
