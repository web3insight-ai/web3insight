import type { RepoRankRecord } from "../api/typing";
import type { Repository } from "./typing";

function resolveDataSource(raw: RepoRankRecord[]): Repository[] {
  return raw.map(repo => ({
    id: repo.repo_id,
    name: repo.repo_name,
    fullName: repo.repo_name,
    description: "",
    statistics: {
      star: repo.star_count,
      fork: repo.forks_count,
      watch: 0,
      openIssue: repo.open_issues_count,
    },
  }));
}

export { resolveDataSource };
