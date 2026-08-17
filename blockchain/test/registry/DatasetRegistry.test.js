const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatasetRegistry Smart Contract", function () {
  let DatasetRegistry;
  let datasetRegistry;
  let owner;
  let user1;
  let user2;

  const validCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validLicense = "CC-BY-4.0";
  const validRoyalty = 500; // 5.00%

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero total datasets", async function () {
      expect(await datasetRegistry.getTotalDatasets()).to.equal(0);
    });

    it("Should have MAX_ROYALTY_BPS set to 10000", async function () {
      expect(await datasetRegistry.MAX_ROYALTY_BPS()).to.equal(10000);
    });
  });

  describe("Dataset Registration", function () {
    it("Should successfully register a dataset and emit DatasetRegistered event", async function () {
      const tx = await datasetRegistry.connect(user1).registerDataset(
        validCID,
        validLicense,
        validRoyalty
      );

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(datasetRegistry, "DatasetRegistered")
        .withArgs(1, user1.address, validCID, validLicense, validRoyalty, block.timestamp);

      expect(await datasetRegistry.getTotalDatasets()).to.equal(1);
    });

    it("Should assign incremental dataset IDs for multiple registrations", async function () {
      await datasetRegistry.connect(user1).registerDataset("cid1", "MIT", 200);
      await datasetRegistry.connect(user2).registerDataset("cid2", "Apache-2.0", 300);
      await datasetRegistry.connect(user1).registerDataset("cid3", "CC0", 0);

      expect(await datasetRegistry.getTotalDatasets()).to.equal(3);

      const d1 = await datasetRegistry.getDataset(1);
      const d2 = await datasetRegistry.getDataset(2);
      const d3 = await datasetRegistry.getDataset(3);

      expect(d1.datasetId).to.equal(1);
      expect(d1.owner).to.equal(user1.address);
      expect(d2.datasetId).to.equal(2);
      expect(d2.owner).to.equal(user2.address);
      expect(d3.datasetId).to.equal(3);
      expect(d3.owner).to.equal(user1.address);
    });

    it("Should revert if CID is empty", async function () {
      await expect(
        datasetRegistry.connect(user1).registerDataset("", validLicense, validRoyalty)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidCID");
    });

    it("Should revert if license is empty", async function () {
      await expect(
        datasetRegistry.connect(user1).registerDataset(validCID, "", validRoyalty)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidLicense");
    });

    it("Should revert if royalty exceeds MAX_ROYALTY_BPS (10000)", async function () {
      await expect(
        datasetRegistry.connect(user1).registerDataset(validCID, validLicense, 10001)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidRoyalty").withArgs(10001);
    });

    it("Should accept boundary royalty values (0 and 10000)", async function () {
      await expect(datasetRegistry.connect(user1).registerDataset("cid-zero", "MIT", 0))
        .to.not.be.reverted;
      await expect(datasetRegistry.connect(user1).registerDataset("cid-max", "MIT", 10000))
        .to.not.be.reverted;
    });
  });

  describe("Dataset Retrieval", function () {
    beforeEach(async function () {
      await datasetRegistry.connect(user1).registerDataset(validCID, validLicense, validRoyalty);
    });

    it("Should return correct dataset record details", async function () {
      const dataset = await datasetRegistry.getDataset(1);
      expect(dataset.datasetId).to.equal(1);
      expect(dataset.owner).to.equal(user1.address);
      expect(dataset.cid).to.equal(validCID);
      expect(dataset.license).to.equal(validLicense);
      expect(dataset.royalty).to.equal(validRoyalty);
      expect(dataset.active).to.be.true;
      expect(dataset.createdAt).to.be.gt(0);
    });

    it("Should return correct dataset owner", async function () {
      expect(await datasetRegistry.getDatasetOwner(1)).to.equal(user1.address);
    });

    it("Should return list of datasets by owner", async function () {
      await datasetRegistry.connect(user1).registerDataset("cid-2", "GPL-3.0", 100);
      const user1Datasets = await datasetRegistry.getDatasetsByOwner(user1.address);
      expect(user1Datasets.length).to.equal(2);
      expect(user1Datasets[0]).to.equal(1);
      expect(user1Datasets[1]).to.equal(2);

      const user2Datasets = await datasetRegistry.getDatasetsByOwner(user2.address);
      expect(user2Datasets.length).to.equal(0);
    });

    it("Should revert getDatasetsByOwner for zero address", async function () {
      await expect(
        datasetRegistry.getDatasetsByOwner(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(datasetRegistry, "ZeroAddress");
    });

    it("Should revert getDataset for non-existent dataset ID", async function () {
      await expect(datasetRegistry.getDataset(0)).to.be.revertedWithCustomError(
        datasetRegistry,
        "DatasetNotFound"
      ).withArgs(0);

      await expect(datasetRegistry.getDataset(999)).to.be.revertedWithCustomError(
        datasetRegistry,
        "DatasetNotFound"
      ).withArgs(999);
    });

    it("Should revert getDatasetOwner for non-existent dataset ID", async function () {
      await expect(datasetRegistry.getDatasetOwner(999)).to.be.revertedWithCustomError(
        datasetRegistry,
        "DatasetNotFound"
      ).withArgs(999);
    });
  });

  describe("Dataset Updates", function () {
    beforeEach(async function () {
      await datasetRegistry.connect(user1).registerDataset(validCID, validLicense, validRoyalty);
    });

    it("Should allow owner to update dataset metadata and emit DatasetUpdated", async function () {
      const updatedCID = "QmNewHash123456789";
      const updatedLicense = "MIT";
      const updatedRoyalty = 750;

      await expect(
        datasetRegistry.connect(user1).updateDataset(1, updatedCID, updatedLicense, updatedRoyalty)
      )
        .to.emit(datasetRegistry, "DatasetUpdated")
        .withArgs(1, updatedCID, updatedLicense, updatedRoyalty);

      const updated = await datasetRegistry.getDataset(1);
      expect(updated.cid).to.equal(updatedCID);
      expect(updated.license).to.equal(updatedLicense);
      expect(updated.royalty).to.equal(updatedRoyalty);
    });

    it("Should prevent non-owner from updating dataset", async function () {
      await expect(
        datasetRegistry.connect(user2).updateDataset(1, "newCID", "MIT", 500)
      ).to.be.revertedWithCustomError(datasetRegistry, "UnauthorizedCaller").withArgs(user2.address);
    });

    it("Should validate inputs during update", async function () {
      await expect(
        datasetRegistry.connect(user1).updateDataset(1, "", "MIT", 500)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidCID");

      await expect(
        datasetRegistry.connect(user1).updateDataset(1, "newCID", "", 500)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidLicense");

      await expect(
        datasetRegistry.connect(user1).updateDataset(1, "newCID", "MIT", 15000)
      ).to.be.revertedWithCustomError(datasetRegistry, "InvalidRoyalty").withArgs(15000);
    });

    it("Should revert update on non-existent dataset ID", async function () {
      await expect(
        datasetRegistry.connect(user1).updateDataset(999, "newCID", "MIT", 500)
      ).to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound").withArgs(999);
    });
  });

  describe("Status Management", function () {
    beforeEach(async function () {
      await datasetRegistry.connect(user1).registerDataset(validCID, validLicense, validRoyalty);
    });

    it("Should allow owner to toggle active status and emit DatasetStatusChanged", async function () {
      await expect(datasetRegistry.connect(user1).setDatasetStatus(1, false))
        .to.emit(datasetRegistry, "DatasetStatusChanged")
        .withArgs(1, false);

      let dataset = await datasetRegistry.getDataset(1);
      expect(dataset.active).to.be.false;

      await expect(datasetRegistry.connect(user1).setDatasetStatus(1, true))
        .to.emit(datasetRegistry, "DatasetStatusChanged")
        .withArgs(1, true);

      dataset = await datasetRegistry.getDataset(1);
      expect(dataset.active).to.be.true;
    });

    it("Should prevent non-owner from changing dataset status", async function () {
      await expect(
        datasetRegistry.connect(user2).setDatasetStatus(1, false)
      ).to.be.revertedWithCustomError(datasetRegistry, "UnauthorizedCaller").withArgs(user2.address);
    });

    it("Should revert status update on non-existent dataset ID", async function () {
      await expect(
        datasetRegistry.connect(user1).setDatasetStatus(999, false)
      ).to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound").withArgs(999);
    });
  });

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await datasetRegistry.connect(user1).registerDataset("cid-1", "MIT", 100);
      await datasetRegistry.connect(user1).registerDataset("cid-2", "MIT", 200);
      await datasetRegistry.connect(user1).registerDataset("cid-3", "MIT", 300);
    });

    it("Should allow owner to transfer dataset ownership and update indices", async function () {
      // Transfer middle dataset (id: 2) to user2
      await expect(datasetRegistry.connect(user1).transferDatasetOwnership(2, user2.address))
        .to.emit(datasetRegistry, "DatasetOwnershipTransferred")
        .withArgs(2, user1.address, user2.address);

      expect(await datasetRegistry.getDatasetOwner(2)).to.equal(user2.address);

      const user1Datasets = await datasetRegistry.getDatasetsByOwner(user1.address);
      expect(user1Datasets.length).to.equal(2);
      expect(user1Datasets).to.include(1n);
      expect(user1Datasets).to.include(3n);
      expect(user1Datasets).to.not.include(2n);

      const user2Datasets = await datasetRegistry.getDatasetsByOwner(user2.address);
      expect(user2Datasets.length).to.equal(1);
      expect(user2Datasets[0]).to.equal(2);
    });

    it("Should prevent non-owner from transferring dataset ownership", async function () {
      await expect(
        datasetRegistry.connect(user2).transferDatasetOwnership(1, user2.address)
      ).to.be.revertedWithCustomError(datasetRegistry, "UnauthorizedCaller").withArgs(user2.address);
    });

    it("Should revert if new owner is zero address", async function () {
      await expect(
        datasetRegistry.connect(user1).transferDatasetOwnership(1, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(datasetRegistry, "ZeroAddress");
    });

    it("Should handle transfer to self gracefully", async function () {
      await expect(
        datasetRegistry.connect(user1).transferDatasetOwnership(1, user1.address)
      ).to.not.be.reverted;
      expect(await datasetRegistry.getDatasetOwner(1)).to.equal(user1.address);
    });

    it("Should revert transfer on non-existent dataset ID", async function () {
      await expect(
        datasetRegistry.connect(user1).transferDatasetOwnership(999, user2.address)
      ).to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound").withArgs(999);
    });
  });
});
