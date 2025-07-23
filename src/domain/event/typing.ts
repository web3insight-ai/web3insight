import type { User as GithubUser } from "../github/typing";
import type { Developer } from "../developer/typing";

type EcosystemAnalytics = {
  name: string;
  score: number;
  repos: {
    fullName: string;
    score: string;
  }[];
};

type Contestant = Developer & {
  analytics: EcosystemAnalytics[];
};

type EventReport = {
  id: string;
  type: "hackathon";
  description: string;
  contestants: Contestant[];
};

export type { GithubUser, EcosystemAnalytics, EventReport };
