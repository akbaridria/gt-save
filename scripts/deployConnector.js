const { ethers } = require("hardhat");

async function main() {
  const chains = require("../data/chains.json");
  const avalanche = chains.filter((item) => item.name === "Avalanche")[0];
  const Connector = await ethers.getContractFactory("GTSaveConnector");
  const connector = await Connector.deploy(
    avalanche.gateway,
    avalanche.gasReceiver
  );
  console.log("deploying contract-connector...");
  console.log("--------------------------------");
  await connector.deployed();
  console.log("Deployed contract connector: ", connector.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
