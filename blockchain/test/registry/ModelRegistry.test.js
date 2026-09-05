const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ModelRegistry Smart Contract", function () {
  let ModelRegistry;
  let modelRegistry;
  let owner;
  let user1;
  let user2;
  let user3;

  const validName = "ResNet-50-Classifier";
  const validMetadataURI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/metadata.json";
  const validModelHash = "a3c4f981b2e61d859123456789abcdef0123456789abcdef0123456789abcdef"; // 64-char SHA256 hex string

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    ModelRegistry = await ethers.getContractFactory("ModelRegistry");
    modelRegistry = await ModelRegistry.deploy();
    await modelRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero total models", async function () {
      expect(await modelRegistry.getTotalModels()).to.equal(0);
    });
  });

  describe("Model Registration", function () {
    it("Should successfully register a model and emit ModelRegistered and ModelVersionAdded events", async function () {
      const tx = await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(modelRegistry, "ModelRegistered")
        .withArgs(1, user1.address, validName, validMetadataURI, validModelHash, 1, block.timestamp);

      await expect(tx)
        .to.emit(modelRegistry, "ModelVersionAdded")
        .withArgs(1, 1, validModelHash, validMetadataURI, block.timestamp);

      expect(await modelRegistry.getTotalModels()).to.equal(1);
    });

    it("Should assign incremental model IDs for multiple registrations", async function () {
      await modelRegistry.connect(user1).registerModel("Model-A", "uri:1", "hash:1");
      await modelRegistry.connect(user2).registerModel("Model-B", "uri:2", "hash:2");
      await modelRegistry.connect(user1).registerModel("Model-C", "uri:3", "hash:3");

      expect(await modelRegistry.getTotalModels()).to.equal(3);

      const m1 = await modelRegistry.getModel(1);
      const m2 = await modelRegistry.getModel(2);
      const m3 = await modelRegistry.getModel(3);

      expect(m1.modelId).to.equal(1);
      expect(m1.owner).to.equal(user1.address);
      expect(m2.modelId).to.equal(2);
      expect(m2.owner).to.equal(user2.address);
      expect(m3.modelId).to.equal(3);
      expect(m3.owner).to.equal(user1.address);
    });

    it("Should revert if model name is empty", async function () {
      await expect(
        modelRegistry.connect(user1).registerModel("", validMetadataURI, validModelHash)
      ).to.be.revertedWithCustomError(modelRegistry, "InvalidModelName");
    });

    it("Should revert if metadata URI is empty", async function () {
      await expect(
        modelRegistry.connect(user1).registerModel(validName, "", validModelHash)
      ).to.be.revertedWithCustomError(modelRegistry, "InvalidMetadataURI");
    });

    it("Should revert if model hash is empty", async function () {
      await expect(
        modelRegistry.connect(user1).registerModel(validName, validMetadataURI, "")
      ).to.be.revertedWithCustomError(modelRegistry, "InvalidModelHash");
    });

    it("Should revert if owner tries to register a model with duplicate name", async function () {
      await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);

      await expect(
        modelRegistry
          .connect(user1)
          .registerModel(validName, "uri:different", "hash:different")
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelAlreadyExists")
        .withArgs(validName);
    });

    it("Should allow different owners to register models with the same name", async function () {
      await expect(
        modelRegistry.connect(user1).registerModel(validName, validMetadataURI, validModelHash)
      ).to.not.be.reverted;

      await expect(
        modelRegistry.connect(user2).registerModel(validName, validMetadataURI, validModelHash)
      ).to.not.be.reverted;

      expect(await modelRegistry.getTotalModels()).to.equal(2);
    });
  });

  describe("Model Retrieval", function () {
    beforeEach(async function () {
      await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);
    });

    it("Should return correct model record details", async function () {
      const model = await modelRegistry.getModel(1);
      expect(model.modelId).to.equal(1);
      expect(model.owner).to.equal(user1.address);
      expect(model.name).to.equal(validName);
      expect(model.metadataURI).to.equal(validMetadataURI);
      expect(model.currentVersion).to.equal(1);
      expect(model.totalVersions).to.equal(1);
      expect(model.active).to.be.true;
      expect(model.createdAt).to.be.gt(0);
    });

    it("Should return correct model owner", async function () {
      expect(await modelRegistry.getModelOwner(1)).to.equal(user1.address);
    });

    it("Should return list of models by owner", async function () {
      await modelRegistry.connect(user1).registerModel("Second-Model", "uri:2", "hash:2");

      const user1Models = await modelRegistry.getModelsByOwner(user1.address);
      expect(user1Models.length).to.equal(2);
      expect(user1Models[0]).to.equal(1);
      expect(user1Models[1]).to.equal(2);

      const user2Models = await modelRegistry.getModelsByOwner(user2.address);
      expect(user2Models.length).to.equal(0);
    });

    it("Should revert getModelsByOwner for zero address", async function () {
      await expect(
        modelRegistry.getModelsByOwner(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(modelRegistry, "ZeroAddress");
    });

    it("Should return active status correctly", async function () {
      expect(await modelRegistry.isModelActive(1)).to.be.true;
    });

    it("Should revert getModel for nonexistent model ID", async function () {
      await expect(modelRegistry.getModel(0))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(0);

      await expect(modelRegistry.getModel(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });

    it("Should revert getModelOwner for nonexistent model ID", async function () {
      await expect(modelRegistry.getModelOwner(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });

    it("Should revert isModelActive for nonexistent model ID", async function () {
      await expect(modelRegistry.isModelActive(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });
  });

  describe("Model Versioning", function () {
    const version2URI = "ipfs://QmVersion2/metadata.json";
    const version2Hash = "b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef";
    const version3URI = "ipfs://QmVersion3/metadata.json";
    const version3Hash = "c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0123456789abcdef0123456789abcdef";

    beforeEach(async function () {
      await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);
    });

    it("Should add a new version and emit ModelVersionAdded", async function () {
      const tx = await modelRegistry
        .connect(user1)
        .addModelVersion(1, version2URI, version2Hash);

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(modelRegistry, "ModelVersionAdded")
        .withArgs(1, 2, version2Hash, version2URI, block.timestamp);

      const model = await modelRegistry.getModel(1);
      expect(model.currentVersion).to.equal(2);
      expect(model.totalVersions).to.equal(2);
      expect(await modelRegistry.getVersionCount(1)).to.equal(2);
    });

    it("Should preserve historical versions when multiple versions are added", async function () {
      await modelRegistry.connect(user1).addModelVersion(1, version2URI, version2Hash);
      await modelRegistry.connect(user1).addModelVersion(1, version3URI, version3Hash);

      expect(await modelRegistry.getVersionCount(1)).to.equal(3);

      const v1 = await modelRegistry.getVersion(1, 1);
      expect(v1.versionNumber).to.equal(1);
      expect(v1.metadataURI).to.equal(validMetadataURI);
      expect(v1.modelHash).to.equal(validModelHash);
      expect(v1.active).to.be.true;

      const v2 = await modelRegistry.getVersion(1, 2);
      expect(v2.versionNumber).to.equal(2);
      expect(v2.metadataURI).to.equal(version2URI);
      expect(v2.modelHash).to.equal(version2Hash);
      expect(v2.active).to.be.true;

      const v3 = await modelRegistry.getVersion(1, 3);
      expect(v3.versionNumber).to.equal(3);
      expect(v3.metadataURI).to.equal(version3URI);
      expect(v3.modelHash).to.equal(version3Hash);
      expect(v3.active).to.be.true;

      const latest = await modelRegistry.getLatestVersion(1);
      expect(latest.versionNumber).to.equal(3);
      expect(latest.modelHash).to.equal(version3Hash);

      const allVersions = await modelRegistry.getModelVersions(1);
      expect(allVersions.length).to.equal(3);
      expect(allVersions[0].versionNumber).to.equal(1);
      expect(allVersions[1].versionNumber).to.equal(2);
      expect(allVersions[2].versionNumber).to.equal(3);
    });

    it("Should prevent non-owner from adding a model version", async function () {
      await expect(
        modelRegistry.connect(user2).addModelVersion(1, version2URI, version2Hash)
      )
        .to.be.revertedWithCustomError(modelRegistry, "UnauthorizedCaller")
        .withArgs(user2.address);
    });

    it("Should prevent adding a version with duplicate hash as the current version", async function () {
      await expect(
        modelRegistry.connect(user1).addModelVersion(1, version2URI, validModelHash)
      )
        .to.be.revertedWithCustomError(modelRegistry, "DuplicateModelVersion")
        .withArgs(1, 1);
    });

    it("Should revert if adding version to an inactive model", async function () {
      await modelRegistry.connect(user1).setModelStatus(1, false);

      await expect(
        modelRegistry.connect(user1).addModelVersion(1, version2URI, version2Hash)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelInactive")
        .withArgs(1);
    });

    it("Should revert if version metadata URI is empty", async function () {
      await expect(
        modelRegistry.connect(user1).addModelVersion(1, "", version2Hash)
      ).to.be.revertedWithCustomError(modelRegistry, "InvalidMetadataURI");
    });

    it("Should revert if version model hash is empty", async function () {
      await expect(
        modelRegistry.connect(user1).addModelVersion(1, version2URI, "")
      ).to.be.revertedWithCustomError(modelRegistry, "InvalidModelHash");
    });

    it("Should revert adding version to nonexistent model", async function () {
      await expect(
        modelRegistry.connect(user1).addModelVersion(999, version2URI, version2Hash)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });

    it("Should revert getVersion for invalid or out-of-bounds version number", async function () {
      await expect(modelRegistry.getVersion(1, 0))
        .to.be.revertedWithCustomError(modelRegistry, "VersionNotFound")
        .withArgs(1, 0);

      await expect(modelRegistry.getVersion(1, 5))
        .to.be.revertedWithCustomError(modelRegistry, "VersionNotFound")
        .withArgs(1, 5);
    });

    it("Should revert version queries for nonexistent model ID", async function () {
      await expect(modelRegistry.getVersion(999, 1))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);

      await expect(modelRegistry.getLatestVersion(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);

      await expect(modelRegistry.getVersionCount(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);

      await expect(modelRegistry.getModelVersions(999))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });
  });

  describe("Model Hash Verification", function () {
    const v2Hash = "second_version_hash_value_123456789";

    beforeEach(async function () {
      await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);
      await modelRegistry
        .connect(user1)
        .addModelVersion(1, "uri:v2", v2Hash);
    });

    it("Should return true when verifying matching hash for version 1", async function () {
      expect(await modelRegistry.verifyModelHash(1, 1, validModelHash)).to.be.true;
    });

    it("Should return false when verifying mismatching hash for version 1", async function () {
      expect(await modelRegistry.verifyModelHash(1, 1, "wrong_hash")).to.be.false;
    });

    it("Should return true when verifying matching hash for version 2", async function () {
      expect(await modelRegistry.verifyModelHash(1, 2, v2Hash)).to.be.true;
    });

    it("Should revert verifyModelHash for nonexistent model", async function () {
      await expect(modelRegistry.verifyModelHash(999, 1, validModelHash))
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });

    it("Should revert verifyModelHash for nonexistent version", async function () {
      await expect(modelRegistry.verifyModelHash(1, 99, validModelHash))
        .to.be.revertedWithCustomError(modelRegistry, "VersionNotFound")
        .withArgs(1, 99);
    });
  });

  describe("Status Management", function () {
    beforeEach(async function () {
      await modelRegistry
        .connect(user1)
        .registerModel(validName, validMetadataURI, validModelHash);
    });

    it("Should allow owner to toggle active status and emit ModelStatusChanged", async function () {
      await expect(modelRegistry.connect(user1).setModelStatus(1, false))
        .to.emit(modelRegistry, "ModelStatusChanged")
        .withArgs(1, false);

      expect(await modelRegistry.isModelActive(1)).to.be.false;

      await expect(modelRegistry.connect(user1).setModelStatus(1, true))
        .to.emit(modelRegistry, "ModelStatusChanged")
        .withArgs(1, true);

      expect(await modelRegistry.isModelActive(1)).to.be.true;
    });

    it("Should prevent non-owner from changing model status", async function () {
      await expect(
        modelRegistry.connect(user2).setModelStatus(1, false)
      )
        .to.be.revertedWithCustomError(modelRegistry, "UnauthorizedCaller")
        .withArgs(user2.address);
    });

    it("Should revert status update on nonexistent model ID", async function () {
      await expect(
        modelRegistry.connect(user1).setModelStatus(999, false)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });
  });

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await modelRegistry.connect(user1).registerModel("Model-1", "uri:1", "hash:1");
      await modelRegistry.connect(user1).registerModel("Model-2", "uri:2", "hash:2");
      await modelRegistry.connect(user1).registerModel("Model-3", "uri:3", "hash:3");
    });

    it("Should allow owner to transfer model ownership and update indices", async function () {
      // Transfer middle model (id: 2) to user2
      await expect(modelRegistry.connect(user1).transferModelOwnership(2, user2.address))
        .to.emit(modelRegistry, "ModelOwnershipTransferred")
        .withArgs(2, user1.address, user2.address);

      expect(await modelRegistry.getModelOwner(2)).to.equal(user2.address);

      const user1Models = await modelRegistry.getModelsByOwner(user1.address);
      expect(user1Models.length).to.equal(2);
      expect(user1Models).to.include(1n);
      expect(user1Models).to.include(3n);
      expect(user1Models).to.not.include(2n);

      const user2Models = await modelRegistry.getModelsByOwner(user2.address);
      expect(user2Models.length).to.equal(1);
      expect(user2Models[0]).to.equal(2);
    });

    it("Should allow former owner to re-register a model with the transferred model name", async function () {
      await modelRegistry.connect(user1).transferModelOwnership(1, user2.address);

      // user1 can now register "Model-1" again
      await expect(
        modelRegistry.connect(user1).registerModel("Model-1", "uri:new", "hash:new")
      ).to.not.be.reverted;
    });

    it("Should revert transfer if new owner already has a model with the same name", async function () {
      await modelRegistry.connect(user2).registerModel("Model-1", "uri:existing", "hash:existing");

      await expect(
        modelRegistry.connect(user1).transferModelOwnership(1, user2.address)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelAlreadyExists")
        .withArgs("Model-1");
    });

    it("Should prevent non-owner from transferring model ownership", async function () {
      await expect(
        modelRegistry.connect(user2).transferModelOwnership(1, user2.address)
      )
        .to.be.revertedWithCustomError(modelRegistry, "UnauthorizedCaller")
        .withArgs(user2.address);
    });

    it("Should revert if new owner is zero address", async function () {
      await expect(
        modelRegistry.connect(user1).transferModelOwnership(1, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(modelRegistry, "ZeroAddress");
    });

    it("Should handle transfer to self gracefully", async function () {
      await expect(
        modelRegistry.connect(user1).transferModelOwnership(1, user1.address)
      ).to.not.be.reverted;
      expect(await modelRegistry.getModelOwner(1)).to.equal(user1.address);
    });

    it("Should revert transfer on nonexistent model ID", async function () {
      await expect(
        modelRegistry.connect(user1).transferModelOwnership(999, user2.address)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });
  });
});
