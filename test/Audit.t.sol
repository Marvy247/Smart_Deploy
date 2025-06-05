// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../test/TestContract.sol";

contract AuditTest is Test {
    TestContract testContract;

    function setUp() public {
        testContract = new TestContract(100); // Initialize with value 100
    }

    function testValueOperations() public {
        // Test initial value
        assertEq(testContract.value(), 100, "Initial value should be 100");
        
        // Test setValue function
        testContract.setValue(200);
        assertEq(testContract.value(), 200, "Value should update to 200");
    }
}
