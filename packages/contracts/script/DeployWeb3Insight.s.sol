// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Web3Insight} from "../src/Web3Insight.sol";

contract DeployWeb3Insight is Script {
    function run() external {
        // Get the initial owner address from environment variable or use a default
        address initialOwner = 0xd559c7e581233F19cD4E3F2Ce969ddE01D3dEEC4;
        
        vm.startBroadcast();
        
        Web3Insight web3Insight = new Web3Insight(initialOwner);
        
        console.log("Web3Insight deployed to:", address(web3Insight));
        console.log("Initial owner:", initialOwner);
        console.log("Contract name:", web3Insight.name());
        console.log("Contract symbol:", web3Insight.symbol());
        
        vm.stopBroadcast();
    }
}