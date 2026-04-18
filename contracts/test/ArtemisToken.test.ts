import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArtemisToken", function () {
  it("mints full supply to treasury", async function () {
    const [, treasury] = await ethers.getSigners();
    const ArtemisToken = await ethers.getContractFactory("ArtemisToken");
    const token = await ArtemisToken.deploy(treasury.address);
    await token.waitForDeployment();

    const expectedSupply = ethers.parseUnits("10000000", 18);

    expect(await token.totalSupply()).to.equal(expectedSupply);
    expect(await token.balanceOf(treasury.address)).to.equal(expectedSupply);
  });

  it("reverts with zero treasury", async function () {
    const ArtemisToken = await ethers.getContractFactory("ArtemisToken");
    await expect(ArtemisToken.deploy(ethers.ZeroAddress)).to.be.revertedWith("Invalid treasury");
  });
});