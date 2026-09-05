const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Phase 13: Gas Benchmarking Test Suite", function () {
  let AIXToken, aixToken;
  let Treasury, treasury;
  let DatasetRegistry, datasetRegistry;
  let LicenseRegistry, licenseRegistry;
  let PurchaseEngine, purchaseEngine;
  let ModelRegistry, modelRegistry;
  let ProvenanceRegistry, provenanceRegistry;
  let RoyaltyEngine, royaltyEngine;

  let owner, creator, buyer, contributor1, contributor2;
  const initialSupply = ethers.parseEther("10000000");

  const validDatasetCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validModelName = "ResNet-50-Classifier";
  const validMetadataURI = "ipfs://QmMetadata/model.json";
  const validModelHash =
    "a3c4f981b2e61d859123456789abcdef0123456789abcdef0123456789abcdef";
  const validExecutionId = "exec-gas-bench-001";
  const validMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes("gas_bench_metadata_sample")
  );

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

  const RoyaltySourceType = {
    PURCHASE: 0,
    DERIVATIVE: 1,
    INFERENCE: 2,
    DIRECT: 3,
  };

  beforeEach(async function () {
    [owner, creator, buyer, contributor1, contributor2] =
      await ethers.getSigners();

    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(initialSupply, owner.address);
    await aixToken.waitForDeployment();

    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(owner.address);
    await treasury.waitForDeployment();

    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();

    LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
    licenseRegistry = await LicenseRegistry.deploy(
      await datasetRegistry.getAddress()
    );
    await licenseRegistry.waitForDeployment();

    PurchaseEngine = await ethers.getContractFactory("PurchaseEngine");
    purchaseEngine = await PurchaseEngine.deploy(
      await aixToken.getAddress(),
      await datasetRegistry.getAddress(),
      await licenseRegistry.getAddress(),
      await treasury.getAddress(),
      250,
      owner.address
    );
    await purchaseEngine.waitForDeployment();

    ModelRegistry = await ethers.getContractFactory("ModelRegistry");
    modelRegistry = await ModelRegistry.deploy();
    await modelRegistry.waitForDeployment();

    ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    provenanceRegistry = await ProvenanceRegistry.deploy(
      await datasetRegistry.getAddress(),
      await modelRegistry.getAddress()
    );
    await provenanceRegistry.waitForDeployment();

    RoyaltyEngine = await ethers.getContractFactory("RoyaltyEngine");
    royaltyEngine = await RoyaltyEngine.deploy(
      await aixToken.getAddress(),
      await treasury.getAddress(),
      await purchaseEngine.getAddress(),
      250,
      owner.address
    );
    await royaltyEngine.waitForDeployment();

    await aixToken.transfer(buyer.address, ethers.parseEther("50000"));
  });

  it("1. AIXToken.transfer gas consumption benchmark (< 70,000)", async function () {
    const tx = await aixToken.transfer(creator.address, ethers.parseEther("100"));
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(70000n);
    expect(receipt.status).to.equal(1);
  });

  it("2. AIXToken.approve gas consumption benchmark (< 60,000)", async function () {
    const tx = await aixToken.approve(await purchaseEngine.getAddress(), ethers.parseEther("1000"));
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(60000n);
    expect(receipt.status).to.equal(1);
  });

  it("3. Treasury.depositToken gas consumption benchmark (< 100,000)", async function () {
    await aixToken.approve(await treasury.getAddress(), ethers.parseEther("500"));
    const tx = await treasury.depositToken(await aixToken.getAddress(), ethers.parseEther("500"));
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(100000n);
    expect(receipt.status).to.equal(1);
  });

  it("4. Treasury.withdrawToken gas consumption benchmark (< 70,000)", async function () {
    await aixToken.approve(await treasury.getAddress(), ethers.parseEther("500"));
    await treasury.depositToken(await aixToken.getAddress(), ethers.parseEther("500"));
    const tx = await treasury.withdrawToken(await aixToken.getAddress(), creator.address, ethers.parseEther("250"));
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(70000n);
    expect(receipt.status).to.equal(1);
  });

  it("5. DatasetRegistry.registerDataset gas consumption benchmark (< 350,000)", async function () {
    const tx = await datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(350000n);
    expect(receipt.status).to.equal(1);
  });

  it("6. DatasetRegistry.updateDataset gas consumption benchmark (< 90,000)", async function () {
    await datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500);
    const tx = await datasetRegistry.connect(creator).updateDataset(1, "QmNewCID1234567890", "Apache-2.0", 300);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(90000n);
    expect(receipt.status).to.equal(1);
  });

  it("7. LicenseRegistry.createLicense gas consumption benchmark (< 450,000)", async function () {
    await datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500);
    const tx = await licenseRegistry.connect(creator).createLicense({
      assetId: 1,
      assetType: AssetType.DATASET,
      licenseType: LicenseType.COMMERCIAL,
      pricingModel: PricingModel.FIXED,
      fixedPrice: ethers.parseEther("500"),
      royaltyRate: 0,
      metadataURI: "ipfs://QmMeta",
      rights: {
        canView: true,
        canDownload: true,
        canModify: true,
        canTrain: true,
        canInfer: true,
        canCommercialUse: true,
        canDistribute: false,
        canSublicense: false,
      },
      restrictions: "None",
      validFrom: 0,
      validUntil: 0,
    });
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(450000n);
    expect(receipt.status).to.equal(1);
  });

  it("8. ModelRegistry.registerModel gas consumption benchmark (< 500,000)", async function () {
    const tx = await modelRegistry.connect(creator).registerModel(validModelName, validMetadataURI, validModelHash);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(500000n);
    expect(receipt.status).to.equal(1);
  });

  it("9. ModelRegistry.addModelVersion gas consumption benchmark (< 250,000)", async function () {
    await modelRegistry.connect(creator).registerModel(validModelName, validMetadataURI, validModelHash);
    const tx = await modelRegistry.connect(creator).addModelVersion(1, "ipfs://QmMetaV2", "c5d6e7f80123456789abcdef0123456789abcdef0123456789abcdef01234567");
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(250000n);
    expect(receipt.status).to.equal(1);
  });

  it("10. PurchaseEngine.purchaseDataset gas consumption benchmark (< 600,000)", async function () {
    await datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500);
    await licenseRegistry.connect(creator).createLicense({
      assetId: 1,
      assetType: AssetType.DATASET,
      licenseType: LicenseType.COMMERCIAL,
      pricingModel: PricingModel.FIXED,
      fixedPrice: ethers.parseEther("500"),
      royaltyRate: 0,
      metadataURI: "ipfs://QmMeta",
      rights: {
        canView: true,
        canDownload: true,
        canModify: true,
        canTrain: true,
        canInfer: true,
        canCommercialUse: true,
        canDistribute: false,
        canSublicense: false,
      },
      restrictions: "None",
      validFrom: 0,
      validUntil: 0,
    });

    await aixToken.connect(buyer).approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));
    const tx = await purchaseEngine.connect(buyer).purchaseDataset(1, 1);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(600000n);
    expect(receipt.status).to.equal(1);
  });

  it("11. RoyaltyEngine.distributeRoyalty gas consumption benchmark (< 750,000)", async function () {
    const revenue = ethers.parseEther("1000");
    const recipients = [
      { recipient: contributor1.address, shareBps: 6000 },
      { recipient: contributor2.address, shareBps: 3750 },
    ];
    await aixToken.approve(await royaltyEngine.getAddress(), revenue);
    const tx = await royaltyEngine.distributeRoyalty(RoyaltySourceType.PURCHASE, 101, revenue, recipients);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(750000n);
    expect(receipt.status).to.equal(1);
  });

  it("12. ProvenanceRegistry.registerProvenance gas consumption benchmark (< 600,000)", async function () {
    await datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500);
    await modelRegistry.connect(creator).registerModel(validModelName, validMetadataURI, validModelHash);
    const tx = await provenanceRegistry.connect(creator).registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lessThan(600000n);
    expect(receipt.status).to.equal(1);
  });
});
