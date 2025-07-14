// SPDX-License-Identifier: MIT
pragma solidity ^__SolidityVersion__;

contract __PascalCaseName__ {
    string private greeting;

    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }
}