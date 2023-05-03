// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "./Types.sol";
import "./gt-save/GTSave.sol";

contract VRFV2Consumer is VRFConsumerBaseV2, ConfirmedOwner {
  
  GTSave public gtSave;
  uint64 sId;
  bytes32 keyHash;
  uint32 callbackGasLimit = 10000000;
  uint16 requestConfirmations = 3;
  uint32 numWords = 1;
  uint256[] public requestIds;
  uint256 public lastRequestId;

  mapping(uint256 => Types.RequestStatus) public listRequests;
  VRFCoordinatorV2Interface COORDINATOR;

  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);
  
  constructor(uint64 _subscriptionId, bytes32 _keyhash, address _vrfCoordinatior, address payable _gtSave) VRFConsumerBaseV2(_vrfCoordinatior) ConfirmedOwner(msg.sender)  {
    gtSave = GTSave(_gtSave);
    sId = _subscriptionId;
    keyHash = _keyhash;
    COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinatior);
  }

  function requestRandomWords() external onlyOwner returns (uint256 requestId)
    {

      requestId = COORDINATOR.requestRandomWords(
        keyHash,
        sId,
        requestConfirmations,
        callbackGasLimit,
        numWords
      );
      listRequests[requestId] = Types.RequestStatus({
        randomWords: new uint256[](0),
        exists: true,
        fulfilled: false
      });

      requestIds.push(requestId);
      lastRequestId = requestId;

      emit RequestSent(requestId, numWords);
      
      return requestId;

    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {

      require(listRequests[_requestId].exists, "GTSave: request id not found");
      listRequests[_requestId].fulfilled = true;
      listRequests[_requestId].randomWords = _randomWords;
      emit RequestFulfilled(_requestId, _randomWords);
      gtSave.completeRound(_randomWords);
    }

    function getRequestStatus(uint256 _requestId ) external view returns (bool fulfilled, uint256[] memory randomWords) {

        require(listRequests[_requestId].exists, "request not found");
        Types.RequestStatus memory request = listRequests[_requestId];
        return (request.fulfilled, request.randomWords);

    }

}