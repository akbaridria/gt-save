const tdly = require("@tenderly/hardhat-tenderly");
tdly.setup({ automaticVerifications: true });

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    "polygon-testnet": {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    "avalanche-testnet": {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
  },
  tenderly: {
    username: "akbaridria", // tenderly username (or organization name)
    project: "gt-save", // project name
    privateVerification: false, // if true, contracts will be verified privately, if false, contracts will be verified publicly
  },
};
