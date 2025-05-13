import { KYSELY, OCTOKIT } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { ActorsScopeType, EcoType } from '../dto/data.dto';
import { TotalService } from './total.services';
import type { Octokit as OctokitType } from '@octokit/rest';
import {
  EcoRankDto,
  EcoRankListDto,
  TotalDto,
  RepoRankDto,
  RepoRankListDto,
} from '@/api/api.dto';

@Injectable()
@Console()
export class RankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;
  @Inject(OCTOKIT) private readonly github!: OctokitType;

  constructor(
    private cacheDataService: CacheDataService,
    private totalService: TotalService,
  ) {}

  async ecoRankTotal(ecoName: EcoType, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.EcoRank,
      ecoName,
    );

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    const data: EcoRankDto[] = [];

    const ecoTypes = Object.values(EcoType).filter(
      (eco) => eco !== EcoType.ALL,
    );
    for (const ecoName of ecoTypes) {
      const actorsTotalAllScopeResult =
        await this.totalService.actorsAllTotal(ecoName);

      const actorsTotalCoreScopeResult =
        await this.totalService.actorsCoreTotal(ecoName, ActorsScopeType.Core);

      data.push({
        eco_name: ecoName,
        actors_total: (actorsTotalAllScopeResult?.cache_data as TotalDto).total,
        actors_core_total: (actorsTotalCoreScopeResult?.cache_data as TotalDto)
          .total,
      });
    }

    const cacheData = new EcoRankListDto();
    cacheData.list = data;

    return await this.cacheDataService.updateCacheData(
      CacheKey.EcoRank,
      cacheData,
      new Date().toISOString(),
    );
  }

  async repoStarRank(
    ecoName: EcoType,
    limit: number = 10,
    cache: boolean = true,
  ) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.RepoStarRank,
      ecoName,
    );

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    let query = this.db
      .selectFrom('web3.event')
      .innerJoin('web3.repos', 'web3.event.repo_id', 'web3.repos.repo_id')
      .select([
        'web3.event.repo_id',
        'web3.repos.repo_name',
        this.db.fn.count('web3.event.actor_id').distinct().as('star_count'),
      ])
      .where('web3.event.event_type', '=', 'WatchEvent')
      .groupBy(['web3.event.repo_id', 'web3.repos.repo_name'])
      .orderBy('star_count', 'desc')
      .limit(limit);

    if (ecoName !== EcoType.ALL) {
      query = query.where(
        'web3.repos.eco_names',
        '@>',
        sql<string[]>`ARRAY[${sql.join([ecoName])}]`,
      );
    }

    const result = await query.execute();

    if (!result) {
      throw new Error('No data found');
    }

    const data: RepoRankDto[] = await Promise.all(
      result.map(async (row) => {
        const [owner, repo] = row.repo_name!.split('/');
        const repoDetails = await this.github.rest.repos.get({
          owner,
          repo,
        });
        return {
          repo_id: Number(row.repo_id),
          repo_name: row.repo_name!,
          star_count: repoDetails.data.stargazers_count,
          forks_count: repoDetails.data.forks_count,
          open_issues_count: repoDetails.data.open_issues_count,
        };
      }),
    );

    data.sort((a, b) => b.star_count - a.star_count);

    const cacheData = new RepoRankListDto();
    cacheData.list = data;

    return await this.cacheDataService.updateCacheData(
      CacheKey.RepoStarRank,
      cacheData,
      new Date().toISOString(),
      ecoName,
    );
  }

  @Command({
    command: 'sync:eco:rank',
    description: 'Test eco data',
  })
  async test() {
    await this.ecoRankTotal(EcoType.ALL, false);
    const ecoTypes = Object.values(EcoType);
    for (const eco of ecoTypes) {
      await this.repoStarRank(eco, 10, false);
    }
    return Promise.resolve();
  }
}
