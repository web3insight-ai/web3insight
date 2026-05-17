export const ECO_ALL = 'ALL' as const;

export type EcoName = string;

export type EcoNameFilter = string;

export enum ActorsScopeType {
  ALL = 'ALL',
  Core = 'Core',
}

export type ActorsScopeTypeValue = `${ActorsScopeType}`;

export enum StatsPeriod {
  WEEK = 'week',
  MONTH = 'month',
}

// const METHOD = {} as const;

// type METHOD_TYPE = (typeof METHOD)[keyof typeof METHOD];
