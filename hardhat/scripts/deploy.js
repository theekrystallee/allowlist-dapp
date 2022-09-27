const { ethers } = require("hardhat");

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
  const allowlistContract = await ethers.getContractFactory("Allowlist");

  // here we deploy the contract
  const deployedAllowlistContract = await allowlistContract.deploy(143);
  // 10 is the Maximum number of whitelisted addresses allowed

  // Wait for it to finish deploying
  await deployedAllowlistContract.deployed();

  // print the address of the deployed contract
  console.log("Allowlist Contract Address:", deployedAllowlistContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });