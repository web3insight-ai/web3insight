import type { NormalizedPagination, SqlStylePagination } from "@/clients/http";

import type { Repo } from "../github/typing";
import type { PaginatableParams } from "../api/typing";

type Repository = Pick<Repo, "id" | "name"> & {
  fullName: string;
  description: string;
  statistics: {
    star: number;
    fork: number;
    watch: number;
    openIssue: number;
  };
  customMark?: number | string;
};

type ManageableListParams = NormalizedPagination & Omit<PaginatableParams, keyof SqlStylePagination> & {
  eco: string;
};

export type { Repository, ManageableListParams };
