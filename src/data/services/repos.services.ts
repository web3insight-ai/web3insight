import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { isAbsolute, join, parse } from 'path';
import { ECO_ALL } from '../dto/data.dto';
import {
  RepoContributor,
  RepoInfo,
  TokenPoolService,
} from '@/app/db/pool.services';
import { GithubService } from '@/api/services/github.services';
import {
  BaseIdReqAndResDto,
  GetReposMarkResDto,
  RepoActiveDevDto,
  RepoMarkDto,
  ReposCustomMarkReqDto,
  ReposOrderEnum,
  ReposOrderReqDto,
  SucessResDto,
} from '@/api/dto/api.dto';
import { chunkArray } from '@/helper';

@Injectable()
@Console()
export class ReposService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;
  private readonly contributorPageSize = 100;
  private readonly contributorMaxRetries = 3;
  private readonly contributorCsvFields = [
    'login',
    'id',
    'node_id',
    'avatar_url',
    'gravatar_id',
    'url',
    'html_url',
    'followers_url',
    'following_url',
    'gists_url',
    'starred_url',
    'subscriptions_url',
    'organizations_url',
    'repos_url',
    'events_url',
    'received_events_url',
    'type',
    'user_view_type',
    'site_admin',
    'contributions',
  ];

  constructor(
    private tokenPoolService: TokenPoolService,
    private githubService: GithubService,
  ) {}

  async getReposByEcoName(params: ReposOrderReqDto) {
    let query = this.db.selectFrom('data.repos');
    if (params.eco_name !== ECO_ALL) {
      query = query.where('upstream_marks', '?', params.eco_name);
    }

    if (params.search && params.search !== '') {
      query = query.where('repo_name', 'ilike', `%${params.search}%`);
    }

    const total = await query
      .select(this.db.fn.count('repo_id').as('total'))
      .execute();

    if (params.order === ReposOrderEnum.ID) {
      query = query.orderBy('repo_id', params.direction);
    }

    if (params.order === ReposOrderEnum.ORG) {
      query = query.orderBy('repo_name', params.direction);
    }

    query = query.offset(params.skip);
    query = query.limit(params.take);

    const find = await query.selectAll().execute();

    const list: RepoMarkDto[] = find.map((item) => ({
      repo_id: item.repo_id as unknown as number,
      repo_name: item.repo_name ?? '',
      upstream_marks: item.upstream_marks as object,
      custom_marks: item.custom_marks as object,
    }));

    const res = new GetReposMarkResDto();
    res.list = list;
    res.total = total[0].total as number;

    return res;
  }

  async markRepo(param: BaseIdReqAndResDto, body: ReposCustomMarkReqDto) {
    const repo = await this.db
      .selectFrom('data.repos')
      .selectAll()
      .where('repo_id', '=', String(param.id))
      .executeTakeFirst();
    if (!repo) {
      throw new NotFoundException(`Repo with id ${param.id} not found`);
    }
    const custom_marks = repo.custom_marks ?? {};
    custom_marks[body.eco_name] = body.mark;
    await this.db
      .updateTable('data.repos')
      .set({
        custom_marks: custom_marks,
      })
      .where('repo_id', '=', String(param.id))
      .execute();
    return (new SucessResDto().sucess = true);
  }

  async getRepoInfo(list: number[]): Promise<RepoInfo[]> {
    const results: RepoInfo[][] = [];
    const repoIdentifiers: number[] = [];
    const db = await this.db
      .selectFrom('data.repos')
      .selectAll()
      .where(
        'repo_id',
        'in',
        list.map((id) => String(id)),
      )
      .execute();

    for (const repo of db) {
      if (
        repo.api_updated_at > new Date(Date.now() - 24 * 60 * 60 * 1000) ||
        repo.created_at < repo.api_updated_at
      ) {
        results.push([repo.api as RepoInfo]);
      } else {
        repoIdentifiers.push(Number(repo.repo_id));
      }
    }

    const repoBatches = chunkArray(repoIdentifiers, 20);
    for (const batch of repoBatches) {
      const batchResults = await Promise.all(
        batch.map(async (repoIdentifier) => {
          try {
            const client = await this.tokenPoolService.getClient();
            const { data } = await client.request(
              'GET /repositories/{repo_id}',
              {
                repo_id: repoIdentifier,
              },
            );
            return data as RepoInfo;
          } catch (e) {
            console.log(`Failed to fetch repo ${repoIdentifier}:`, e);
            const api = await this.db
              .selectFrom('data.repos')
              .select('api')
              .where('repo_id', '=', String(repoIdentifier))
              .executeTakeFirst();
            if (api && api.api) {
              return api.api as RepoInfo;
            }
            throw new NotFoundException(
              `Repo with id ${repoIdentifier} not found in API or database`,
            );
          }
        }),
      );
      results.push(batchResults);

      await this.db.transaction().execute(async (trx) =>
        Promise.all(
          batchResults.map((repo) =>
            trx
              .updateTable('data.repos')
              .set({
                repo_id: repo.id,
                api: repo,
                api_updated_at: new Date(),
              })
              .where('repo_id', '=', String(repo.id))
              .execute(),
          ),
        ),
      );
    }
    const repoInfo = results.flat();

    return repoInfo;
  }

  async getRepoCommitUsers(repoList: string[]): Promise<RepoContributor[]> {
    const normalized = repoList
      .map((repo) => this.githubService.normalizeRepoFullName(repo))
      .filter((repo): repo is string => !!repo);
    const uniqueRepos = Array.from(new Set(normalized));
    const contributors = new Map<string, RepoContributor>();

    for (const repoFullName of uniqueRepos) {
      const [owner, repo] = repoFullName.split('/');
      if (!owner || !repo) {
        continue;
      }

      let page = 1;
      while (true) {
        const data = await this.fetchContributorsPage(owner, repo, page);
        if (!data || data.length === 0) {
          break;
        }

        for (const contributor of data) {
          const key = contributor.id
            ? contributor.id.toString()
            : contributor.login;
          if (!key || contributors.has(key)) {
            continue;
          }
          contributors.set(key, contributor);
        }

        if (data.length < this.contributorPageSize) {
          break;
        }
        page += 1;
      }
    }

    return Array.from(contributors.values());
  }

  private async fetchContributorsPage(
    owner: string,
    repo: string,
    page: number,
  ): Promise<RepoContributor[] | null> {
    for (let attempt = 0; attempt <= this.contributorMaxRetries; attempt += 1) {
      try {
        const client = await this.tokenPoolService.getClient();
        const response = await client.rest.repos.listContributors({
          owner,
          repo,
          per_page: this.contributorPageSize,
          page,
        });
        return response.data;
      } catch (error) {
        if (this.githubService.isRepoNotFound(error)) {
          return null;
        }
        if (
          this.githubService.isRetryableNetworkError(error) &&
          attempt < this.contributorMaxRetries
        ) {
          continue;
        }
        console.log(
          `Failed to fetch contributors for ${owner}/${repo}:`,
          error,
        );
        return null;
      }
    }
    return null;
  }

  @Command({
    command: 'github:repos:contributors <repos...>',
    description: 'List unique contributors for given GitHub repos',
  })
  async listRepoCommitUsersCli(repos: string[]) {
    const repoInputs = repos
      .flatMap((repo) => repo.split(','))
      .map((repo) => repo.trim())
      .filter(Boolean);
    const users = await this.getRepoCommitUsers(repoInputs);
    console.log(JSON.stringify(users, null, 2));
    return users;
  }

  @Command({
    command: 'github:repos:contributors:file <file>',
    description: 'Export contributors for GitHub repos from CSV or Excel',
  })
  async listRepoCommitUsersFromFileCli(file: string) {
    const filePath = isAbsolute(file) ? file : join(process.cwd(), file);
    const repoInputs = await this.loadReposFromFile(filePath);
    if (repoInputs.length === 0) {
      console.log('No repositories found in file.');
      return [];
    }
    const outputPath = this.getContributorsCsvPath(filePath);
    const normalized = repoInputs
      .map((repo) => this.githubService.normalizeRepoFullName(repo))
      .filter((repo): repo is string => !!repo);
    const uniqueRepos = Array.from(new Set(normalized));

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('contributors');
    sheet.addRow([...this.contributorCsvFields, 'repo']);

    let rowCount = 0;
    for (const repoFullName of uniqueRepos) {
      const [owner, repo] = repoFullName.split('/');
      if (!owner || !repo) {
        continue;
      }

      let page = 1;
      while (true) {
        const data = await this.fetchContributorsPage(owner, repo, page);
        if (!data || data.length === 0) {
          break;
        }

        for (const contributor of data) {
          sheet.addRow(this.buildContributorRow(contributor, repoFullName));
          rowCount += 1;
        }

        if (data.length < this.contributorPageSize) {
          break;
        }
        page += 1;
      }
    }

    await workbook.csv.writeFile(outputPath);
    console.log(`Exported ${rowCount} rows to ${outputPath}`);
    return rowCount;
  }

  private async loadReposFromFile(filePath: string): Promise<string[]> {
    const workbook = new Workbook();
    const lowerPath = filePath.toLowerCase();

    if (lowerPath.endsWith('.csv')) {
      await workbook.csv.readFile(filePath);
    } else if (lowerPath.endsWith('.xlsx')) {
      await workbook.xlsx.readFile(filePath);
    } else {
      throw new Error('Unsupported file type. Use .csv or .xlsx');
    }

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }

    const repos: string[] = [];
    sheet.eachRow((row, index) => {
      const value = String(row.getCell(1).text ?? '').trim();
      if (!value) {
        return;
      }
      const lowerValue = value.toLowerCase();
      if (
        index === 1 &&
        ['repo', 'repo_name', 'repository', 'url', 'repo_url'].includes(
          lowerValue,
        )
      ) {
        return;
      }
      repos.push(value);
    });

    return repos;
  }

  private getContributorsCsvPath(filePath: string) {
    const info = parse(filePath);
    const dir = info.dir || process.cwd();
    return join(dir, `${info.name}.contributors.csv`);
  }

  private buildContributorRow(
    contributor: RepoContributor,
    repoFullName: string,
  ) {
    const row = this.contributorCsvFields.map(
      (field) => (contributor as Record<string, unknown>)[field] ?? '',
    );
    row.push(repoFullName);
    return row;
  }

  async getRepoActiveDevelopers(repoId: number): Promise<RepoActiveDevDto> {
    const repo = await this.db
      .selectFrom('data.repos')
      .selectAll()
      .where('repo_id', '=', String(repoId))
      .executeTakeFirst();
    if (!repo) {
      throw new NotFoundException(`Repo with id ${repoId} not found`);
    }
    const activeDevelopers = repo.active_developers;

    const res = new RepoActiveDevDto();
    res.list = activeDevelopers as [];
    return res;
  }

  @Command({
    command: 'test:repos:fn',
    description: '',
  })
  async test() {
    await this.getRepoInfo([1181927]);
    const params = new ReposOrderReqDto();
    params.order = ReposOrderEnum.ID;
    params.skip = 0;
    params.take = 10;
    params.eco_name = ECO_ALL;
    await this.getReposByEcoName(params);
    return Promise.resolve();
  }
}
