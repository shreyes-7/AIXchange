const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProvenanceRegistry Smart Contract", function () {
  let DatasetRegistry;
  let datasetRegistry;
  let ModelRegistry;
  let modelRegistry;
  let ProvenanceRegistry;
  let provenanceRegistry;

  let deployer;
  let dataScientist; // model creator / registrant
  let datasetOwner;
  let unauthorizedUser;

  const validCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validModelName = "ResNet-50-Classifier";
  const validMetadataURI = "ipfs://QmMetadata/model.json";
  const validModelHash = "a3c4f981b2e61d859123456789abcdef0123456789abcdef0123456789abcdef";
  const validExecutionId = "exec-sandbox-20260905-001";
  const validMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("model_metadata_sample_content"));

  beforeEach(async function () {
    [deployer, dataScientist, datasetOwner, unauthorizedUser] = await ethers.getSigners();

    // 1. Deploy Phase 4 DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();

    // 2. Deploy Phase 8 ModelRegistry
    ModelRegistry = await ethers.getContractFactory("ModelRegistry");
    modelRegistry = await ModelRegistry.deploy();
    await modelRegistry.waitForDeployment();

    // 3. Deploy Phase 9 ProvenanceRegistry
    ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    provenanceRegistry = await ProvenanceRegistry.deploy(
      await datasetRegistry.getAddress(),
      await modelRegistry.getAddress()
    );
    await provenanceRegistry.waitForDeployment();

    // Setup initial dataset (id: 1) by datasetOwner
    await datasetRegistry.connect(datasetOwner).registerDataset(validCID, "CC-BY-4.0", 500);

    // Setup initial model (id: 1, v1) by dataScientist
    await modelRegistry
      .connect(dataScientist)
      .registerModel(validModelName, validMetadataURI, validModelHash);
  });

  describe("Deployment & Configuration", function () {
    it("Should initialize with zero total provenance records", async function () {
      expect(await provenanceRegistry.getTotalProvenanceRecords()).to.equal(0);
    });

    it("Should link correct DatasetRegistry and ModelRegistry addresses", async function () {
      expect(await provenanceRegistry.datasetRegistry()).to.equal(
        await datasetRegistry.getAddress()
      );
      expect(await provenanceRegistry.modelRegistry()).to.equal(
        await modelRegistry.getAddress()
      );
    });

    it("Should revert if deployed with zero address for either dependency", async function () {
      await expect(
        ProvenanceRegistry.deploy(ethers.ZeroAddress, await modelRegistry.getAddress())
      ).to.be.revertedWithCustomError(provenanceRegistry, "ZeroAddress");

      await expect(
        ProvenanceRegistry.deploy(await datasetRegistry.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(provenanceRegistry, "ZeroAddress");
    });
  });

  describe("Provenance Registration", function () {
    it("Should successfully register provenance and emit ProvenanceRegistered event", async function () {
      const tx = await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(provenanceRegistry, "ProvenanceRegistered")
        .withArgs(
          1,
          1,
          1,
          1,
          validExecutionId,
          validMetadataHash,
          dataScientist.address,
          block.timestamp
        );

      expect(await provenanceRegistry.getTotalProvenanceRecords()).to.equal(1);

      const record = await provenanceRegistry.getProvenance(1);
      expect(record.provenanceId).to.equal(1);
      expect(record.datasetId).to.equal(1);
      expect(record.modelId).to.equal(1);
      expect(record.modelVersion).to.equal(1);
      expect(record.executionId).to.equal(validExecutionId);
      expect(record.metadataHash).to.equal(validMetadataHash);
      expect(record.registrant).to.equal(dataScientist.address);
      expect(record.active).to.be.true;
      expect(record.createdAt).to.equal(block.timestamp);
    });

    it("Should assign incremental IDs for multiple provenance records", async function () {
      // Version 2 for model 1
      await modelRegistry
        .connect(dataScientist)
        .addModelVersion(1, "ipfs://QmVersion2", "hash_version_2_abcdef1234567890");

      // Register second dataset (id: 2)
      await datasetRegistry.connect(datasetOwner).registerDataset("cid:dataset-2", "MIT", 0);

      // Provenance 1: Dataset 1 -> Model 1 (v1)
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, "exec-001", validMetadataHash);

      // Provenance 2: Dataset 2 -> Model 1 (v2)
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(2, 1, 2, "exec-002", validMetadataHash);

      expect(await provenanceRegistry.getTotalProvenanceRecords()).to.equal(2);

      const p1 = await provenanceRegistry.getProvenance(1);
      const p2 = await provenanceRegistry.getProvenance(2);

      expect(p1.provenanceId).to.equal(1);
      expect(p1.datasetId).to.equal(1);
      expect(p1.modelVersion).to.equal(1);

      expect(p2.provenanceId).to.equal(2);
      expect(p2.datasetId).to.equal(2);
      expect(p2.modelVersion).to.equal(2);
    });

    it("Should revert if dataset ID is 0", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(0, 1, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "DatasetNotFound")
        .withArgs(0);
    });

    it("Should revert if dataset does not exist in DatasetRegistry", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(999, 1, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(datasetRegistry, "DatasetNotFound")
        .withArgs(999);
    });

    it("Should revert if model ID is 0", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 0, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "ModelNotFound")
        .withArgs(0);
    });

    it("Should revert if model does not exist in ModelRegistry", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 999, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(modelRegistry, "ModelNotFound")
        .withArgs(999);
    });

    it("Should revert if model version is 0", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 1, 0, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "VersionNotFound")
        .withArgs(1, 0);
    });

    it("Should revert if model version exceeds total model versions", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 1, 5, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "VersionNotFound")
        .withArgs(1, 5);
    });

    it("Should revert if caller is not the model owner", async function () {
      await expect(
        provenanceRegistry
          .connect(unauthorizedUser)
          .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "UnauthorizedCaller")
        .withArgs(unauthorizedUser.address);
    });

    it("Should revert if executionId is empty", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 1, 1, "", validMetadataHash)
      ).to.be.revertedWithCustomError(provenanceRegistry, "InvalidExecutionId");
    });

    it("Should revert if metadataHash is bytes32(0)", async function () {
      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 1, 1, validExecutionId, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(provenanceRegistry, "InvalidMetadataHash");
    });

    it("Should revert if duplicate provenance relationship is registered", async function () {
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);

      await expect(
        provenanceRegistry
          .connect(dataScientist)
          .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceAlreadyExists")
        .withArgs(1);
    });
  });

  describe("Provenance Lookups & Indexing", function () {
    beforeEach(async function () {
      // Add version 2 to model 1
      await modelRegistry
        .connect(dataScientist)
        .addModelVersion(1, "ipfs://QmVersion2", "hash_version_2_abcdef1234567890");

      // Register dataset 2
      await datasetRegistry.connect(datasetOwner).registerDataset("cid:d2", "MIT", 100);

      // Register Provenance 1: Dataset 1 -> Model 1 (v1), exec-001
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, "exec-001", validMetadataHash);

      // Register Provenance 2: Dataset 2 -> Model 1 (v1), exec-001 (multi-dataset training)
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(2, 1, 1, "exec-001", validMetadataHash);

      // Register Provenance 3: Dataset 1 -> Model 1 (v2), exec-002 (fine-tuning)
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 2, "exec-002", validMetadataHash);
    });

    it("Should return correct provenance records by model ID", async function () {
      const modelRecords = await provenanceRegistry.getProvenanceByModel(1);
      expect(modelRecords.length).to.equal(3);
      expect(modelRecords[0]).to.equal(1n);
      expect(modelRecords[1]).to.equal(2n);
      expect(modelRecords[2]).to.equal(3n);
    });

    it("Should return correct provenance records by model version", async function () {
      const v1Records = await provenanceRegistry.getProvenanceByModelVersion(1, 1);
      expect(v1Records.length).to.equal(2);
      expect(v1Records[0]).to.equal(1n);
      expect(v1Records[1]).to.equal(2n);

      const v2Records = await provenanceRegistry.getProvenanceByModelVersion(1, 2);
      expect(v2Records.length).to.equal(1);
      expect(v2Records[0]).to.equal(3n);
    });

    it("Should return correct provenance records by dataset ID", async function () {
      const d1Records = await provenanceRegistry.getProvenanceByDataset(1);
      expect(d1Records.length).to.equal(2);
      expect(d1Records[0]).to.equal(1n);
      expect(d1Records[1]).to.equal(3n);

      const d2Records = await provenanceRegistry.getProvenanceByDataset(2);
      expect(d2Records.length).to.equal(1);
      expect(d2Records[0]).to.equal(2n);
    });

    it("Should return correct provenance records by execution ID", async function () {
      const exec1Records = await provenanceRegistry.getProvenanceByExecution("exec-001");
      expect(exec1Records.length).to.equal(2);
      expect(exec1Records[0]).to.equal(1n);
      expect(exec1Records[1]).to.equal(2n);

      const exec2Records = await provenanceRegistry.getProvenanceByExecution("exec-002");
      expect(exec2Records.length).to.equal(1);
      expect(exec2Records[0]).to.equal(3n);
    });

    it("Should return provenance ID by composite key", async function () {
      const provId = await provenanceRegistry.getProvenanceIdByKey(1, "exec-001", 1, 1);
      expect(provId).to.equal(1);

      const nonExistent = await provenanceRegistry.getProvenanceIdByKey(1, "exec-unknown", 1, 1);
      expect(nonExistent).to.equal(0);
    });

    it("Should return active status correctly", async function () {
      expect(await provenanceRegistry.isProvenanceActive(1)).to.be.true;
    });

    it("Should revert getProvenance on nonexistent ID", async function () {
      await expect(provenanceRegistry.getProvenance(0))
        .to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceNotFound")
        .withArgs(0);

      await expect(provenanceRegistry.getProvenance(999))
        .to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceNotFound")
        .withArgs(999);
    });

    it("Should revert isProvenanceActive on nonexistent ID", async function () {
      await expect(provenanceRegistry.isProvenanceActive(999))
        .to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceNotFound")
        .withArgs(999);
    });
  });

  describe("Verification Engine", function () {
    beforeEach(async function () {
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);
    });

    it("Should return true when verifying matching provenance parameters", async function () {
      const isValid = await provenanceRegistry.verifyProvenance(
        1,
        1,
        validExecutionId,
        1,
        1,
        validMetadataHash
      );
      expect(isValid).to.be.true;
    });

    it("Should return false when verifying with wrong dataset ID", async function () {
      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          99,
          validExecutionId,
          1,
          1,
          validMetadataHash
        )
      ).to.be.false;
    });

    it("Should return false when verifying with wrong execution ID", async function () {
      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          1,
          "wrong-exec-id",
          1,
          1,
          validMetadataHash
        )
      ).to.be.false;
    });

    it("Should return false when verifying with wrong model ID", async function () {
      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          1,
          validExecutionId,
          99,
          1,
          validMetadataHash
        )
      ).to.be.false;
    });

    it("Should return false when verifying with wrong model version", async function () {
      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          1,
          validExecutionId,
          1,
          99,
          validMetadataHash
        )
      ).to.be.false;
    });

    it("Should return false when verifying with wrong metadata hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("corrupted_hash_payload"));
      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          1,
          validExecutionId,
          1,
          1,
          wrongHash
        )
      ).to.be.false;
    });

    it("Should return false when verifying nonexistent provenance record", async function () {
      expect(
        await provenanceRegistry.verifyProvenance(
          999,
          1,
          validExecutionId,
          1,
          1,
          validMetadataHash
        )
      ).to.be.false;

      expect(
        await provenanceRegistry.verifyProvenance(
          0,
          1,
          validExecutionId,
          1,
          1,
          validMetadataHash
        )
      ).to.be.false;
    });

    it("Should verify metadata hash directly with verifyProvenanceHash", async function () {
      expect(
        await provenanceRegistry.verifyProvenanceHash(1, validMetadataHash)
      ).to.be.true;

      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("tampered"));
      expect(await provenanceRegistry.verifyProvenanceHash(1, wrongHash)).to.be.false;

      expect(await provenanceRegistry.verifyProvenanceHash(999, validMetadataHash)).to.be.false;
    });

    it("Should return false from verification if provenance has been deactivated", async function () {
      await provenanceRegistry.connect(dataScientist).setProvenanceStatus(1, false);

      expect(
        await provenanceRegistry.verifyProvenance(
          1,
          1,
          validExecutionId,
          1,
          1,
          validMetadataHash
        )
      ).to.be.false;

      expect(await provenanceRegistry.verifyProvenanceHash(1, validMetadataHash)).to.be.false;
    });
  });

  describe("Status Management & Auditable Revocation", function () {
    beforeEach(async function () {
      await provenanceRegistry
        .connect(dataScientist)
        .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash);
    });

    it("Should allow model owner / registrant to toggle active status and emit ProvenanceStatusChanged", async function () {
      const tx = await provenanceRegistry.connect(dataScientist).setProvenanceStatus(1, false);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(provenanceRegistry, "ProvenanceStatusChanged")
        .withArgs(1, false, block.timestamp);

      expect(await provenanceRegistry.isProvenanceActive(1)).to.be.false;

      // Reactivate
      await provenanceRegistry.connect(dataScientist).setProvenanceStatus(1, true);
      expect(await provenanceRegistry.isProvenanceActive(1)).to.be.true;
    });

    it("Should allow new model owner to update provenance status after model transfer", async function () {
      // Transfer model ownership to unauthorizedUser (now new owner)
      await modelRegistry.connect(dataScientist).transferModelOwnership(1, unauthorizedUser.address);

      // unauthorizedUser is now the model owner and can manage status
      await expect(provenanceRegistry.connect(unauthorizedUser).setProvenanceStatus(1, false))
        .to.emit(provenanceRegistry, "ProvenanceStatusChanged")
        .withArgs(1, false, (await ethers.provider.getBlock("latest")).timestamp + 1);

      expect(await provenanceRegistry.isProvenanceActive(1)).to.be.false;
    });

    it("Should prevent unrelated account from modifying provenance status", async function () {
      await expect(
        provenanceRegistry.connect(unauthorizedUser).setProvenanceStatus(1, false)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "UnauthorizedCaller")
        .withArgs(unauthorizedUser.address);
    });

    it("Should revert setProvenanceStatus on nonexistent provenance ID", async function () {
      await expect(
        provenanceRegistry.connect(dataScientist).setProvenanceStatus(999, false)
      )
        .to.be.revertedWithCustomError(provenanceRegistry, "ProvenanceNotFound")
        .withArgs(999);
    });
  });
});
