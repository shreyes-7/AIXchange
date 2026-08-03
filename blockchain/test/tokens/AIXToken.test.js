const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIXToken Smart Contract", function () {
  let AIXToken;
  let aixToken;
  let owner;
  let addr1;
  let addr2;
  const initialSupply = ethers.parseEther("1000000"); // 1 Million AIX

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AIXToken = await ethers.getContractFactory("AIXToken");
    aixToken = await AIXToken.deploy(initialSupply, owner.address);
    await aixToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name", async function () {
      expect(await aixToken.name()).to.equal("AIXchange Token");
    });

    it("Should set the correct token symbol", async function () {
      expect(await aixToken.symbol()).to.equal("AIX");
    });

    it("Should set the correct decimals (18)", async function () {
      expect(await aixToken.decimals()).to.equal(18);
    });

    it("Should set the correct total supply and assign to owner", async function () {
      expect(await aixToken.totalSupply()).to.equal(initialSupply);
      expect(await aixToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the correct contract owner", async function () {
      expect(await aixToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts successfully", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(aixToken.transfer(addr1.address, transferAmount))
        .to.emit(aixToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);

      expect(await aixToken.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await aixToken.balanceOf(owner.address)).to.equal(initialSupply - transferAmount);
    });

    it("Should fail when sender does not have enough balance", async function () {
      const transferAmount = ethers.parseEther("10");
      await expect(
        aixToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(aixToken, "ERC20InsufficientBalance");
    });
  });

  describe("Minting", function () {
    it("Should allow contract owner to mint new tokens", async function () {
      const mintAmount = ethers.parseEther("500");
      await expect(aixToken.mint(addr1.address, mintAmount))
        .to.emit(aixToken, "TokensMinted")
        .withArgs(addr1.address, mintAmount);

      expect(await aixToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await aixToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should prevent non-owner from minting tokens", async function () {
      const mintAmount = ethers.parseEther("500");
      await expect(
        aixToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(aixToken, "OwnableUnauthorizedAccount");
    });

    it("Should revert if minting to zero address", async function () {
      await expect(
        aixToken.mint(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(aixToken, "ZeroAddress");
    });

    it("Should revert if minting zero amount", async function () {
      await expect(
        aixToken.mint(addr1.address, 0)
      ).to.be.revertedWithCustomError(aixToken, "ZeroAmount");
    });
  });

  describe("Burning", function () {
    it("Should allow user to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("200");
      await expect(aixToken.burn(burnAmount))
        .to.emit(aixToken, "TokensBurned")
        .withArgs(owner.address, burnAmount);

      expect(await aixToken.balanceOf(owner.address)).to.equal(initialSupply - burnAmount);
      expect(await aixToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should revert when burning zero amount", async function () {
      await expect(aixToken.burn(0)).to.be.revertedWithCustomError(
        aixToken,
        "ZeroAmount"
      );
    });

    it("Should allow burnFrom using spender allowance", async function () {
      const transferAmount = ethers.parseEther("500");
      const burnAmount = ethers.parseEther("200");

      await aixToken.transfer(addr1.address, transferAmount);
      await aixToken.connect(addr1).approve(owner.address, burnAmount);

      await expect(aixToken.burnFrom(addr1.address, burnAmount))
        .to.emit(aixToken, "TokensBurned")
        .withArgs(addr1.address, burnAmount);

      expect(await aixToken.balanceOf(addr1.address)).to.equal(transferAmount - burnAmount);
    });
  });

  describe("Approvals and Allowance", function () {
    it("Should approve spender allowance correctly", async function () {
      const approveAmount = ethers.parseEther("1000");
      await aixToken.approve(addr1.address, approveAmount);
      expect(await aixToken.allowance(owner.address, addr1.address)).to.equal(approveAmount);
    });
  });
});
