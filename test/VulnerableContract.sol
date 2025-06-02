// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract VulnerableContract {
    mapping(address => uint) public balances;
    bool private locked;

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public noReentrant {
        uint balance = balances[msg.sender];
        require(balance > 0, "Insufficient balance");
        
        // Effects - Update state before interaction
        balances[msg.sender] = 0;
        
        // Interaction - External call last
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
