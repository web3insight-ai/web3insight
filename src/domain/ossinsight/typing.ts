type GithubUser = {
  id: number;
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  html_url: string;
  created_at: string;
};

type PersonalOverview = {
  user_id: number;
  issues: number;
  pull_requests: number;
  code_reviews: number;
}

export type { GithubUser, PersonalOverview };
