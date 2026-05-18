import { desc, eq, sql } from 'drizzle-orm';
import type { DbClient } from '@/db/client';
import type { TokenPoolService } from '@/services/token-pool.service';
import type { GithubService } from '@/services/github.service';
import { api_donate_repos } from '@/db/schema';
import { first, firstOrThrow } from '@/db/helpers';
import { Buffer } from 'buffer';

/**
 * Pure-class port of data/services/donate.services.ts. NestJS BadRequestException
 * /NotFoundException become plain Error — Hono handlers convert to ORPCError.
 */
export class DonateService {
  constructor(
    private readonly db: DbClient,
    private readonly tokenPoolService: TokenPoolService,
    private readonly githubService: GithubService,
  ) {}

  private async fetchDonationData(
    owner: string,
    repo: string,
    client: any,
    ref?: string | null,
  ): Promise<Record<string, any>> {
    try {
      const res = await client.rest.repos.getContent({
        owner,
        repo,
        path: '.x402/donation.json',
        ref: ref ?? undefined,
      });

      if (Array.isArray(res.data)) {
        return {};
      }

      const file = res.data as {
        type?: string;
        content?: string;
        encoding?: string;
      };

      if (file.type !== 'file' || !file.content) {
        return {};
      }

      const decoded = Buffer.from(
        file.content,
        file.encoding === 'base64' ? 'base64' : 'utf-8',
      ).toString('utf-8');

      try {
        return JSON.parse(decoded);
      } catch {
        return {};
      }
    } catch (error: any) {
      if (error?.status === 404) {
        return {};
      }
      return {};
    }
  }

  async create(repoFullName: string, submitterId: string) {
    const { owner, repo } = this.githubService.parseRepoFullName(repoFullName);
    const client = await this.tokenPoolService.getClient();
    const { data: repoInfo } = await client.rest.repos.get({ owner, repo });
    const repoDonateData = await this.fetchDonationData(
      owner,
      repo,
      client,
      repoInfo.default_branch,
    );

    const exists = await first(
      this.db
        .select({ repo_id: api_donate_repos.repo_id })
        .from(api_donate_repos)
        .where(eq(api_donate_repos.repo_id, String(repoInfo.id)))
        .limit(1),
    );

    if (exists) {
      return firstOrThrow(
        this.db
          .update(api_donate_repos)
          .set({
            repo_info: repoInfo as any,
            repo_donate_data: repoDonateData,
            submitter_id: submitterId,
          })
          .where(eq(api_donate_repos.repo_id, String(repoInfo.id)))
          .returning(),
        'Failed to update donate repo',
      );
    }

    return firstOrThrow(
      this.db
        .insert(api_donate_repos)
        .values({
          repo_id: String(repoInfo.id),
          repo_info: repoInfo as any,
          repo_donate_data: repoDonateData,
          submitter_id: submitterId,
        })
        .returning(),
      'Failed to insert donate repo',
    );
  }

  async list() {
    // Reason: defensive upper bound. The donate repos table grows monotonically
    // and the dashboard's plaza renders all rows at once — without a cap, a
    // future spike in registrations would silently turn this into an
    // unbounded scan + multi-MB JSON payload. 500 leaves plenty of headroom
    // over today's volume while keeping the response under ~1 MB.
    return this.db
      .select()
      .from(api_donate_repos)
      .orderBy(desc(api_donate_repos.created_at))
      .limit(500);
  }

  async detail(repoId: number) {
    const record = await first(
      this.db
        .select()
        .from(api_donate_repos)
        .where(eq(api_donate_repos.repo_id, String(repoId)))
        .limit(1),
    );

    if (!record) {
      throw new Error('Repository not found');
    }

    return record;
  }

  async detailByName(repoFullName: string) {
    const record = await first(
      this.db
        .select()
        .from(api_donate_repos)
        .where(
          sql`${api_donate_repos.repo_info} @> ${JSON.stringify({ full_name: repoFullName })}::jsonb`,
        )
        .limit(1),
    );

    if (!record) {
      throw new Error('Repository not found');
    }

    return record;
  }

  async update(repoId: number, repoDonateData?: Record<string, any>) {
    if (!repoDonateData) {
      throw new Error('repo_donate_data is required');
    }

    const exists = await first(
      this.db
        .select({ repo_id: api_donate_repos.repo_id })
        .from(api_donate_repos)
        .where(eq(api_donate_repos.repo_id, String(repoId)))
        .limit(1),
    );

    if (!exists) {
      throw new Error('Repository not found');
    }

    await this.db
      .update(api_donate_repos)
      .set({
        repo_donate_data: repoDonateData,
      })
      .where(eq(api_donate_repos.repo_id, String(repoId)));

    return this.detail(repoId);
  }
}
