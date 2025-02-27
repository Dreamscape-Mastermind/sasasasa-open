// import { unlock } from "hardhat";
const { unlock } = require('hardhat')
const { ethers } = require('hardhat')
const abis = require("@unlock-protocol/contracts");

// deploy the Unlock contract
async function main() {
  
  // await unlock.deployUnlock();
  
  // deploy the template
  // await unlock.deployPublicLock();
  
  // deploy the entire protocol (localhost only)
  const unlockContract = await unlock.deployProtocol();
  console.log("Unlock Protocol deployed to:", unlockContract.unlock.target);
  
  // create a lock with proper values
  const lockArgs = {
    expirationDuration: 60 * 60 * 24 * 7, // 7 days
    currencyContractAddress: null, // null for ETH
    keyPrice: ethers.parseEther("0.1").toString(), // 0.1 ETH in wei
    maxNumberOfKeys: 100,
    name: "A Demo Lock",
  };

  // Create the lock and get the transaction
  const lockTx = await unlock.createLock(lockArgs);
  console.log("Lock deployed to:", lockTx.lockAddress);

  // Get the lock contract instance using Unlock's ABI
  const [deployer] = await ethers.getSigners();
  const lock = new ethers.Contract(
    lockTx.lockAddress,
    abis.PublicLockV15.abi,
    deployer
  );
  
  // Verify the lock configuration
  console.log("\nLock Configuration:");
  console.log("Lock Address:", lock.target);
  try {
    const price = await lock.keyPrice();
    const name = await lock.name();
    const duration = await lock.expirationDuration();
    
    console.log("Key Price:", ethers.formatEther(price), "ETH");
    console.log("Name:", name);
    console.log("Expiration Duration:", duration.toString(), "seconds");
    
    // Save this address for the mint script
    console.log("\nUse this address in your mint.js script:");
    console.log("const contractAddress =", `"${lock.target}";`);
  } catch (error) {
    console.error("Error reading lock configuration:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });