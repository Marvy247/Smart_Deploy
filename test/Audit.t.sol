// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../test/TestContract.sol";

contract AuditTest is Test {
    TestContract testContract;

    function setUp() public {
        testContract = new TestContract();
    }

    function testVulnerableFunctionDetection() public {
        // Test that vulnerable functions exist
        (bool reentrancySuccess, ) = address(testContract).call(
            abi.encodeWithSignature("withdraw(uint256)", 1 ether)
        );
        
        (bool unsafeTransferSuccess, ) = address(testContract).call(
            abi.encodeWithSignature("unsafeTransfer(address)", address(this))
        );

        // withdraw() should fail due to reentrancy check
        assertFalse(reentrancySuccess, "Reentrancy vulnerability should cause failure");
        // unsafeTransfer() succeeds but is still vulnerable
        assertTrue(unsafeTransferSuccess, "Unsafe transfer exists but call succeeds"); 
    }
}
