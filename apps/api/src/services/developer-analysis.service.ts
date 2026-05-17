import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
  DEVELOPER_ROAST_SYSTEM_PROMPT,
  buildDeveloperRoastUserMessage,
  type EcoInfo,
  type RoastReport,
} from '@/ai/prompts/developer-roast.prompt';

/**
 * Pure-class port of ai/services/developer-analysis.service.ts. Drops
 * NestJS @Injectable + ConfigService + Logger; takes the OpenRouter
 * credentials through constructor config and uses console for diagnostics.
 *
 * Wired into the container in src/app/container.ts and surfaced to
 * UsersService through `deps.developerAnalysisService` so the legacy
 * analysis pipeline (custom-events flow) keeps working.
 */

export interface AnalysisData {
  id: string;
  intent: string;
  request_data: { urls: string[] };
  github: { users: GitHubUser[] };
  data: { users: EcosystemUser[] };
  created_at: string;
  updated_at: string;
  description: string;
  submitter_id: string;
  ai?: unknown;
  public: boolean;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  public_gists: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

interface EcosystemUser {
  actor_id: string;
  ecosystem_scores: EcosystemScore[];
}

interface EcosystemScore {
  ecosystem: string;
  repos: {
    score: number;
    repo_name: string;
    last_activity_at: string;
    first_activity_at: string;
  }[];
  total_score: number;
  last_activity_at: string;
  first_activity_at: string;
}

export interface DeveloperAnalysisResult {
  success: boolean;
  timestamp: string;
  data: {
    profile: DeveloperProfile;
    roastReport: RoastReport;
  };
  metadata?: {
    analysisVersion: string;
    includesRoast: boolean;
  };
}

interface DeveloperProfile {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  twitter: string;
  created_at: string;
  stats: {
    totalScore: string;
    followers: string;
    publicRepos: string;
    following: string;
  };
}

export interface DeveloperAnalysisConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export class DeveloperAnalysisService {
  private readonly openai;
  private readonly model: string;

  constructor(private readonly config: DeveloperAnalysisConfig) {
    if (!config.apiKey) {
      console.warn(
        '[DeveloperAnalysisService] OPENROUTER_API_KEY not configured — analyze() will fail',
      );
    }

    this.openai = createOpenAI({
      apiKey: config.apiKey ?? '',
      baseURL: config.baseURL ?? 'https://openrouter.ai/api/v1',
    });
    this.model = config.model ?? 'anthropic/claude-sonnet-4';
  }

  async analyze(analysisData: AnalysisData): Promise<DeveloperAnalysisResult> {
    const timestamp = new Date().toISOString();

    const githubUser = analysisData.github?.users?.[0];
    const ecosystemUser = analysisData.data?.users?.[0];

    if (!githubUser?.id && !ecosystemUser?.actor_id) {
      throw new Error('Invalid input: GitHub user data is required');
    }

    const developerData = this.extractDeveloperData(githubUser, ecosystemUser);
    const roastReport = await this.generateRoastReport(developerData);
    const profile = this.buildProfile(githubUser, ecosystemUser);

    return {
      success: true,
      timestamp,
      data: { profile, roastReport },
      metadata: {
        analysisVersion: '2.0',
        includesRoast: true,
      },
    };
  }

  private extractDeveloperData(
    githubUser: GitHubUser,
    ecosystemUser?: EcosystemUser,
  ) {
    const now = new Date();
    const createdAt = new Date(githubUser.created_at);
    const updatedAt = new Date(githubUser.updated_at);

    const yearsFromCreate = (
      Math.round(
        ((now.getTime() - createdAt.getTime()) /
          (1000 * 60 * 60 * 24 * 365)) *
          10,
      ) / 10
    ).toString();

    const daysFromLastActivity = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    ).toString();

    const ecoInfo: EcoInfo[] = (ecosystemUser?.ecosystem_scores || []).map(
      (e) => {
        const firstActivity = new Date(e.first_activity_at);
        const lastActivity = new Date(e.last_activity_at);
        const monthsBetween =
          (lastActivity.getTime() - firstActivity.getTime()) /
            (1000 * 60 * 60 * 24 * 30) +
          1;

        return {
          ecosystem_name: e.ecosystem || '',
          repo_cnt: e.repos?.length || 0,
          contribution_score: e.total_score || 0,
          score_per_month: ((e.total_score || 0) / monthsBetween).toFixed(2),
          first_activity: e.first_activity_at?.split('T')[0] || '',
          days_from_first_activity: `${Math.floor((now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
          last_activity: e.last_activity_at?.split('T')[0] || '',
          days_from_last_activity: `${Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
        };
      },
    );

    return {
      name: githubUser.name || githubUser.login || '',
      bio: githubUser.bio || '',
      location: githubUser.location || '',
      yearsFromCreate,
      daysFromLastActivity,
      publicGists: githubUser.public_gists || 0,
      publicRepos: githubUser.public_repos || 0,
      followers: githubUser.followers || 0,
      following: githubUser.following || 0,
      ecoInfo,
    };
  }

  private async generateRoastReport(developerData: {
    name: string;
    bio: string;
    location: string;
    yearsFromCreate: string;
    daysFromLastActivity: string;
    publicGists: number;
    publicRepos: number;
    followers: number;
    following: number;
    ecoInfo: EcoInfo[];
  }): Promise<RoastReport> {
    const userMessage = buildDeveloperRoastUserMessage(developerData);

    const { text } = await generateText({
      model: this.openai(this.model),
      system: DEVELOPER_ROAST_SYSTEM_PROMPT,
      prompt: userMessage,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    try {
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      const parsed = JSON.parse(jsonStr) as RoastReport;
      return {
        chinese: parsed.chinese || '',
        english: parsed.english || '',
      };
    } catch {
      console.warn(
        '[DeveloperAnalysisService] Failed to parse AI response as JSON, using raw text',
      );
      return { chinese: text, english: text };
    }
  }

  private buildProfile(
    githubUser: GitHubUser,
    ecosystemUser?: EcosystemUser,
  ): DeveloperProfile {
    const allEcosystem = ecosystemUser?.ecosystem_scores?.find(
      (e) => e.ecosystem === 'ALL',
    );
    const totalScore = allEcosystem?.total_score || 0;

    return {
      username: githubUser.login,
      name: githubUser.name || '',
      avatar_url: githubUser.avatar_url,
      bio: githubUser.bio || '',
      location: githubUser.location || '',
      blog: githubUser.blog || '',
      twitter: githubUser.twitter_username || '',
      created_at: githubUser.created_at?.split('T')[0] || '',
      stats: {
        totalScore: totalScore.toString(),
        followers: (githubUser.followers || 0).toString(),
        publicRepos: (githubUser.public_repos || 0).toString(),
        following: (githubUser.following || 0).toString(),
      },
    };
  }
}
