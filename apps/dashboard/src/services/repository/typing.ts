import type { Repo } from "../github/typing";

type Repository = Pick<Repo, "id" | "name"> & {
  fullName: string;
  description: string;
  statistics: {
    star: number;
    fork: number;
    watch: number;
    openIssue: number;
    contributor: number;
  };
  customMark?: number | string;
};

type ManageableListParams = {
  pageNum?: number;
  pageSize?: number;
  eco: string;
  search?: string;
  order?: string;
  direction?: string;
};

export type { Repository, ManageableListParams };
