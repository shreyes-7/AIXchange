const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const tokenAddress = process.env.AIX_TOKEN_ADDRESS;
  const recipientAddress = process.env.RECIPIENT_ADDRESS || signer.address;
  const amountToMint = process.env.MINT_AMOUNT || "1000";

  if (!tokenAddress) {
    console.log("No AIX_TOKEN_ADDRESS specified in env. Deploying a temporary AIXToken instance...");
    const AIXToken = await hre.ethers.getContractFactory("AIXToken");
    const aixToken = await AIXToken.deploy(hre.ethers.parseEther("1000000"), signer.address);
    await aixToken.waitForDeployment();
    const address = await aixToken.getAddress();
    console.log("Deployed AIXToken at:", address);
    
    const mintAmount = hre.ethers.parseEther(amountToMint);
    const tx = await aixToken.mint(recipientAddress, mintAmount);
    await tx.wait();
    console.log(`Successfully minted ${amountToMint} AIX to ${recipientAddress}`);
    return;
  }

  const aixToken = await hre.ethers.getContractAt("AIXToken", tokenAddress);
  const mintAmount = hre.ethers.parseEther(amountToMint);
  console.log(`Minting ${amountToMint} AIX to ${recipientAddress}...`);
  const tx = await aixToken.mint(recipientAddress, mintAmount);
  await tx.wait();
  console.log(`Successfully minted ${amountToMint} AIX to ${recipientAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Mint script failed:", error);
    process.exit(1);
  });
