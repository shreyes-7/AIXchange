const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 5 Deployment — License Registry");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Get or deploy DatasetRegistry address
  let datasetRegistryAddress = process.env.DATASET_REGISTRY_ADDRESS;
  if (!datasetRegistryAddress) {
    console.log("DATASET_REGISTRY_ADDRESS not set in env. Deploying DatasetRegistry first...");
    const DatasetRegistry = await hre.ethers.getContractFactory("DatasetRegistry");
    const datasetRegistry = await DatasetRegistry.deploy();
    await datasetRegistry.waitForDeployment();
    datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log("DatasetRegistry deployed at:", datasetRegistryAddress);
  } else {
    console.log("Using existing DatasetRegistry at:", datasetRegistryAddress);
  }

  // 2. Deploy LicenseRegistry
  console.log("Deploying LicenseRegistry contract...");
  const LicenseRegistry = await hre.ethers.getContractFactory("LicenseRegistry");
  const licenseRegistry = await LicenseRegistry.deploy(datasetRegistryAddress);
  await licenseRegistry.waitForDeployment();
  const licenseRegistryAddress = await licenseRegistry.getAddress();

  console.log("==================================================");
  console.log("Phase 5 Deployment Complete Successfully!");
  console.log("DatasetRegistry: ", datasetRegistryAddress);
  console.log("LicenseRegistry: ", licenseRegistryAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("LicenseRegistry deployment failed:", error);
    process.exit(1);
  });