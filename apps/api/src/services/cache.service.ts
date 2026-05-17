import type { DbClient } from '@/db/client';
import type { CacheKeyValue } from '@/data/dto/cache.dto';

/**
 * Pure-class port of CacheDataService (data/services/cache.services.ts) without
 * NestJS DI decorators. The container constructs one instance per Vercel cold start.
 */
export class CacheService {
  constructor(private readonly db: DbClient) {}

  async get(key: CacheKeyValue, ecoName = 'ALL') {
    return this.db
      .selectFrom('api.caches')
      .selectAll()
      .where('cache_key', '=', key)
      .where('eco_name', '=', ecoName)
      .executeTakeFirst();
  }

  async update(
    key: CacheKeyValue,
    value: Record<string, unknown>,
    createdAt: string,
    ecoName = 'ALL',
  ): Promise<void> {
    await this.db
      .insertInto('api.caches')
      .values({
        cache_key: key,
        eco_name: ecoName,
        cache_data: value as never,
        created_at: createdAt,
      })
      .onConflict((oc) =>
        oc.columns(['cache_key', 'eco_name']).doUpdateSet({
          cache_data: value as never,
          created_at: createdAt,
        }),
      )
      .execute();
  }
}
