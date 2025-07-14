// contracts/HtmlProxy.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./HtmlChunk.sol";

contract HtmlProxy {
    address[] public chunkContracts;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setChunkContracts(address[] memory _chunkContracts) external onlyOwner {
        chunkContracts = _chunkContracts;
    }

    /*
    // 💀 メモリ上限の問題を引き起こすため、getFullText関数は削除します。
    // データの再結合は、オフチェーンのクライアント側で行うべきです。
    */

    function getChunkCount() public view returns (uint256) {
        return chunkContracts.length;
    }
}