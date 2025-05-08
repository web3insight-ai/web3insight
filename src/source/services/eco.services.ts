import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';

@Injectable()
@Console()
export class EcoDataService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private cacheDataService: CacheDataService) {}

  async reposNum(ecoName: string, cache: boolean = true) {
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
      .select(this.db.fn.countAll().as('count'));

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
      { count: result.count },
      new Date().toISOString(),
    );

    return await this.cacheDataService.getCacheData(CacheKey.ReposNum, ecoName);
  }

  @Command({
    command: 'test:eco:repos',
    description: 'Test eco repos',
  })
  async test() {
    await this.reposNum('ALL', false);
    return null;
  }
}
