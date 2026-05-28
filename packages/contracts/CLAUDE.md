# CLAUDE.md

Project-scoped guidance for `packages/contracts` (`@web3insight/contracts`). For monorepo-wide conventions, see `../../CLAUDE.md`.

## Project overview

Foundry / Solidity project for the Web3Insight Monad NFT contract. The deployed Monad Testnet contract is documented in `README.md` and currently verified on Sourcify.

## Essential commands

```bash
pnpm --filter @web3insight/contracts build
pnpm --filter @web3insight/contracts test
pnpm --filter @web3insight/contracts format
pnpm --filter @web3insight/contracts format:check
pnpm --filter @web3insight/contracts deploy:testnet
```

## Safety rules

- Never commit private keys, mnemonic phrases, Foundry keystores, RPC secrets, or deployment wallets.
- Do not run `deploy:testnet` or any `--broadcast` script unless the user explicitly confirms target chain, deployer, and expected effect.
- Verify chain ID before reads/writes. Monad Testnet is chain ID `10143`, RPC `https://testnet-rpc.monad.xyz`.
- Contract changes that alter frontend/API assumptions must be reflected in `apps/dev-card` and any API metadata/minting code in the same task or clearly called out.

## Solidity conventions

- Keep contract changes minimal and security-reviewable.
- Run `forge fmt` and `forge test` for any Solidity/script change.
- Prefer explicit events and access control checks; do not bypass owner/admin constraints for tests without documenting why.
- For verification, use Sourcify settings from `README.md` and keep constructor args reproducible.
