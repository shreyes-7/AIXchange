const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury Smart Contract", function () {
  let AIXToken;
  let aixToken;
  let Treasury;
  let treasury;
  let owner;
  let addr1;
  let addr2;
  const initialSupply = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(initialSupply, owner.address);
    await aixToken.waitForDeployment();

    Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(owner.address);
    await treasury.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await treasury.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero ETH and token balance", async function () {
      expect(await treasury.getETHBalance()).to.equal(0);
      const tokenAddress = await aixToken.getAddress();
      expect(await treasury.getTokenBalance(tokenAddress)).to.equal(0);
    });
  });

  describe("ETH Deposits and Withdrawals", function () {
    it("Should receive ETH via direct deposit and emit ETHDeposited", async function () {
      const depositAmount = ethers.parseEther("5");
      await expect(
        addr1.sendTransaction({
          to: await treasury.getAddress(),
          value: depositAmount,
        })
      )
        .to.emit(treasury, "ETHDeposited")
        .withArgs(addr1.address, depositAmount);

      expect(await treasury.getETHBalance()).to.equal(depositAmount);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const depositAmount = ethers.parseEther("10");
      const withdrawAmount = ethers.parseEther("4");
      const treasuryAddress = await treasury.getAddress();

      await addr1.sendTransaction({
        to: treasuryAddress,
        value: depositAmount,
      });

      const initialRecipientBal = await ethers.provider.getBalance(addr2.address);

      await expect(treasury.withdrawETH(addr2.address, withdrawAmount))
        .to.emit(treasury, "ETHWithdrawn")
        .withArgs(addr2.address, withdrawAmount);

      expect(await treasury.getETHBalance()).to.equal(depositAmount - withdrawAmount);
      expect(await ethers.provider.getBalance(addr2.address)).to.equal(
        initialRecipientBal + withdrawAmount
      );
    });

    it("Should prevent non-owner from withdrawing ETH", async function () {
      await expect(
        treasury.connect(addr1).withdrawETH(addr1.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
    });

    it("Should revert if withdrawing zero ETH or to zero address", async function () {
      await expect(
        treasury.withdrawETH(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(treasury, "ZeroAddress");

      await expect(
        treasury.withdrawETH(addr1.address, 0)
      ).to.be.revertedWithCustomError(treasury, "ZeroAmount");
    });

    it("Should revert if ETH withdrawal exceeds balance", async function () {
      await expect(
        treasury.withdrawETH(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(treasury, "InsufficientBalance");
    });
  });

  describe("ERC20 Token Deposits and Withdrawals", function () {
    it("Should hold tokens transferred to treasury address", async function () {
      const transferAmount = ethers.parseEther("5000");
      const treasuryAddress = await treasury.getAddress();
      const tokenAddress = await aixToken.getAddress();

      await aixToken.transfer(treasuryAddress, transferAmount);

      expect(await treasury.getTokenBalance(tokenAddress)).to.equal(transferAmount);
    });

    it("Should allow owner to withdraw ERC20 tokens from treasury", async function () {
      const transferAmount = ethers.parseEther("5000");
      const withdrawAmount = ethers.parseEther("2000");
      const treasuryAddress = await treasury.getAddress();
      const tokenAddress = await aixToken.getAddress();

      await aixToken.transfer(treasuryAddress, transferAmount);

      await expect(treasury.withdrawToken(tokenAddress, addr1.address, withdrawAmount))
        .to.emit(treasury, "TokenWithdrawn")
        .withArgs(tokenAddress, addr1.address, withdrawAmount);

      expect(await treasury.getTokenBalance(tokenAddress)).to.equal(
        transferAmount - withdrawAmount
      );
      expect(await aixToken.balanceOf(addr1.address)).to.equal(withdrawAmount);
    });

    it("Should prevent non-owner from withdrawing tokens", async function () {
      const tokenAddress = await aixToken.getAddress();
      await expect(
        treasury.connect(addr1).withdrawToken(tokenAddress, addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
    });

    it("Should revert if withdrawing zero token amount or invalid token/recipient address", async function () {
      const tokenAddress = await aixToken.getAddress();

      await expect(
        treasury.withdrawToken(ethers.ZeroAddress, addr1.address, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(treasury, "ZeroAddress");

      await expect(
        treasury.withdrawToken(tokenAddress, ethers.ZeroAddress, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(treasury, "ZeroAddress");

      await expect(
        treasury.withdrawToken(tokenAddress, addr1.address, 0)
      ).to.be.revertedWithCustomError(treasury, "ZeroAmount");
    });

    it("Should revert if token withdrawal amount exceeds balance", async function () {
      const tokenAddress = await aixToken.getAddress();
      await expect(
        treasury.withdrawToken(tokenAddress, addr1.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(treasury, "InsufficientBalance");
    });
  });
});
