// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../packages/backend/src/services/DeploymentService.sol";

contract AnvilDeploymentTest is Test {
    DeploymentService deploymentService;
    address constant ANVIL_ADDRESS = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    string constant ANVIL_RPC = "http://localhost:8545";

    function setUp() public {
        deploymentService = new DeploymentService();
        
        // Verify Anvil is running
        (bool success, ) = ANVIL_RPC.call("");
        require(success, "Anvil not running - please start Anvil first");
        
        // Verify account has ETH
        uint256 balance = ANVIL_ADDRESS.balance;
        require(balance > 0, "Anvil account has no ETH");
    }

    function testDeployContractSuccessfully() public {
        // Load config from deploy-config.json
        string memory config = vm.readFile("test/deploy-config.json");
        
        // Parse config (simplified for example)
        string memory contractName = vm.parseJsonString(config, ".contractName");
        string memory bytecode = vm.parseJsonString(config, ".bytecode");
        
        // Deploy
        (bool success, bytes memory result) = address(deploymentService).call(
            abi.encodeWithSignature(
                "deployDirect(string,string,string,bytes)",
                contractName,
                "", // source
                bytecode,
                "" // constructorArgs
            )
        );
        
        require(success, "Deployment failed");
        (address deployedAddress, uint256 gasUsed) = abi.decode(result, (address, uint256));
        
        assertTrue(deployedAddress != address(0));
        assertTrue(gasUsed > 0);
    }

    function testFailWithInvalidBytecode() public {
        // Should revert with invalid bytecode
        (bool success, ) = address(deploymentService).call(
            abi.encodeWithSignature(
                "deployDirect(string,string,string,bytes)",
                "InvalidContract",
                "", // source
                "0xinvalid",
                "" // constructorArgs
            )
        );
        
        require(!success, "Should have failed with invalid bytecode");
    }

    function testTrackDeploymentStatus() public {
        string memory config = vm.readFile("test/deploy-config.json");
        string memory bytecode = vm.parseJsonString(config, ".bytecode");
        
        (bool success, bytes memory result) = address(deploymentService).call(
            abi.encodeWithSignature(
                "deployDirect(string,string,string,bytes)",
                "TestContract",
                "", // source
                bytecode,
                "" // constructorArgs
            )
        );
        
        require(success, "Deployment failed");
        (address deployedAddress, , uint256 blockNumber) = abi.decode(result, (address, string, uint256));
        
        assertTrue(blockNumber > 0);
    }

    function testVerifyContractDeployment() public {
        string memory config = vm.readFile("test/deploy-config.json");
        string memory bytecode = vm.parseJsonString(config, ".bytecode");
        
        (bool success, bytes memory result) = address(deploymentService).call(
            abi.encodeWithSignature(
                "deployDirect(string,string,string,bytes)",
                "TestContract",
                "", // source
                bytecode,
                "" // constructorArgs
            )
        );
        
        require(success, "Deployment failed");
        (address deployedAddress, , ) = abi.decode(result, (address, string, uint256));
        
        uint256 codeSize = deployedAddress.code.length;
        assertTrue(codeSize > 0);
    }
}
