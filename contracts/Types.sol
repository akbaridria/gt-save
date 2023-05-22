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

  struct AxlCall {
    string destinationChain;
    string destinationAddress;
    bytes payload;
  }

  struct ParameterWithdraw {
    uint256 amount;
    address user;
    address gasToken;
    string sourceChain;
    string sourceAddress;
    string tokenSymbol;
  }

  struct ParameterClaimPrize {
    address user;
    uint256 roundId;
    string sourceChain;
    address gasToken;
    string sourceAddress;
    string tokenSymbol;
  }

  struct PayloadArgs {
    address user;
    uint256 amount;
    uint256 id;
    uint256 roundId;
  }

  struct DetailWin {
    uint256 roundId;
    uint256 prize;
  }
}