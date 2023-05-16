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

async function main() {
  const chains = require("../../data/chains.json");
  const avalanche = chains.filter((item) => item.name === "Avalanche");
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.JsonRpcProvider(avalanche[0].rpc);
  const signer = new ethers.Wallet(process.env.PRIV_KEY, provider);
  const amount = ethers.utils.parseUnits("5", "6");

  console.log("Starting testing to request deposit..");
  console.log("-------------------------------------");

  const gTSaveConnector = new Contract(
    avalanche[0].contractAddress,
    Connector.abi,
    signer
  );

  const tokenContract = new Contract(avalanche[0].axlToken, IERC20.abi, signer);

  console.log("approveing ausdc");
  console.log("-----------------");
  const approvalTx = await tokenContract.approve(
    gTSaveConnector.address,
    amount
  );
  await approvalTx.wait();
  console.log("approved!");

  console.log("get estimated fee on dest chain..");
  console.log("---------------------------------");

  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gasFee = await api.estimateGasFee(
    EvmChain.CELO,
    EvmChain.POLYGON,
    GasToken.AVAX,
    1000000
  );
  console.log("etimated fee in avax: ", gasFee);

  console.log("sending tx to request deposit..");
  console.log("-------------------------------");

  const tx = await gTSaveConnector.requestDeposit(
    amount,
    polygon[0].contractAddress,
    {
      value: ethers.BigNumber.from(gasFee),
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
