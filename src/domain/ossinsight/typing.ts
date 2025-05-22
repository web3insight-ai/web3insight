type PersonalOverview = {
  user_id: number;
  issues: number;
  pull_requests: number;
  code_reviews: number;
}

export type { PersonalOverview };
export type { User as GithubUser } from "../github/typing";
