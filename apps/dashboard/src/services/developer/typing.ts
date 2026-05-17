import type { User, Event } from "../github/typing";

type EcosystemInfo = {
  ecosystem: string;
  totalScore?: number;
  repoCount?: number;
  firstActivityAt?: string;
  lastActivityAt?: string;
};

type DeveloperEcosystems = {
  ecosystems: EcosystemInfo[];
  totalScore?: number;
};

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

type ActivityDescriptionResolver = (event: Event) => string;

type DeveloperActivity = {
  id: string;
  description: string;
  date: string;
};

type DeveloperContribution = {
  date: string;
  total: number;
};

export type {
  Developer,
  EcosystemInfo,
  DeveloperEcosystems,
  ActivityDescriptionResolver,
  DeveloperActivity,
  DeveloperContribution,
};
