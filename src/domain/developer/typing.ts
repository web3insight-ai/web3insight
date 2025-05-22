type GithubId = number;
type GithubLogin = string;

type Developer = {
  id: GithubId;
  username: GithubLogin;
  nickname: string;
  description: string;
  avatar: string;
  location: string;
  social: {
    github: string;
    twitter: string;
    website: string;
  };
  statistics: {
    repository: number;
    pullRequest: number;
    codeReview: number;
  };
  joinedAt: string;
};

export type { Developer };
