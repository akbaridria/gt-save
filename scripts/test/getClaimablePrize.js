const { ethers, Contract } = require("ethers");
require("dotenv").config();
const GTSave = require("../../artifacts/contracts/gt-save/GTSave.sol/GTSave.json");
const ERC20 = require("../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");

async function getRate() {
  const chains = require("../../data/chains.json");
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);
  const amount = ethers.utils.parseUnits("5", "6");

  const swapHelper = new Contract(
    polygon[0].contractAddress,
    GTSave.abi,
    signer
  );

  const d = await swapHelper.getClaimablePrize();
  console.log(d);
}

getRate();
