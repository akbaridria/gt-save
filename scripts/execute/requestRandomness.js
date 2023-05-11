const { ethers, Contract } = require("ethers");
require("dotenv").config();
const VrfConsumer = require("../../artifacts/contracts/VRFV2Consumer.sol/VRFV2Consumer.json");

async function requestRandom() {
  const chains = require("../../data/chains.json");
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);

  const vrfConsumer = new Contract(
    polygon[0].vrfConsumer,
    VrfConsumer.abi,
    signer
  );

  const tx = await vrfConsumer.requestRandomWords();
  const receipt = await tx.wait();
  console.log("done:", receipt.transactionHash);
}

requestRandom();
