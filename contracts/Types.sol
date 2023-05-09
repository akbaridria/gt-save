// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Types {

  struct RequestStatus {
    bool fulfilled;
    bool exists;
    uint256[] randomWords;
  }

  struct UserData {
    bool isEntity;
    uint256 balance;
    uint256 oddUpdate;
    uint256 depositDate;
    DetailWin[] listWin;
  }
  
  struct DataWinners {
    bool isEntity;
    address winner;
    uint256 prize;
  }

  struct PayGas {
    address sender;
    string destinationChain;
    string destinationAddress;
    bytes payload;
    string symbol;
    uint256 amount;
    address refundAddress;
  }

  struct AxlCallWithToken {
    string destinationChain;
    string destinationAddress;
    bytes payload;
    string symbol;
    uint256 amount;
  }

  struct ParameterWithdraw {
    uint256 amount;
    address user;
    address gasToken;
    uint256 amountGas;
    string sourceChain;
    string sourceAddress;
    string tokenSymbol;
  }

  struct ParameterClaimPrize {
    address user;
    uint256 roundId;
    string sourceChain;
    uint256 amountGas;
    address gasToken;
    string sourceAddress;
    string tokenSymbol;
  }

  struct PayloadArgs {
    address user;
    uint256 amount;
    uint256 id;
    uint256 amountGas;
    uint256 roundId;
  }

  struct DetailWin {
    uint256 roundId;
    uint256 prize;
  }
}