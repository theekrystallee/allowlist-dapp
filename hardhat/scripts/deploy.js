const { ethers } = require("hardhat");

async function main() {
  const allowlistContract = await ethers.getContractFactory("Allowlist");

  const deployedAllowlistContract = await allowlistContract.deploy(143);

  await deployedAllowlistContract.deployed();

  console.log("Allowlist Contract Address:", deployedAllowlistContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });