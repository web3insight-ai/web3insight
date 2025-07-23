import type { ManageableListParams } from "../repository/typing";

type Ecosystem = {
  name: string;
};

enum EcosystemType {
  ALL = "all",
  PUBLIC_CHAIN = "public_chain",
  INFRASTRUCTURE = "infrastructure", 
  COMMUNITY = "community",
}

const EcosystemTypeLabels: Record<EcosystemType, string> = {
  [EcosystemType.ALL]: "All",
  [EcosystemType.PUBLIC_CHAIN]: "Public Chain",
  [EcosystemType.INFRASTRUCTURE]: "Infrastructure",
  [EcosystemType.COMMUNITY]: "Community",
};

export type { Ecosystem, ManageableListParams as RepositoryListParams };
export { EcosystemType, EcosystemTypeLabels };
