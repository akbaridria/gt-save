const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { sleep } = require("@axelar-network/axelarjs-sdk");

async function main() {
  const chains = require("../data/chains.json");
  const moonbeam = chains.filter((item) => item.name === "Moonbeam")[0];

  console.log("------------------------------------------");
  console.log("deploying vrf consumer...");

  const Consumer = await ethers.getContractFactory("VRFConsumer");
  const consumer = await Consumer.deploy(
    moonbeam.nodary,
    moonbeam.contractAddress
  );
  await consumer.deployed();
  moonbeam.vrfConsumer = consumer.address;
  console.log("Deployed vrf consumer :", consumer.address);

  console.log("------------------------------");
  console.log("verify contract on moonscan");
  console.log("-------------------------------");

  await sleep(10);

  await run(`verify:verify`, {
    address: consumer.address,
    constructorArguments: [moonbeam.nodary, moonbeam.contractAddress],
  });

  console.log("Verify Complete!");
  console.log("");

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
