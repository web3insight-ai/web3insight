import type { ManageableListParams } from "../repository/typing";

type Ecosystem = {
  name: string;
};

enum EcosystemType {
  ALL = "all",
  PUBLIC_CHAIN = "public_chain",
  INFRASTRUCTURE = "infrastructure", 
  COMMUNITY = "community",
  DAO = "dao",
}

const EcosystemTypeLabels: Record<EcosystemType, string> = {
  [EcosystemType.ALL]: "All",
  [EcosystemType.PUBLIC_CHAIN]: "Public Chain",
  [EcosystemType.INFRASTRUCTURE]: "Infrastructure",
  [EcosystemType.COMMUNITY]: "Community",
  [EcosystemType.DAO]: "DAO",
};

export type { Ecosystem, ManageableListParams as RepositoryListParams };
export { EcosystemType, EcosystemTypeLabels };
