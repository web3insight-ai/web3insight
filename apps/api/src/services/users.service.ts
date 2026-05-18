import { Workbook } from 'exceljs';
import { existsSync } from 'fs';
import { isAbsolute, join, parse } from 'path';
import { and, count, eq, inArray, ne, sql } from 'drizzle-orm';
import type { DbClient } from '@/db/client';
import type { TokenPoolService } from '@/services/token-pool.service';
import type { GithubService } from '@/services/github.service';
import {
  api_analysis_users,
  api_auth_users_binds,
  data_actors,
  data_ecosystems,
} from '@/db/schema';
import { first, firstOrThrow } from '@/db/helpers';
import {
  type BaseIdReqAndResDto,
  type CustomQueryUsersOrderReqDto,
  type CustomQueryUsersReqDto,
  CustomQueryUsersResDto,
  type CustomShareReqDto,
  CustomUploadResDto,
  DirectionEnum,
  type GithubUsersDto,
  Intent,
} from '@/api/dto/api.dto';
import { logger } from '@/app/logger';

const log = logger.child({ service: 'users' });

type ApiAnalysisUsers = typeof api_analysis_users.$inferSelect;

type UserTopLangsResult = {
  username: string;
  languages: string[];
  error?: string;
};

type LanguageRankingItem = {
  language: string;
  count: number;
  percentage: number;
};

type TopLangsOverallAnalysis = {
  total_users: number;
  users_with_languages: number;
  users_without_languages: number;
  language_ranking: LanguageRankingItem[];
};

type TopLangsExportResult = {
  output_path: string;
  language_ranking_path: string;
  total_users: number;
  users_with_languages: number;
  users_without_languages: number;
  failed_users: { username: string; error: string }[];
  language_ranking: LanguageRankingItem[];
  overall_analysis: TopLangsOverallAnalysis;
};

/**
 * Late-bound dependencies needed only by a subset of UsersService methods.
 *
 * # Reason: AuthService depends on UsersService and vice-versa (Privy GitHub
 * binding lookup + JWT-issuing OAuth flow). To avoid a constructor cycle, we
 * pass the AuthService via a lazy getter from the container after both are
 * instantiated. The DeveloperAnalysisService is similarly deferred because
 * Phase E will port the OpenAI streaming separately.
 */
export interface UsersServiceDeps {
  /** Lazy accessor to break the AuthService ↔ UsersService cycle. */
  getAuthService: () => {
    getPrivyUserBindings(userDid: string): Promise<{
      user_id: string;
      // Reason: Privy SDK's LinkedAccount is a discriminated union; consumer code
      // narrows by `.type`. Using unknown[] avoids importing the full Privy type
      // surface into this interface.
      linked_accounts: ReadonlyArray<unknown>;
    } | null>;
  };
  /**
   * AI analyzer (Phase E port — pure class wired in src/app/container.ts).
   * Optional + duck-typed so test stubs can provide a minimal shim.
   */
  developerAnalysisService?: {
    analyze: (analysisData: unknown) => Promise<unknown>;
  } | null;
}

/**
 * Pure-class port of data/services/users.services.ts.
 *
 * Notable changes from the NestJS version:
 * - `@OnEvent('api.custom.analysis.createdv2')` removed — call
 *   `handleAnalysisCreated(payload)` directly from the upload handler instead.
 *   TODO(phase-f): wire Inngest event handler if async-after-response is needed.
 * - Logger replaced with console (Hono doesn't ship a Logger primitive).
 * - AuthService cycle broken via lazy getter passed in `UsersServiceDeps`.
 */
export class UsersService {
  constructor(
    private readonly db: DbClient,
    private readonly tokenPoolService: TokenPoolService,
    private readonly githubService: GithubService,
    private readonly deps: UsersServiceDeps,
  ) {}

  async uploadAndGetUsers(
    body: CustomQueryUsersReqDto,
    uid: string,
    ref: string = '',
  ) {
    const usernames = body.request_data.map((url) =>
      this.githubService.extractUsername(url),
    );

    if (body.intent === Intent.Profile) {
      const existing = await first(
        this.db
          .select({
            id: api_analysis_users.id,
            github: api_analysis_users.github,
            public: api_analysis_users.public,
            submitter_id: api_analysis_users.submitter_id,
          })
          .from(api_analysis_users)
          .where(
            and(
              eq(api_analysis_users.submitter_id, uid),
              eq(api_analysis_users.intent, body.intent),
            ),
          )
          .limit(1),
      );

      if (existing) {
        const res = new CustomUploadResDto();
        res.users = existing.github as GithubUsersDto[];
        res.id = Number(existing.id);
        return res;
      }

      const githubUsername = await this.getPrivyGithubUsername(uid);
      if (githubUsername) {
        usernames.push(githubUsername);
      }

      if (usernames.length === 0) {
        throw new Error('No GitHub usernames provided or linked');
      }
    }

    const githubData = [] as GithubUsersDto[];

    const fail = [] as string[];

    for (let i = 0; i < usernames.length; i += 10) {
      const batch = usernames.slice(i, i + 10);

      const batchResults = await Promise.all(
        batch.map(async (username) => {
          try {
            if (!username) {
              return null;
            }
            const clinet = await this.tokenPoolService.getClient();
            const response = await clinet.users.getByUsername({ username });
            return { username, data: response.data };
          } catch (error) {
            if (username) fail.push(username);
            log.error('failed to process user', {
              username,
              err: error instanceof Error ? error.message : String(error),
            });
            return null;
          }
        }),
      );

      batchResults.forEach((result) => {
        if (result) {
          githubData.push(result.data);
        }
      });
    }

    const res = new CustomUploadResDto();
    res.users = githubData;
    res.fail = fail;

    if (ref === '') {
      const inserted = await firstOrThrow(
        this.db
          .insert(api_analysis_users)
          .values({
            request_data: { urls: body.request_data },
            github: { users: githubData },
            intent: body.intent,
            submitter_id: uid,
            description: body.description,
          })
          .returning({ id: api_analysis_users.id }),
        'Failed to insert analysis_users',
      );

      res.id = Number(inserted.id);
    } else {
      res.id = Number(ref);
      await this.db
        .update(api_analysis_users)
        .set({
          request_data: { urls: body.request_data },
          github: { users: githubData },
          intent: body.intent,
          description: body.description,
          data: {},
          ai: {},
        })
        .where(eq(api_analysis_users.id, String(ref)));
    }

    // TODO(phase-f): originally this.eventEmitter.emit('api.custom.analysis.createdv2', res)
    // Callers should `void this.handleAnalysisCreated(res)` after the response is sent,
    // or we wire an Inngest event in Phase F so the work happens out-of-band.

    return res;
  }

  async share(
    uid: string,
    params: BaseIdReqAndResDto,
    body: CustomShareReqDto,
  ) {
    const existing = await first(
      this.db
        .select({
          id: api_analysis_users.id,
          public: api_analysis_users.public,
        })
        .from(api_analysis_users)
        .where(
          and(
            eq(api_analysis_users.submitter_id, uid),
            eq(api_analysis_users.intent, Intent.Profile),
            eq(api_analysis_users.id, String(params.id)),
          ),
        )
        .limit(1),
    );

    if (!existing) {
      throw new Error('Analysis not found');
    }

    await this.db
      .update(api_analysis_users)
      .set({ public: body.share })
      .where(eq(api_analysis_users.id, String(params.id)));

    return new Object();
  }

  async remove(uid: string, params: BaseIdReqAndResDto) {
    const existing = await first(
      this.db
        .select({ id: api_analysis_users.id })
        .from(api_analysis_users)
        .where(
          and(
            eq(api_analysis_users.submitter_id, uid),
            eq(api_analysis_users.intent, Intent.Profile),
            eq(api_analysis_users.id, String(params.id)),
          ),
        )
        .limit(1),
    );

    if (!existing) {
      throw new Error('Analysis not found');
    }

    await this.db
      .delete(api_analysis_users)
      .where(eq(api_analysis_users.id, String(params.id)));

    return new Object();
  }

  async getList(params: CustomQueryUsersOrderReqDto, uid: string) {
    const whereClause = and(
      eq(api_analysis_users.submitter_id, uid),
      eq(api_analysis_users.intent, params.intent),
    );

    const totalRow = await this.db
      .select({ total: count(api_analysis_users.id) })
      .from(api_analysis_users)
      .where(whereClause);

    const direction =
      params.direction === DirectionEnum.DESC ? sql`desc` : sql`asc`;
    const find = await this.db
      .select({
        id: api_analysis_users.id,
        description: api_analysis_users.description,
        created_at: api_analysis_users.created_at,
      })
      .from(api_analysis_users)
      .where(whereClause)
      .orderBy(sql`${api_analysis_users.id} ${direction}`)
      .offset(params.skip)
      .limit(params.take);

    const res = new CustomQueryUsersResDto();
    res.list = find as unknown as ApiAnalysisUsers[];
    res.total = Number(totalRow[0].total);

    return res;
  }

  async getPublicList(params: CustomQueryUsersOrderReqDto) {
    const whereClause = and(
      eq(api_analysis_users.public, true),
      eq(api_analysis_users.intent, 'hackathon'),
    );

    const totalRow = await this.db
      .select({ total: count(api_analysis_users.id) })
      .from(api_analysis_users)
      .where(whereClause);

    const direction =
      params.direction === DirectionEnum.DESC ? sql`desc` : sql`asc`;
    const find = await this.db
      .select({
        id: api_analysis_users.id,
        description: api_analysis_users.description,
        created_at: api_analysis_users.created_at,
      })
      .from(api_analysis_users)
      .where(whereClause)
      .orderBy(sql`${api_analysis_users.id} ${direction}`)
      .offset(params.skip)
      .limit(params.take);

    const res = new CustomQueryUsersResDto();
    res.list = find as unknown as ApiAnalysisUsers[];
    res.total = Number(totalRow[0].total);

    return res;
  }

  async analysisUsers(params: BaseIdReqAndResDto) {
    const analysis = await firstOrThrow(
      this.db
        .select()
        .from(api_analysis_users)
        .where(eq(api_analysis_users.id, String(params.id)))
        .limit(1),
      'Analysis not found',
    );

    if (analysis.data && Object.keys(analysis.data).length > 0) {
      return analysis;
    }
    return analysis;
  }

  async exportTopLangsByAnalysisId(
    analysisId: string | number,
    outputPath?: string,
  ): Promise<TopLangsExportResult & { analysis_id: string }> {
    const analysisIdValue = String(analysisId).trim();
    if (!analysisIdValue) {
      throw new Error('analysisId is required');
    }

    const analysis = await first(
      this.db
        .select({
          id: api_analysis_users.id,
          github: api_analysis_users.github,
        })
        .from(api_analysis_users)
        .where(eq(api_analysis_users.id, analysisIdValue))
        .limit(1),
    );

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    const usernames = this.extractUsernamesFromGithubPayload(analysis.github);
    if (usernames.length === 0) {
      throw new Error('No GitHub users found in analysis github data');
    }

    const defaultName = `analysis_${analysisIdValue}_top_langs.csv`;
    const result = await this.exportTopLangsByUsernames(
      usernames,
      outputPath ?? defaultName,
    );

    return { analysis_id: String(analysis.id), ...result };
  }

  async exportTopLangsByUsernames(
    usernames: string[],
    outputPath?: string,
  ): Promise<TopLangsExportResult> {
    const normalized = this.normalizeUsernames(usernames);
    if (normalized.length === 0) {
      throw new Error('No GitHub usernames provided');
    }

    const targetPath = (() => {
      const candidate = outputPath?.trim()
        ? outputPath.trim()
        : `user_top_langs_${Date.now()}.csv`;
      return isAbsolute(candidate) ? candidate : join(process.cwd(), candidate);
    })();

    const rankingPath = this.getLanguageRankingPath(targetPath);

    if (existsSync(targetPath)) {
      const cachedResults = await this.readTopLangsCsv(targetPath);
      const distribution = this.buildLanguageDistribution(cachedResults);
      await this.writeLanguageRankingCsv(
        distribution.language_ranking,
        rankingPath,
      );
      return this.buildTopLangsExportResult(
        cachedResults,
        targetPath,
        distribution,
        rankingPath,
      );
    }

    const results: UserTopLangsResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < normalized.length; i += batchSize) {
      const batch = normalized.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((username) => this.fetchUserTopLanguages(username)),
      );
      results.push(...batchResults);
    }

    await this.writeTopLangsCsv(results, targetPath);
    const distribution = this.buildLanguageDistribution(results);
    await this.writeLanguageRankingCsv(
      distribution.language_ranking,
      rankingPath,
    );

    return this.buildTopLangsExportResult(
      results,
      targetPath,
      distribution,
      rankingPath,
    );
  }

  async getTopFormUserName(username: string) {
    const analysis = await first(
      this.db
        .select({
          data: api_analysis_users.data,
          github: api_analysis_users.github,
        })
        .from(api_analysis_users)
        .where(
          and(
            eq(api_analysis_users.intent, Intent.Profile),
            ne(api_analysis_users.data, {}),
            sql`${api_analysis_users.github} @> ${JSON.stringify({
              users: [{ login: username }],
            })}::jsonb`,
          ),
        )
        .limit(1),
    );

    if (!analysis) {
      return {
        username,
        top_ecosystems: [],
        message: 'User not found',
      };
    }

    const githubData = analysis.github as {
      users: Array<{ login?: string; id: number }>;
    };
    const githubUser = githubData.users.find(
      (u) => u.login && u.login.toLowerCase() === username.toLowerCase(),
    );

    if (!githubUser) {
      return {
        username,
        top_ecosystems: [],
        message: 'User not found in github data',
      };
    }

    const data = analysis.data as {
      users?: Array<{
        actor_id: string;
        ecosystem_scores?: Array<Record<string, unknown>>;
      }>;
    };
    const userEcosystemData = data.users?.find(
      (u) =>
        u.actor_id === githubUser.id.toString() ||
        Number(u.actor_id) === githubUser.id,
    );

    if (!userEcosystemData || !userEcosystemData.ecosystem_scores) {
      return {
        username,
        actor_id: githubUser.id,
        top_ecosystems: [],
        message: 'No ecosystem data found for user',
      };
    }

    const topEcosystems = userEcosystemData.ecosystem_scores
      .sort((a, b) => (b.total_score as number) - (a.total_score as number))
      .slice(0, 3)
      .map((ecosystem) => ({
        ecosystem: ecosystem.ecosystem,
        score: ecosystem.total_score,
        repos_count: Array.isArray(ecosystem.repos)
          ? (ecosystem.repos as unknown[]).length
          : 0,
        first_activity_at: ecosystem.first_activity_at,
        last_activity_at: ecosystem.last_activity_at,
      }));

    return {
      username,
      actor_id: githubUser.id,
      top_ecosystems: topEcosystems,
      total_ecosystems: userEcosystemData.ecosystem_scores.length,
    };
  }

  private extractUsernamesFromGithubPayload(payload: unknown): string[] {
    if (!payload) {
      return [];
    }

    let data: unknown = payload;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return [];
      }
    }

    const users = Array.isArray(data)
      ? data
      : Array.isArray((data as { users?: unknown[] }).users)
        ? (data as { users: unknown[] }).users
        : [];

    return users
      .map((user) => {
        if (!user || typeof user !== 'object') {
          return '';
        }
        const record = user as { login?: string; username?: string };
        const login =
          typeof record.login === 'string' ? record.login : record.username;
        return typeof login === 'string' ? login : '';
      })
      .filter((login): login is string => !!login);
  }

  private normalizeUsernames(usernames: string[]): string[] {
    const normalized = usernames
      .map((username) => {
        if (!username) {
          return '';
        }
        const extracted = this.githubService.extractUsername(username);
        return (extracted ?? username).trim();
      })
      .filter((username): username is string => !!username);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const username of normalized) {
      const key = username.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(username);
    }
    return unique;
  }

  private async fetchUserTopLanguages(
    username: string,
  ): Promise<UserTopLangsResult> {
    const trimmed = username.trim();
    if (!trimmed) {
      return {
        username: username ?? '',
        languages: [],
        error: 'Empty username',
      };
    }

    const url = `https://yu-readme.vercel.app/api/top-langs/?username=${encodeURIComponent(
      trimmed,
    )}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        return {
          username: trimmed,
          languages: [],
          error: `Request failed (${response.status})`,
        };
      }

      const svg = await response.text();
      const languages = this.parseTopLangsSvg(svg);
      if (languages.length === 0) {
        const messageMatch = svg.match(
          /data-testid="message"[\s\S]*?<tspan[^>]*>([^<]+)<\/tspan>/i,
        );
        const fallbackMatch = svg.match(/Something went wrong[^<]*/i);
        const message = messageMatch
          ? this.decodeHtmlEntities(messageMatch[1].trim())
          : fallbackMatch
            ? fallbackMatch[0].trim()
            : '';
        return {
          username: trimmed,
          languages: [],
          error: message || 'No languages parsed from SVG',
        };
      }

      return { username: trimmed, languages };
    } catch (error) {
      return {
        username: trimmed,
        languages: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private parseTopLangsSvg(svg: string): string[] {
    if (!svg) {
      return [];
    }

    const matches = svg.matchAll(
      /data-testid="lang-name"[^>]*>([^<]+)<\/text>/g,
    );
    const names: string[] = [];
    const seen = new Set<string>();

    for (const match of matches) {
      const name = this.decodeHtmlEntities(match[1].trim());
      if (!name) {
        continue;
      }
      const key = name.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      names.push(name);
    }

    return names;
  }

  private decodeHtmlEntities(value: string): string {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/&#(\d+);/g, (_match, num) =>
        String.fromCharCode(parseInt(num, 10)),
      );
  }

  private buildLanguageDistribution(
    results: UserTopLangsResult[],
  ): TopLangsOverallAnalysis {
    const totalUsers = results.length;
    let usersWithLanguages = 0;
    const counts = new Map<string, number>();

    for (const result of results) {
      if (result.languages.length > 0) {
        usersWithLanguages += 1;
      }
      const uniqueLangs = new Set(
        result.languages.map((lang) => lang.trim()).filter(Boolean),
      );
      for (const lang of uniqueLangs) {
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
      }
    }

    const ranking = Array.from(counts.entries())
      .map(([language, count]) => ({
        language,
        count,
        percentage:
          totalUsers > 0 ? Number(((count / totalUsers) * 100).toFixed(2)) : 0,
      }))
      .sort(
        (a, b) => b.count - a.count || a.language.localeCompare(b.language),
      );

    return {
      total_users: totalUsers,
      users_with_languages: usersWithLanguages,
      users_without_languages: totalUsers - usersWithLanguages,
      language_ranking: ranking,
    };
  }

  private buildTopLangsExportResult(
    results: UserTopLangsResult[],
    outputPath: string,
    distribution: TopLangsOverallAnalysis,
    rankingPath: string,
  ): TopLangsExportResult {
    const failedUsers = results
      .filter((result) => result.error)
      .map((result) => ({
        username: result.username,
        error: result.error ?? '',
      }));

    return {
      output_path: outputPath,
      language_ranking_path: rankingPath,
      total_users: distribution.total_users,
      users_with_languages: distribution.users_with_languages,
      users_without_languages: distribution.users_without_languages,
      failed_users: failedUsers,
      language_ranking: distribution.language_ranking,
      overall_analysis: distribution,
    };
  }

  private async writeTopLangsCsv(
    results: UserTopLangsResult[],
    outputPath: string,
  ) {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('user_languages');
    sheet.addRow(['username', 'languages', 'language_count', 'error']);

    for (const result of results) {
      sheet.addRow([
        result.username,
        result.languages.join('|'),
        result.languages.length,
        result.error ?? '',
      ]);
    }

    await workbook.csv.writeFile(outputPath);
  }

  private async writeLanguageRankingCsv(
    ranking: LanguageRankingItem[],
    outputPath: string,
  ) {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('language_ranking');
    sheet.addRow(['rank', 'language', 'user_count', 'percentage']);

    ranking.forEach((item, index) => {
      sheet.addRow([index + 1, item.language, item.count, item.percentage]);
    });

    await workbook.csv.writeFile(outputPath);
  }

  private getLanguageRankingPath(outputPath: string): string {
    const info = parse(outputPath);
    const dir = info.dir || process.cwd();
    const baseName = info.name || 'language_ranking';
    return join(dir, `${baseName}.language_ranking.csv`);
  }

  private async readTopLangsCsv(
    outputPath: string,
  ): Promise<UserTopLangsResult[]> {
    const workbook = new Workbook();
    await workbook.csv.readFile(outputPath);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }

    const results: UserTopLangsResult[] = [];
    sheet.eachRow((row, index) => {
      if (index === 1) {
        return;
      }
      const username = String(row.getCell(1).text ?? '').trim();
      if (!username) {
        return;
      }
      const languagesText = String(row.getCell(2).text ?? '').trim();
      const errorText = String(row.getCell(4).text ?? '').trim();
      const languages = languagesText
        ? languagesText
            .split('|')
            .map((lang) => lang.trim())
            .filter(Boolean)
        : [];
      results.push({
        username,
        languages,
        error: errorText || undefined,
      });
    });

    return results;
  }

  async getTopFormUserId(id: string) {
    const analysis = await first(
      this.db
        .select({
          eco_score: data_actors.eco_score,
          actor_id: data_actors.actor_id,
          actor_login: data_actors.actor_login,
        })
        .from(data_actors)
        .where(eq(data_actors.actor_id, id))
        .limit(1),
    );
    if (!analysis) {
      return {};
    }

    const ecoScore = (analysis.eco_score || {}) as {
      ecosystems?: Array<{ ecosystem?: string }>;
    };
    const allEcosystems = Array.isArray(ecoScore.ecosystems)
      ? ecoScore.ecosystems
      : [];

    const ecosystemNames = allEcosystems
      .map((ecosystem) => ecosystem?.ecosystem?.trim())
      .filter((name): name is string => !!name);

    const activeNames = await this.getActiveEcosystemNames(ecosystemNames);
    const activeNameSet = new Set(activeNames);

    const ecosystems = allEcosystems.filter((ecosystem) => {
      const name = ecosystem?.ecosystem?.trim();
      return name && activeNameSet.has(name);
    });

    return {
      ...analysis,
      eco_score: {
        ...ecoScore,
        ecosystems,
      },
    };
  }

  async getTopFormGithubUserName(username: string) {
    const clinet = await this.tokenPoolService.getClient();
    const response = await clinet.users.getByUsername({ username });
    return await this.getTopFormUserId(response.data.id.toString());
  }

  async getEventUsers(identifier: string) {
    const rawIdentifier = identifier?.trim();
    if (!rawIdentifier) {
      throw new Error('identifier is required');
    }

    const normalizedIdentifier =
      this.githubService.extractUsername(rawIdentifier) ?? rawIdentifier;
    const isGithubId = /^\d+$/.test(normalizedIdentifier);
    const match = isGithubId
      ? { id: Number(normalizedIdentifier) }
      : { login: normalizedIdentifier };
    const conditions = [{ users: [match] }, [match]];

    const results = new Map<string, { id: number; description: string }>();

    for (const condition of conditions) {
      const rows = await this.db
        .select({
          id: api_analysis_users.id,
          description: api_analysis_users.description,
        })
        .from(api_analysis_users)
        .where(
          and(
            sql`${api_analysis_users.github} @> ${JSON.stringify(condition)}::jsonb`,
            eq(api_analysis_users.intent, Intent.Hackathon),
          ),
        );

      for (const row of rows) {
        const rowId = Number(row.id);
        if (results.has(String(rowId))) {
          continue;
        }
        results.set(String(rowId), {
          id: rowId,
          description: row.description ?? '',
        });
      }
    }

    return {
      list: Array.from(results.values()),
    };
  }

  private async getActiveEcosystemNames(names: string[]): Promise<string[]> {
    const uniqueNames = Array.from(
      new Set(
        names
          .map((name) => name?.trim())
          .filter((name): name is string => !!name),
      ),
    );

    if (uniqueNames.length === 0) {
      return [];
    }

    const activeEcosystems = await this.db
      .select({ name: data_ecosystems.name })
      .from(data_ecosystems)
      .where(
        and(
          inArray(data_ecosystems.name, uniqueNames),
          eq(data_ecosystems.active, true),
        ),
      );

    return activeEcosystems.map((ecosystem) => ecosystem.name);
  }

  async getPrivyGithubUsername(uid: string): Promise<string | null> {
    const privyBind = await first(
      this.db
        .select({ bind_openid: api_auth_users_binds.bind_openid })
        .from(api_auth_users_binds)
        .where(
          and(
            eq(api_auth_users_binds.bind_uid, uid),
            eq(api_auth_users_binds.bind_type, 'privy'),
          ),
        )
        .limit(1),
    );

    const account = await this.deps
      .getAuthService()
      .getPrivyUserBindings(privyBind?.bind_openid || '');

    if (account == null) {
      return null;
    }

    const githubAccount = account.linked_accounts.find(
      (acc): acc is { type: string; username?: string | null } =>
        typeof acc === 'object' &&
        acc !== null &&
        (acc as { type?: unknown }).type === 'github_oauth',
    );

    return githubAccount?.username ?? null;
  }

  /**
   * Plain async method replacing the `@OnEvent('api.custom.analysis.createdv2')`
   * handler. Hono handlers should `void this.handleAnalysisCreated(res)` to
   * preserve fire-and-forget semantics, or Phase F can route this through
   * Inngest for retry guarantees.
   */
  async handleAnalysisCreated(payload: CustomUploadResDto) {
    const ids = payload.users.map((user: { id: number }) => user.id);

    const actors = await this.db
      .select({
        actor_id: data_actors.actor_id,
        eco_score: data_actors.eco_score,
      })
      .from(data_actors)
      // actor_id column is text in the schema; cast number[] → string[] for the IN clause.
      .where(inArray(data_actors.actor_id, ids.map(String)));

    const rows = actors
      .filter((actor) => actor.eco_score && typeof actor.eco_score === 'object')
      .map((actor) => {
        const ecoScore = actor.eco_score as {
          total_score?: number;
          ecosystems?: Array<Record<string, unknown>>;
        };
        const ecosystems = Array.isArray(ecoScore.ecosystems)
          ? ecoScore.ecosystems
          : [];

        return {
          actor_id: actor.actor_id,
          user_score: ecoScore.total_score || 0,
          ecosystem_scores: ecosystems.map((eco) => ({
            ecosystem: eco.ecosystem,
            repos: Array.isArray(eco.repos) ? eco.repos : [],
            total_score: eco.total_score || 0,
            first_activity_at: eco.first_activity_at,
            last_activity_at: eco.last_activity_at,
          })),
        };
      });

    const ecosystems = rows.flatMap((item) =>
      item.ecosystem_scores.map((ecosystem) => ecosystem.ecosystem as string),
    );

    const uniqueEcosystems = Array.from(new Set(ecosystems));

    let filteredRows = rows as Array<{
      actor_id: string;
      user_score: number;
      ecosystem_scores: Array<Record<string, unknown>>;
    }>;

    if (uniqueEcosystems.length > 0) {
      const ecosystemDB = await this.db
        .select()
        .from(data_ecosystems)
        .where(
          and(
            inArray(data_ecosystems.name, uniqueEcosystems),
            eq(data_ecosystems.active, true),
          ),
        );

      const activeEcosystemNames = new Set(
        ecosystemDB.map((item) => item.name),
      );

      filteredRows = rows
        .map((item) => {
          const filteredEcosystemScores = item.ecosystem_scores.filter(
            (ecosystem) =>
              ecosystem.ecosystem &&
              activeEcosystemNames.has(ecosystem.ecosystem as string),
          );

          const uniqueRepos = new Map<string, number>();
          filteredEcosystemScores.forEach((eco) => {
            if (Array.isArray(eco.repos)) {
              (
                eco.repos as Array<{ repo_name?: string; score?: number }>
              ).forEach((repo) => {
                if (repo.repo_name && repo.score) {
                  const existingScore = uniqueRepos.get(repo.repo_name);
                  if (!existingScore || repo.score > existingScore) {
                    uniqueRepos.set(repo.repo_name, repo.score);
                  }
                }
              });
            }
          });

          const newUserScore = Array.from(uniqueRepos.values()).reduce(
            (sum: number, score: number) => sum + score,
            0,
          );

          const sortedEcosystemScores = [...filteredEcosystemScores].sort(
            (a, b) => (b.total_score as number) - (a.total_score as number),
          );

          return {
            ...item,
            user_score: newUserScore,
            ecosystem_scores: sortedEcosystemScores,
          };
        })
        .sort((a, b) => b.user_score - a.user_score);
    }

    const data: {
      users: typeof filteredRows;
      users_with_contributions?: number;
      users_without_contributions?: number;
      contribution_percentage?: number;
      ecosystem_ranking?: Array<{ ecosystem: string; count: number }>;
    } = { users: filteredRows };

    const totalUsers = data.users.length;

    const usersWithContributions = data.users.filter(
      (user) => user.ecosystem_scores && user.ecosystem_scores.length > 0,
    ).length;

    const usersWithoutContributions = totalUsers - usersWithContributions;

    const contributionPercentage =
      totalUsers > 0 ? (usersWithContributions / totalUsers) * 100 : 0;

    const ecosystemCounts: { [key: string]: number } = {};

    data.users.forEach((user) => {
      if (user.ecosystem_scores) {
        user.ecosystem_scores.forEach((ecosystem) => {
          if (ecosystem.ecosystem) {
            const ecoName = ecosystem.ecosystem as string;
            ecosystemCounts[ecoName] = (ecosystemCounts[ecoName] || 0) + 1;
          }
        });
      }
    });

    const ecosystemRanking = Object.entries(ecosystemCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([ecosystem, count]) => ({ ecosystem, count }));

    data.users_with_contributions = usersWithContributions;
    data.users_without_contributions = usersWithoutContributions;
    data.contribution_percentage = contributionPercentage;
    data.ecosystem_ranking = ecosystemRanking;

    if (filteredRows.length > 0) {
      await this.db
        .update(api_analysis_users)
        .set({ data })
        .where(eq(api_analysis_users.id, String(payload.id)));
    }

    if (ids.length > 1) {
      return;
    }

    const newData = await firstOrThrow(
      this.db
        .select()
        .from(api_analysis_users)
        .where(eq(api_analysis_users.id, String(payload.id)))
        .limit(1),
      'Analysis not found',
    );

    // TODO(phase-e): port DeveloperAnalysisService to Hono-friendly streaming.
    // Until then, skip AI augmentation if the analyzer isn't wired into deps.
    const analyzer = this.deps.developerAnalysisService;
    if (!analyzer) {
      return;
    }

    try {
      log.info('ai analysis start', { analysisId: payload.id });

      const analysisData = {
        id: String(newData.id),
        intent: newData.intent,
        request_data: newData.request_data as { urls: string[] },
        github: newData.github as { users: unknown[] },
        data: newData.data as { users: unknown[] },
        created_at: newData.created_at ?? '',
        updated_at: newData.updated_at ?? '',
        description: newData.description || '',
        submitter_id: newData.submitter_id || '',
        public: newData.public || false,
      };

      const aiData = await analyzer.analyze(analysisData);

      log.info('ai analysis complete', { analysisId: payload.id });

      await this.db
        .update(api_analysis_users)
        .set({ ai: aiData })
        .where(eq(api_analysis_users.id, String(payload.id)));
    } catch (error) {
      log.error('ai analysis failed', {
        analysisId: payload.id,
        err: error instanceof Error ? error.message : String(error),
      });
      // Record empty AI data rather than failing the request
      await this.db
        .update(api_analysis_users)
        .set({ ai: { success: false, error: String(error) } })
        .where(eq(api_analysis_users.id, String(payload.id)));
    }
  }
}
