type User = {
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

type Repo = {
  id: number;
  name: string;
  full_name: string;
  owner: Pick<User, "id" | "login" | "avatar_url" | "html_url">;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
};

export type { User, Repo };
