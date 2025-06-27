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
  Nexus = 'Nexus',
  Hyperlane = 'Hyperlane',
  Chainlink = 'Chainlink',
  Base = 'Base',
}

export type EcoTypeValue = `${EcoType}`;

export enum ActorsScopeType {
  ALL = 'ALL',
  Core = 'Core',
}

export type ActorsScopeTypeValue = `${ActorsScopeType}`;

export const EcoTypeArray: string[] = Object.values(EcoType);
