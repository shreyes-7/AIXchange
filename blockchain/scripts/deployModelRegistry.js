const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 8 Deployment — Model Registry");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  console.log("Deploying ModelRegistry contract...");
  const ModelRegistry = await hre.ethers.getContractFactory("ModelRegistry");
  const modelRegistry = await ModelRegistry.deploy();
  await modelRegistry.waitForDeployment();
  const modelRegistryAddress = await modelRegistry.getAddress();

  console.log("==================================================");
  console.log("Phase 8 Deployment Complete Successfully!");
  console.log("ModelRegistry deployed at:", modelRegistryAddress);
  console.log("==================================================");

  // Deployment verification / smoke test
  console.log("Verifying deployed contract instance...");
  const totalModels = await modelRegistry.getTotalModels();
  console.log("Initial total models:", totalModels.toString());

  console.log("Performing deployment verification registration...");
  const testTx = await modelRegistry.registerModel(
    "Deployment-Verification-Model",
    "ipfs://QmDeployVerifyHash/metadata.json",
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  const receipt = await testTx.wait();
  console.log("Registration TX confirmed in block:", receipt.blockNumber);

  const model = await modelRegistry.getModel(1);
  console.log("Verified Model Name:", model.name);
  console.log("Verified Model Owner:", model.owner);
  console.log("Verified Version:", model.currentVersion.toString());

  const version = await modelRegistry.getVersion(1, 1);
  console.log("Verified Version 1 Hash:", version.modelHash);

  const hashMatches = await modelRegistry.verifyModelHash(
    1,
    1,
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  console.log("Verified On-Chain Hash Verification:", hashMatches);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("ModelRegistry deployment failed:", error);
    process.exit(1);
  });
