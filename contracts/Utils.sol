
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Types.sol";

library Utils {

  function deleteArrayByValue(address value, address[] storage array) internal  {
    for(uint256 i = 0; i < array.length; i++) {
      if(array[i] == value) {
        array[i] = array[array.length - 1];
        array.pop();
        break;
      }
    }
  }

  function compareStrings(string memory a, string memory b) internal pure returns (bool) {
    return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
  }

  function quickSort(uint[] memory arr, int left, int right) internal returns (uint256[] memory) {
    int i = left;
    int j = right;
    if(i==j) return arr;
    uint pivot = arr[uint(left + (right - left) / 2)];
    while (i <= j) {
        while (arr[uint(i)] > pivot) i++;
        while (pivot > arr[uint(j)]) j--;
        if (i <= j) {
            (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
            i++;
            j--;
        }
    }
    if (left < j)
        quickSort(arr, left, j);
    if (i < right)
        quickSort(arr, i, right);

    return arr;
  }

  function pickWinnerIndex(uint256[] memory _arr, uint256 _winningNumber) internal pure returns (uint256) {
    if(_arr.length == 1) {
      return 0;
    }
    uint256 total = 0;
    for(uint256 i = 0; i < _arr.length; i++) {
      if((_arr[i] + total) >= _winningNumber ) {
        return i;
      }
      total += _arr[i];
    }
    return _arr.length - 1;
  }
}