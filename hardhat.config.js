require("@nomicfoundation/hardhat-toolbox");
require('@unlock-protocol/hardhat-plugin')
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "paris"
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account 1
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Account 2
        '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Account 3
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', // Account 4
        '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', // Account 5
        '0x8b3a350cf5c6717558e90c1908f31a17a5b8929b4913a3cf0468e387afdb00e1', // Account 6
        '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e', // Account 7
        '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356', // Account 8
        '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d50e5c77333', // Account 9
      ]
    },
    scrollZkEVMSepolia: {
      chainId: 534351,
      httpHeaders: {
        "Content-Type": "application/json",
      },
      url: "https://scroll-sepolia-rpc.publicnode.com", // Replace with the correct Scroll zkEVM RPC URL
      accounts: [process.env.ACCOUNT_PRIVATE_KEY], // Use your private key from the .env file
      gasLimit: 5000000,
      timeout: 120000 // 2 minutes
    },
  },
};
