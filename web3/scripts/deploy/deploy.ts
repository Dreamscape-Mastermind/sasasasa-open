import "@nomicfoundation/hardhat-ethers";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { TicketNFT__factory } from "../../typechain-types";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const TicketNFTFactory = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFTFactory.deploy();
  await ticketNFT.waitForDeployment();

  console.log("TicketNFT deployed to:", await ticketNFT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 