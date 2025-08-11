export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string | number;
  message: string;
  data: T;
  extra?: Record<string, unknown>;
}

export interface AnalysisRequest {
  request_data?: string[];
  intent: string;
  description?: string;
}

export interface AnalysisResponse {
  id: number;
  users: {
    users: GitHubUser[];
  };
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id?: string;
  avatar_url: string;
  gravatar_id?: string;
  url?: string;
  html_url: string;
  followers_url?: string;
  following_url?: string;
  gists_url?: string;
  starred_url?: string;
  subscriptions_url?: string;
  organizations_url?: string;
  repos_url?: string;
  events_url?: string;
  received_events_url?: string;
  type?: string;
  user_view_type?: string;
  site_admin?: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists?: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at?: string;
  ecosystem_scores?: EcosystemScore[];
  ai?: AIProfile;
}

export interface EcosystemScore {
  repos: Array<{
    score: number;
    repo_name: string;
    last_activity_at: string;
    first_activity_at: string;
  }>;
  ecosystem: string;
  total_score: number;
  last_activity_at: string;
  first_activity_at: string;
}

export interface AnalyticsUser {
  actor_id: string;
  ecosystem_scores: EcosystemScore[];
}

export interface AIProfile {
  summary?: string;
  skills?: string[];
  expertise_areas?: string[];
  contribution_patterns?: Record<string, unknown>;
  ai_insights?: Record<string, unknown>;
  web3_involvement?: {
    score: number;
    level: string;
    evidence: string[];
  };
  recommendation?: string;
  analysis_date?: string;

  // Rich data from response.json - comprehensive AI analysis data
  highlights?: string[];
  profileCard?: {
    bio: string;
    blog: string;
    name: string;
    stats: {
      followers: number;
      following: number;
      totalScore: number;
      publicRepos: number;
    };
    twitter: string;
    location: string;
    username: string;
    avatar_url: string;
    created_at: string;
  };
  technicalStack?: {
    skills: string[];
    languages: string[];
    mainFocus: string;
    frameworks: string[];
  };
  web3Ecosystems?: {
    top3: Array<{
      name: string;
      rank: number;
      score: number;
      percentage: number;
      lastActivityAt: string;
      firstActivityAt: string;
    }>;
    detailed: Array<{
      repos: Array<{
        name: string;
        score: number;
        lastActivityAt: string;
        firstActivityAt: string;
      }>;
      score: number;
      ecosystem: string;
    }>;
    otherEcosystems: Array<{
      name: string;
      score: number;
      repoCount: number;
      lastActivityAt: string;
      firstActivityAt: string;
    }>;
  };
  activityTimeline?: {
    lastActivity: string;
    activityLevel: string;
    totalDaysActive: number;
    firstWeb3Activity: string;
  };

  // AI Roast Report - comprehensive sarcastic analysis
  roast_report?: {
    title: string;
    overall_roast: string;
    activity_roast: string;
    ecosystem_roast: string;
    technical_roast: string;
    final_verdict: string;
    constructive_sarcasm: string[];
    roast_score: {
      spicyLevel: string;
      truthLevel: string;
      helpfulLevel: string;
    };
  };
}

// Raw API response structure from GET /v1/custom/analysis/users/{id}
export interface RawAnalysisResult {
  id: string;
  intent: string;
  request_data: {
    urls: string[];
  };
  github: {
    users: GitHubUser[];
  };
  data: {
    users: AnalyticsUser[];
  };
  created_at: string;
  updated_at: string;
  description: string;
  submitter_id: string;
  ai?: {
    success?: boolean;
    data?: {
      profile: {
        output: {
          highlights?: string[];
          profileCard?: AIProfile['profileCard'];
          technicalStack?: AIProfile['technicalStack'];
          web3Ecosystems?: AIProfile['web3Ecosystems'];
          activityTimeline?: AIProfile['activityTimeline'];
        };
      };
      roastReport?: {
        output: {
          title: string;
          overallRoast: string;
          activityRoast: string;
          ecosystemRoast: string;
          technicalRoast: string;
          finalVerdict: string;
          constructiveSarcasm: string[];
          roastScore: {
            spicyLevel: string;
            truthLevel: string;
            helpfulLevel: string;
          };
        };
      };
    };
    timestamp?: string;
  };
  public: boolean;
}

// Processed result structure returned by our repository functions
export interface AnalysisResult {
  data: {
    users: GitHubUser[];
  };
  status: "pending" | "analyzing" | "completed" | "failed";
  progress?: number;
  estimatedTime?: string;
  message?: string;
}

export interface BasicAnalysisResult {
  id: number;
  users: GitHubUser[];
}

export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

// Callback function types
export type ProgressCallback = (status: string, progressValue?: number, data?: Partial<AnalysisResult>) => void;
export type BasicDataCallback = (basicData: BasicAnalysisResult) => void;

// Ecosystem data types
export interface EcosystemItem {
  name: string;
  rank: number;
  score: number;
  percentage: number;
  lastActivityAt: string;
  firstActivityAt: string;
}
