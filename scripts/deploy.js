const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { sleep } = require("@axelar-network/axelarjs-sdk");

async function main() {
  const chains = require("../data/chains.json");
  const polygon = chains.filter((item) => item.name === "Polygon")[0];

  // console.log("deploying swaphelper");
  // const SwapHelper = await ethers.getContractFactory("SwapHelper");
  // const swapHelper = await SwapHelper.deploy(polygon.router);
  // await swapHelper.deployed();
  // polygon.swapHelper = swapHelper.address;
  // console.log("deploy swap helper : ", swapHelper.address);

  console.log("----------------------------------------");
  console.log("deploying main contract...");
  const GTSave = await ethers.getContractFactory("GTSave");
  const gtSave = await GTSave.deploy(
    polygon.gateway,
    polygon.gasReceiver,
    polygon.usdc,
    polygon.aToken,
    polygon.poolUsdc,
    polygon.wmatic
  );
  await gtSave.deployed();
  polygon.contractAddress = gtSave.address;
  console.log("Deployed main-contract: ", gtSave.address);
  console.log();

  console.log("------------------------------------------");
  console.log("deploying vrf consumer...");
  const keyHash =
    "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";
  const sId = 4267;
  const vrfCoordinator = "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed";

  const Consumer = await ethers.getContractFactory("VRFV2Consumer");
  const consumer = await Consumer.deploy(
    sId,
    keyHash,
    vrfCoordinator,
    gtSave.address
  );
  await consumer.deployed();
  polygon.vrfConsumer = consumer.address;
  console.log("Deployed vrf consumer :", consumer.address);

  console.log("------------------------------");
  console.log("verify contract on polygonscan");
  console.log("-------------------------------");

  await sleep(10);

  await run(`verify:verify`, {
    address: gtSave.address,
    constructorArguments: [
      polygon.gateway,
      polygon.gasReceiver,
      polygon.usdc,
      polygon.aToken,
      polygon.poolUsdc,
      polygon.wmatic,
    ],
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
