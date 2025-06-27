import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheKey, CacheKeyValue } from '@/data/dto/cache.dto';

@Injectable()
@Console()
export class CacheDataService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  async updateCacheData(
    key: CacheKeyValue,
    value: Record<string, any>,
    created_at: string,
    eco_name = 'ALL',
  ): Promise<void> {
    await this.db
      .insertInto('api.caches')
      .values({
        cache_key: key,
        eco_name: eco_name,
        cache_data: value,
        created_at,
      })
      .onConflict((oc) =>
        oc.columns(['cache_key', 'eco_name']).doUpdateSet({
          cache_data: value,
          created_at,
        }),
      )
      .execute();
  }

  async getCacheData(key: CacheKeyValue, eco_name = 'ALL') {
    const result = await this.db
      .selectFrom('api.caches')
      .selectAll()
      .where('cache_key', '=', key)
      .where('eco_name', '=', eco_name)
      .executeTakeFirst();

    return result;
  }

  @Command({
    command: 'test:caches:update',
    description: 'Test eco repos',
  })
  async test(): Promise<void> {
    await this.updateCacheData(
      CacheKey.RepoTotal,
      { count: 0 },
      '2023-10-01',
      'Test',
    );
    const result = await this.getCacheData(CacheKey.RepoTotal, 'Test');

    console.log('result', result);
    return null;
  }
}
