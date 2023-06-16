// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/MTokens.sol";
import "../Types.sol";
import "../Utils.sol";

contract GTSave is AxelarExecutable, ReentrancyGuard, Ownable {
  using SafeMath for uint256;


  IAxelarGasService gasReceiver;
  IERC20 usdc;
  MTokens iPool;
  
  uint256 public constant MIN_DURATION_PER_ROUND = 7 days;
  string public axlUSDC = 'aUSDC';

  uint256 public roundId = 1;
  uint256 public prizes;
  uint256 public totalDeposit;

  uint256 public startRoundDate = block.timestamp;
  uint256 public endRoundDate = block.timestamp + MIN_DURATION_PER_ROUND;

  address[] public listUserData;
  mapping(address => Types.UserData) public userData;
  mapping(uint256 => Types.DataWinners) public winners;
  mapping(uint256 => address) private weightedBalanceUser;
  address vrfConsumer = address(0);

  modifier userExist(address user) {
    require(userData[user].isEntity, "data not found");
    _;
  }

  modifier winnerExist(uint256 _roundId) {
    require(winners[_roundId].isEntity, "data not found");
    _;
  }

  modifier validWinner(uint256 _roundId, address winner) {
    require(winners[_roundId].isEntity, "data not found");
    require(winners[_roundId].winner == winner, "not a winner on round spesified");
    _;
  }

  event _deposit(address indexed _from, string _fromChain, uint256 _roundId, uint256 _amount);
  event _withdraw(address indexed _from, string _fromChain, uint256 _roundId, uint256 _amount );
  event _claim(address indexed _from, string _fromChain, uint256 _roubndId, uint256 _amount);
  event _winner(address indexed _from, uint256 indexed _roundId, uint256 prize);
  event _testing(uint256 _balance, uint256 _underlying);

  constructor(
    address _gateway, 
    address _gasReceiver, 
    address _usdc, 
    address _poolUsdc
    ) AxelarExecutable(_gateway) {

      gasReceiver = IAxelarGasService(_gasReceiver);
      usdc = IERC20(_usdc);
      iPool = MTokens(_poolUsdc);

  }

  function startRound() internal returns (uint256) {
    startRoundDate = block.timestamp;
    endRoundDate = startRoundDate + MIN_DURATION_PER_ROUND;
    roundId++;
    return roundId;
  }

  function getPrize(uint256 _prizeAmount) internal {
    prizes += _prizeAmount;
    iPool.redeemUnderlying(_prizeAmount);
  }

  function completeRound(uint256 _randomWords) external {
    require(listUserData.length > 0, "no users deposit!");
    require(msg.sender == vrfConsumer, "Unauthorized");
    require(endRoundDate <= block.timestamp, "round not ended yet!");

    // uint256[] memory weightedBalances = new uint256[](listUserData.length);
    // uint256 totalWeightedBalance = 0;

    // for (uint256 i = 0; i < listUserData.length; i++) {
    //   uint256 weightedBalance = userData[listUserData[i]].balance.add(block.timestamp - userData[listUserData[i]].oddUpdate);
    //   weightedBalances[i] = weightedBalance;
    //   weightedBalanceUser[weightedBalance] = listUserData[i];
    //   totalWeightedBalance += weightedBalance;
    // }

    // weightedBalances = Utils.quickSort(weightedBalances, int(0), int(weightedBalances.length - 1));

    uint256 winningNumber = _randomWords.mod(listUserData.length);

    // uint256 indArr = Utils.pickWinnerIndex(weightedBalances, winningNumber);
    address winner = listUserData[winningNumber];
    uint256 prizeAmount = iPool.balanceOfUnderlying(address(this)) - totalDeposit;

    winners[roundId] = Types.DataWinners({
      isEntity: true,
      winner: winner,
      prize: prizeAmount
    });

    userData[winner].oddUpdate = block.timestamp;
    userData[winner].listWin.push(Types.DetailWin({
      roundId: roundId,
      prize: prizeAmount
    }));

    emit _winner(winner, roundId, prizeAmount);

    getPrize(prizeAmount);
    startRound();
  }


  function deposit(uint256 amount) external nonReentrant {
    require( usdc.balanceOf(msg.sender) >= amount, "insufficient balance");

    totalDeposit += amount;
    
    if(userData[msg.sender].isEntity){
      userData[msg.sender].balance += amount;
    } else {
      userData[msg.sender].isEntity = true;
      userData[msg.sender].balance = amount;
      userData[msg.sender].oddUpdate = block.timestamp;
      userData[msg.sender].depositDate = block.timestamp;
      listUserData.push(msg.sender);
    }

    usdc.transferFrom(msg.sender, address(this), amount);
    usdc.approve(address(iPool), amount);
    iPool.mint(amount);

    emit _deposit(msg.sender, 'Polygon', roundId, amount);
  }

  function withdraw(uint256 amount) external userExist(msg.sender) nonReentrant {
    require(userData[msg.sender].balance >= amount, "insufficient balance");

    totalDeposit -= amount;

    iPool.redeemUnderlying(amount);

    userData[msg.sender].balance -= amount;

    if(userData[msg.sender].balance == 0) {
      Utils.deleteArrayByValue(msg.sender, listUserData);
    }

    usdc.transfer(msg.sender, amount);

    emit _withdraw(msg.sender, 'Polygon', roundId, amount);
  }

  function claim(uint256 _roundId) external validWinner(_roundId, msg.sender) nonReentrant {
    uint256 prize = winners[_roundId].prize;

    delete winners[_roundId];
    usdc.transfer(msg.sender, prize);

    emit _claim(msg.sender, 'Polygon', _roundId, prize);
  }

  function receiveAndDeposit(address user, uint256 amount) internal {
    
    // it should be swap here from axlUSDC to USDC 

    totalDeposit += amount.mul(1e12);

    if(userData[user].isEntity){
      userData[user].balance += amount.mul(1e12);
    } else {
      userData[user].isEntity = true;
      userData[user].balance = amount.mul(1e12);
      userData[user].oddUpdate = block.timestamp;
      userData[user].depositDate = block.timestamp;
      listUserData.push(user);
    }

    usdc.allocateTo(address(this), amount.mul(1e12));
    usdc.approve(address(iPool), amount.mul(1e12));
    iPool.mint(amount.mul(1e12));
    
  }
  
  function receiveAndWithdraw(Types.ParameterWithdraw memory paramWithdraw) internal userExist(paramWithdraw.user) {

    require(userData[paramWithdraw.user].balance >= paramWithdraw.amount.mul(1e12), "insufficient balance ");

    totalDeposit -= paramWithdraw.amount.mul(1e12);

    iPool.redeemUnderlying(paramWithdraw.amount.mul(1e12));

    // it should be swap here from usdc to axlUSDC
    
    userData[paramWithdraw.user].balance -= paramWithdraw.amount.mul(1e12);

    if(userData[paramWithdraw.user].balance == 0) {
      Utils.deleteArrayByValue(paramWithdraw.user, listUserData);
    }

    bytes memory payload = abi.encode(paramWithdraw.user);

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: paramWithdraw.sourceChain,
      destinationAddress: paramWithdraw.sourceAddress,
      payload: payload,
      symbol: paramWithdraw.tokenSymbol,
      amount: paramWithdraw.amount
    });
 
    IERC20(paramWithdraw.gasToken).approve(address(gateway), paramWithdraw.amount);
    callBridge(axlCallWithToken);
  }

  function receiveAndClaimPrize(Types.ParameterClaimPrize memory paramClaimPrize) internal validWinner(paramClaimPrize.roundId, paramClaimPrize.user) {

    uint256 prize = winners[paramClaimPrize.roundId].prize.div(1e12);

    // it should be swap here from usdc to axlusdc

    IERC20(paramClaimPrize.gasToken).approve(address(gateway), prize);
    delete winners[paramClaimPrize.roundId];

    bytes memory payload = abi.encode(paramClaimPrize.user);

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: paramClaimPrize.sourceChain,
      destinationAddress: paramClaimPrize.sourceAddress,
      payload: payload,
      symbol: paramClaimPrize.tokenSymbol,
      amount: prize
    });
  
    callBridge(axlCallWithToken);
  }

  function callBridge(
    Types.AxlCallWithToken memory axlCallWithToken
    ) internal { 
    
    gateway.callContractWithToken(
      axlCallWithToken.destinationChain, 
      axlCallWithToken.destinationAddress, 
      axlCallWithToken.payload, 
      axlCallWithToken.symbol, 
      axlCallWithToken.amount);
  }

  function _executeWithToken(
    string calldata sourceChain,
    string calldata ,
    bytes calldata payload,
    string calldata ,
    uint256
  ) internal override {

    Types.PayloadArgs memory args = abi.decode(payload, (Types.PayloadArgs));

    if(args.id == 0) {
      receiveAndDeposit(args.user, args.amount);
      emit _deposit(args.user, sourceChain, args.roundId, args.amount);
    }
  }

   function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        Types.PayloadArgs memory args = abi.decode(payload, (Types.PayloadArgs));
        address gasToken = gateway.tokenAddresses(axlUSDC);

        if (args.id == 1){
          Types.ParameterWithdraw memory paramWithdraw = Types.ParameterWithdraw({
            amount: args.amount,
            user: args.user,
            gasToken: gasToken,
            sourceChain: sourceChain,
            sourceAddress: sourceAddress,
            tokenSymbol: axlUSDC
          });
          receiveAndWithdraw(paramWithdraw);
          emit _withdraw(args.user, sourceChain, roundId, args.amount);
        } else if(args.id == 2) {
          Types.ParameterClaimPrize memory paramClaimPrize = Types.ParameterClaimPrize({
            user: args.user,
            roundId: args.roundId,
            sourceChain: sourceChain,
            gasToken: gasToken,
            sourceAddress: sourceAddress,
            tokenSymbol: axlUSDC
          });
          receiveAndClaimPrize(paramClaimPrize);
          emit _claim(args.user, sourceChain, args.roundId, args.amount);
        }
    }

  function getUserData(address user) external userExist(user) view returns (Types.UserData memory){
    return userData[user];
  }

  function setVrfConsumer(address _consumer) external onlyOwner {
    vrfConsumer = _consumer;
  }

}