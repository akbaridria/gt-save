// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IUniSwapV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SwapHelper {
  using SafeERC20 for IERC20;

  IUniSwapV2 univ2;

  constructor(address _router) {
    univ2 = IUniSwapV2(_router);
  }

  function getExchangeRate(uint256 _amount, address[] memory _path) public view returns (uint256) {
    return univ2.getAmountsOut(_amount, _path)[_path.length - 1];
  }

  function getAmountYForX(uint256 _amount, address[] memory _path) public view returns (uint256) {
    return univ2.getAmountsIn(_amount, _path)[0];
  }

  function swapForMatic(uint256 _amount, address[] memory _path, address _to) public payable returns (uint256) {
    IERC20(_path[0]).safeApprove(address(univ2), _amount);
    uint256[] memory amountOut = univ2.swapExactTokensForETH(_amount, getExchangeRate(_amount, _path), _path, _to, block.timestamp +  15);
    return amountOut[_path.length - 1];
  }

}