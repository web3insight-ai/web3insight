import { and, eq } from 'drizzle-orm';
import type { DbClient } from '@/db/client';
import { api_caches } from '@/db/schema';
import { first } from '@/db/helpers';
import type { CacheKeyValue } from '@/data/dto/cache.dto';

/**
 * Pure-class port of CacheDataService (data/services/cache.services.ts) without
 * NestJS DI decorators. The container constructs one instance per Vercel cold start.
 */
export class CacheService {
  constructor(private readonly db: DbClient) {}

  async get(key: CacheKeyValue, ecoName = 'ALL') {
    return first(
      this.db
        .select()
        .from(api_caches)
        .where(
          and(eq(api_caches.cache_key, key), eq(api_caches.eco_name, ecoName)),
        )
        .limit(1),
    );
  }

  async update(
    key: CacheKeyValue,
    value: Record<string, unknown>,
    createdAt: string,
    ecoName = 'ALL',
  ): Promise<void> {
    await this.db
      .insert(api_caches)
      .values({
        cache_key: key,
        eco_name: ecoName,
        cache_data: value,
        created_at: createdAt,
      })
      .onConflictDoUpdate({
        target: [api_caches.cache_key, api_caches.eco_name],
        set: {
          cache_data: value,
          created_at: createdAt,
        },
      });
  }
}
