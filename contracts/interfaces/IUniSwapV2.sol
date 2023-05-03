// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniSwapV2 {
  function swapExactTokensForETH(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
  ) external returns (uint[] memory amounts);
  
  function getAmountsOut(
    uint256 amountIn, 
    address[] calldata path
  ) external view returns (uint256[] memory amounts);

  function getAmountsIn(
    uint amountOut, 
    address[] memory path
  ) external view returns (uint[] memory amounts);
}