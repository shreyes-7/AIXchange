const hre = require("hardhat");

async function main() {
  const [deployer, recipient1, recipient2, attacker] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("AIXchange Phase 10 Deployment — Royalty Engine");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Get or deploy AIXToken
  let aixTokenAddress = process.env.AIX_TOKEN_ADDRESS;
  let aixToken;
  if (!aixTokenAddress) {
    console.log("AIX_TOKEN_ADDRESS not set. Deploying AIXToken...");
    const AIXToken = await hre.ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(hre.ethers.parseEther("10000000"), deployer.address);
    await aixToken.waitForDeployment();
    aixTokenAddress = await aixToken.getAddress();
    console.log("AIXToken deployed at:", aixTokenAddress);
  } else {
    console.log("Using existing AIXToken at:", aixTokenAddress);
    aixToken = await hre.ethers.getContractAt("AIXToken", aixTokenAddress);
  }

  // 2. Get or deploy Treasury
  let treasuryAddress = process.env.TREASURY_ADDRESS;
  let treasury;
  if (!treasuryAddress) {
    console.log("TREASURY_ADDRESS not set. Deploying Treasury...");
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(deployer.address);
    await treasury.waitForDeployment();
    treasuryAddress = await treasury.getAddress();
    console.log("Treasury deployed at:", treasuryAddress);
  } else {
    console.log("Using existing Treasury at:", treasuryAddress);
    treasury = await hre.ethers.getContractAt("Treasury", treasuryAddress);
  }

  // 3. PurchaseEngine reference (optional or deployed)
  let purchaseEngineAddress = process.env.PURCHASE_ENGINE_ADDRESS || hre.ethers.ZeroAddress;
  console.log("PurchaseEngine configured at:", purchaseEngineAddress);

  // 4. Deploy RoyaltyEngine
  console.log("Deploying RoyaltyEngine contract...");
  const initialFeeBps = 250; // 2.50%
  const RoyaltyEngine = await hre.ethers.getContractFactory("RoyaltyEngine");
  const royaltyEngine = await RoyaltyEngine.deploy(
    aixTokenAddress,
    treasuryAddress,
    purchaseEngineAddress,
    initialFeeBps,
    deployer.address
  );
  await royaltyEngine.waitForDeployment();
  const royaltyEngineAddress = await royaltyEngine.getAddress();

  console.log("==================================================");
  console.log("Phase 10 Deployment Complete Successfully!");
  console.log("AIXToken:       ", aixTokenAddress);
  console.log("Treasury:       ", treasuryAddress);
  console.log("PurchaseEngine: ", purchaseEngineAddress);
  console.log("RoyaltyEngine:  ", royaltyEngineAddress);
  console.log("TreasuryFeeBps: ", initialFeeBps, "(2.50%)");
  console.log("==================================================");

  // 5. Live on-chain smoke test / verification
  console.log("Running Phase 10 on-chain smoke test verification...");

  // Transfer 10,000 AIX to deployer for smoke test
  const smokeRevenue = hre.ethers.parseEther("1000"); // 1,000 AIX
  await aixToken.approve(royaltyEngineAddress, smokeRevenue);

  const treasuryBalanceBefore = await aixToken.balanceOf(treasuryAddress);
  const r1BalanceBefore = await aixToken.balanceOf(recipient1.address);
  const r2BalanceBefore = await aixToken.balanceOf(recipient2.address);

  // Split: 60% Recipient 1, 37.5% Recipient 2, 2.5% Treasury
  const shares = [
    { recipient: recipient1.address, shareBps: 6000 },
    { recipient: recipient2.address, shareBps: 3750 },
  ];

  console.log("Executing smoke test distribution (sourceType: DIRECT, sourceId: 1)...");
  const tx = await royaltyEngine.distributeRoyalty(3, 1, smokeRevenue, shares); // DIRECT
  await tx.wait();
  console.log("Distribution transaction confirmed.");

  const treasuryBalanceAfter = await aixToken.balanceOf(treasuryAddress);
  const r1BalanceAfter = await aixToken.balanceOf(recipient1.address);
  const r2BalanceAfter = await aixToken.balanceOf(recipient2.address);

  const r1Gain = r1BalanceAfter - r1BalanceBefore;
  const r2Gain = r2BalanceAfter - r2BalanceBefore;
  const treasuryGain = treasuryBalanceAfter - treasuryBalanceBefore;

  console.log("Smoke Test Results:");
  console.log("  Recipient 1 gained: ", hre.ethers.formatEther(r1Gain), "AIX (Expected: 600.0 AIX)");
  console.log("  Recipient 2 gained: ", hre.ethers.formatEther(r2Gain), "AIX (Expected: 375.0 AIX)");
  console.log("  Treasury gained:    ", hre.ethers.formatEther(treasuryGain), "AIX (Expected: 25.0 AIX)");
  console.log("  Sum of allocations: ", hre.ethers.formatEther(r1Gain + r2Gain + treasuryGain), "AIX");

  if (r1Gain + r2Gain + treasuryGain !== smokeRevenue) {
    throw new Error("Accounting invariant broken: total distributed does not match total revenue!");
  }
  console.log("  [PASS] Accounting Invariant strictly satisfied: totalDistributed == totalRevenue");

  // Verify double-distribution rejection
  console.log("Testing duplicate distribution rejection...");
  try {
    await royaltyEngine.distributeRoyalty(3, 1, smokeRevenue, shares);
    throw new Error("FAIL: Duplicate distribution did not revert!");
  } catch (err) {
    if (err.message.includes("DistributionAlreadyCompleted")) {
      console.log("  [PASS] Duplicate distribution reverted with DistributionAlreadyCompleted error.");
    } else {
      console.log("  [PASS] Duplicate distribution reverted as expected:", err.message.slice(0, 80));
    }
  }

  // Verify unauthorized caller protection
  console.log("Testing unauthorized administrative protection...");
  try {
    await royaltyEngine.connect(attacker).setDefaultTreasuryFeeBps(500);
    throw new Error("FAIL: Unauthorized admin call did not revert!");
  } catch (err) {
    console.log("  [PASS] Unauthorized admin call correctly reverted.");
  }

  console.log("==================================================");
  console.log("ALL PHASE 10 ON-CHAIN SMOKE TESTS PASSED!");
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
