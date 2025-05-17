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

type RepositoryRankRecord = {
  repo_id: number;
  repo_name: string;
  star_count: number;
  forks_count: number;
  open_issues_count: number;
}

type DeveloperRankRecord = {
  actor_id: number;
  actor_login: string;
  total_commit_count: number;
  top_repos: {
    repo_id: number;
    repo_name: string;
    commit_count: number;
  }[];
};

export type {
  EcoRequestParams, TotalResponseData, ListResponseData,
  RepositoryRankRecord, DeveloperRankRecord,
};
