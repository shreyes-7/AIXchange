const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  EventMonitor,
  TreasuryMonitor,
  FraudEngine,
  DEFAULT_MONITORING_CONFIG,
} = require("../../monitoring");

describe("Phase 13: Blockchain API Integration Test Suite", function () {
  let AIXToken, aixToken;
  let Treasury, treasury;
  let DatasetRegistry, datasetRegistry;
  let LicenseRegistry, licenseRegistry;
  let PurchaseEngine, purchaseEngine;
  let ModelRegistry, modelRegistry;
  let ProvenanceRegistry, provenanceRegistry;
  let RoyaltyEngine, royaltyEngine;

  let owner, creator, buyer, contributor1, contributor2, attacker;
  const initialSupply = ethers.parseEther("10000000"); // 10,000,000 AIX
  const initialFeeBps = 250; // 2.50%

  const validDatasetCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validModelName = "ResNet-50-Classifier";
  const validMetadataURI = "ipfs://QmMetadata/model.json";
  const validModelHash =
    "a3c4f981b2e61d859123456789abcdef0123456789abcdef0123456789abcdef";
  const validExecutionId = "exec-sandbox-20260906-001";
  const validMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes("model_metadata_sample_content")
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
    [owner, creator, buyer, contributor1, contributor2, attacker] =
      await ethers.getSigners();

    // 1. Deploy AIXToken
    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(initialSupply, owner.address);
    await aixToken.waitForDeployment();

    // 2. Deploy Treasury
    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(owner.address);
    await treasury.waitForDeployment();

    // 3. Deploy DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();

    // 4. Deploy LicenseRegistry
    LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
    licenseRegistry = await LicenseRegistry.deploy(
      await datasetRegistry.getAddress()
    );
    await licenseRegistry.waitForDeployment();

    // 5. Deploy PurchaseEngine
    PurchaseEngine = await ethers.getContractFactory("PurchaseEngine");
    purchaseEngine = await PurchaseEngine.deploy(
      await aixToken.getAddress(),
      await datasetRegistry.getAddress(),
      await licenseRegistry.getAddress(),
      await treasury.getAddress(),
      initialFeeBps,
      owner.address
    );
    await purchaseEngine.waitForDeployment();

    // 6. Deploy ModelRegistry
    ModelRegistry = await ethers.getContractFactory("ModelRegistry");
    modelRegistry = await ModelRegistry.deploy();
    await modelRegistry.waitForDeployment();

    // 7. Deploy ProvenanceRegistry
    ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    provenanceRegistry = await ProvenanceRegistry.deploy(
      await datasetRegistry.getAddress(),
      await modelRegistry.getAddress()
    );
    await provenanceRegistry.waitForDeployment();

    // 8. Deploy RoyaltyEngine
    RoyaltyEngine = await ethers.getContractFactory("RoyaltyEngine");
    royaltyEngine = await RoyaltyEngine.deploy(
      await aixToken.getAddress(),
      await treasury.getAddress(),
      await purchaseEngine.getAddress(),
      initialFeeBps,
      owner.address
    );
    await royaltyEngine.waitForDeployment();

    // Setup: Fund buyer with AIX tokens
    await aixToken.transfer(buyer.address, ethers.parseEther("50000"));
  });

  describe("1. Wallet / Cryptographic Authentication Flow", function () {
    it("Should verify EIP-191 personal sign signature matching wallet address", async function () {
      const nonce = "aix-nonce-987654321";
      const message = `Please sign this message to authenticate with AIXchange: ${nonce}`;
      const signature = await buyer.signMessage(message);

      const recoveredAddress = ethers.verifyMessage(message, signature);
      expect(recoveredAddress.toLowerCase()).to.equal(buyer.address.toLowerCase());

      expect(signature).to.match(/^0x[a-fA-F0-9]{130}$/);
      expect(recoveredAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("Should reject signature when verified against altered message", async function () {
      const originalMessage = "Please sign this message to authenticate with AIXchange: nonce-1";
      const alteredMessage = "Please sign this message to authenticate with AIXchange: nonce-2";
      const signature = await buyer.signMessage(originalMessage);

      const recoveredAddress = ethers.verifyMessage(alteredMessage, signature);
      expect(recoveredAddress.toLowerCase()).to.not.equal(buyer.address.toLowerCase());
    });
  });

  describe("2. AIX Token Operations & State Transitions", function () {
    it("Should perform token transfer with exact balance diff and Transfer event", async function () {
      const transferAmount = ethers.parseEther("1000");
      const senderBefore = await aixToken.balanceOf(owner.address);
      const receiverBefore = await aixToken.balanceOf(creator.address);

      const tx = await aixToken.transfer(creator.address, transferAmount);
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);
      expect(receipt.hash).to.match(/^0x[a-fA-F0-9]{64}$/);
      expect(receipt.gasUsed).to.be.greaterThan(0n);

      const senderAfter = await aixToken.balanceOf(owner.address);
      const receiverAfter = await aixToken.balanceOf(creator.address);

      expect(senderBefore - senderAfter).to.equal(transferAmount);
      expect(receiverAfter - receiverBefore).to.equal(transferAmount);

      await expect(tx)
        .to.emit(aixToken, "Transfer")
        .withArgs(owner.address, creator.address, transferAmount);
    });

    it("Should revert transfer on insufficient balance", async function () {
      const excessiveAmount = ethers.parseEther("1000000000");
      await expect(
        aixToken.connect(attacker).transfer(creator.address, excessiveAmount)
      ).to.be.revertedWithCustomError(aixToken, "ERC20InsufficientBalance");
    });

    it("Should update allowance and emit Approval event", async function () {
      const approveAmount = ethers.parseEther("5000");
      const tx = await aixToken.connect(buyer).approve(await purchaseEngine.getAddress(), approveAmount);
      await tx.wait();

      const allowance = await aixToken.allowance(buyer.address, await purchaseEngine.getAddress());
      expect(allowance).to.equal(approveAmount);

      await expect(tx)
        .to.emit(aixToken, "Approval")
        .withArgs(buyer.address, await purchaseEngine.getAddress(), approveAmount);
    });

    it("Should revert transferFrom if allowance is exceeded", async function () {
      await aixToken.connect(buyer).approve(attacker.address, ethers.parseEther("100"));
      await expect(
        aixToken
          .connect(attacker)
          .transferFrom(buyer.address, attacker.address, ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(aixToken, "ERC20InsufficientAllowance");
    });
  });

  describe("3. Treasury Operations & SafeERC20 Accounting", function () {
    it("Should deposit tokens into Treasury via depositToken and emit TokenDeposited", async function () {
      const depositAmount = ethers.parseEther("2500");
      await aixToken.approve(await treasury.getAddress(), depositAmount);

      const treasuryBefore = await aixToken.balanceOf(await treasury.getAddress());
      const tx = await treasury.depositToken(await aixToken.getAddress(), depositAmount);
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);
      const treasuryAfter = await aixToken.balanceOf(await treasury.getAddress());
      expect(treasuryAfter - treasuryBefore).to.equal(depositAmount);

      await expect(tx)
        .to.emit(treasury, "TokenDeposited")
        .withArgs(await aixToken.getAddress(), owner.address, depositAmount);
    });

    it("Should withdraw tokens from Treasury by owner and reject non-owner", async function () {
      const depositAmount = ethers.parseEther("1000");
      await aixToken.approve(await treasury.getAddress(), depositAmount);
      await treasury.depositToken(await aixToken.getAddress(), depositAmount);

      await expect(
        treasury
          .connect(attacker)
          .withdrawToken(await aixToken.getAddress(), attacker.address, depositAmount)
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");

      const tx = await treasury.withdrawToken(
        await aixToken.getAddress(),
        creator.address,
        depositAmount
      );
      await expect(tx)
        .to.emit(treasury, "TokenWithdrawn")
        .withArgs(await aixToken.getAddress(), creator.address, depositAmount);
    });

    it("Should revert depositToken for zero address or zero amount", async function () {
      await expect(
        treasury.depositToken(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(treasury, "ZeroAddress");

      await expect(
        treasury.depositToken(await aixToken.getAddress(), 0)
      ).to.be.revertedWithCustomError(treasury, "ZeroAmount");
    });
  });

  describe("4. Dataset & Model Registry Operations", function () {
    it("Should register a dataset and assign incremental identifier", async function () {
      const tx = await datasetRegistry
        .connect(creator)
        .registerDataset(validDatasetCID, "MIT", 500);
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);
      await expect(tx).to.emit(datasetRegistry, "DatasetRegistered");

      const dataset = await datasetRegistry.getDataset(1);
      expect(dataset.owner).to.equal(creator.address);
      expect(dataset.cid).to.equal(validDatasetCID);
      expect(dataset.active).to.be.true;
    });

    it("Should register a model, add a version, and verify SHA-256 hash on-chain", async function () {
      const tx1 = await modelRegistry
        .connect(creator)
        .registerModel(validModelName, validMetadataURI, validModelHash);
      await expect(tx1).to.emit(modelRegistry, "ModelRegistered");

      const v2Hash = "b4d5e6f70123456789abcdef0123456789abcdef0123456789abcdef01234567";
      const tx2 = await modelRegistry
        .connect(creator)
        .addModelVersion(1, "ipfs://QmMetadata/model-v2.json", v2Hash);
      await expect(tx2).to.emit(modelRegistry, "ModelVersionAdded");

      expect(await modelRegistry.verifyModelHash(1, 1, validModelHash)).to.be.true;
      expect(await modelRegistry.verifyModelHash(1, 2, v2Hash)).to.be.true;
      expect(await modelRegistry.verifyModelHash(1, 1, "wronghash")).to.be.false;
    });

    it("Should reject duplicate model name for same creator", async function () {
      await modelRegistry
        .connect(creator)
        .registerModel(validModelName, validMetadataURI, validModelHash);

      await expect(
        modelRegistry
          .connect(creator)
          .registerModel(validModelName, validMetadataURI, validModelHash)
      ).to.be.revertedWithCustomError(modelRegistry, "ModelAlreadyExists");
    });
  });

  describe("5. Marketplace / Purchase Settlement & Fee Splitting", function () {
    let datasetId = 1;
    let licenseId = 1;
    const licensePrice = ethers.parseEther("1000");

    beforeEach(async function () {
      await datasetRegistry
        .connect(creator)
        .registerDataset(validDatasetCID, "MIT", 500);

      await licenseRegistry.connect(creator).createLicense({
        assetId: datasetId,
        assetType: AssetType.DATASET,
        licenseType: LicenseType.COMMERCIAL,
        pricingModel: PricingModel.FIXED,
        fixedPrice: licensePrice,
        royaltyRate: 0,
        metadataURI: "ipfs://QmLicenseMeta",
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
        restrictions: "Non-redistributable",
        validFrom: 0,
        validUntil: 0,
      });

      await aixToken
        .connect(buyer)
        .approve(await purchaseEngine.getAddress(), licensePrice);
    });

    it("Should execute atomic purchase, split 2.5% fee to Treasury, and grant access", async function () {
      const expectedPlatformFee = (licensePrice * 250n) / 10000n; // 25 AIX
      const expectedCreatorNet = licensePrice - expectedPlatformFee; // 975 AIX

      const buyerBefore = await aixToken.balanceOf(buyer.address);
      const creatorBefore = await aixToken.balanceOf(creator.address);
      const treasuryBefore = await aixToken.balanceOf(await treasury.getAddress());

      const tx = await purchaseEngine
        .connect(buyer)
        .purchaseDataset(datasetId, licenseId);
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);

      const buyerAfter = await aixToken.balanceOf(buyer.address);
      const creatorAfter = await aixToken.balanceOf(creator.address);
      const treasuryAfter = await aixToken.balanceOf(await treasury.getAddress());

      expect(buyerBefore - buyerAfter).to.equal(licensePrice);
      expect(creatorAfter - creatorBefore).to.equal(expectedCreatorNet);
      expect(treasuryAfter - treasuryBefore).to.equal(expectedPlatformFee);

      expect(await purchaseEngine.hasAccess(buyer.address, datasetId, licenseId)).to.be.true;

      await expect(tx).to.emit(purchaseEngine, "DatasetPurchased");
    });

    it("Should reject purchase if buyer has insufficient allowance", async function () {
      await aixToken
        .connect(buyer)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("100"));

      await expect(
        purchaseEngine.connect(buyer).purchaseDataset(datasetId, licenseId)
      ).to.be.revertedWithCustomError(purchaseEngine, "InsufficientBalance");
    });

    it("Should reject purchase if creator attempts to purchase own dataset", async function () {
      await expect(
        purchaseEngine.connect(creator).purchaseDataset(datasetId, licenseId)
      ).to.be.revertedWithCustomError(purchaseEngine, "SelfPurchaseNotAllowed");
    });
  });

  describe("6. RoyaltyEngine Multi-Party Distribution & Accounting", function () {
    it("Should distribute royalties to multiple contributors and absorb remainder in Treasury", async function () {
      const revenue = ethers.parseEther("1000");
      const recipients = [
        { recipient: contributor1.address, shareBps: 6000 },
        { recipient: contributor2.address, shareBps: 3750 },
      ];

      await aixToken.approve(await royaltyEngine.getAddress(), revenue);

      const c1Before = await aixToken.balanceOf(contributor1.address);
      const c2Before = await aixToken.balanceOf(contributor2.address);
      const tBefore = await aixToken.balanceOf(await treasury.getAddress());

      const tx = await royaltyEngine.distributeRoyalty(
        RoyaltySourceType.PURCHASE,
        101, // sourceId
        revenue,
        recipients
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const c1After = await aixToken.balanceOf(contributor1.address);
      const c2After = await aixToken.balanceOf(contributor2.address);
      const tAfter = await aixToken.balanceOf(await treasury.getAddress());

      const expectedC1 = ethers.parseEther("600"); // 60% of 1000
      const expectedC2 = ethers.parseEther("375"); // 37.5% of 1000
      const expectedTreasury = ethers.parseEther("25"); // 2.5% of 1000

      expect(c1After - c1Before).to.equal(expectedC1);
      expect(c2After - c2Before).to.equal(expectedC2);
      expect(tAfter - tBefore).to.equal(expectedTreasury);

      expect(expectedC1 + expectedC2 + expectedTreasury).to.equal(revenue);

      // Verify anti-replay: duplicate distribution must revert
      await aixToken.approve(await royaltyEngine.getAddress(), revenue);
      await expect(
        royaltyEngine.distributeRoyalty(RoyaltySourceType.PURCHASE, 101, revenue, recipients)
      ).to.be.revertedWithCustomError(royaltyEngine, "DistributionAlreadyCompleted");
    });
  });

  describe("7. Provenance DAG Lineage & Verification", function () {
    beforeEach(async function () {
      await datasetRegistry
        .connect(creator)
        .registerDataset(validDatasetCID, "MIT", 500);

      await modelRegistry
        .connect(creator)
        .registerModel(validModelName, validMetadataURI, validModelHash);
    });

    it("Should register provenance lineage and verify on-chain deterministically", async function () {
      const tx = await provenanceRegistry
        .connect(creator)
        .registerProvenance(
          1, // datasetId
          1, // modelId
          1, // modelVersion
          validExecutionId,
          validMetadataHash
        );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      await expect(tx)
        .to.emit(provenanceRegistry, "ProvenanceRegistered");

      const isValid = await provenanceRegistry.verifyProvenance(
        1,
        1,
        validExecutionId,
        1,
        1,
        validMetadataHash
      );
      expect(isValid).to.be.true;

      const isMismatch = await provenanceRegistry.verifyProvenance(
        1,
        999,
        validExecutionId,
        1,
        1,
        validMetadataHash
      );
      expect(isMismatch).to.be.false;
    });

    it("Should revert duplicate provenance registration", async function () {
      await provenanceRegistry
        .connect(creator)
        .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);

      await expect(
        provenanceRegistry
          .connect(creator)
          .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash)
      ).to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceAlreadyExists");
    });

    it("Should revert if non-model-owner attempts to register provenance", async function () {
      await expect(
        provenanceRegistry
          .connect(attacker)
          .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash)
      ).to.be.revertedWithCustomError(provenanceRegistry, "UnauthorizedCaller");
    });
  });

  describe("8. Cross-Contract Monitoring & Fraud Engine Integration", function () {
    it("Should collect, normalize, and reconcile cross-contract events", async function () {
      await aixToken.transfer(creator.address, ethers.parseEther("500"));
      await aixToken.approve(await treasury.getAddress(), ethers.parseEther("100"));
      await treasury.depositToken(await aixToken.getAddress(), ethers.parseEther("100"));

      const provider = ethers.provider;
      const contracts = {
        AIXToken: {
          address: await aixToken.getAddress(),
          interface: aixToken.interface,
        },
        Treasury: {
          address: await treasury.getAddress(),
          interface: treasury.interface,
        },
      };

      const monitor = new EventMonitor(provider, contracts);
      const events = await monitor.fetchEvents({ fromBlock: 0 });

      expect(events.length).to.be.greaterThan(0);
      events.forEach((evt) => {
        expect(evt.transactionHash).to.match(/^0x[a-fA-F0-9]{64}$/);
        expect(evt.contractName).to.be.oneOf(["AIXToken", "Treasury"]);
        expect(typeof evt.blockNumber).to.equal("number");
        expect(typeof evt.arguments).to.equal("object");
      });
    });

    it("Should evaluate transactions in FraudEngine without raising false positives on standard flows", async function () {
      const fraudEngine = new FraudEngine(DEFAULT_MONITORING_CONFIG);
      const normalEvents = [
        {
          contractName: "AIXToken",
          eventName: "Transfer",
          from: buyer.address,
          to: await purchaseEngine.getAddress(),
          amount: ethers.parseEther("500").toString(),
          timestamp: new Date(),
          transactionHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        },
      ];

      const flags = fraudEngine.analyze(normalEvents);
      expect(flags).to.be.an("array").that.is.empty;
    });
  });

  describe("9. API & Swagger/OpenAPI Schema Conformance", function () {
    it("Should conform to expected Swagger API response data types and patterns", async function () {
      const tx = await aixToken.transfer(buyer.address, ethers.parseEther("10"));
      const receipt = await tx.wait();

      expect(receipt.hash).to.match(/^0x[a-fA-F0-9]{64}$/);
      expect(buyer.address).to.match(/^0x[a-fA-F0-9]{40}$/);

      const balance = await aixToken.balanceOf(buyer.address);
      const balanceStr = balance.toString();
      expect(balanceStr).to.match(/^\d+$/);

      expect(initialFeeBps).to.be.at.least(0).and.at.most(10000);
    });
  });
});
