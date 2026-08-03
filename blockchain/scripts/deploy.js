const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 3 Deployment");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Deploy AIXToken
  const initialSupply = hre.ethers.parseEther("1000000000"); // 1 Billion AIX
  console.log("Deploying AIXToken with initial supply: 1,000,000,000 AIX...");
  const AIXToken = await hre.ethers.getContractFactory("AIXToken");
  const aixToken = await AIXToken.deploy(initialSupply, deployer.address);
  await aixToken.waitForDeployment();
  const aixTokenAddress = await aixToken.getAddress();
  console.log("AIXToken deployed at:", aixTokenAddress);

  // 2. Deploy Treasury
  console.log("Deploying Treasury contract...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(deployer.address);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed at:", treasuryAddress);

  console.log("==================================================");
  console.log("Phase 3 Deployment Complete Successfully!");
  console.log("AIXToken: ", aixTokenAddress);
  console.log("Treasury: ", treasuryAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
