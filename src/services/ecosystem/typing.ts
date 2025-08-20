import type { ManageableListParams } from "../repository/typing";
import type { EcoRankRecord } from "../api/typing";

type Ecosystem = {
  name: string;
};

type EcosystemWithStats = EcoRankRecord;

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

export type { Ecosystem, EcosystemWithStats, ManageableListParams as RepositoryListParams };
export { EcosystemType, EcosystemTypeLabels };
