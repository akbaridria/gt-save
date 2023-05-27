const ethers = require("ethers");
const gtSaveContract = require("../artifacts/contracts/gt-save/GTSave.sol/GTSave.json");
const gtSaveConnector = require("../artifacts/contracts/gt-save/GTSaveConnector.sol/GTSaveConnector.json");
const erc20 = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const chains = require("../data/chains.json");
const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} = require("@axelar-network/axelarjs-sdk");

export const getCountDown = async (privKey) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(privKey, providerPol);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const end = await gtsave.endRoundDate();
  return ethers.BigNumber.from(end).toNumber();
};

export const getTotalDeposit = async (privKey) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(privKey, providerPol);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const total = await gtsave.totalDeposit();
  return new Intl.NumberFormat().format(
    ethers.BigNumber.from(total).toNumber() / 1e6
  );
};

export const getPrize = async (privKey) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(privKey, providerPol);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const total = await gtsave.getClaimablePrize();
  return new Intl.NumberFormat().format(
    ethers.BigNumber.from(total).toNumber() / 1e6
  );
};

export const getRound = async (privKey) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(privKey, providerPol);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const total = await gtsave.roundId();
  return ethers.BigNumber.from(total).toNumber();
};

export const getUserData = async (privKey, sender) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const providerPol = new ethers.providers.JsonRpcProvider(polygon[0].rpc);
  const signerPol = new ethers.Wallet(privKey, providerPol);
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const userData = await gtsave.getUserData(sender);
  return userData;
};

export const getUsdcBalance = async (sender, chain) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const ierc20 = new ethers.Contract(
    chain[0].name === "Polygon" ? chain[0].usdc : chain[0].axlToken,
    erc20.abi,
    signerPol
  );
  const balance = await ierc20.balanceOf(sender);
  return ethers.BigNumber.from(balance).toNumber() / 1e6;
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
      EvmChain[chain[0].fee],
      EvmChain["POLYGON"],
      GasToken[chain[0].symbol],
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

export const depositOnPolygon = async (amount) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    polygon[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const tx = await gtsave.deposit(amount);
  return tx;
};

export const depositOthers = async (chain, amount, amountGas) => {
  const polygon = chains.filter((item) => item.name === "Polygon");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestDeposit(
    amount,
    polygon[0].contractAddress,
    {
      value: amountGas,
    }
  );
  return tx;
};
