import { ethers } from "hardhat";

export const ONE_TOKEN = ethers.parseUnits("1", 18);
export const ONE_USD_6 = ethers.parseUnits("1", 6);

export const PRESALE_CAP = ethers.parseUnits("5000000", 18);
export const MIN_PURCHASE_USD = ethers.parseUnits("25", 6);

export const BATCH_CAPS = [
  ethers.parseUnits("500000", 18),
  ethers.parseUnits("750000", 18),
  ethers.parseUnits("1000000", 18),
  ethers.parseUnits("1000000", 18),
  ethers.parseUnits("1250000", 18),
  ethers.parseUnits("500000", 18)
];

export const BATCH_PRICES = [
  250000n,
  400000n,
  550000n,
  700000n,
  800000n,
  900000n
];

export async function deployFixture() {
  const [owner, treasury, buyer1, buyer2] = await ethers.getSigners();

  const MockUSD = await ethers.getContractFactory("MockUSD");
  const usdt = await MockUSD.deploy("Tether USD", "USDT", 6);
  const usdc = await MockUSD.deploy("USD Coin", "USDC", 6);
  await usdt.waitForDeployment();
  await usdc.waitForDeployment();

  const ArtemisToken = await ethers.getContractFactory("ArtemisToken");
  const artm3 = await ArtemisToken.deploy(treasury.address);
  await artm3.waitForDeployment();

  const ArtemisPresale = await ethers.getContractFactory("ArtemisPresale");
  const presale = await ArtemisPresale.deploy(
    await artm3.getAddress(),
    await usdt.getAddress(),
    await usdc.getAddress(),
    treasury.address,
    PRESALE_CAP,
    MIN_PURCHASE_USD,
    BATCH_CAPS,
    BATCH_PRICES
  );
  await presale.waitForDeployment();

  const mintAmount = ethers.parseUnits("5000000", 6);
  await usdt.mint(buyer1.address, mintAmount);
  await usdt.mint(buyer2.address, mintAmount);
  await usdc.mint(buyer1.address, mintAmount);
  await usdc.mint(buyer2.address, mintAmount);

  return {
    owner,
    treasury,
    buyer1,
    buyer2,
    artm3,
    usdt,
    usdc,
    presale
  };
}