export const EcoType = {
  ALL: 'ALL',
  NEAR: 'NEAR',
  OpenBuild: 'OpenBuild',
  Starknet: 'Starknet',
} as const;

export type EcoTypeType = typeof EcoType;

export type EcoTypeName = keyof typeof EcoType;

export type EcoTypeValue = (typeof EcoType)[keyof typeof EcoType];
