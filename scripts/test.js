const { ethers, run } = require("hardhat");

function main() {
  const abi = require("../artifacts/contracts/gt-save/GTSave.sol/GTSave.json");
  let iface = new ethers.utils.Interface(abi.abi);
  console.log(iface.encodeFunctionData("deposit", ["10000000000000000000"]));
}

main();
