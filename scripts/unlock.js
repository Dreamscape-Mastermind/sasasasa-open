// import { unlock } from "hardhat";


// const { unlock } = require('hardhat')
const { ethers } = require('hardhat')
const unlockPackage = require("@unlock-protocol/contracts");
const abis = require("@unlock-protocol/contracts");
// deploy the Unlock contract
async function main() {
  console.log("Deploying Unlock Contract on Scroll Sepolia");
  
  // Get the contract factory using ABI and bytecode
  const UnlockFactory = new ethers.ContractFactory(
    unlockPackage.UnlockV14.abi,
    unlockPackage.UnlockV14.bytecode,
    (await ethers.getSigners())[0]
  );

  // Deploy the contract and wait for deployment
  const unlockContract = await UnlockFactory.deploy();
  // In v6, we need to wait for deployment explicitly
  await unlockContract.waitForDeployment();
  
  // In v6, we use getAddress() instead of address
  console.log(`Unlock Contract deployed to: ${await unlockContract.getAddress()}`);

  // create a lock with proper values matching the ABI
  const lockArgs = {
    _expirationDuration: 60 * 60 * 24 * 7, // 7 days
    _tokenAddress: ethers.ZeroAddress, // ETH by using zero address
    _keyPrice: ethers.parseEther("0.1"), // 0.1 ETH
    _maxNumberOfKeys: 100,
    _lockName: "A Demo Event Ticket Type i.e Lock",
    _salt: ethers.hexlify(ethers.randomBytes(12)) // Generate random bytes12 salt
  };

  console.log("Creating lock with args:", lockArgs);

  // Create lock using the deployed Unlock contract with all required parameters
  const createLockTx = await unlockContract.createLock(
    lockArgs._expirationDuration,
    lockArgs._tokenAddress,
    lockArgs._keyPrice,
    lockArgs._maxNumberOfKeys,
    lockArgs._lockName,
    lockArgs._salt // Add the bytes12 parameter
  );

  const receipt = await createLockTx.wait();
  
  // Get the NewLock event from the transaction receipt
  const newLockEvent = receipt.logs.find(log => {
    try {
      const parsed = unlockContract.interface.parseLog(log);
      return parsed.name === 'NewLock';
    } catch (e) {
      return false;
    }
  });

  if (newLockEvent) {
    const parsedLog = unlockContract.interface.parseLog(newLockEvent);
    const lockAddress = parsedLog.args.newLockAddress;
    console.log("Lock deployed to:", lockAddress);

    // Get the lock contract instance
    const lock = new ethers.Contract(
      lockAddress,
      unlockPackage.PublicLockV15.abi,
      (await ethers.getSigners())[0]
    );

    // Verify the lock configuration
    console.log("\nLock Configuration:");
    try {
      const price = await lock.keyPrice();
      const name = await lock.name();
      const duration = await lock.expirationDuration();
      
      console.log("Lock Address:", await lock.getAddress());
      console.log("Key Price:", ethers.formatEther(price), "ETH");
      console.log("Name:", name);
      console.log("Expiration Duration:", duration.toString(), "seconds");
    } catch (error) {
      console.error("Error reading lock configuration:", error);
    }
  } else {
    console.error("NewLock event not found in transaction receipt");
  }
}

async function getContractABI() {
    // Replace with your contract address
    const contractAddress = "0x5b4E9Aef9B95b4762f341BAaA7958285C98F6FD8";
    
    // Create contract instance using the ABI from the package
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(
        contractAddress,
        unlockPackage.UnlockV14.abi,
        signer
    );
    
    // Get interface
    const iface = contract.interface;
    
    // Find all createLock related functions
    console.log("\nCreateLock functions:");
    const createLockFunctions = iface.fragments.filter(f => 
        f.type === 'function' && f.name === 'createLock'
    );
    
    createLockFunctions.forEach((fragment, index) => {
        console.log(`\nCreateLock variant ${index + 1}:`);
        console.log("Function:", fragment.format());
        console.log("Inputs:", fragment.inputs);
    });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// getContractABI()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });