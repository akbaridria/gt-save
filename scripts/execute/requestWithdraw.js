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

async function main() {
  const chains = require("../../data/chains.json");
  const avalanche = chains.filter((item) => item.name === "Avalanche");
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.JsonRpcProvider(avalanche[0].rpc);

  const signer = new ethers.Wallet(process.env.PRIV_KEY2, provider);
  const amount = ethers.utils.parseUnits("1", "6");

  console.log("Start testing to request withdraw..");
  console.log("-------------------------------------");
  console.log();
  const gTSaveConnector = new Contract(
    avalanche[0].contractAddress,
    Connector.abi,
    signer
  );

  console.log("get estimated fee on dest chain..");
  console.log("---------------------------------");
  console.log();
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gasFee = await api.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.MOONBEAM,
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
    EvmChain.MOONBEAM,
    EvmChain.AVALANCHE,
    GasToken.AVAX,
    500000,
    1.5
  );
  const amountFee = ethers.BigNumber.from(feeBack);
  console.log("estimated fee back in avax : ", feeBack);
  console.log();
  console.log("sending tx to request withdraw..");
  console.log("-------------------------------");

  const tx = await gTSaveConnector.requestWithdraw(
    amount,
    moonbeam[0].contractAddress,
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
