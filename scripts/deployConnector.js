const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { sleep } = require("@axelar-network/axelarjs-sdk");

async function main() {
  const chains = require("../data/chains.json");
  const gateway = chains.filter((item) => item.name === network.name)[0]
    .gateway;
  const gasReceiver = chains.filter((item) => item.name === network.name)[0]
    .gasReceiver;

  console.log("deploying contract-connector...");
  console.log("--------------------------------");
  const Connector = await ethers.getContractFactory("GTSaveConnector");

  const connector = await Connector.deploy(gateway, gasReceiver);

  await connector.deployed();
  chains.filter((item) => item.name === network.name)[0].contractAddress =
    connector.address;

  await sleep(10);

  if (chains.filter((item) => item.name === network.name)[0].isEtherscan) {
    console.log("Deployed contract connector: ", connector.address);
    console.log();

    console.log("verify contract on etherscan. ");
    console.log("-------------------------------");

    await sleep(10);

    await run(`verify:verify`, {
      address: connector.address,
      constructorArguments: [gateway, gasReceiver],
    });

    console.log("contract address verified on etherscan!");
  }

  const filePath = path.join(__dirname, "../data/chains.json");
  await fs.writeFileSync(filePath, JSON.stringify(chains, null, 2));
  console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
