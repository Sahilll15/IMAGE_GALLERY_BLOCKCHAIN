const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const ImageSaver = await ethers.getContractFactory("ImageSaver");
  const imageSaver = await ImageSaver.deploy();
  await imageSaver.waitForDeployment();

  const address = await imageSaver.getAddress();
  console.log("ImageSaver deployed to:", address);
  
  // Store the contract address to be used by the frontend
  console.log("Copy this address to your frontend .env file as VITE_CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 