// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    uint256 public value;
    
    constructor(uint256 _value) {
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function setValue(uint256 _newValue) public {
        value = _newValue;
    }
}
