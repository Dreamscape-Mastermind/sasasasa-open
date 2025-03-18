const hre = require("hardhat");
const { network } = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // In ethers v6, we need to use provider.getBalance() instead of signer.getBalance()
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString());
    console.log("Network:", network.name);

    // Configuration parameters
    const platformAdmin = deployer.address;
    const platformWallet = deployer.address;
    const defaultPlatformFee = 250; // 2.5% platform fee

    console.log("\nDeploying SasasasaEventFactory...");
    const SasasasaEventFactory = await hre.ethers.getContractFactory("SasasasaEventFactory");

    const factory = await SasasasaEventFactory.deploy(
      platformAdmin,
      platformWallet,
      defaultPlatformFee
    );

    // In v6, we use waitForDeployment() instead of deployed()
    console.log("Waiting for deployment transaction...");
    await factory.waitForDeployment();
    
    // In v6, we get the address using getAddress()
    const factoryAddress = await factory.getAddress();
    console.log("SasasasaEventFactory deployed to:", factoryAddress);

    // Create sample event
    console.log("\nCreating a sample event...");
    const sampleEventConfig = {
      uri: "ipfs://green-regular-cicada-808.mypinata.cloud",
      maxSupplies: [100, 200, 300],
      prices: [
        // In v6, we use parseEther from ethers
        hre.ethers.parseEther("0.001"),
        hre.ethers.parseEther("0.002"),
        hre.ethers.parseEther("0.003")
      ],
      eventOrganizer: deployer.address
    };

    const createEventTx = await factory.createEvent(
      sampleEventConfig.uri,
      sampleEventConfig.maxSupplies,
      sampleEventConfig.prices,
      sampleEventConfig.eventOrganizer
    );

    console.log("Waiting for event creation transaction...");
    const receipt = await createEventTx.wait();
    
    // Event parsing is slightly different in v6
    const eventCreatedLog = receipt.logs.find(
      log => log.fragment?.name === 'EventCreated'
    );
    const eventAddress = eventCreatedLog?.args?.eventContract;
    
    // Verification
    if (network.name === "scrollZkEVMSepolia") {
      console.log("\nWaiting 30 seconds before verification...");
      await new Promise(resolve => setTimeout(resolve, 30000));

      try {
        console.log("Verifying factory contract...");
        await hre.run("verify:verify", {
          address: factoryAddress,
          constructorArguments: [
            platformAdmin,
            platformWallet,
            defaultPlatformFee
          ],
        });
      } catch (error) {
        console.log("Verification failed:", error.message);
      }
    }

    // Deployment Summary
    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log("Network:", network.name);
    console.log("Factory Address:", factoryAddress);
    console.log("Platform Admin:", platformAdmin);
    console.log("Platform Wallet:", platformWallet);
    console.log("Default Platform Fee:", defaultPlatformFee/100, "%");
    console.log("Sample Event Address:", eventAddress);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      network: network.name,
      factoryAddress: factoryAddress,
      sampleEventAddress: eventAddress,
      platformAdmin,
      platformWallet,
      defaultPlatformFee,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      `deployment-${network.name}-${Date.now()}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

  } catch (error) {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
