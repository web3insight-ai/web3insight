import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
  DEVELOPER_ROAST_SYSTEM_PROMPT,
  buildDeveloperRoastUserMessage,
  EcoInfo,
  RoastReport,
} from '../prompts/developer-roast.prompt';

/**
 * 分析请求数据结构 - 来自数据库的 api_analysis_users 表
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

/**
 * AI 分析响应结构 - 与 n8n 响应格式一致
 */
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

@Injectable()
export class DeveloperAnalysisService {
  private readonly logger = new Logger(DeveloperAnalysisService.name);
  private readonly openai;

  constructor(private readonly configService: ConfigService) {
    // 使用 OpenRouter 作为 OpenAI 兼容的 API
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const baseURL =
      this.configService.get<string>('OPENROUTER_BASE_URL') ||
      'https://openrouter.ai/api/v1';

    if (!apiKey) {
      this.logger.warn(
        'OPENROUTER_API_KEY not configured, AI analysis will fail',
      );
    }

    this.openai = createOpenAI({
      apiKey: apiKey || '',
      baseURL,
    });
  }

  /**
   * 分析开发者数据并生成 AI 锐评
   * 复刻 n8n 的完整工作流逻辑
   */
  async analyze(analysisData: AnalysisData): Promise<DeveloperAnalysisResult> {
    const timestamp = new Date().toISOString();

    try {
      // Step 1: 验证输入数据
      const githubUser = analysisData.github?.users?.[0];
      const ecosystemUser = analysisData.data?.users?.[0];

      if (!githubUser?.id && !ecosystemUser?.actor_id) {
        throw new Error('Invalid input: GitHub user data is required');
      }

      // Step 2: 提取开发者数据 (复刻 n8n Extract Developer Data)
      const developerData = this.extractDeveloperData(
        githubUser,
        ecosystemUser,
      );

      // Step 3: 调用 AI 生成锐评 (复刻 n8n AI Developer Analyzer)
      const roastReport = await this.generateRoastReport(developerData);

      // Step 4: 格式化响应 (复刻 n8n Format Final Response)
      const profile = this.buildProfile(githubUser, ecosystemUser);

      return {
        success: true,
        timestamp,
        data: {
          profile,
          roastReport,
        },
        metadata: {
          analysisVersion: '2.0',
          includesRoast: true,
        },
      };
    } catch (error) {
      this.logger.error('Developer analysis failed', error);
      throw error;
    }
  }

  /**
   * 提取开发者数据 - 复刻 n8n 的 Extract Developer Data 节点
   */
  private extractDeveloperData(
    githubUser: GitHubUser,
    ecosystemUser?: EcosystemUser,
  ): {
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
  } {
    const now = new Date();
    const createdAt = new Date(githubUser.created_at);
    const updatedAt = new Date(githubUser.updated_at);

    // 计算账号年龄
    const yearsFromCreate = (
      Math.round(
        ((now.getTime() - createdAt.getTime()) /
          (1000 * 60 * 60 * 24 * 365)) *
          10,
      ) / 10
    ).toString();

    // 计算最近活跃天数
    const daysFromLastActivity = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    ).toString();

    // 构建生态信息数组
    const ecoInfo: EcoInfo[] = (ecosystemUser?.ecosystem_scores || []).map(
      (e) => {
        const firstActivity = new Date(e.first_activity_at);
        const lastActivity = new Date(e.last_activity_at);

        // 计算月数（用于计算月均贡献分数）
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

  /**
   * 调用 AI 生成毒舌锐评 - 复刻 n8n 的 AI Developer Analyzer 节点
   */
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
    const model =
      this.configService.get<string>('OPENROUTER_MODEL') ||
      'anthropic/claude-sonnet-4';

    const userMessage = buildDeveloperRoastUserMessage(developerData);

    this.logger.debug(`Calling AI model: ${model}`);

    const { text } = await generateText({
      model: this.openai(model),
      system: DEVELOPER_ROAST_SYSTEM_PROMPT,
      prompt: userMessage,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    // 解析 JSON 响应
    try {
      // 尝试提取 JSON 内容（可能被包裹在 markdown 代码块中）
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
    } catch (parseError) {
      this.logger.warn('Failed to parse AI response as JSON, using raw text');
      return {
        chinese: text,
        english: text,
      };
    }
  }

  /**
   * 构建开发者档案 - 复刻 n8n 的 Format Final Response 节点
   */
  private buildProfile(
    githubUser: GitHubUser,
    ecosystemUser?: EcosystemUser,
  ): DeveloperProfile {
    // 获取总分（从 ALL 生态中获取）
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
