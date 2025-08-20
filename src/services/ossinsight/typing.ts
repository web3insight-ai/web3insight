type PersonalOverview = {
  user_id: number;
  issues: number;
  pull_requests: number;
  code_reviews: number;
}

type ContributionType = "pushes" | "issues" | "issue_comments" | "pull_requests" | "reviews" | "review_comments";

type PersonalContributionTrend = {
  cnt: number;
  contribution_type: ContributionType;
  event_month: string;
};

export type { PersonalOverview, PersonalContributionTrend };
export type { User as GithubUser } from "../github/typing";
