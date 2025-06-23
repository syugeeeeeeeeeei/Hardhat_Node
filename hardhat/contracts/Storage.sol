// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Storage
 * @dev uint256型の値を1つだけ保存し、読み出すことができるシンプルなコントラクト
 */
contract Storage {
    uint256 private number;

    /**
     * @dev 新しい値を保存する関数
     * @param newNumber 保存する新しい値
     */
    function store(uint256 newNumber) public {
        number = newNumber;
    }

    /**
     * @dev 保存されている値を読み出す関数
     * @return 現在保存されている値
     */
    function retrieve() public view returns (uint256) {
        return number;
    }
}