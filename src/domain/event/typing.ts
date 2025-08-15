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
  request_data?: string[]; // Original participant URLs
};

type PartialEventReport = {
  id: string;
  type: "hackathon";
  description: string; // Event name/title
  contestants: PartialContestant[];
  analysisComplete: boolean;
};

type EventInsight = {
  id: string;
  description: string;
  created_at: string;
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
  EventInsight,
};
