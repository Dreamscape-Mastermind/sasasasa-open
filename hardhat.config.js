require("@nomicfoundation/hardhat-toolbox");
require('@unlock-protocol/hardhat-plugin')
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
    },
    scrollZkEVMSepolia: {
      chainId: 534351,
      httpHeaders: {
        "Content-Type": "application/json",
      },
      url: "https://scroll-sepolia-rpc.publicnode.com", // Replace with the correct Scroll zkEVM RPC URL
      accounts: [process.env.ACCOUNT_PRIVATE_KEY], // Use your private key from the .env file
    },
  },
};
