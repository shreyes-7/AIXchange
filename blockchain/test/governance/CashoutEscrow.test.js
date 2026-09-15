const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CashoutEscrow Smart Contract", function () {
  let AIXToken;
  let aixToken;
  let CashoutEscrow;
  let cashoutEscrow;
  let owner;
  let creator;
  let unauthorized;
  const initialSupply = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, creator, unauthorized] = await ethers.getSigners();

    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(initialSupply, owner.address);
    await aixToken.waitForDeployment();

    const aixTokenAddress = await aixToken.getAddress();
    CashoutEscrow = await ethers.getContractFactory("CashoutEscrow");
    cashoutEscrow = await CashoutEscrow.deploy(aixTokenAddress, owner.address);
    await cashoutEscrow.waitForDeployment();

    // Fund creator with 100 AIX for testing
    await aixToken.transfer(creator.address, ethers.parseEther("100"));
  });

  describe("Deployment", function () {
    it("Should set the correct owner and AIX token address", async function () {
      expect(await cashoutEscrow.owner()).to.equal(owner.address);
      expect(await cashoutEscrow.aixToken()).to.equal(await aixToken.getAddress());
      expect(await cashoutEscrow.getLockedBalance()).to.equal(0);
    });

    it("Should revert if deployed with zero address for AIX token", async function () {
      await expect(
        CashoutEscrow.deploy(ethers.ZeroAddress, owner.address)
      ).to.be.revertedWithCustomError(cashoutEscrow, "ZeroAddress");
    });
  });

  describe("Locking Tokens", function () {
    const cashoutId = ethers.keccak256(ethers.toUtf8Bytes("cashout_test_001"));
    const lockAmount = ethers.parseEther("10");

    it("Should lock tokens from creator wallet into escrow", async function () {
      const escrowAddress = await cashoutEscrow.getAddress();
      await aixToken.connect(creator).approve(escrowAddress, lockAmount);

      await expect(
        cashoutEscrow.connect(creator).lockTokens(cashoutId, creator.address, lockAmount)
      )
        .to.emit(cashoutEscrow, "CashoutEscrowLocked")
        .withArgs(cashoutId, creator.address, lockAmount);

      expect(await cashoutEscrow.getLockedBalance()).to.equal(lockAmount);
      expect(await aixToken.balanceOf(creator.address)).to.equal(ethers.parseEther("90"));

      const record = await cashoutEscrow.getEscrow(cashoutId);
      expect(record.creator).to.equal(creator.address);
      expect(record.tokenAmount).to.equal(lockAmount);
      expect(record.status).to.equal(1); // 1 = LOCKED
    });

    it("Should revert if duplicate cashoutId is locked", async function () {
      const escrowAddress = await cashoutEscrow.getAddress();
      await aixToken.connect(creator).approve(escrowAddress, ethers.parseEther("20"));

      await cashoutEscrow.connect(creator).lockTokens(cashoutId, creator.address, lockAmount);

      await expect(
        cashoutEscrow.connect(creator).lockTokens(cashoutId, creator.address, lockAmount)
      ).to.be.revertedWithCustomError(cashoutEscrow, "EscrowAlreadyExists");
    });
  });

  describe("Finalizing and Burning (Payout Success)", function () {
    const cashoutId = ethers.keccak256(ethers.toUtf8Bytes("cashout_burn_001"));
    const lockAmount = ethers.parseEther("10");

    beforeEach(async function () {
      const escrowAddress = await cashoutEscrow.getAddress();
      await aixToken.connect(creator).approve(escrowAddress, lockAmount);
      await cashoutEscrow.connect(creator).lockTokens(cashoutId, creator.address, lockAmount);
    });

    it("Should burn locked tokens and decrease totalSupply on completeAndBurn", async function () {
      const supplyBefore = await aixToken.totalSupply();

      await expect(cashoutEscrow.connect(owner).completeAndBurn(cashoutId))
        .to.emit(cashoutEscrow, "CashoutEscrowBurned")
        .withArgs(cashoutId, creator.address, lockAmount);

      const supplyAfter = await aixToken.totalSupply();
      expect(supplyBefore - supplyAfter).to.equal(lockAmount);
      expect(await cashoutEscrow.getLockedBalance()).to.equal(0);

      const record = await cashoutEscrow.getEscrow(cashoutId);
      expect(record.status).to.equal(3); // 3 = BURNED
    });

    it("Should revert if non-owner calls completeAndBurn", async function () {
      await expect(
        cashoutEscrow.connect(unauthorized).completeAndBurn(cashoutId)
      ).to.be.revertedWithCustomError(cashoutEscrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Releasing Tokens (Payout Failure)", function () {
    const cashoutId = ethers.keccak256(ethers.toUtf8Bytes("cashout_release_001"));
    const lockAmount = ethers.parseEther("10");

    beforeEach(async function () {
      const escrowAddress = await cashoutEscrow.getAddress();
      await aixToken.connect(creator).approve(escrowAddress, lockAmount);
      await cashoutEscrow.connect(creator).lockTokens(cashoutId, creator.address, lockAmount);
    });

    it("Should release tokens safely back to creator wallet on releaseTokens", async function () {
      expect(await aixToken.balanceOf(creator.address)).to.equal(ethers.parseEther("90"));

      await expect(cashoutEscrow.connect(owner).releaseTokens(cashoutId))
        .to.emit(cashoutEscrow, "CashoutEscrowReleased")
        .withArgs(cashoutId, creator.address, lockAmount);

      expect(await aixToken.balanceOf(creator.address)).to.equal(ethers.parseEther("100"));
      expect(await cashoutEscrow.getLockedBalance()).to.equal(0);

      const record = await cashoutEscrow.getEscrow(cashoutId);
      expect(record.status).to.equal(2); // 2 = RELEASED
    });

    it("Should revert if non-owner calls releaseTokens", async function () {
      await expect(
        cashoutEscrow.connect(unauthorized).releaseTokens(cashoutId)
      ).to.be.revertedWithCustomError(cashoutEscrow, "OwnableUnauthorizedAccount");
    });
  });
});
