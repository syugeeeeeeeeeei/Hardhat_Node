// contracts/HtmlChunk.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title HtmlChunk
 * @dev Stores a piece (chunk) of a larger HTML string along with its ID.
 */
contract HtmlChunk {
    uint256 public immutable id;
    string public chunk;

    /**
     * @dev Sets the ID and the HTML chunk.
     * @param _id The identifier for sorting/ordering.
     * @param _chunk The chunk of the HTML string.
     */
    constructor(uint256 _id, string memory _chunk) {
        id = _id;
        chunk = _chunk;
    }
}