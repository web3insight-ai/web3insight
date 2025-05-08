import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { CountDto } from '@/api/api.dto';

@Injectable()
@Console()
export class EcoDataService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private cacheDataService: CacheDataService) {}

  async reposTotal(ecoName: string, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.ReposNum,
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

    if (!ecoName) {
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
      CacheKey.ReposNum,
      { total: result.total },
      new Date().toISOString(),
      ecoName,
    );

    return await this.cacheDataService.getCacheData(CacheKey.ReposNum, ecoName);
  }

  async actorsTotal(ecoName: string, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.ActorNum,
      ecoName,
    );

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    let total = 0;

    if (ecoName == 'ALL') {
      const result = await this.db
        .selectFrom('web3.actors')
        .select(this.db.fn.countAll().as('total'))
        .executeTakeFirst();

      total = (result as CountDto).total;
    } else {
      const result = await this.db
        .selectFrom('web3.event')
        .innerJoin('web3.repos', 'web3.event.repo_id', 'web3.repos.repo_id')
        .where(
          'web3.repos.eco_names',
          '@>',
          sql<string[]>`ARRAY[${sql.join([ecoName])}]`,
        )
        .select(this.db.fn.count('web3.event.repo_id').distinct().as('total'))
        .executeTakeFirst();
      total = (result as CountDto).total;
    }

    await this.cacheDataService.updateCacheData(
      CacheKey.ActorNum,
      { total },
      new Date().toISOString(),
    );

    return await this.cacheDataService.getCacheData(CacheKey.ActorNum, ecoName);
  }

  @Command({
    command: 'test:eco:data',
    description: 'Test eco data',
  })
  async test() {
    await this.reposTotal('ALL', false);
    await this.actorsTotal('ALL', false);
    return null;
  }
}
