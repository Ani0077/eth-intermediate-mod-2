const { ethers } = require("hardhat");

async function main() {
  const CarParkingSystem = await ethers.getContractFactory("CarParkingSystem");
  const carParkingSystem = await CarParkingSystem.deploy();  // Deploy the contract
  await carParkingSystem.deployed();  // Wait for the deployment to be mined

  console.log(`CarParkingSystem deployed to: ${carParkingSystem.address}`);  // Output the deployed contract address
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
