import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { ECO_ALL } from '../dto/data.dto';
import { RepoInfo, TokenPoolService } from '@/app/db/pool.services';
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

  constructor(private tokenPoolService: TokenPoolService) {}

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
