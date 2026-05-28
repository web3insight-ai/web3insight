# Contracts Package Guide

Scope: `packages/contracts/**`. Inherit the root guide; this file covers Foundry/Solidity rules.

## Surface

- Package: `@web3insight/contracts`
- Foundry project for the Web3Insight Monad NFT contract.
- Monad Testnet chain ID: `10143`, RPC: `https://testnet-rpc.monad.xyz`.

## Commands

```bash
pnpm --filter @web3insight/contracts build
pnpm --filter @web3insight/contracts test
pnpm --filter @web3insight/contracts format
pnpm --filter @web3insight/contracts format:check
pnpm --filter @web3insight/contracts deploy:testnet
```

## Safety Rules

- Never commit private keys, mnemonics, Foundry keystores, RPC secrets, or deployment wallets.
- Do not run `deploy:testnet` or any `--broadcast` script unless the user confirms target chain, deployer, and expected effect.
- Contract changes that alter frontend/API assumptions must update `apps/dev-card` and related API metadata/minting code or call out the follow-up clearly.
- Keep changes minimal, run `forge fmt` and `forge test`, and preserve reproducible Sourcify verification settings from `README.md`.
