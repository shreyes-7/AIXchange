const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Cashout Escrow Deployment");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  const aixTokenAddress = process.env.AIX_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log("Using AIXToken at:", aixTokenAddress);

  const CashoutEscrow = await hre.ethers.getContractFactory("CashoutEscrow");
  const cashoutEscrow = await CashoutEscrow.deploy(aixTokenAddress, deployer.address);
  await cashoutEscrow.waitForDeployment();
  const cashoutEscrowAddress = await cashoutEscrow.getAddress();

  console.log("==================================================");
  console.log("CashoutEscrow deployed at:", cashoutEscrowAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("CashoutEscrow deployment failed:", error);
    process.exit(1);
  });
