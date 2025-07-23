import type { User as GithubUser } from "../github/typing";
import type { Developer } from "../developer/typing";

type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

type EcosystemAnalytics = {
  name: string;
  score: number;
  repos: {
    fullName: string;
    score: string;
  }[];
};

type PartialEcosystemAnalytics = {
  name: string;
  score?: number;
  repos?: {
    fullName: string;
    score: string;
  }[];
  status: AnalysisStatus;
  progress?: number;
  estimatedTime?: string;
};

type Contestant = Developer & {
  analytics: EcosystemAnalytics[];
};

type PartialContestant = GithubUser & {
  analytics?: PartialEcosystemAnalytics[];
  analysisStatus: AnalysisStatus;
  analysisProgress?: number;
  estimatedTime?: string;
};

type EventReport = {
  id: string;
  type: "hackathon";
  description: string; // Event name/title
  contestants: Contestant[];
};

type PartialEventReport = {
  id: string;
  type: "hackathon";
  description: string; // Event name/title
  contestants: PartialContestant[];
  analysisComplete: boolean;
};

export type { 
  GithubUser, 
  AnalysisStatus,
  EcosystemAnalytics, 
  PartialEcosystemAnalytics,
  Contestant,
  PartialContestant,
  EventReport, 
  PartialEventReport, 
};
