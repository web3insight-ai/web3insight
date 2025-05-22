import type { User } from "../github/typing";

type Developer = {
  id: User["id"];
  username: User["login"];
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

type DeveloperActivity = {
  id: string;
  description: string;
  date: string;
}

export type { Developer, DeveloperActivity };
