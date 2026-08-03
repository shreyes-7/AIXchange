const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const accountAddress = process.env.ACCOUNT_ADDRESS || signer.address;
  const tokenAddress = process.env.AIX_TOKEN_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;

  console.log("==================================================");
  console.log("Checking balances for account:", accountAddress);

  const ethBalance = await hre.ethers.provider.getBalance(accountAddress);
  console.log("ETH Balance:", hre.ethers.formatEther(ethBalance), "ETH");

  if (tokenAddress) {
    const aixToken = await hre.ethers.getContractAt("AIXToken", tokenAddress);
    const tokenBalance = await aixToken.balanceOf(accountAddress);
    const symbol = await aixToken.symbol();
    console.log(`${symbol} Token Balance:`, hre.ethers.formatEther(tokenBalance), symbol);
  }

  if (treasuryAddress) {
    console.log("--------------------------------------------------");
    console.log("Checking Treasury at:", treasuryAddress);
    const treasury = await hre.ethers.getContractAt("Treasury", treasuryAddress);
    const treasuryETH = await treasury.getETHBalance();
    console.log("Treasury ETH Balance:", hre.ethers.formatEther(treasuryETH), "ETH");

    if (tokenAddress) {
      const treasuryToken = await treasury.getTokenBalance(tokenAddress);
      console.log("Treasury AIX Token Balance:", hre.ethers.formatEther(treasuryToken), "AIX");
    }
  }

  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Balance check failed:", error);
    process.exit(1);
  });
