export enum EcoType {
  ALL = 'ALL',
  NEAR = 'NEAR',
  OpenBuild = 'OpenBuild',
  Starknet = 'Starknet',
}

export type EcoTypeValue = `${EcoType}`;

export enum ActorsScopeType {
  ALL = 'ALL',
  Core = 'Core',
}

export type ActorsScopeTypeValue = `${ActorsScopeType}`;
