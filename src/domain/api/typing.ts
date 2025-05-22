type EcosystemType = "NEAR" | "OpenBuild" | "Starknet";

type EcoRequestParams = {
  eco: EcosystemType | "ALL";
};

type TotalResponseData = {
  total: string;
};

type ListResponseData<T> = {
  list: T[];
};

type EcoRankRecord = {
  eco_name: string;
  actors_total: number;
  actors_core_total: number;
}

type RepoBasic = {
  repo_id: number;
  repo_name: string;
}

type RepoRankRecord =  RepoBasic & {
  star_count: number;
  forks_count: number;
  open_issues_count: number;
}

type ActorBasic = {
  actor_id: number;
  actor_login: string;
}

type ActorRankRecord = ActorBasic & {
  total_commit_count: number;
  top_repos: (RepoBasic & {
    commit_count: number;
  })[];
};

type ActorTrendRecord = {
  date: string;
  total: number;
}

export type {
  EcoRequestParams, TotalResponseData, ListResponseData,
  EcoRankRecord, RepoRankRecord, ActorRankRecord, ActorTrendRecord,
};
