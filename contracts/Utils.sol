
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

  function changeStatusDetailWin(uint256 roundId, Types.DetailWin[] memory arr ) internal pure returns (Types.DetailWin[] memory) {
    for(uint256 i = 0; i < arr.length; i++) {
      if(arr[i].roundId == roundId) {
        arr[i].isClaim = true;
      }
    }
    return arr;
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

  function binarySearch(uint256[] memory _arr, uint256 _low, uint256 _high, uint256 _search) internal pure returns (uint256) {
    if(_arr[0] > _search) {
      return 0;
    } else if(_arr[_arr.length - 1] < _search) {
      return _arr.length - 1;
    } else {
      uint256 mid;
      while(_low <= _high) {
        mid = (_low + _high) / 2;
        if(_arr[mid] <_search) {
          _high = mid - 1;
        } else {
          _low = mid + 1;
        }
      }
      return mid;
    }
  }
}