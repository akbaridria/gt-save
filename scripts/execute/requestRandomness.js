const { ethers, Contract } = require("ethers");
require("dotenv").config();
const VrfConsumer = require("../../artifacts/contracts/VRFConsumer.sol/VRFConsumer.json");

async function requestRandom() {
  const chains = require("../../data/chains.json");
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);

  const vrfConsumer = new Contract(
    moonbeam[0].vrfConsumer,
    VrfConsumer.abi,
    signer
  );

  const tx = await vrfConsumer.makeRequestUint256();
  const receipt = await tx.wait();
  console.log("done:", receipt.transactionHash);
}

requestRandom();
