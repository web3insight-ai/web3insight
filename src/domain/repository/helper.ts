import type { RepoRankRecord } from "../api/typing";
import type { Repository } from "./typing";

const customMarkTextMap = {
  0: "Irrelevant",
  1: "Tangential",
  2: "Peripheral",
  3: "Incidental",
  4: "Marginal",
  5: "Relevant",
  6: "Notable",
  7: "Important",
  8: "Strategic",
  9: "Pillar",
  10: "Core",
};

function resolveCustomMarkText(mark: number | string): string {
  return customMarkTextMap[mark as keyof typeof customMarkTextMap] || "Unspecified";
}

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

export { resolveCustomMarkText, resolveDataSource };
