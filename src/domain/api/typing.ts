import type { DataValue } from "@/types";
import type { SqlStylePagination } from "@/clients/http";

type PaginatableParams = Partial<SqlStylePagination> & {
  search?: string;
  order?: string;
  direction?: string;
};

type TotalResponseData = {
  total: string;
};

type ListResponseData<T extends DataValue = DataValue> = {
  list: T[];
};

type EcoRequestParams = {
  eco: string;
};

type EcoRankRecord = {
  eco_name: string;
  actors_total: number;
  actors_core_total: number;
  actors_new_total: number;
  repos_total: number;
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
  contributor_count: number;
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
  EcoRequestParams, EcoRankRecord, EcoRepo,
  RepoRankRecord,
  ActorRankRecord, ActorTrendRecord,
};
