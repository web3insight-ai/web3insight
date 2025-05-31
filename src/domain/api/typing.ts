import type { DataValue } from "@/types";

type PaginatableParams = {
  search?: string;
  order?: string;
  skip?: number;
  take?: number
};

type TotalResponseData = {
  total: string;
};

type ListResponseData<T> = {
  list: T[];
};

type EcosystemType = "NEAR" | "OpenBuild" | "Starknet";

type EcoRequestParams = {
  eco: EcosystemType | "ALL";
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

type EcoRepo = RepoBasic & {
  upstream_marks: Record<string, DataValue>;
  custom_marks: Record<string, DataValue>;
};

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
  PaginatableParams, TotalResponseData, ListResponseData,
  EcosystemType, EcoRequestParams, EcoRankRecord, EcoRepo,
  RepoRankRecord,
  ActorRankRecord, ActorTrendRecord,
};
