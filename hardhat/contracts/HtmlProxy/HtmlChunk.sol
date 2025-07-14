// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HtmlChunk
 * @dev 分割されたHTMLテキストの一部と、その順序を識別するためのIDを保持するコントラクト。
 */
contract HtmlChunk {
    /**
     * @dev 分割されたテキストデータ。
     */
    string public textChunk;

    /**
     * @dev テキストの順序を示すID（0から始まるインデックス）。
     */
    uint256 public chunkId;

    /**
     * @dev コントラクトのデプロイ時に、IDとテキストチャンクを設定します。
     * @param _chunkId このチャンクの順序を示すID。
     * @param _textChunk このコントラクトが保持するテキストの断片。
     */
    constructor(uint256 _chunkId, string memory _textChunk) {
        chunkId = _chunkId;
        textChunk = _textChunk;
    }
}