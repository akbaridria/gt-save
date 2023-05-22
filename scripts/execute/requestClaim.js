const hre = require("hardhat");
const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

const { ethers, Contract } = require("ethers");
require("dotenv").config();

const Connector = require("../../artifacts/contracts/gt-save/GTSaveConnector.sol/GTSaveConnector.json");
const IERC20 = require("../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const SwapHelper = require("../../artifacts/contracts/SwapHelper.sol/SwapHelper.json");

async function main() {
  const chains = require("../../data/chains.json");
  const avalanche = chains.filter((item) => item.name === "Avalanche");
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.JsonRpcProvider(avalanche[0].rpc);
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(process.env.PRIV_KEY, providerPol);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);
  const amount = ethers.utils.parseUnits("5", "6");

  console.log("Start testing to request claim prize..");
  console.log("-------------------------------------");
  console.log();
  const gTSaveConnector = new Contract(
    avalanche[0].contractAddress,
    Connector.abi,
    signer
  );

  const tokenContract = new Contract(avalanche[0].axlToken, IERC20.abi, signer);

  const swapHelper = new Contract(
    polygon[0].swapHelper,
    SwapHelper.abi,
    signerPol
  );

  console.log("get estimated fee on dest chain..");
  console.log("---------------------------------");
  console.log();
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gasFee = await api.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.POLYGON,
    GasToken.AVAX,
    1000000,
    1.5
  );
  console.log("etimated fee in avax: ", gasFee);
  console.log();

  console.log("get estimated fee on dest chain to send back token...");
  console.log(
    "-----------------------------------------------------------------------"
  );
  console.log();
  const feeBack = await api.estimateGasFee(
    EvmChain.POLYGON,
    EvmChain.AVALANCHE,
    GasToken.AVAX,
    500000,
    1.5
  );
  const amountFee = ethers.BigNumber.from(feeBack);
  console.log("estimated fee back in avax : ", feeBack);
  console.log();
  console.log("sending tx to request claim..");
  console.log("-------------------------------");

  const tx = await gTSaveConnector.requestClaimPrize(
    10000000,
    polygon[0].contractAddress,
    {
      value: ethers.BigNumber.from(gasFee).add(amountFee),
      gasLimit: 500000,
    }
  );
  const receipt = await tx.wait();
  console.log("Transaction receipt:", receipt.transactionHash);
  console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
