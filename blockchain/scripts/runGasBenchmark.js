/**
 * Standalone Gas Benchmark Script for Phase 13
 * Executes representative state-changing operations and outputs a structured benchmark table.
 */
const { ethers } = require("hardhat");

async function main() {
  console.log("===============================================================");
  console.log("     AIXchange Phase 13 — Blockchain Gas Benchmarking Suite     ");
  console.log("===============================================================\n");

  const [owner, creator, buyer, contributor1, contributor2] =
    await ethers.getSigners();
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

  const results = [];

  async function benchmark(operation, contract, txPromise) {
    const tx = await txPromise;
    const receipt = await tx.wait();
    results.push({
      operation,
      contract,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? "CONFIRMED" : "REVERTED",
    });
  }

  // 1. Deploy Contracts
  const AIXToken = await ethers.getContractFactory("AIXToken");
  const aixToken = await AIXToken.deploy(initialSupply, owner.address);
  await aixToken.waitForDeployment();

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(owner.address);
  await treasury.waitForDeployment();

  const DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
  const datasetRegistry = await DatasetRegistry.deploy();
  await datasetRegistry.waitForDeployment();

  const LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
  const licenseRegistry = await LicenseRegistry.deploy(
    await datasetRegistry.getAddress()
  );
  await licenseRegistry.waitForDeployment();

  const PurchaseEngine = await ethers.getContractFactory("PurchaseEngine");
  const purchaseEngine = await PurchaseEngine.deploy(
    await aixToken.getAddress(),
    await datasetRegistry.getAddress(),
    await licenseRegistry.getAddress(),
    await treasury.getAddress(),
    250,
    owner.address
  );
  await purchaseEngine.waitForDeployment();

  const ModelRegistry = await ethers.getContractFactory("ModelRegistry");
  const modelRegistry = await ModelRegistry.deploy();
  await modelRegistry.waitForDeployment();

  const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy(
    await datasetRegistry.getAddress(),
    await modelRegistry.getAddress()
  );
  await provenanceRegistry.waitForDeployment();

  const RoyaltyEngine = await ethers.getContractFactory("RoyaltyEngine");
  const royaltyEngine = await RoyaltyEngine.deploy(
    await aixToken.getAddress(),
    await treasury.getAddress(),
    await purchaseEngine.getAddress(),
    250,
    owner.address
  );
  await royaltyEngine.waitForDeployment();

  await aixToken.transfer(buyer.address, ethers.parseEther("50000"));

  // 2. Execute Operations
  await benchmark(
    "transfer",
    "AIXToken",
    aixToken.transfer(creator.address, ethers.parseEther("100"))
  );

  await benchmark(
    "approve",
    "AIXToken",
    aixToken.approve(await purchaseEngine.getAddress(), ethers.parseEther("1000"))
  );

  await aixToken.approve(await treasury.getAddress(), ethers.parseEther("500"));
  await benchmark(
    "depositToken",
    "Treasury",
    treasury.depositToken(await aixToken.getAddress(), ethers.parseEther("500"))
  );

  await benchmark(
    "withdrawToken",
    "Treasury",
    treasury.withdrawToken(
      await aixToken.getAddress(),
      creator.address,
      ethers.parseEther("250")
    )
  );

  await benchmark(
    "registerDataset",
    "DatasetRegistry",
    datasetRegistry.connect(creator).registerDataset(validDatasetCID, "MIT", 500)
  );

  await benchmark(
    "updateDataset",
    "DatasetRegistry",
    datasetRegistry
      .connect(creator)
      .updateDataset(1, "QmNewCID1234567890", "Apache-2.0", 300)
  );

  await benchmark(
    "createLicense",
    "LicenseRegistry",
    licenseRegistry.connect(creator).createLicense({
      assetId: 1,
      assetType: 0,
      licenseType: 1,
      pricingModel: 0,
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
    })
  );

  await benchmark(
    "registerModel",
    "ModelRegistry",
    modelRegistry
      .connect(creator)
      .registerModel(validModelName, validMetadataURI, validModelHash)
  );

  await benchmark(
    "addModelVersion",
    "ModelRegistry",
    modelRegistry
      .connect(creator)
      .addModelVersion(
        1,
        "ipfs://QmMetaV2",
        "c5d6e7f80123456789abcdef0123456789abcdef0123456789abcdef01234567"
      )
  );

  await aixToken
    .connect(buyer)
    .approve(await purchaseEngine.getAddress(), ethers.parseEther("500"));
  await benchmark(
    "purchaseDataset",
    "PurchaseEngine",
    purchaseEngine.connect(buyer).purchaseDataset(1, 1)
  );

  const revenue = ethers.parseEther("1000");
  const recipients = [
    { recipient: contributor1.address, shareBps: 6000 },
    { recipient: contributor2.address, shareBps: 3750 },
  ];
  await aixToken.approve(await royaltyEngine.getAddress(), revenue);
  await benchmark(
    "distributeRoyalty",
    "RoyaltyEngine",
    royaltyEngine.distributeRoyalty(0, 101, revenue, recipients)
  );

  await benchmark(
    "registerProvenance",
    "ProvenanceRegistry",
    provenanceRegistry
      .connect(creator)
      .registerProvenance(1, 1, 1, validExecutionId, validMetadataHash)
  );

  // 3. Output Markdown Table
  console.log("| Operation | Contract | Transaction Hash | Gas Used | Status |");
  console.log("| :--- | :--- | :--- | :--- | :--- |");
  for (const r of results) {
    console.log(
      `| \`${r.operation}\` | \`${r.contract}\` | \`${r.txHash.slice(0, 10)}...${r.txHash.slice(-8)}\` | **${Number(r.gasUsed).toLocaleString()}** | ${r.status} |`
    );
  }

  console.log("\nFull Transaction Evidence Log:\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error("Gas Benchmark Failed:", error);
  process.exit(1);
});
