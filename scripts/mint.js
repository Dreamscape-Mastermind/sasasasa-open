// const ethers = require('ethers');
const { ethers } = require('hardhat')
const lockAbi = require('../artifacts/contracts/Lock.sol/Lock.json').abi//('artifacts/contracts/Lock.sol/Lock.json')
// const Lock = await ethers.getContractFactory("Lock");
// const lock = await Lock.attach("0x0165878A594ca255338adfa4d48449f69242Eb8F");
const abis = require("@unlock-protocol/contracts");

// await lock.withdraw();
// const value = await lock.get();
// console.log(lock);

// const abi = [
//   "event Transfer(address indexed from, address indexed to, uint256 indexed id)"
// ];

const contractAddress = "0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e"; // Replace with your contract address

const nftMetadata = {
  name: "Dreamscape NFT",
  description: "A unique collectible from the Dreamscape collection.",
  image: "ipfs://QmExampleHash",
  attributes: [
    { trait_type: "Rarity", value: "Legendary" },
    { trait_type: "Power", value: 100 }
  ]
};
const metadataString = JSON.stringify(nftMetadata);
const metadataBytes = ethers.toUtf8Bytes(metadataString);

async function main() {
  const [deployer] = await ethers.getSigners()
  // console.log("signers :", await ethers.getSigners())
  const MyContract = await new ethers.Contract(
    contractAddress,
    abis.PublicLockV15.abi,
    deployer
  );
  
//   const errorData = "0x17ed8646";
// const decoded = await deployer.call({
//   to: MyContract.address,
//   data: errorData
// });
// console.log("Decoded error:", decoded);


  try {
    // First, let's check the lock's configuration
    const keyPrice = await MyContract.keyPrice();
    const lockName = await MyContract.name();
    const expirationDuration = await MyContract.expirationDuration();
    
    console.log("Lock Configuration:");
    console.log("Key Price:", keyPrice);
    console.log("Lock Name:", lockName);
    console.log("Expiration Duration:", expirationDuration.toString(), "seconds");
    
    const recipient = '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E';
    const referrer = ethers.ZeroAddress;

    // const tx = await deployer.sendTransaction({
    //   to: contractAddress,
    //   value: ethers.parseEther("0.5") // Send 0.5 ETH
    // });
    // await tx.wait();
    // console.log("Funded contract with 0.5 ETH");
    
    
    console.log("Attempting purchase with:");
    console.log("Recipient:", recipient);
    console.log("Price:", ethers.formatEther(keyPrice), "ETH");
    
    // Convert arrays to the correct format
    const prices = [keyPrice];
    const recipients = [recipient];
    const referrers = [deployer.address];
    const encodedMetadata = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [metadataString]);
    const data = [encodedMetadata];
    
    console.log("Purchase parameters:");
    console.log("Prices:", prices);
    console.log("Recipients:", recipients);
    console.log("Referrers:", referrers);
    console.log("key manager:", [deployer.address])
    console.log("Data:", data);
    
    let dat = await MyContract.purchase(
      prices,
      recipients,
      referrers,
      recipients,
      ['0x'],
      {
        value: keyPrice,
        gasLimit: 10000000
      }
    );
    await dat.wait();
    console.log("Purchase successful:", dat.hash);
    // let trx = await MyContract.purchase(
    //   [ethers.parseEther("0.1")], 
    //   [recipient], 
    //   [deployer.address], // Set referrer to deployer
    //   [recipient], // Set keyManager to recipient
    //   [], // No metadata
    //   { value: ethers.parseEther("0.1") } // Ensure correct ETH amount
    // );
    // let receipt = await trx.wait();
    // console.log("receipts",receipt.events);
    // let grant = await MyContract.grantKeys(recipients, [60 * 60 * 24 * 7], [deployer.address])
    // await grant.wait()
    // console.log("Grant Keys :", grant.hash)
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

main();

// await ethers.provider.call({
//   to: "0x1A7A3e29c3c4b3C858f2DeD8bE6ed51A07589ecF",
//   data: "0x17ed8646"
// });
