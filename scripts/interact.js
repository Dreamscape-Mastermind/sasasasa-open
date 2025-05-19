const { ethers } = require('hardhat')
const abis = require("@unlock-protocol/contracts");


const contractAddress = "0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e";
async function main() {
  const [deployer] = await ethers.getSigners()
  const MyContract = await new ethers.Contract(
    contractAddress,
    abis.PublicLockV15.abi,
    deployer
  );
  

  try {
    // First, let's check the lock's configuration
    // const keyPrice = await MyContract.symbol();
    // const lockName = await MyContract.name();
    
    // Add error handling and logging for tokenURI
    try {
      const baseTokenURI = await MyContract.tokenURI(0);
      console.log("Base Token URI:", baseTokenURI);
      
      const tokenURI = await MyContract.tokenURI(1);
      console.log("Raw Token URI Response:", tokenURI);

      
      await MyContract.setLockMetadata("Dreamscape mastermind", "DSM", "ipfs://ourTokenURI")
      // Verify the token exists
      // const exists = await MyContract.getHasValidKey(1);
      // console.log("Token 2 exists:", exists);
      
      // Get token owner
      const owner = await MyContract.ownerOf(3);
      console.log("Token 2 owner:", owner);
    } catch (tokenError) {
      console.log("Error fetching token URI:", tokenError.message);
    }
    
    const numberOfOwners = await MyContract.numberOfOwners()
    const keyPrice = await MyContract.symbol();
    const lockName = await MyContract.name();
    console.log("Lock Configuration:");
    console.log("Symbol:", keyPrice);
    console.log("Number of owners:", numberOfOwners.toString());
    console.log("Lock Name:", lockName);
    
    const isLockManager = await MyContract.isLockManager(deployer.address);
    console.log('Is deployer a lock manager?', isLockManager);
      
    

  } catch(error) {
    console.log('error :', error);
    if (error.data) {
      console.log('Error data:', error.data);
    }
    
    // Additional debugging information
    try {
      const isLockManager = await MyContract.isLockManager(deployer.address);
      console.log('Is deployer a lock manager?', isLockManager);
      
      const balance = await deployer.provider.getBalance(deployer.address);
      console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');
      
      const contractBalance = await deployer.provider.getBalance(contractAddress);
      console.log('Contract balance:', ethers.formatEther(contractBalance), 'ETH');
    } catch (e) {
      console.log('Could not fetch additional info:', e.message);
    }
  }
}

// async function getTokenURI(lockAddress, tokenId) {
//   const lock = await ethers.getContractAt("IPublicLock", lockAddress);
//   const uri = await lock.tokenURI(tokenId);
//   console.log(`Token URI for token ${tokenId}:`, uri);
//   return uri;
// }
// getTokenURI(contractAddress, 2)
main();

