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

export class QueryTopActors {
  ecosystem: string;
  top_actors: QueryTopActor[];
}

export class QueryReposTotal {
  ecosystem_name: string;
  repo_count: number;
}

export class QueryEcoTotal {
  ecosystem_count: number;
}

export class QueryActorsTotal {
  ecosystem: string;
  total_actors: number;
  recent_active_actors: number;
  new_developers_90days: number;
}

export class QueryTopActor {
  actor_id: number;
  actor_login: string;
  total_score: number;
  total_commit_count: number = 0;
  top_repos: QueryTopActorRepo[];
}

export class QueryTopActorRepo {
  repo_id: number;
  repo_name: string;
  commit_count: number = 0;
  score: number;
}
