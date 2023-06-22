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
  const total =
    parseFloat(
      (
        parseFloat(exchangeRate / 1e28) *
        parseFloat(ethers.utils.formatUnits(totalBalance, "8"))
      ).toFixed(6)
    ) - parseFloat(ethers.utils.formatEther(totalDeposit));
  return total < 0 ? 0 : total.toFixed(6);
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
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const providerPol = new ethers.providers.JsonRpcProvider(moonbeam[0].rpc);
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
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
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();

  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );

  const gas = await gtsave.estimateGas.deposit(params);
  const gasPrice = await provider.getGasPrice();
  return ethers.BigNumber.from(gas.mul(gasPrice)).toNumber() / 1e18;
};

export const estimateDepositGasOther = async (chain, amount, amountGas) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );

  const gas = await gtsave.estimateGas.requestDeposit(
    amount,
    moonbeam[0].contractAddress,
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
    chain[0].name === "Moonbeam" ? chain[0].usdc : chain[0].axlToken,
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
    chain[0].name === "Moonbeam" ? chain[0].usdc : chain[0].axlToken,
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
      EvmChain["MOONBEAM"],
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
    chain[0].name === "Moonbeam" ? chain[0].usdc : chain[0].axlToken,
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
    "moonbeam",
    chain[0].symbol,
    1000000,
    2
  );

  const feeBack = await api.estimateGasFee(
    "moonbeam",
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
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const tx = await gtsave.withdraw(amount, { gasLimit: 500000 });
  return tx;
};

export const withdrawOthers = async (chain, amount, amountGas) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestWithdraw(
    amount,
    moonbeam[0].contractAddress,
    {
      value: amountGas,
      gasLimit: 500000,
    }
  );
  return tx;
};

export const claimOnPolygon = async (roundId) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    signerPol
  );
  const tx = await gtsave.claim(roundId, { gasLimit: 500000 });
  return tx;
};

export const claimOthersOthers = async (chain, roundId, amountGas) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signerPol = provider.getSigner();
  const gtsaveConnector = new ethers.Contract(
    chain[0].contractAddress,
    gtSaveConnector.abi,
    signerPol
  );
  const tx = await gtsaveConnector.requestClaimPrize(
    roundId,
    moonbeam[0].contractAddress,
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

export const checkWinners = async (roundId) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam");
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const gtsave = new ethers.Contract(
    moonbeam[0].contractAddress,
    gtSaveContract.abi,
    provider
  );

  const winner = await gtsave.winners(roundId);
  return winner.isEntity;
};

export const showToast = (
  text = "This is a toast",
  bg = "rgb(220, 38, 38)"
) => {
  Toastify({
    text: text,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: bg,
    },
  }).showToast();
};

export const faucetUsdc = async (user) => {
  const moonbeam = chains.filter((item) => item.name === "Moonbeam")[0];
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();
  const contract = new ethers.Contract(moonbeam.usdc, erc20.abi, signer);
  const tx = await contract.allocateTo(user, ethers.utils.parseEther("100"));
  return tx;
};

export const listFaq = () => {
  return [
    {
      question: "What is GTSave?",
      answer:
        "GTSave is a decentralized cross-chain savings protocol that allows users to save and earn rewards through fair and transparent drawings. It is built on the combination of Axelar GMP and API3 rqng, providing a secure and exciting experience for participants.",
    },
    {
      question: "How does GTSave earn interest?",
      answer:
        "GTSave generates interest through the utilization of Moonwell Artemis on Moonbeam. This integration serves as the yield source, enabling the platform to generate rewards for users' savings.",
    },
    {
      question: "When does GTSave pick the winner?",
      answer:
        "GTSave selects the winner through a weekly drawing. The specific date and time of the drawing are predetermined and communicated to the participants.",
    },
    {
      question: "How does GTSave pick the winner?",
      answer:
        "GTSave utilizes the API3 QRNG (Quantum Random Number Generator) to ensure a fair and transparent selection of the winner. When it's time to determine the winner of the weekly drawing, GTSave sends a request to the API3 QRNG to obtain a random number. This random number serves as the basis for selecting the winner from among the participants. Since the API3 QRNG is a trusted and secure source of random numbers, it helps prevent any manipulation or bias in the winner selection process.",
    },
    {
      question: "Is GTSave fair and transparent?",
      answer:
        "Absolutely! GTSave is committed to ensuring fairness and transparency throughout its operations. The platform takes several measures to uphold these principles. Firstly, the winner selection process is conducted using a trusted and secure source of random numbers, such as the API3 QRNG. This helps to eliminate any biases or manipulation in choosing the winner.",
    },
    {
      question: "Is there any lock period on GTSave?",
      answer:
        "No, GTSave does not impose any lock period on users' assets. Participants have full control over their deposited funds, allowing them to deposit, withdraw, or claim the prize whenever they desire. The absence of a lock period provides flexibility and liquidity for users' assets",
    },
  ];
};