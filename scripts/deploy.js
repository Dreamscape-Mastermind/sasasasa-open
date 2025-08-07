const hre = require("hardhat");

async function main() {
    const LockStorage = await hre.ethers.getContractFactory("Lock");
    const lockStorage = await LockStorage.deploy(1740076878);

    await lockStorage.waitForDeployment();
    console.log("Contract deployed to:", await lockStorage.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});