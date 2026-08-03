const hre = require("hardhat");

async function main() {
  const [signer, defaultRecipient] = await hre.ethers.getSigners();
  const tokenAddress = process.env.AIX_TOKEN_ADDRESS;
  const recipientAddress = process.env.RECIPIENT_ADDRESS || defaultRecipient.address;
  const amountToTransfer = process.env.TRANSFER_AMOUNT || "500";

  if (!tokenAddress) {
    console.log("No AIX_TOKEN_ADDRESS specified. Deploying temporary token for transfer demonstration...");
    const AIXToken = await hre.ethers.getContractFactory("AIXToken");
    const aixToken = await AIXToken.deploy(hre.ethers.parseEther("1000000"), signer.address);
    await aixToken.waitForDeployment();
    const addr = await aixToken.getAddress();
    const amount = hre.ethers.parseEther(amountToTransfer);
    const tx = await aixToken.transfer(recipientAddress, amount);
    await tx.wait();
    console.log(`Transferred ${amountToTransfer} AIX from ${signer.address} to ${recipientAddress} via contract at ${addr}`);
    return;
  }

  const aixToken = await hre.ethers.getContractAt("AIXToken", tokenAddress);
  const amount = hre.ethers.parseEther(amountToTransfer);
  console.log(`Transferring ${amountToTransfer} AIX to ${recipientAddress}...`);
  const tx = await aixToken.transfer(recipientAddress, amount);
  await tx.wait();
  console.log(`Successfully transferred ${amountToTransfer} AIX to ${recipientAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Transfer failed:", error);
    process.exit(1);
  });
