export enum EcoType {
  ALL = 'ALL',
  NEAR = 'NEAR',
  Solana = 'Solana',
  OpenBuild = 'OpenBuild',
  Starknet = 'Starknet',
  Bitcoin = 'Bitcoin',
  Ethereum = 'Ethereum',
  Aptos = 'Aptos',
  Sui = 'Sui',
  Mantle = 'Mantle',
  Monad = 'Monad',
}

export type EcoTypeValue = `${EcoType}`;

export enum ActorsScopeType {
  ALL = 'ALL',
  Core = 'Core',
}

export type ActorsScopeTypeValue = `${ActorsScopeType}`;
