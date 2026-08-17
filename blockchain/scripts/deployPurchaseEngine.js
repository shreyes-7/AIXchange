const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 6 Deployment — Purchase Engine");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Get or deploy AIXToken
  let aixTokenAddress = process.env.AIX_TOKEN_ADDRESS;
  if (!aixTokenAddress) {
    console.log("AIX_TOKEN_ADDRESS not set in env. Deploying AIXToken...");
    const AIXToken = await hre.ethers.getContractFactory("AIXToken");
    const aixToken = await AIXToken.deploy(hre.ethers.parseEther("1000000000"), deployer.address);
    await aixToken.waitForDeployment();
    aixTokenAddress = await aixToken.getAddress();
    console.log("AIXToken deployed at:", aixTokenAddress);
  } else {
    console.log("Using existing AIXToken at:", aixTokenAddress);
  }

  // 2. Get or deploy Treasury
  let treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    console.log("TREASURY_ADDRESS not set in env. Deploying Treasury...");
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(deployer.address);
    await treasury.waitForDeployment();
    treasuryAddress = await treasury.getAddress();
    console.log("Treasury deployed at:", treasuryAddress);
  } else {
    console.log("Using existing Treasury at:", treasuryAddress);
  }

  // 3. Get or deploy DatasetRegistry
  let datasetRegistryAddress = process.env.DATASET_REGISTRY_ADDRESS;
  if (!datasetRegistryAddress) {
    console.log("DATASET_REGISTRY_ADDRESS not set in env. Deploying DatasetRegistry...");
    const DatasetRegistry = await hre.ethers.getContractFactory("DatasetRegistry");
    const datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();
    datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log("DatasetRegistry deployed at:", datasetRegistryAddress);
  } else {
    console.log("Using existing DatasetRegistry at:", datasetRegistryAddress);
  }

  // 4. Get or deploy LicenseRegistry
  let licenseRegistryAddress = process.env.LICENSE_REGISTRY_ADDRESS;
  if (!licenseRegistryAddress) {
    console.log("LICENSE_REGISTRY_ADDRESS not set in env. Deploying LicenseRegistry...");
    const LicenseRegistry = await hre.ethers.getContractFactory("LicenseRegistry");
    const licenseRegistry = await LicenseRegistry.deploy(datasetRegistryAddress);
    await licenseRegistry.waitForDeployment();
    licenseRegistryAddress = await licenseRegistry.getAddress();
    console.log("LicenseRegistry deployed at:", licenseRegistryAddress);
  } else {
    console.log("Using existing LicenseRegistry at:", licenseRegistryAddress);
  }

  // 5. Deploy PurchaseEngine
  console.log("Deploying PurchaseEngine contract...");
  const initialFeeBps = 250; // 2.50%
  const PurchaseEngine = await hre.ethers.getContractFactory("PurchaseEngine");
  const purchaseEngine = await PurchaseEngine.deploy(
    aixTokenAddress,
    datasetRegistryAddress,
    licenseRegistryAddress,
    treasuryAddress,
    initialFeeBps,
    deployer.address
  );
  await purchaseEngine.waitForDeployment();
  const purchaseEngineAddress = await purchaseEngine.getAddress();

  console.log("==================================================");
  console.log("Phase 6 Deployment Complete Successfully!");
  console.log("AIXToken:        ", aixTokenAddress);
  console.log("Treasury:        ", treasuryAddress);
  console.log("DatasetRegistry: ", datasetRegistryAddress);
  console.log("LicenseRegistry: ", licenseRegistryAddress);
  console.log("PurchaseEngine:  ", purchaseEngineAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("PurchaseEngine deployment failed:", error);
    process.exit(1);
  });
