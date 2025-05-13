import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { ActorsScopeType, EcoType } from '../dto/data.dto';
import { TotalService } from './total.services';
import { EcoRankDto, EcoRankListDto, TotalDto } from '@/api/api.dto';

@Injectable()
@Console()
export class RankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private cacheDataService: CacheDataService,
    private totalService: TotalService,
  ) {}

  async EcoRankTotal(ecoName: EcoType, cache: boolean = true) {
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

  @Command({
    command: 'test:eco:data:rank',
    description: 'Test eco data',
  })
  async test() {
    await this.EcoRankTotal(EcoType.ALL, false);
    return Promise.resolve();
  }
}
