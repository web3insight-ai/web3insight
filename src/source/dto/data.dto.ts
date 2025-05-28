export enum EcoType {
  ALL = 'ALL',
  NEAR = 'NEAR',
  Aurora = 'Aurora',
  Solana = 'Solana',
  OpenBuild = 'OpenBuild',
  Starknet = 'Starknet',
  Bitcoin = 'Bitcoin',
  Ethereum = 'Ethereum',
  NSL = 'Natural Selection Labs  (RSS3)',
  Aptos = 'Aptos',
  Sui = 'Sui',
  Mantle = 'Mantle',
}

export type EcoTypeValue = `${EcoType}`;

export enum ActorsScopeType {
  ALL = 'ALL',
  Core = 'Core',
}

export type ActorsScopeTypeValue = `${ActorsScopeType}`;
