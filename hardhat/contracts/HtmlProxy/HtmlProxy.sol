// contracts/HtmlProxy.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./HtmlChunk.sol";

/**
 * @title HtmlProxy
 * @dev Acts as a factory for HtmlChunk contracts and reconstructs the full HTML.
 * It splits a given HTML string and deploys multiple HtmlChunk contracts to store the pieces.
 */
contract HtmlProxy {
    address[] public chunkContracts;

    struct Chunk {
        uint256 id;
        string chunk;
    }

    /**
     * @dev Splits the HTML and deploys chunk contracts.
     * @param _text_html The full HTML string.
     * @param _splitCount The number of chunks to split the HTML into.
     *
     * WARNING: On-chain string manipulation is very gas-intensive.
     * For large strings or a high split count, this deployment can be
     * very expensive or even fail.
     */
    constructor(string memory _text_html, uint256 _splitCount) {
        require(_splitCount > 0, "Split count must be greater than 0");

        bytes memory htmlBytes = bytes(_text_html);
        uint256 totalLength = htmlBytes.length;
        if (totalLength == 0) {
            return;
        }

        uint256 chunkSize = (totalLength + _splitCount - 1) / _splitCount; // Ceiling division

        for (uint256 i = 0; i < _splitCount; i++) {
            uint256 startIndex = i * chunkSize;
            if (startIndex >= totalLength) {
                break;
            }

            uint256 endIndex = startIndex + chunkSize;
            if (endIndex > totalLength) {
                endIndex = totalLength;
            }

            bytes memory chunkBytes = new bytes(endIndex - startIndex);
            for (uint256 j = 0; j < chunkBytes.length; j++) {
                chunkBytes[j] = htmlBytes[startIndex + j];
            }

            HtmlChunk chunkContract = new HtmlChunk(i, string(chunkBytes));
            chunkContracts.push(address(chunkContract));
        }
    }

    /**
     * @dev Retrieves chunks from all child contracts, sorts them by ID, and returns the combined HTML.
     * @return The full, reconstructed HTML string.
     *
     * WARNING: This function is also very gas-intensive due to multiple external calls,
     * array manipulations, and string concatenations. It may fail for large data.
     * The recommended approach is to fetch chunks on the client-side and combine them there.
     */
    function getFullHtml() external view returns (string memory) {
        Chunk[] memory chunks = new Chunk[](chunkContracts.length);

        for (uint256 i = 0; i < chunkContracts.length; i++) {
            HtmlChunk chunkContract = HtmlChunk(chunkContracts[i]);
            chunks[i] = Chunk({id: chunkContract.id(), chunk: chunkContract.chunk()});
        }

        // Simple bubble sort based on chunk ID
        for (uint256 i = 0; i < chunks.length; i++) {
            for (uint256 j = i + 1; j < chunks.length; j++) {
                if (chunks[i].id > chunks[j].id) {
                    (chunks[i], chunks[j]) = (chunks[j], chunks[i]);
                }
            }
        }

        string memory fullHtml;
        for (uint256 i = 0; i < chunks.length; i++) {
            fullHtml = string(abi.encodePacked(fullHtml, chunks[i].chunk));
        }

        return fullHtml;
    }

    /**
     * @dev Returns the list of deployed chunk contract addresses.
     * Useful for client-side reconstruction.
     */
    function getChunkAddresses() external view returns (address[] memory) {
        return chunkContracts;
    }
}