// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvalidContract {
    // This contract has several issues that will prevent successful deployment:
    // 1. Missing constructor parentheses
    constructor {
        // 2. Uninitialized storage pointer
        string memory msg;
        // 3. Invalid operation
        1 + "string";
    }
    
    // 4. Missing return in view function
    function badFunction() public view returns (uint256) {
    }
}
