// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IAxelarGateway} from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import {IAxelarGasService} from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';
import {AxelarExecutable} from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import '@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol';

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import '../Types.sol';

contract GTSaveConnector is AxelarExecutable {
  using AddressToString for address;
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IAxelarGasService gasReceiver;
  string public constant destChain = 'Polygon';
  string public constant supportedAxlToken = 'aUSDC';
  address public axlUsdc;


  event _pendingDeposit(address indexed _from,  uint256 _amount);
  event _pendingWithdraw(address indexed _from,  uint256 _amount);
  event _pendingClaim(address indexed _from,  uint256 _roundId );

  constructor(address _gateway, address _gasReceiver) AxelarExecutable(_gateway){
    gasReceiver = IAxelarGasService(_gasReceiver);
    axlUsdc = gateway.tokenAddresses(supportedAxlToken);
  }

  function callBridge(
    Types.PayGas memory payGas,
    Types.AxlCallWithToken memory axlCallWithToken,
    bool isDeposit
    ) internal {
    if(isDeposit) {

       gasReceiver.payNativeGasForContractCallWithToken{value: msg.value}(
        payGas.sender, 
        payGas.destinationChain, 
        payGas.destinationAddress, 
        payGas.payload, 
        payGas.symbol, 
        payGas.amount, 
        payGas.refundAddress
      );

      gateway.callContractWithToken(
        axlCallWithToken.destinationChain, 
        axlCallWithToken.destinationAddress, 
        axlCallWithToken.payload, 
        axlCallWithToken.symbol, 
        axlCallWithToken.amount
      );
     
    } else {

      gasReceiver.payNativeGasForContractCall{value: msg.value} (
        payGas.sender,
        payGas.destinationChain, 
        payGas.destinationAddress, 
        payGas.payload, 
        payGas.refundAddress
      );

      gateway.callContract(
        axlCallWithToken.destinationChain,
        axlCallWithToken.destinationAddress, 
        axlCallWithToken.payload
      );
    }
  }


  function requestDeposit(uint256 amount, address destAddress) external payable {
    require(IERC20(axlUsdc).balanceOf(msg.sender) > amount, 'GTSave: insufficient balance');
    require(msg.value > 0, 'GTSave: insufficient ether');

    IERC20(axlUsdc).safeTransferFrom(msg.sender, address(this), amount);
    IERC20(axlUsdc).safeApprove(address(gateway), amount);
    Types.PayloadArgs memory paramArgs = Types.PayloadArgs({
      user: msg.sender,
      amount: amount,
      id: 0,
      roundId: 0
    });
    bytes memory payload = abi.encode(paramArgs);

    Types.PayGas memory payGas = Types.PayGas({
      sender: address(this),
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: amount,
      refundAddress: msg.sender
    });

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: amount
    });
    callBridge(payGas, axlCallWithToken, true);
    emit _pendingDeposit(msg.sender, amount);
  }

  function requestWithdraw(uint256 amount, address destAddress) external payable {

    require(msg.value > 0, 'GTSave: insufficient ether');
    require(amount > 0, 'GTSave: withdraw must not zero!');
    
    Types.PayloadArgs memory paramArgs = Types.PayloadArgs({
      user: msg.sender,
      amount: amount,
      id: 1,
      roundId: 0
    });
    
    bytes memory payload = abi.encode(paramArgs);

    Types.PayGas memory payGas = Types.PayGas({
      sender: address(this),
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: 0,
      refundAddress: msg.sender
    });

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: 0
    });

    callBridge(payGas, axlCallWithToken, false);
    emit _pendingWithdraw(msg.sender, amount);
  }

  function requestClaimPrize(uint256 _roundId, address destAddress) external payable {
    require(msg.value > 0, 'GTSave: insufficient ether for axelar gas fee');
    
    Types.PayloadArgs memory paramArgs = Types.PayloadArgs({
      user: msg.sender,
      amount: 0,
      id: 2,
      roundId: _roundId
    });
    bytes memory payload = abi.encode(paramArgs);
    
    Types.PayGas memory payGas = Types.PayGas({
      sender: address(this),
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: 0,
      refundAddress: msg.sender
    });

    Types.AxlCallWithToken memory axlCallWithToken = Types.AxlCallWithToken({
      destinationChain: destChain,
      destinationAddress: destAddress.toString(),
      payload: payload,
      symbol: supportedAxlToken,
      amount: 0
    });

    callBridge(payGas, axlCallWithToken, false);
    emit _pendingClaim(msg.sender, _roundId);
  }

  function _executeWithToken(
    string calldata ,
    string calldata ,
    bytes calldata payload,
    string calldata tokenSymbol,
    uint256 amount
  ) internal override {
    address recipient = abi.decode(payload, (address));
    address tokenAddress = gateway.tokenAddresses(tokenSymbol);
    IERC20(tokenAddress).safeTransfer(recipient, amount);
  }

}