# Web3Insight - Monad NFT Project

## Deployed Contract Information

**Contract Address**: `0xA1E2C9721322150eE2042097cd7E32f12720F139`  
**Network**: Monad Testnet (Chain ID: 10143)  
**Initial Owner**: `0xd559c7e581233F19cD4E3F2Ce969ddE01D3dEEC4`  
**Verification Status**: ✅ Verified on Sourcify  
**Explorer**: [View on Monad Explorer](https://testnet.monadexplorer.com/address/0xA1E2C9721322150eE2042097cd7E32f12720F139)

## Project Overview

Web3Insight is an ERC721 NFT contract that allows developers to mint unique profiles linked to their GitHub usernames, storing their Web3 skills, ecosystem involvement, and calculated Web3 scores.

## Monad-flavored Foundry

> [!NOTE]
> In this Foundry template, the default chain is `monadTestnet`. If you wish to change it, change the network in `foundry.toml`

<h4 align="center">
  <a href="https://docs.monad.xyz">Monad Documentation</a> | <a href="https://book.getfoundry.sh/">Foundry Documentation</a> |
   <a href="https://github.com/monad-developers/foundry-monad/issues">Report Issue</a>
</h4>


**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat, and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions, and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose Solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Gas Snapshots

```shell
forge snapshot
```

### Anvil

```shell
anvil
```

### Deploy Web3Insight to Monad Testnet

The Web3Insight contract has been deployed using the following command:

```shell
forge script script/DeployWeb3Insight.s.sol --private-key <PRIVATE_KEY> --broadcast --rpc-url https://testnet-rpc.monad.xyz
```

For future deployments, you can create a keystore file:

```shell
cast wallet import monad-deployer --private-key <YOUR_PRIVATE_KEY>
```

Then deploy using:

```shell
forge script script/DeployWeb3Insight.s.sol --account monad-deployer --broadcast --rpc-url https://testnet-rpc.monad.xyz
```

### Verify Web3Insight Contract

The Web3Insight contract has been verified on Sourcify using:

```shell
# First, encode constructor arguments
cast abi-encode "constructor(address)" 0xd559c7e581233F19cD4E3F2Ce969ddE01D3dEEC4

# Then verify the contract
forge verify-contract \
  0xA1E2C9721322150eE2042097cd7E32f12720F139 \
  src/Web3Insight.sol:Web3Insight \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org \
  --constructor-args 0x000000000000000000000000d559c7e581233f19cd4e3f2ce969dde01d3deec4
```

For future contract verifications:

```shell
forge verify-contract \
  <contract_address> \
  src/Web3Insight.sol:Web3Insight \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org \
  --constructor-args <abi_encoded_constructor_arguments>
```

### Cast
[Cast reference](https://book.getfoundry.sh/cast/)
```shell
cast <subcommand>
```

### Help

```shell
forge --help
anvil --help
cast --help
```


## FAQ

### Error: `Error: server returned an error response: error code -32603: Signer had insufficient balance`

This error happens when you don't have enough balance to deploy your contract. You can check your balance with the following command:

```shell
cast wallet address --account monad-deployer
```

### I have constructor arguments, how do I deploy my contract?

```shell
forge create \
  src/Counter.sol:Counter \
  --account monad-deployer \
  --broadcast \
  --constructor-args <constructor_arguments>
```

### I have constructor arguments, how do I verify my contract?

```shell
forge verify-contract \
  <contract_address> \
  src/Counter.sol:Counter \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org \
  --constructor-args <abi_encoded_constructor_arguments>
```

Please refer to the [Foundry Book](https://book.getfoundry.sh/) for more information.