import type { DataValue } from "@/types";

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard API response wrapper
 * Matches existing ResponseResult type from @/types/http.ts
 */
export interface ResponseResult<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  code: string;
  extra?: unknown;
}

/**
 * Pagination params for SQL-style pagination
 */
export interface PaginationParams {
  offset?: number;
  limit?: number;
  search?: string;
  order?: string;
  direction?: "asc" | "desc";
}

/**
 * Common response with total count
 */
export interface TotalResponse {
  total: string;
}

/**
 * Common response with list
 */
export interface ListResponse<T> {
  list: T[];
}

// ============================================================================
// Ecosystem Types
// ============================================================================

export interface EcoRankRecord {
  eco_name: string;
  actors_total: number;
  actors_core_total: number;
  actors_new_total: number;
  repos_total: number;
  kind?: string;
}

export interface EcoRepo {
  repo_id: number;
  repo_name: string;
  upstream_marks: Record<string, DataValue>;
  custom_marks: Record<string, DataValue>;
}

export interface AdminEcosystemListResponse {
  provider_ecosystem: string[];
  available_ecosystem: string[];
}

// ============================================================================
// Repository Types
// ============================================================================

export interface RepoBasic {
  repo_id: number;
  repo_name: string;
}

export interface RepoRankRecord extends RepoBasic {
  star_count: number;
  forks_count: number;
  open_issues_count: number;
  contributor_count: number;
}

export interface RepoTrendingRecord extends RepoBasic {
  star_count: number;
  forks_count: number;
  open_issues_count: number;
  star_growth_7d: number;
  description: string;
}

export interface RepoDeveloperActivityRecord extends RepoBasic {
  dev_7_day: number;
  star_count: number;
  forks_count: number;
  open_issues_count: number;
  description: string;
}

export interface RepoActiveDeveloperRecord {
  month: string;
  developers: number;
}

// ============================================================================
// Actor (Developer) Types
// ============================================================================

export interface ActorBasic {
  actor_id: number;
  actor_login: string;
}

export interface ActorRankRecord extends ActorBasic {
  total_commit_count: number;
  top_repos: (RepoBasic & {
    commit_count: number;
  })[];
}

export interface ActorTrendRecord {
  date: string;
  total: number;
}

export interface ActorCountryRankRecord {
  country: string;
  total: number;
}

export interface ActorCountryRankResponse extends ListResponse<ActorCountryRankRecord> {
  total: number;
}

// ============================================================================
// API Request Params
// ============================================================================

export interface EcoParams {
  eco?: string;
}

export interface ActorTotalParams extends EcoParams {
  scope?: "ALL" | "Core";
}

export interface ActorTrendParams extends EcoParams {
  period?: "week" | "month";
}

// ============================================================================
// Custom Analysis Types
// ============================================================================

export interface AnalysisUserListParams {
  offset?: number;
  limit?: number;
  search?: string;
  order?: string;
  direction?: string;
}

export interface AnalyzeUserRequest {
  request_data: string[];
  intent: string;
  description?: string;
}

export interface AnalyzeUserResponse {
  id: number;
  users: Array<{
    id: number;
    login: string;
    name: string;
    avatar_url: string;
  }>;
}

// ============================================================================
// Event Types
// ============================================================================

export interface EventInsight {
  id: string;
  description: string;
  created_at: string;
}

export interface EventInsightsParams {
  skip?: number;
  take?: number;
  intent?: string;
  direction?: "asc" | "desc";
}

export interface EventInsightsResponse {
  list: EventInsight[];
  total: number;
}

// ============================================================================
// Developer Types
// ============================================================================

export interface EcosystemInfo {
  ecosystem: string;
  totalScore?: number;
  repoCount: number;
  firstActivityAt?: string;
  lastActivityAt?: string;
}

export interface DeveloperEcosystems {
  ecosystems: EcosystemInfo[];
  totalScore?: number;
}

export interface EcoScoreApiResponse {
  actor_id?: string;
  actor_login?: string;
  eco_score?: {
    ecosystems?: Array<{
      ecosystem: string;
      total_score?: number;
      repos?: Array<{
        repo_name: string;
        score: number;
      }>;
      first_activity_at?: string;
      last_activity_at?: string;
    }>;
    total_score?: number;
    updated_at?: string;
  };
}

// ============================================================================
// GitHub Proxy Types
// ============================================================================

export interface GitHubUser {
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
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: Pick<GitHubUser, "id" | "login" | "avatar_url" | "html_url">;
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
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: Pick<GitHubUser, "id" | "login" | "avatar_url">;
  repo: { id: number; name: string };
  public: boolean;
  created_at: string;
  payload: Record<string, unknown>;
  org?: {
    id: number;
    login: string;
    avatar_url: string;
  };
}

// ============================================================================
// OSS Insight Types
// ============================================================================

export interface OssInsightUser {
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
}

export interface PersonalOverview {
  user_id: number;
  issues: number;
  pull_requests: number;
  code_reviews: number;
}

export type ContributionType =
  | "pushes"
  | "issues"
  | "issue_comments"
  | "pull_requests"
  | "reviews"
  | "review_comments";

export interface PersonalContributionTrend {
  cnt: number;
  contribution_type: ContributionType;
  event_month: string;
}

// ============================================================================
// Developer Detail Types
// ============================================================================

export interface Developer {
  id: number;
  username: string;
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
}

export interface DeveloperActivity {
  id: string;
  description: string;
  date: string;
}

export interface DeveloperContribution {
  date: string;
  total: number;
}

export interface DeveloperRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  statistics: {
    star: number;
    fork: number;
    watch: number;
    openIssue: number;
    contributor: number;
  };
}

// ============================================================================
// x402 Donate Types
// ============================================================================

/**
 * Configuration from .x402/donation.json file
 */
export interface DonationConfig {
  payTo: string;
  recipients?: { address: string; basisPoints: number }[];
  title?: string;
  description?: string;
  creator?: string;
  defaultAmount?: number;
  network?: string;
  links?: string[];
}

/**
 * Repository info stored in donate_repos table
 */
export interface DonateRepoInfo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
}

/**
 * Donate repo record from API
 */
export interface DonateRepo {
  repo_id: number;
  repo_info: DonateRepoInfo;
  repo_donate_data: DonationConfig | null;
  submitter_id: number;
  created_at: string;
  updated_at: string;
}
