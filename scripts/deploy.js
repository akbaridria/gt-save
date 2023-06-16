const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { sleep } = require("@axelar-network/axelarjs-sdk");

async function main() {
  const chains = require("../data/chains.json");
  const moonbeam = chains.filter((item) => item.name === "Moonbeam")[0];

  // console.log("deploying swaphelper");
  // const SwapHelper = await ethers.getContractFactory("SwapHelper");
  // const swapHelper = await SwapHelper.deploy(moonbeam.router);
  // await swapHelper.deployed();
  // moonbeam.swapHelper = swapHelper.address;
  // console.log("deploy swap helper : ", swapHelper.address);

  console.log("----------------------------------------");
  console.log("deploying main contract...");
  const GTSave = await ethers.getContractFactory("GTSave");
  const gtSave = await GTSave.deploy(
    moonbeam.gateway,
    moonbeam.gasReceiver,
    moonbeam.usdc,
    moonbeam.poolUsdc
  );
  await gtSave.deployed();
  moonbeam.contractAddress = gtSave.address;
  console.log("Deployed main-contract: ", gtSave.address);
  console.log();

  console.log("------------------------------");
  console.log("verify contract on moonbeamscan");
  console.log("-------------------------------");

  await sleep(10);

  await run(`verify:verify`, {
    address: gtSave.address,
    constructorArguments: [
      moonbeam.gateway,
      moonbeam.gasReceiver,
      moonbeam.usdc,
      moonbeam.poolUsdc,
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
