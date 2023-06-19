const ethers = require("ethers");
const gtSaveContract = require("../artifacts/contracts/gt-save/GTSave.sol/GTSave.json");
const gtSaveConnector = require("../artifacts/contracts/gt-save/GTSaveConnector.sol/GTSaveConnector.json");
const erc20 = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
const mErc20 = require("../data/mUSDC.json");
const chains = require("../data/chains.json");
const batchPreAbi = require("../data/batch.json");
const batchPreCompile = "0x0000000000000000000000000000000000000808";

const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

export const getCountDown = async () => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const providerPol = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    providerPol
  );
  const end = await gtsave.endRoundDate();
  return ethers.BigNumber.from(end).toNumber();
};

export const getTotalDeposit = async () => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const providerPol = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    providerPol
  );
  const total = await gtsave.totalDeposit();
  return new Intl.NumberFormat().format(ethers.utils.formatEther(total));
};

export const getPrize = async () => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const providerPol = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    providerPol
  );
  const merc20 = new ethers.Contract(moonbeam[0].poolUsdc, mErc20, providerPol);

  const totalDeposit = await gtsave.totalDeposit();
  const exchangeRate = await merc20.exchangeRateStored();
  const totalBalance = await merc20.balanceOf(moonbeam[0].contractAddress);
  const total = exchangeRate
    .mul(totalBalance)
    .sub(totalDeposit)
    .div(ethers.utils.parseUnits("1", "28"));
  return parseFloat(ethers.utils.formatEther(total)).toFixed(6);
};

export const getRound = async () => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const providerPol = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    providerPol
  );
  const total = await gtsave.roundId();
  return ethers.BigNumber.from(total).toNumber();
};

export const getUserData = async (sender) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    providerPol
  );
  const userData = await gtsave.getUserData(sender);
  return userData;
};

export const getUsdcBalance = async (sender, chain) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const ierc20 = new ethers.Contract(
    chain[0].name === "Moonbeam" ? chain[0].usdc : chain[0].axlToken,
    erc20.abi,
    signerPol
  );
  const balance = await ierc20.balanceOf(sender);
  return ethers.utils.formatUnits(
    balance,
    chain[0].name === "Moonbeam" ? 18 : 6
  );
};

export const estimateDepositGas = async (params) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();

  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );

  const gas = await gtsave.estimateGas.deposit(params);
  const gasPrice = await provider.getGasPrice();
  return ethers.BigNumber.from(gas.mul(gasPrice)).toNumber() / 1e18;
};

export const estimateDepositGasOther = async (chain, amount, amountGas) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );

  const gas = await gtsave.estimateGas.requestDeposit(
    amount,
    polygon[0].contractAddress,
    {
      value: amountGas,
    }
  );
  const gasPrice = await provider.getGasPrice();
  return ethers.BigNumber.from(gas.mul(gasPrice)).toNumber() / 1e18;
};

export const estimateGasApprove = async (chain, amount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const ierc20 = new ethers.Contract(
    chain[0].name === "Polygon" ? chain[0].usdc : chain[0].axlToken,
    erc20.abi,
    signerPol
  );
  const gas = await ierc20.estimateGas.approve(
    chain[0].contractAddress,
    amount
  );
  const gasPrice = await provider.getGasPrice();
  return ethers.BigNumber.from(gas.mul(gasPrice)).toNumber() / 1e18;
};

export const checkAllowance = async (chain) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const ierc20 = new ethers.Contract(
    chain[0].name === "Polygon" ? chain[0].usdc : chain[0].axlToken,
    erc20.abi,
    signerPol
  );
  const allowance = await ierc20.allowance(
    signerPol.getAddress(),
    chain[0].contractAddress
  );
  return ethers.BigNumber.from(allowance).toNumber();
};

export const axelarDepositFee = async (chain) => {
  if (chain[0].name === "filecoin") {
    return ethers.utils.parseUnits("2");
  } else {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
    const gasFee = await api.estimateGasFee(
      chain[0].fee,
      EvmChain["POLYGON"],
      chain[0].symbol,
      1000000,
      1.5
    );
    return ethers.utils.formatUnits(ethers.BigNumber.from(gasFee), 18);
  }
};

export const approveTx = async (chain, amount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const ierc20 = new ethers.Contract(
    chain[0].name === "Polygon" ? chain[0].usdc : chain[0].axlToken,
    erc20.abi,
    signerPol
  );
  const tx = await ierc20.approve(chain[0].contractAddress, amount);
  await tx.wait();
};

export const depositOthers = async (chain, amount, amountGas) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestDeposit(
    amount,
    moonbeam[0].contractAddress,
    {
      value: amountGas,
    }
  );
  return tx;
};

export const getFeeAxelarTwoWay = async (chain) => {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gasFee = await api.estimateGasFee(
    chain[0].fee,
    "polygon",
    chain[0].symbol,
    1000000,
    2
  );

  const feeBack = await api.estimateGasFee(
    "polygon",
    chain[0].fee,
    chain[0].symbol,
    1000000,
    2
  );
  return ethers.utils.formatUnits(
    ethers.BigNumber.from(gasFee).add(ethers.BigNumber.from(feeBack)),
    18
  );
};

export const withdrawOnPolygon = async (amount) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const tx = await gtsave.withdraw(amount, { gasLimit: 500000 });
  return tx;
};

export const withdrawOthers = async (chain, amount, amountGas) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestWithdraw(
    amount,
    polygon[0].contractAddress,
    {
      value: amountGas,
      gasLimit: 500000,
    }
  );
  return tx;
};

export const claimOnPolygon = async (roundId) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const tx = await gtsave.claim(roundId, { gasLimit: 500000 });
  return tx;
};

export const claimOthersOthers = async (chain, roundId, amountGas) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestClaimPrize(
    roundId,
    polygon[0].contractAddress,
    {
      value: amountGas,
      gasLimit: 500000,
    }
  );
  return tx;
};

export const estimateBatchDeposit = async (amount) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();
  const batchReq = new ethers.Contract(batchPreCompile, batchPreAbi, signer);
  const ifaceErc = new ethers.utils.Interface(erc20.abi);
  const ifaceGtsave = new ethers.utils.Interface(gtSaveContract.abi);
  const callDataAapprove = ifaceErc.encodeFunctionData("approve", [
    moonbeam[0].contractAddress,
    amount,
  ]);
  const callDataDeposit = ifaceGtsave.encodeFunctionData("deposit", [amount]);

  const gas = await batchReq.estimateGas.batchAll(
    [moonbeam[0].usdc, moonbeam[0].contractAddress],
    [],
    [callDataAapprove, callDataDeposit],
    []
  );
  const gasPrice = await provider.getGasPrice();
  return ethers.BigNumber.from(gas.mul(gasPrice)).toNumber() / 1e18;
};

export const batchDeposit = async (amount) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();
  const batchReq = new ethers.Contract(batchPreCompile, batchPreAbi, signer);
  const ifaceErc = new ethers.utils.Interface(erc20.abi);
  const ifaceGtsave = new ethers.utils.Interface(gtSaveContract.abi);
  const callDataAapprove = ifaceErc.encodeFunctionData("approve", [
    moonbeam[0].contractAddress,
    amount,
  ]);
  const callDataDeposit = ifaceGtsave.encodeFunctionData("deposit", [amount]);

  const tx = await batchReq.batchAll(
    [moonbeam[0].usdc, moonbeam[0].contractAddress],
    [],
    [callDataAapprove, callDataDeposit],
    []
  );
  return tx;
};