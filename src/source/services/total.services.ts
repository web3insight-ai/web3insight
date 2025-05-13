import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { ActorsScopeType, EcoType } from '../dto/data.dto';
import { ActorDateListDto, StatsPeriod } from '@/api/api.dto';

@Injectable()
@Console()
export class TotalService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private cacheDataService: CacheDataService) {}

  async reposTotal(ecoName: EcoType, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.ReposTotal,
      ecoName,
    );

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    let query = this.db
      .selectFrom('web3.repos')
      .select(this.db.fn.countAll().as('total'));

    if (ecoName !== EcoType.ALL) {
      query = query.where(
        'eco_names',
        '@>',
        sql<string[]>`ARRAY[${sql.join([ecoName])}]`,
      );
    }

    const result = await query.executeTakeFirst();

    if (!result) {
      throw new Error('No data found');
    }

    await this.cacheDataService.updateCacheData(
      CacheKey.ReposTotal,
      { total: result.total },
      new Date().toISOString(),
      ecoName,
    );

    return await this.cacheDataService.getCacheData(
      CacheKey.ReposTotal,
      ecoName,
    );
  }

  // async actorsAllTotal(ecoName: EcoType, cache: boolean = true) {
  //   const dbData = await this.cacheDataService.getCacheData(
  //     CacheKey.ActorTotal,
  //     ecoName,
  //   );

  //   if (!dbData && cache) {
  //     throw new Error('Cache not found');
  //   }

  //   if (dbData && cache) {
  //     return dbData;
  //   }

  //   const result = await this.db
  //     .selectFrom('web3.actors')
  //     .select(this.db.fn.countAll().as('total'))
  //     .executeTakeFirst();

  //   if (!result) {
  //     throw new Error('No data found');
  //   }
  //   await this.cacheDataService.updateCacheData(
  //     CacheKey.ActorTotal,
  //     { total: result.total },
  //     new Date().toISOString(),
  //     ecoName,
  //   );

  //   return await this.cacheDataService.getCacheData(
  //     CacheKey.ActorTotal,
  //     ecoName,
  //   );
  // }

  async actorsTotal(
    ecoName: EcoType,
    scope: ActorsScopeType,
    cache: boolean = true,
  ) {
    const cacheKey =
      ecoName == EcoType.ALL ? CacheKey.ActorTotal : CacheKey.ActorCoreTotal;

    const dbData = await this.cacheDataService.getCacheData(cacheKey, ecoName);

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    let query = this.db
      .selectFrom('web3.event')
      .innerJoin('web3.repos', 'web3.event.repo_id', 'web3.repos.repo_id')
      .select(this.db.fn.count('web3.event.actor_id').distinct().as('total'));

    if (ecoName !== EcoType.ALL) {
      query = query.where(
        'web3.repos.eco_names',
        '@>',
        sql<string[]>`ARRAY[${sql.join([ecoName])}]`,
      );
    }

    if (scope === ActorsScopeType.Core) {
      query = query.where('web3.event.event_type', 'in', [
        'PushEvent',
        'CreateEvent',
      ]);
    }

    const result = await query.executeTakeFirst();

    if (!result) {
      throw new Error('No data found');
    }

    await this.cacheDataService.updateCacheData(
      cacheKey,
      { total: result.total },
      new Date().toISOString(),
      ecoName,
    );

    return await this.cacheDataService.getCacheData(cacheKey, ecoName);
  }

  async ecoTotal(ecoName: EcoType, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(CacheKey.EcoTotal);

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    const result = await this.db
      .selectFrom(['web3.repos', sql<string>`UNNEST(eco_names)`.as('eco_name')])
      .select(this.db.fn.count('eco_name').distinct().as('total'))
      .executeTakeFirst();

    if (!result) {
      throw new Error('No data found');
    }

    await this.cacheDataService.updateCacheData(
      CacheKey.EcoTotal,
      { total: result.total },
      new Date().toISOString(),
      ecoName,
    );

    return await this.cacheDataService.getCacheData(CacheKey.EcoTotal, ecoName);
  }

  async getActorStats(ecoName: EcoType, period: StatsPeriod, cache = true) {
    const cacheKey =
      period == StatsPeriod.MONTH
        ? CacheKey.ActorMonthTotal
        : CacheKey.ActorWeekTotal;

    const dbData = await this.cacheDataService.getCacheData(cacheKey, ecoName);

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    let dateTruncUnit: string = StatsPeriod.WEEK;

    const aliasName = 'date';

    if (period === StatsPeriod.WEEK) {
      dateTruncUnit = 'week';
    } else if (period === StatsPeriod.MONTH) {
      dateTruncUnit = 'month';
    }

    let query = this.db
      .selectFrom('web3.event')
      .select([
        sql<Date>`DATE_TRUNC(${dateTruncUnit}, "web3"."event"."created_at")`.as(
          aliasName,
        ),
        this.db.fn.count('web3.event.actor_id').distinct().as('total'),
      ]);

    if (ecoName !== EcoType.ALL) {
      query = query
        .innerJoin('web3.repos', 'web3.event.repo_id', 'web3.repos.repo_id')
        .where(
          'web3.repos.eco_names',
          '@>',
          sql<string[]>`ARRAY[${sql.join([ecoName])}]`,
        );
    }

    query = query.groupBy(aliasName).orderBy(aliasName, 'desc').limit(8);

    const results = await query.execute();

    const data = results.map((row) => ({
      date: row[aliasName],
      total: Number(row.total),
    }));

    const resData = new ActorDateListDto();

    resData.list = data;

    await this.cacheDataService.updateCacheData(
      cacheKey,
      resData,
      new Date().toISOString(),
      ecoName,
    );

    return await this.cacheDataService.getCacheData(cacheKey, ecoName);
  }

  @Command({
    command: 'sync:eco:total',
    description: 'Test eco data',
  })
  async test() {
    await this.ecoTotal(EcoType.ALL, false);
    const ecoTypes = Object.values(EcoType);
    for (const eco of ecoTypes) {
      await this.reposTotal(eco, false);
      await this.actorsTotal(eco, ActorsScopeType.Core, false);
      await this.actorsTotal(eco, ActorsScopeType.ALL, false);
      await this.getActorStats(eco, StatsPeriod.MONTH, false);
      await this.getActorStats(eco, StatsPeriod.WEEK, false);
    }
    return null;
  }
}
