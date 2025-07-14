// contracts/HtmlStorage.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HtmlStorage
 * @dev HTMLコンテンツを複数のチャンク（断片）として動的配列に格納し、
 * 後からチャンクを追加できるようにしたコントラクト。
 * すべてのチャンクを結合して取得する関数は、ガス制限とメモリ制限の問題により、
 * コメントアウトされています。
 */
contract HtmlStorage {
    // コントラクトの所有者。チャンクの追加は所有者のみが行えるようにします。
    address public owner;

    // HTMLの各チャンク（断片）を格納する動的配列
    // 注意: この配列が大きくなると、追加（書き込み）時のガス代が高くなります。
    string[] private htmlChunks;

    // 所有者のみが関数を実行できるようにする修飾子
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev コントラクトのデプロイ時に所有者を設定します。
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev HTMLのチャンク（断片）を配列に追加します。
     * @param _chunk 追加するHTMLの文字列断片。
     * @notice 1回の呼び出しで追加するチャンクのサイズは、EVMのガス制限に収まるよう、
     * オフチェーンの呼び出し元で適切に制限する必要があります（例: 24KB以下）。
     */
    function addChunk(string memory _chunk) external onlyOwner {
        htmlChunks.push(_chunk);
    }

    /**
     * @dev 格納されているHTMLチャンクの総数を返します。
     * この情報を使って、オフチェーンで個々のチャンクをループして取得できます。
     * @return 格納されているチャンクの数。
     */
    function getChunkCount() public view returns (uint256) {
        return htmlChunks.length;
    }

    /**
     * @dev 指定されたインデックスのHTMLチャンク（断片）を返します。
     * オフチェーンのクライアントは、この関数をチャンクの数だけ繰り返し呼び出し、
     * 取得した断片を結合して完全なHTMLを再構築します。
     * @param _index 取得するチャンクの配列インデックス。
     * @return 指定されたインデックスのHTMLチャンク。
     */
    function getChunk(uint256 _index) public view returns (string memory) {
        require(_index < htmlChunks.length, "Index out of bounds");
        return htmlChunks[_index];
    }

    /*
    // 💀 以下の関数は、格納されている全てのチャンクをコントラクト内で結合しようと試みるものですが、
    //    チャンクの数が多くなったり、個々のチャンクが大きくなったりすると、
    //    Ethereum Virtual Machine (EVM) のガス制限やメモリ制限に容易に抵触し、実行不可能になります。
    //    そのため、この機能はコメントアウトし、データの再結合はオフチェーンで行うべきです。

    function getAllHtml() public view returns (string memory) {
        string memory fullHtml = "";
        for (uint256 i = 0; i < htmlChunks.length; i++) {
            // string.concat はガスを大量に消費します
            fullHtml = string.concat(fullHtml, htmlChunks[i]);
        }
        return fullHtml;
    }
    */
}