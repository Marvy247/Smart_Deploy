// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    mapping(address => uint256) private balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Reentrancy vulnerability
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }

    // Uninitialized storage pointer
    function unsafeTransfer(address to) public {
        bytes32[1] memory data;
        assembly {
            pop(call(gas(), to, 0, add(data, 0x20), mload(data), 0, 0))
        }
    }
}
