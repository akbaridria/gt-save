const fs = require("fs");
const path = require("path");
const { ethers, Contract } = require("ethers");
const GTSave = require("../artifacts/contracts/gt-save/GTSave.sol/GTSave.json");
require("dotenv").config();

async function main() {
  const chains = require("../data/chains.json");
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);

  const gt = new Contract(polygon[0].contractAddress, GTSave.abi, signer);
  const r = await gt.vrfCoordinator();
  console.log(r === "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed");
  console.log(typeof r);
  console.log(r);
  console.log("0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed");
  const real = ethers.utils.getAddress(
    "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed"
  );
  console.log(real);
}

main();
