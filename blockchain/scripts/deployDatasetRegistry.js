const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 4 Deployment — Dataset Registry");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  console.log("Deploying DatasetRegistry contract...");
  const DatasetRegistry = await hre.ethers.getContractFactory("DatasetRegistry");
  const datasetRegistry = await DatasetRegistry.deploy();
  await datasetRegistry.waitForDeployment();
  const datasetRegistryAddress = await datasetRegistry.getAddress();

  console.log("==================================================");
  console.log("Phase 4 Deployment Complete Successfully!");
  console.log("DatasetRegistry deployed at:", datasetRegistryAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("DatasetRegistry deployment failed:", error);
    process.exit(1);
  });
