import type { DbClient } from '@/db/client';
import type { TokenPoolService } from '@/services/token-pool.service';
import type { GithubService } from '@/services/github.service';
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

    const exists = await this.db
      .selectFrom('api.donate_repos')
      .select(['repo_id'])
      .where('repo_id', '=', String(repoInfo.id))
      .executeTakeFirst();

    if (exists) {
      const updated = await this.db
        .updateTable('api.donate_repos')
        .set({
          repo_info: repoInfo as any,
          repo_donate_data: repoDonateData,
          submitter_id: submitterId,
        })
        .where('repo_id', '=', String(repoInfo.id))
        .returningAll()
        .executeTakeFirstOrThrow();

      return updated;
    }

    const inserted = await this.db
      .insertInto('api.donate_repos')
      .values({
        repo_id: repoInfo.id,
        repo_info: repoInfo as any,
        repo_donate_data: repoDonateData,
        submitter_id: submitterId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return inserted;
  }

  async list() {
    return await this.db
      .selectFrom('api.donate_repos')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
  }

  async detail(repoId: number) {
    const record = await this.db
      .selectFrom('api.donate_repos')
      .selectAll()
      .where('repo_id', '=', String(repoId))
      .executeTakeFirst();

    if (!record) {
      throw new Error('Repository not found');
    }

    return record;
  }

  async detailByName(repoFullName: string) {
    const record = await this.db
      .selectFrom('api.donate_repos')
      .selectAll()
      .where('repo_info', '@>', JSON.stringify({ full_name: repoFullName }))
      .executeTakeFirst();

    if (!record) {
      throw new Error('Repository not found');
    }

    return record;
  }

  async update(repoId: number, repoDonateData?: Record<string, any>) {
    if (!repoDonateData) {
      throw new Error('repo_donate_data is required');
    }

    const exists = await this.db
      .selectFrom('api.donate_repos')
      .select(['repo_id'])
      .where('repo_id', '=', String(repoId))
      .executeTakeFirst();

    if (!exists) {
      throw new Error('Repository not found');
    }

    await this.db
      .updateTable('api.donate_repos')
      .set({
        repo_donate_data: repoDonateData,
      })
      .where('repo_id', '=', String(repoId))
      .execute();

    return await this.detail(repoId);
  }
}
