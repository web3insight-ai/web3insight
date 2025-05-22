import type { Repo } from "../github/typing";

type Repository = Pick<Repo, "id" | "name"> & {
  fullName: string;
  description: string;
  statistics: {
    star: number;
    fork: number;
    watch: number;
    openIssue: number;
  };
};

export type { Repository };
