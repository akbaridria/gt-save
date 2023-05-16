const tdly = require("@tenderly/hardhat-tenderly");
tdly.setup({ automaticVerifications: true });

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const chains = require("./data/chains.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    Polygon: {
      url: chains.filter((item) => item.name === "Polygon")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    Avalanche: {
      url: chains.filter((item) => item.name === "Avalanche")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    binance: {
      url: chains.filter((item) => item.name === "binance")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    Fantom: {
      url: chains.filter((item) => item.name === "Fantom")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    Moonbeam: {
      url: chains.filter((item) => item.name === "Moonbeam")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    aurora: {
      url: chains.filter((item) => item.name === "aurora")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    celo: {
      chainId: chains.filter((item) => item.name === "celo")[0].chainId,
      url: chains.filter((item) => item.name === "celo")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    arbitrum: {
      url: chains.filter((item) => item.name === "arbitrum")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    optimism: {
      url: chains.filter((item) => item.name === "optimism")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    base: {
      chainId: chains.filter((item) => item.name === "base")[0].chainId,
      url: chains.filter((item) => item.name === "base")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    filecoin: {
      chainId: chains.filter((item) => item.name === "filecoin")[0].chainId,
      url: chains.filter((item) => item.name === "filecoin")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    kava: {
      chainId: chains.filter((item) => item.name === "kava")[0].chainId,
      url: chains.filter((item) => item.name === "kava")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
    "ethereum-2": {
      url: chains.filter((item) => item.name === "ethereum-2")[0].rpc,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2],
    },
  },
  tenderly: {
    username: "akbaridria", // tenderly username (or organization name)
    project: "gt-save", // project name
    privateVerification: false, // if true, contracts will be verified privately, if false, contracts will be verified publicly
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      ftmTestnet: process.env.FTMSCAN_API_KEY,
      moonbaseAlpha: process.env.MOONBEAMSCAN_API_KEY,
      celo: process.env.CELOSCAN_API_KEY,
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      optimisticGoerli: process.env.OPTIMISM_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "celo",
        chainId: chains.filter((item) => item.name === "celo")[0].chainId,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io/",
        },
      },
    ],
  },
};
