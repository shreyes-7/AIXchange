const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 9 Deployment — Provenance Registry");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Get or deploy DatasetRegistry
  let datasetRegistryAddress = process.env.DATASET_REGISTRY_ADDRESS;
  let datasetRegistry;
  if (!datasetRegistryAddress) {
    console.log("DATASET_REGISTRY_ADDRESS not set. Deploying DatasetRegistry...");
    const DatasetRegistry = await hre.ethers.getContractFactory("DatasetRegistry");
    datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();
    datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log("DatasetRegistry deployed at:", datasetRegistryAddress);
  } else {
    console.log("Using existing DatasetRegistry at:", datasetRegistryAddress);
    datasetRegistry = await hre.ethers.getContractAt("DatasetRegistry", datasetRegistryAddress);
  }

  // 2. Get or deploy ModelRegistry
  let modelRegistryAddress = process.env.MODEL_REGISTRY_ADDRESS;
  let modelRegistry;
  if (!modelRegistryAddress) {
    console.log("MODEL_REGISTRY_ADDRESS not set. Deploying ModelRegistry...");
    const ModelRegistry = await hre.ethers.getContractFactory("ModelRegistry");
    modelRegistry = await ModelRegistry.deploy();
    await modelRegistry.waitForDeployment();
    modelRegistryAddress = await modelRegistry.getAddress();
    console.log("ModelRegistry deployed at:", modelRegistryAddress);
  } else {
    console.log("Using existing ModelRegistry at:", modelRegistryAddress);
    modelRegistry = await hre.ethers.getContractAt("ModelRegistry", modelRegistryAddress);
  }

  // 3. Deploy ProvenanceRegistry
  console.log("Deploying ProvenanceRegistry contract...");
  const ProvenanceRegistry = await hre.ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy(
    datasetRegistryAddress,
    modelRegistryAddress
  );
  await provenanceRegistry.waitForDeployment();
  const provenanceRegistryAddress = await provenanceRegistry.getAddress();

  console.log("==================================================");
  console.log("Phase 9 Deployment Complete Successfully!");
  console.log("DatasetRegistry:    ", datasetRegistryAddress);
  console.log("ModelRegistry:      ", modelRegistryAddress);
  console.log("ProvenanceRegistry: ", provenanceRegistryAddress);
  console.log("==================================================");

  // 4. Live on-chain smoke test / verification
  console.log("Running on-chain smoke test verification...");
  const total = await provenanceRegistry.getTotalProvenanceRecords();
  console.log("Initial total provenance records:", total.toString());

  // Ensure a dataset exists for testing
  let datasetId = 1;
  const totalDatasets = await datasetRegistry.getTotalDatasets();
  if (totalDatasets == 0n) {
    console.log("Registering smoke-test dataset...");
    const dTx = await datasetRegistry.registerDataset(
      "QmProvenanceSmokeDatasetCID",
      "CC-BY-4.0",
      500
    );
    await dTx.wait();
  }

  // Ensure a model exists for testing
  let modelId = 1;
  const totalModels = await modelRegistry.getTotalModels();
  if (totalModels == 0n) {
    console.log("Registering smoke-test model...");
    const mTx = await modelRegistry.registerModel(
      "Smoke-Test-Provenance-Model",
      "ipfs://QmSmokeModelURI",
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    await mTx.wait();
  }

  const sampleExecutionId = "exec-smoke-test-001";
  const sampleMetadataHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("sample_model_metadata_provenance_json")
  );

  console.log("Registering smoke-test provenance record...");
  const pTx = await provenanceRegistry.registerProvenance(
    datasetId,
    modelId,
    1,
    sampleExecutionId,
    sampleMetadataHash
  );
  const pReceipt = await pTx.wait();
  console.log("Provenance registered in block:", pReceipt.blockNumber);

  const record = await provenanceRegistry.getProvenance(1);
  console.log("Verified Provenance ID:", record.provenanceId.toString());
  console.log("Verified Dataset ID:   ", record.datasetId.toString());
  console.log("Verified Model ID:     ", record.modelId.toString());
  console.log("Verified Version:      ", record.modelVersion.toString());
  console.log("Verified Execution ID: ", record.executionId);
  console.log("Verified Metadata Hash:", record.metadataHash);

  // Positive verification test
  const isValid = await provenanceRegistry.verifyProvenance(
    1,
    datasetId,
    sampleExecutionId,
    modelId,
    1,
    sampleMetadataHash
  );
  console.log("Positive Verification (expected match):", isValid);

  // Negative verification test (tampered metadata hash)
  const tamperedHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("tampered_content"));
  const isInvalidHash = await provenanceRegistry.verifyProvenance(
    1,
    datasetId,
    sampleExecutionId,
    modelId,
    1,
    tamperedHash
  );
  console.log("Negative Verification (tampered hash rejected):", !isInvalidHash);

  // Negative verification test (wrong model ID)
  const isInvalidModel = await provenanceRegistry.verifyProvenance(
    1,
    datasetId,
    sampleExecutionId,
    999,
    1,
    sampleMetadataHash
  );
  console.log("Negative Verification (wrong model ID rejected):", !isInvalidModel);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("ProvenanceRegistry deployment failed:", error);
    process.exit(1);
  });
