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
  const e = await swapHelper.getUserData(
    "0x694aCF4DFb7601F92A0D2a41cdEC5bf7726C7294"
  );
  console.log(e.listWin);
  // const d = await swapHelper.getUserData(
  //   "0x1cBef56F09317ca4FB110cF3eDdF3Bcc7DeAE6A5"
  // );
  // console.log(d);
  // const tokenContract = new Contract(polygon[0].usdc, ERC20.abi, signer);
  // const tokenaUSDC = new Contract(polygon[0].axlToken, ERC20.abi, signer);
  // const d = await tokenaUSDC.approve(swapHelper.address, amount);
  // d.wait();
  // console.log(d);
  // console.log("approved");
  // const r = await swapHelper.Withdraw(10010000000, {
  //   gasLimit: 500000,
  // });
  // r.wait();
  // console.log(r);
  // const e = await swapHelper.deposit(amount, {
  //   gasLimit: 500000,
  // });
  // e.wait();
  // console.log(e);
  // const data = await swapHelper.Withdraw(ethers.utils.parseUnits("3", "6"), {
  //   gasLimit: 300000,
  // });
  // const f = await tokenaUSDC.approve(swapHelper.address, amount);
  // d.wait();
  // console.log(f);
  // console.log("approved");
  // const payload = {
  //   amount: amount,
  //   user: "0x694aCF4DFb7601F92A0D2a41cdEC5bf7726C7294",
  //   id: 1,
  //   gasToken: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
  //   amountGas: amount,
  //   sourceChain: "Avalanche",
  //   sourceAddress: "0xeFb965d27DB0E00A7de74A5F06cc5168ED55ce84",
  //   tokenSymbol: "aUSDC",
  // };
  // // const gasEstimated = await swapHelper.estimateGas.receiveAndWithdraw(payload);
  // // console.log(gasEstimated);
  // const data = await swapHelper.receiveAndWithdraw(payload, {
  //   gasLimit: 1000000,
  // });
  // console.log(data);
  // console.log(data);
  // console.log(data);
  // const data = await swapHelper.getUserData(
  //   "0x694aCF4DFb7601F92A0D2a41cdEC5bf7726C7294"
  // );
  // console.log(data);
}

getRate();
