export class QueryTopStar {
  ecosystem: string;
  top_repositories: QueryTopStarRepo[];
}

export class QueryTopStarRepo {
  repo_id: number;
  repo_name: string;
  star_count: number;
  forks_count: number = 0;
  open_issues_count: number = 0;
  contributor_count: number;
}
