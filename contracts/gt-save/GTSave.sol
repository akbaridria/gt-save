// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";

import {IAToken} from "@aave/core-v3/contracts/interfaces/IAToken.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";

import "../Types.sol";
import "../SwapHelper.sol";
import "../Utils.sol";

contract GTSave is AxelarExecutable, ReentrancyGuard {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  using AddressToString for address;
  using StringToAddress for string;


  IAxelarGasService gasReceiver;
  SwapHelper swapHelper;
  IERC20 usdc;
  IAToken aToken;
  IPool iPool;

  uint256 public constant MIN_DEPOSIT_DURATION = 10 minutes;
  uint256 public constant MIN_DURATION_PER_ROUND = 1 days;
  string public axlUSDC = 'aUSDC';
  address public wmatic;

  uint256 public roundId = 10000000;
  uint256 public prizes;
  uint256 public totalDeposit;
  address public owner;
  address public vrfCoordinator;

  uint256 startRoundDate = block.timestamp;
  uint256 endRoundDate = block.timestamp + MIN_DURATION_PER_ROUND;

  address[] public listUserData;
  mapping(address => Types.UserData) public userData;
  mapping(uint256 => Types.DataWinners) public winners;
  mapping(uint256 => address) public weightedBalanceUser;

  modifier userExist(address user) {
    require(userData[user].isEntity, "GTSave: data not found");
    _;
  }

  modifier winnerExist(uint256 _roundId) {
    require(winners[_roundId].isEntity, "GTSave: data not found");
    _;
  }

  modifier validWinner(uint256 _roundId, address winner) {
    require(winners[_roundId].isEntity, "GTSave: data not found");
    require(winners[_roundId].winner == winner, "GTSave: not a winner on round spesified");
    _;
  }

  constructor(
    address _gateway, 
    address _gasReceiver, 
    address _usdc, 
    address _aToken, 
    address _poolUsdc,
    address _vrfCoordinator,
    address _univRouter,
    address _wmatic
    ) AxelarExecutable(_gateway) {

      gasReceiver = IAxelarGasService(_gasReceiver);
      vrfCoordinator = _vrfCoordinator;
      usdc = IERC20(_usdc);
      aToken = IAToken(_aToken);
      iPool = IPool(_poolUsdc);
      swapHelper = SwapHelper(_univRouter);
      wmatic = _wmatic;

  }

  function startRound() internal returns (uint256) {
    startRoundDate = block.timestamp;
    endRoundDate = startRoundDate + MIN_DURATION_PER_ROUND;
    roundId++;
    return roundId;
  }

  function getPrize() internal {
    uint256 balanceToWithdraw = getClaimablePrize();
    iPool.withdraw(address(usdc), balanceToWithdraw, address(this));
  }

  function completeRound(uint256[] memory _randomWords) external nonReentrant {
    require(listUserData.length > 0, "GTSave: no users deposit!");
    // require(endRoundDate < block.timestamp, "GTSave: round not ended yet!");

    uint256[] memory weightedBalances = new uint256[](listUserData.length);

    for (uint256 i = 0; i < listUserData.length; i++) {
      uint256 weightedBalance = userData[listUserData[i]].balance.add(block.timestamp - userData[listUserData[i]].oddUpdate);
      weightedBalances[i] = weightedBalance;
      weightedBalanceUser[weightedBalance] = listUserData[i];
    }

    weightedBalances = Utils.quickSort(weightedBalances, int(0), int(weightedBalances.length - 1));

    uint256 winningNumber = _randomWords[0].mod(weightedBalances[0]);

    uint256 indArr = Utils.binarySearch(weightedBalances, 0, weightedBalances.length - 1, winningNumber);
    address winner = weightedBalanceUser[weightedBalances[indArr]];
    uint256 prizeAmount = getClaimablePrize();

    winners[roundId] = Types.DataWinners({
      isEntity: true,
      winner: winner,
      prize: prizeAmount
    });

    userData[winner].listWin.push(Types.DetailWin({
      roundId: roundId,
      prize: prizeAmount,
      isClaim: false
    }));

    getPrize();
    startRound();
  }


  function deposit(uint256 amount) external nonReentrant {
    require( usdc.balanceOf(msg.sender) >= amount, "GTSave : insufficient balance");

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

    usdc.safeTransferFrom(msg.sender, address(this), amount);
    usdc.safeApprove(address(iPool), amount);
    iPool.supply(address(usdc), amount, address(this), 0);

  }

  function Withdraw(uint256 amount) external userExist(msg.sender) nonReentrant {
    require(userData[msg.sender].balance >= amount, "GTSave: insufficient balance");

    totalDeposit -= amount;

    iPool.withdraw(address(usdc), amount, address(this));

    uint256 balanceToSend = amount.sub(amount.mul(getFee(msg.sender)));
    
    userData[msg.sender].balance -= amount;

    if(userData[msg.sender].balance == 0) {
      delete userData[msg.sender];
      Utils.deleteArrayByValue(msg.sender, listUserData);
    }

    usdc.safeTransfer(msg.sender, balanceToSend);
  }

  function claim(uint256 _roundId) external validWinner(_roundId, msg.sender) nonReentrant {
    uint256 prize = winners[_roundId].prize;

    delete winners[_roundId];
    usdc.safeTransfer(msg.sender, prize);
  }

  function receiveAndDeposit(address user, uint256 amount) internal {
    require(usdc.balanceOf(address(this)) >= amount, "GTSave: insufficient balance on contract");
    
    // it should be swap here from axlUSDC to USDC 
    // but since testnet is lack of liquidity in testnet we will use usdc reserve on this contract instead
    // that every 1 axlUSDC receive we will use 1 usdc from this contract to aave pool

    totalDeposit += amount;

    if(userData[user].isEntity){
      userData[user].balance += amount;
    } else {
      userData[user].isEntity = true;
      userData[user].balance = amount;
      userData[user].oddUpdate = block.timestamp;
      userData[user].depositDate = block.timestamp;
      listUserData.push(user);
    }

    usdc.safeApprove(address(iPool), amount);
    iPool.supply(address(usdc), amount, address(this), 0);
    
  }
  
  receive() external payable {}
  
  fallback() external payable {}
  
  function receiveAndWithdraw(Types.ParameterWithdraw memory paramWithdraw) internal userExist(paramWithdraw.user) {

    require(userData[paramWithdraw.user].balance >= paramWithdraw.amount, "GTSave: insufficient balance ");

    totalDeposit -= paramWithdraw.amount;

    iPool.withdraw(address(usdc), paramWithdraw.amount, address(this));

    uint256 balanceToSend = paramWithdraw.amount.sub(paramWithdraw.amount.mul(getFee(paramWithdraw.user)));

    // it should be swap here from usdc to axlUSDC
    // but, because of lack liquidity in testnet we will use axlUSDC reserve in this contract instead
    
    userData[paramWithdraw.user].balance -= paramWithdraw.amount;

    if(userData[paramWithdraw.user].balance == 0) {
      delete userData[paramWithdraw.user];
      Utils.deleteArrayByValue(paramWithdraw.user, listUserData);
    }
    
    IERC20(paramWithdraw.gasToken).safeApprove(address(swapHelper), paramWithdraw.amountGas);
    IERC20(paramWithdraw.gasToken).safeTransfer(address(swapHelper), paramWithdraw.amountGas);

    uint256 amountMatic = executeSwapForMatic(paramWithdraw.amountGas);

    bytes memory payload = abi.encode(paramWithdraw.user);

    Types.PayGas memory payGas = Types.PayGas({
      sender: address(this),
      destinationChain: paramWithdraw.sourceChain,
      destinationAddress: paramWithdraw.sourceAddress,
      payload: payload,
      symbol: paramWithdraw.tokenSymbol,
      amount: balanceToSend,
      refundAddress: paramWithdraw.user
    });

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: paramWithdraw.sourceChain,
      destinationAddress: paramWithdraw.sourceAddress,
      payload: payload,
      symbol: paramWithdraw.tokenSymbol,
      amount: balanceToSend
    });
 
    IERC20(paramWithdraw.gasToken).safeApprove(address(gateway), balanceToSend);
    callBridge(payGas, axlCallWithToken, amountMatic);
  }

  function receiveAndClaimPrize(Types.ParameterClaimPrize memory paramClaimPrize) internal validWinner(paramClaimPrize.roundId, paramClaimPrize.user) {

    uint256 prize = winners[paramClaimPrize.roundId].prize;

    // it should be swap here from usdc to axlusdc
    // but because of lack liquidity in testnet we will use axlUSDC reserve on this contract instead

    

    IERC20(paramClaimPrize.gasToken).safeApprove(address(swapHelper), paramClaimPrize.amountGas);
    IERC20(paramClaimPrize.gasToken).safeTransfer(address(swapHelper), paramClaimPrize.amountGas);

    uint256 amountMatic = executeSwapForMatic(paramClaimPrize.amountGas);

    IERC20(paramClaimPrize.gasToken).safeApprove(address(gateway), prize);
    delete winners[paramClaimPrize.roundId];
    
    bytes memory payload = abi.encode(paramClaimPrize.user);

    Types.PayGas memory payGas = Types.PayGas({
      sender: address(this),
      destinationChain: paramClaimPrize.sourceChain,
      destinationAddress: paramClaimPrize.sourceAddress,
      payload: payload,
      symbol: paramClaimPrize.tokenSymbol,
      amount: prize,
      refundAddress: paramClaimPrize.user
    });

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: paramClaimPrize.sourceChain,
      destinationAddress: paramClaimPrize.sourceAddress,
      payload: payload,
      symbol: paramClaimPrize.tokenSymbol,
      amount: prize
    });
    
    IERC20(paramClaimPrize.gasToken).safeApprove(address(gateway), prize);
    callBridge(payGas, axlCallWithToken, amountMatic);
  }

  function callBridge(
    Types.PayGas memory payGas,
    Types.AxlCallWithToken memory axlCallWithToken,
    uint256 value
    ) internal { 

    gasReceiver.payNativeGasForContractCallWithToken{value: value}(
      payGas.sender, 
      payGas.destinationChain, 
      payGas.destinationAddress, 
      payGas.payload, 
      payGas.symbol, 
      payGas.amount,
      payGas.refundAddress);
    
    gateway.callContractWithToken(
      axlCallWithToken.destinationChain, 
      axlCallWithToken.destinationAddress, 
      axlCallWithToken.payload, 
      axlCallWithToken.symbol, 
      axlCallWithToken.amount);
  }

  function _executeWithToken(
    string calldata sourceChain,
    string calldata sourceAddress,
    bytes calldata payload,
    string calldata tokenSymbol,
    uint256
  ) internal override {
    // require(Utils.compareStrings(tokenSymbol, axlUSDC), "GTSave: Unsupported Token!");
    
    Types.PayloadArgs memory args = abi.decode(payload, (Types.PayloadArgs));
    
    address gasToken = gateway.tokenAddresses(tokenSymbol);

    if(args.id == 0) {
      receiveAndDeposit(args.user, args.amount);
    } else if (args.id == 1){
      Types.ParameterWithdraw memory paramWithdraw = Types.ParameterWithdraw({
        amount: args.amount,
        user: args.user,
        gasToken: gasToken,
        amountGas: args.amountGas,
        sourceChain: sourceChain,
        sourceAddress: sourceAddress,
        tokenSymbol: tokenSymbol
      });
      receiveAndWithdraw(paramWithdraw);
    } else if(args.id == 2) {
      Types.ParameterClaimPrize memory paramClaimPrize = Types.ParameterClaimPrize({
        user: args.user,
        roundId: args.roundId,
        sourceChain: sourceChain,
        amountGas: args.amountGas,
        gasToken: gasToken,
        sourceAddress: sourceAddress,
        tokenSymbol: tokenSymbol
      });
      receiveAndClaimPrize(paramClaimPrize);
    }
    
  }

  // if we use standart method to get interest amount like aToken balance - deposit balance
  // sometime the value is not that "Accurate" that impact the deposit balance will be higher or lower than it should be after withdraw
  function getClaimablePrize() public view returns (uint256) {
    DataTypes.ReserveData memory reserve = iPool.getReserveData(address(usdc));
    uint256 scaledBalance = aToken.scaledBalanceOf(address(this));
    uint256 prize = (scaledBalance.mul(reserve.liquidityIndex).div(1e27)).sub(totalDeposit);
    return prize;
  }

  function getWiner(uint256 _roundId) public winnerExist(_roundId) view returns (Types.DataWinners memory) {
    return winners[_roundId];
  }

  function getUserData(address user) public userExist(user) view returns (Types.UserData memory){
    return userData[user];
  }

  function executeSwapForMatic(uint256 amountIn) internal returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = gateway.tokenAddresses(axlUSDC);
    path[1] = wmatic;
    return swapHelper.swapForMatic(amountIn, path, address(this));
  }

  function getFee(address _user) internal view returns (uint256) {
    uint256 decimalPercent = 3;
    uint256 fee = userData[_user].depositDate > block.timestamp - MIN_DEPOSIT_DURATION ? decimalPercent.div(1000) : 0 ;
    return fee;
  }

}