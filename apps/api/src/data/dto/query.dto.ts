import { StatsPeriod } from './data.dto';

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
  description: string;
  star_growth_7d: number;
  developer_count_last_7_days: number;
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

export class QueryActorDate {
  ecosystem_name: string;
  time_unit: StatsPeriod;
  data: ActorDateItemDto[];
}

export class ActorDateItemDto {
  date: Date = new Date();
  total: number = 0;
}

export class QueryActorCountryStat {
  country: string;
  actor_count: number;
}

export class QueryYearlyDeveloperStat {
  activity_year: number;
  active_developers: number;
  new_developers: number;
  active_developers_yearly_growth_rate: number | null;
  new_developers_yearly_growth_rate: number | null;
}

export class QueryChineseEcosystemParticipation {
  ecosystem_name: string;
  active: boolean | null;
  kind: string | null;
  developer_count: number;
}

export class QueryChineseEcosystemNewDevelopers {
  ecosystem_name: string;
  active: boolean | null;
  kind: string | null;
  new_developer_count: number;
}

export class QueryChineseRepoParticipation {
  repo_id: number;
  repo_name: string;
  developer_count: number;
}
