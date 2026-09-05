const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoyaltyEngine Smart Contract", function () {
  let AIXToken, aixToken;
  let Treasury, treasury;
  let DatasetRegistry, datasetRegistry;
  let LicenseRegistry, licenseRegistry;
  let PurchaseEngine, purchaseEngine;
  let RoyaltyEngine, royaltyEngine;

  let owner, licensor, buyer, recipient1, recipient2, recipient3, attacker;
  const initialSupply = ethers.parseEther("10000000"); // 10M AIX
  const initialFeeBps = 250; // 2.50% default treasury fee

  beforeEach(async function () {
    [owner, licensor, buyer, recipient1, recipient2, recipient3, attacker] =
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
      250, // 2.5% platform fee
      owner.address
    );
    await purchaseEngine.waitForDeployment();

    // 6. Deploy RoyaltyEngine
    RoyaltyEngine = await ethers.getContractFactory("RoyaltyEngine");
    royaltyEngine = await RoyaltyEngine.deploy(
      await aixToken.getAddress(),
      await treasury.getAddress(),
      await purchaseEngine.getAddress(),
      initialFeeBps,
      owner.address
    );
    await royaltyEngine.waitForDeployment();

    // Transfer some AIX tokens to licensor, buyer, and owner for tests
    await aixToken.transfer(licensor.address, ethers.parseEther("50000"));
    await aixToken.transfer(buyer.address, ethers.parseEther("50000"));
  });

  describe("Deployment & Configuration", function () {
    it("Should initialize with zero total distributions", async function () {
      expect(await royaltyEngine.getTotalDistributions()).to.equal(0);
      expect(await royaltyEngine.getTotalDistributedAmount()).to.equal(0);
      expect(await royaltyEngine.getTotalTreasuryDistributed()).to.equal(0);
    });

    it("Should link correct dependency contract addresses", async function () {
      expect(await royaltyEngine.getAixToken()).to.equal(await aixToken.getAddress());
      expect(await royaltyEngine.getTreasury()).to.equal(await treasury.getAddress());
      expect(await royaltyEngine.getPurchaseEngine()).to.equal(
        await purchaseEngine.getAddress()
      );
      expect(await royaltyEngine.getDefaultTreasuryFeeBps()).to.equal(initialFeeBps);
      expect(await royaltyEngine.owner()).to.equal(owner.address);
    });

    it("Should revert if deployed with zero address for AIXToken", async function () {
      await expect(
        RoyaltyEngine.deploy(
          ethers.ZeroAddress,
          await treasury.getAddress(),
          await purchaseEngine.getAddress(),
          250,
          owner.address
        )
      ).to.be.revertedWithCustomError(royaltyEngine, "ZeroAddress");
    });

    it("Should revert if deployed with zero address for Treasury", async function () {
      await expect(
        RoyaltyEngine.deploy(
          await aixToken.getAddress(),
          ethers.ZeroAddress,
          await purchaseEngine.getAddress(),
          250,
          owner.address
        )
      ).to.be.revertedWithCustomError(royaltyEngine, "ZeroAddress");
    });

    it("Should revert if deployed with treasury fee exceeding MAX_TREASURY_FEE_BPS (2000)", async function () {
      await expect(
        RoyaltyEngine.deploy(
          await aixToken.getAddress(),
          await treasury.getAddress(),
          await purchaseEngine.getAddress(),
          2001,
          owner.address
        )
      ).to.be.revertedWithCustomError(royaltyEngine, "TreasuryFeeExceedsMax");
    });
  });

  describe("Revenue Split & Calculation Preview", function () {
    it("Should calculate single recipient split deterministically", async function () {
      const revenue = ethers.parseEther("1000");
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];
      const result = await royaltyEngine.calculateSplit(revenue, 250, shares);

      const expectedTreasury = ethers.parseEther("25"); // 2.5%
      const expectedRecipient1 = ethers.parseEther("975"); // 97.5%

      expect(result.treasuryAmount).to.equal(expectedTreasury);
      expect(result.recipientAmounts[0]).to.equal(expectedRecipient1);
      expect(result.remainder).to.equal(0);
      expect(result.recipientAmounts[0] + result.treasuryAmount).to.equal(revenue);
    });

    it("Should calculate multi-recipient split deterministically", async function () {
      const revenue = ethers.parseEther("1000");
      const shares = [
        { recipient: recipient1.address, shareBps: 6000 }, // 60%
        { recipient: recipient2.address, shareBps: 3500 }, // 35%
      ];
      const result = await royaltyEngine.calculateSplit(revenue, 500, shares);

      expect(result.recipientAmounts[0]).to.equal(ethers.parseEther("600"));
      expect(result.recipientAmounts[1]).to.equal(ethers.parseEther("350"));
      expect(result.treasuryAmount).to.equal(ethers.parseEther("50"));
      expect(
        result.recipientAmounts[0] +
          result.recipientAmounts[1] +
          result.treasuryAmount
      ).to.equal(revenue);
    });

    it("Should handle integer division rounding remainder deterministically by allocating to treasury", async function () {
      // 100 wei split 33.33% and 33.33% with 10% treasury
      const revenue = 100n;
      const shares = [
        { recipient: recipient1.address, shareBps: 3333 }, // 33 wei
        { recipient: recipient2.address, shareBps: 3333 }, // 33 wei
      ];
      // total recipient BPS = 6666. Treasury BPS = 1000.
      // Sum recipient amounts = 66 wei.
      // Treasury receives 100 - 66 = 34 wei!
      const result = await royaltyEngine.calculateSplit(revenue, 1000, shares);

      expect(result.recipientAmounts[0]).to.equal(33n);
      expect(result.recipientAmounts[1]).to.equal(33n);
      expect(result.treasuryAmount).to.equal(34n);
      expect(
        result.recipientAmounts[0] +
          result.recipientAmounts[1] +
          result.treasuryAmount
      ).to.equal(revenue);
    });

    it("Should revert calculateSplit if total revenue is zero", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];
      await expect(
        royaltyEngine.calculateSplit(0, 250, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "ZeroAmount");
    });

    it("Should revert calculateSplit if recipients array is empty", async function () {
      await expect(
        royaltyEngine.calculateSplit(ethers.parseEther("100"), 250, [])
      ).to.be.revertedWithCustomError(royaltyEngine, "InvalidShareAllocation");
    });

    it("Should revert calculateSplit if recipient address is zero", async function () {
      const shares = [{ recipient: ethers.ZeroAddress, shareBps: 9750 }];
      await expect(
        royaltyEngine.calculateSplit(ethers.parseEther("100"), 250, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "InvalidRecipient");
    });

    it("Should revert calculateSplit if recipient shareBps is zero", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 0 }];
      await expect(
        royaltyEngine.calculateSplit(ethers.parseEther("100"), 250, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "InvalidShareAllocation");
    });

    it("Should revert calculateSplit if duplicate recipients are passed", async function () {
      const shares = [
        { recipient: recipient1.address, shareBps: 5000 },
        { recipient: recipient1.address, shareBps: 4000 },
      ];
      await expect(
        royaltyEngine.calculateSplit(ethers.parseEther("100"), 250, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "DuplicateRecipient");
    });

    it("Should revert calculateSplit if total allocation exceeds 10000 basis points", async function () {
      const shares = [
        { recipient: recipient1.address, shareBps: 8000 },
        { recipient: recipient2.address, shareBps: 2000 },
      ];
      // 8000 + 2000 + 250 = 10250 > 10000
      await expect(
        royaltyEngine.calculateSplit(ethers.parseEther("100"), 250, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "InvalidShareAllocation");
    });
  });

  describe("Royalty Distribution Execution", function () {
    const revenueAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      // Approve RoyaltyEngine to spend AIX tokens on behalf of licensor
      await aixToken
        .connect(licensor)
        .approve(await royaltyEngine.getAddress(), ethers.parseEther("50000"));
    });

    it("Should successfully distribute revenue to a single recipient and treasury", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }]; // 97.5% recipient, 2.5% treasury

      const treasuryBalanceBefore = await aixToken.balanceOf(await treasury.getAddress());
      const recipientBalanceBefore = await aixToken.balanceOf(recipient1.address);
      const licensorBalanceBefore = await aixToken.balanceOf(licensor.address);

      const tx = await royaltyEngine
        .connect(licensor)
        .distributeRoyalty(0, 1, revenueAmount, shares); // sourceType: 0 (PURCHASE), sourceId: 1

      await expect(tx)
        .to.emit(royaltyEngine, "DistributionCreated")
        .withArgs(
          1,
          ethers.solidityPackedKeccak256(["uint8", "uint256"], [0, 1]),
          0,
          1,
          licensor.address,
          revenueAmount
        );

      await expect(tx)
        .to.emit(royaltyEngine, "RecipientPaid")
        .withArgs(1, recipient1.address, ethers.parseEther("975"), 9750);

      await expect(tx)
        .to.emit(royaltyEngine, "TreasuryPaid")
        .withArgs(1, await treasury.getAddress(), ethers.parseEther("25"), 250);

      await expect(tx)
        .to.emit(royaltyEngine, "DistributionCompleted")
        .withArgs(1, revenueAmount, 1, (await ethers.provider.getBlock("latest")).timestamp);

      // Verify Balances
      expect(await aixToken.balanceOf(licensor.address)).to.equal(
        licensorBalanceBefore - revenueAmount
      );
      expect(await aixToken.balanceOf(recipient1.address)).to.equal(
        recipientBalanceBefore + ethers.parseEther("975")
      );
      expect(await aixToken.balanceOf(await treasury.getAddress())).to.equal(
        treasuryBalanceBefore + ethers.parseEther("25")
      );

      // Verify Record State
      const dist = await royaltyEngine.getDistribution(1);
      expect(dist.distributionId).to.equal(1);
      expect(dist.totalRevenue).to.equal(revenueAmount);
      expect(dist.treasuryAmount).to.equal(ethers.parseEther("25"));
      expect(dist.recipientCount).to.equal(1);
      expect(dist.status).to.equal(2); // DISTRIBUTED

      // Verify Cumulative Totals
      expect(await royaltyEngine.getTotalDistributions()).to.equal(1);
      expect(await royaltyEngine.getTotalDistributedAmount()).to.equal(revenueAmount);
      expect(await royaltyEngine.getTotalTreasuryDistributed()).to.equal(
        ethers.parseEther("25")
      );
      expect(await royaltyEngine.getRecipientTotalClaimed(recipient1.address)).to.equal(
        ethers.parseEther("975")
      );
    });

    it("Should successfully distribute revenue to multiple recipients atomically", async function () {
      const shares = [
        { recipient: recipient1.address, shareBps: 6000 }, // 60% = 600 AIX
        { recipient: recipient2.address, shareBps: 3500 }, // 35% = 350 AIX
        // remaining 5% = 50 AIX to treasury (since defaultTreasuryFeeBps = 250, treasury gets 50 AIX)
      ];

      const recipient1Before = await aixToken.balanceOf(recipient1.address);
      const recipient2Before = await aixToken.balanceOf(recipient2.address);
      const treasuryBefore = await aixToken.balanceOf(await treasury.getAddress());

      await royaltyEngine
        .connect(licensor)
        .distributeRoyalty(1, 100, revenueAmount, shares); // sourceType: 1 (DERIVATIVE), sourceId: 100

      expect(await aixToken.balanceOf(recipient1.address)).to.equal(
        recipient1Before + ethers.parseEther("600")
      );
      expect(await aixToken.balanceOf(recipient2.address)).to.equal(
        recipient2Before + ethers.parseEther("350")
      );
      expect(await aixToken.balanceOf(await treasury.getAddress())).to.equal(
        treasuryBefore + ethers.parseEther("50")
      );

      // Verify Allocations array
      const allocations = await royaltyEngine.getDistributionAllocations(1);
      expect(allocations.length).to.equal(2);
      expect(allocations[0].recipient).to.equal(recipient1.address);
      expect(allocations[0].amount).to.equal(ethers.parseEther("600"));
      expect(allocations[1].recipient).to.equal(recipient2.address);
      expect(allocations[1].amount).to.equal(ethers.parseEther("350"));
    });

    it("Should reject duplicate distribution of the same revenue source", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];

      await royaltyEngine
        .connect(licensor)
        .distributeRoyalty(0, 42, revenueAmount, shares);

      // Attempting to distribute for source (0, 42) again must revert
      await expect(
        royaltyEngine
          .connect(licensor)
          .distributeRoyalty(0, 42, revenueAmount, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "DistributionAlreadyCompleted");
    });

    it("Should allow multiple direct distributions when sourceId is 0", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];

      // Direct distribution 1
      await royaltyEngine
        .connect(licensor)
        .distributeRoyalty(3, 0, revenueAmount, shares); // sourceType: 3 (DIRECT), sourceId: 0

      // Direct distribution 2 (must succeed because sourceId == 0 generates unique keys)
      await royaltyEngine
        .connect(licensor)
        .distributeRoyalty(3, 0, revenueAmount, shares);

      expect(await royaltyEngine.getTotalDistributions()).to.equal(2);
    });

    it("Should revert distribution if caller has insufficient balance", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];
      const hugeAmount = ethers.parseEther("1000000000"); // more than balance

      await aixToken
        .connect(licensor)
        .approve(await royaltyEngine.getAddress(), hugeAmount);

      await expect(
        royaltyEngine
          .connect(licensor)
          .distributeRoyalty(0, 999, hugeAmount, shares)
      ).to.be.reverted;
    });

    it("Should revert distribution if caller has insufficient allowance", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];

      // attacker has no allowance
      await expect(
        royaltyEngine
          .connect(attacker)
          .distributeRoyalty(0, 999, revenueAmount, shares)
      ).to.be.reverted;
    });
  });

  describe("PurchaseEngine Integration", function () {
    let purchaseId;

    beforeEach(async function () {
      // 1. Register a dataset
      await datasetRegistry
        .connect(licensor)
        .registerDataset("QmDatasetHash", "MIT", 500); // datasetId = 1

      // 2. Register a license
      await licenseRegistry.connect(licensor).createLicense({
        assetId: 1,
        assetType: 0, // DATASET
        licenseType: 1, // COMMERCIAL
        pricingModel: 0, // FIXED
        fixedPrice: ethers.parseEther("1000"),
        royaltyRate: 0,
        metadataURI: "ipfs://license-meta",
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
      }); // licenseId = 1

      // 3. Buyer purchases the dataset license via PurchaseEngine
      await aixToken
        .connect(buyer)
        .approve(await purchaseEngine.getAddress(), ethers.parseEther("1000"));
      const tx = await purchaseEngine.connect(buyer).purchaseDataset(1, 1);
      const receipt = await tx.wait();
      purchaseId = 1;

      // Licensor now has licensorAmount = 975 AIX (1000 - 2.5% fee)
      // Licensor approves RoyaltyEngine to distribute secondary royalties from this purchase
      await aixToken
        .connect(licensor)
        .approve(await royaltyEngine.getAddress(), ethers.parseEther("1000"));
    });

    it("Should successfully distribute purchase royalty from verified purchase record", async function () {
      // Co-authors / contributors share: 60% and 37.5%, platform treasury gets default 2.5%
      const shares = [
        { recipient: recipient1.address, shareBps: 6000 },
        { recipient: recipient2.address, shareBps: 3750 },
      ];

      const tx = await royaltyEngine
        .connect(licensor)
        .distributePurchaseRoyalty(purchaseId, shares);

      await expect(tx)
        .to.emit(royaltyEngine, "DistributionCreated")
        .withArgs(
          1,
          ethers.solidityPackedKeccak256(["uint8", "uint256"], [0, purchaseId]),
          0, // PURCHASE
          purchaseId,
          licensor.address,
          ethers.parseEther("975") // licensorAmount from purchase
        );

      expect(await royaltyEngine.isSourceDistributed(0, purchaseId)).to.be.true;
    });

    it("Should revert distributePurchaseRoyalty on invalid or nonexistent purchase ID", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];
      await expect(
        royaltyEngine.connect(licensor).distributePurchaseRoyalty(999, shares)
      ).to.be.revertedWithCustomError(purchaseEngine, "PurchaseNotFound");
    });

    it("Should revert if the same purchase royalty is distributed more than once", async function () {
      const shares = [{ recipient: recipient1.address, shareBps: 9750 }];

      await royaltyEngine
        .connect(licensor)
        .distributePurchaseRoyalty(purchaseId, shares);

      // Duplicate attempt must revert
      await expect(
        royaltyEngine
          .connect(licensor)
          .distributePurchaseRoyalty(purchaseId, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "DistributionAlreadyCompleted");
    });
  });

  describe("Treasury Management & Admin Configuration", function () {
    it("Should allow owner to update Treasury address and emit TreasuryUpdated", async function () {
      const newTreasury = recipient3.address;
      await expect(royaltyEngine.connect(owner).setTreasury(newTreasury))
        .to.emit(royaltyEngine, "TreasuryUpdated")
        .withArgs(await treasury.getAddress(), newTreasury);

      expect(await royaltyEngine.getTreasury()).to.equal(newTreasury);
    });

    it("Should revert if non-owner tries to update Treasury address", async function () {
      await expect(
        royaltyEngine.connect(attacker).setTreasury(recipient3.address)
      ).to.be.revertedWithCustomError(royaltyEngine, "OwnableUnauthorizedAccount");
    });

    it("Should revert if setting Treasury to zero address", async function () {
      await expect(
        royaltyEngine.connect(owner).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(royaltyEngine, "ZeroAddress");
    });

    it("Should allow owner to update default treasury fee BPS and emit TreasuryFeeUpdated", async function () {
      const newFeeBps = 500; // 5%
      await expect(royaltyEngine.connect(owner).setDefaultTreasuryFeeBps(newFeeBps))
        .to.emit(royaltyEngine, "TreasuryFeeUpdated")
        .withArgs(initialFeeBps, newFeeBps);

      expect(await royaltyEngine.getDefaultTreasuryFeeBps()).to.equal(newFeeBps);
    });

    it("Should revert if non-owner tries to update default treasury fee", async function () {
      await expect(
        royaltyEngine.connect(attacker).setDefaultTreasuryFeeBps(500)
      ).to.be.revertedWithCustomError(royaltyEngine, "OwnableUnauthorizedAccount");
    });

    it("Should revert if updating treasury fee above MAX_TREASURY_FEE_BPS (2000)", async function () {
      await expect(
        royaltyEngine.connect(owner).setDefaultTreasuryFeeBps(2001)
      ).to.be.revertedWithCustomError(royaltyEngine, "TreasuryFeeExceedsMax");
    });
  });

  describe("Emergency Pause & Unpause", function () {
    const revenueAmount = ethers.parseEther("100");
    let shares;

    beforeEach(async function () {
      shares = [{ recipient: recipient1.address, shareBps: 9750 }];
      await aixToken
        .connect(licensor)
        .approve(await royaltyEngine.getAddress(), revenueAmount);
    });

    it("Should allow owner to pause and block distributions", async function () {
      await royaltyEngine.connect(owner).pause();

      await expect(
        royaltyEngine
          .connect(licensor)
          .distributeRoyalty(0, 1, revenueAmount, shares)
      ).to.be.revertedWithCustomError(royaltyEngine, "EnforcedPause");
    });

    it("Should allow owner to unpause and resume distributions", async function () {
      await royaltyEngine.connect(owner).pause();
      await royaltyEngine.connect(owner).unpause();

      await expect(
        royaltyEngine
          .connect(licensor)
          .distributeRoyalty(0, 1, revenueAmount, shares)
      ).to.emit(royaltyEngine, "DistributionCompleted");
    });

    it("Should prevent non-owner from pausing or unpausing", async function () {
      await expect(
        royaltyEngine.connect(attacker).pause()
      ).to.be.revertedWithCustomError(royaltyEngine, "OwnableUnauthorizedAccount");

      await royaltyEngine.connect(owner).pause();

      await expect(
        royaltyEngine.connect(attacker).unpause()
      ).to.be.revertedWithCustomError(royaltyEngine, "OwnableUnauthorizedAccount");
    });
  });

  describe("Read Functions & Queries", function () {
    it("Should revert getDistribution for nonexistent distribution ID", async function () {
      await expect(
        royaltyEngine.getDistribution(999)
      ).to.be.revertedWithCustomError(royaltyEngine, "DistributionNotFound");
    });

    it("Should revert getDistributionAllocations for nonexistent distribution ID", async function () {
      await expect(
        royaltyEngine.getDistributionAllocations(999)
      ).to.be.revertedWithCustomError(royaltyEngine, "DistributionNotFound");
    });

    it("Should revert getRecipientTotalClaimed for zero address", async function () {
      await expect(
        royaltyEngine.getRecipientTotalClaimed(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(royaltyEngine, "ZeroAddress");
    });

    it("Should return isSourceDistributed accurately", async function () {
      expect(await royaltyEngine.isSourceDistributed(0, 777)).to.be.false;
    });
  });
});
