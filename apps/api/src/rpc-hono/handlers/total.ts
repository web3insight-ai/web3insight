import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { CacheKey, type CacheKeyValue } from '@/data/dto/cache.dto';
import { ECO_ALL } from '@/data/dto/data.dto';
import type { Container } from '@/app/container';

const ZERO_TOTAL = { total: 0 };

async function getCache(
  container: Container,
  key: CacheKeyValue,
  ecoName: string,
) {
  try {
    const res = await container.services.cache.get(key, ecoName);
    return res?.cache_data;
  } catch (err) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: err instanceof Error ? err.message : 'cache lookup failed',
    });
  }
}

// Reason: legacy `cache_data` JSONB blobs were written by the NestJS sync jobs
// with numeric totals serialized as strings (postgres COUNT()/SUM() returns
// bigint; old code did not cast). zod's `z.number()` on the response contract
// rejects strings, so we coerce at the read boundary to keep the contract
// strict for new writes while staying compatible with historical rows.
function coerceTotal(data: unknown): { total: number } {
  if (data && typeof data === 'object' && 'total' in data) {
    const t = (data as { total: unknown }).total;
    return { total: typeof t === 'number' ? t : Number(t ?? 0) };
  }
  return ZERO_TOTAL;
}

function coerceDateList(data: unknown): {
  list: Array<{ date: string; total: number }>;
} {
  if (data && typeof data === 'object' && 'list' in data) {
    const list = (data as { list: unknown }).list;
    if (Array.isArray(list)) {
      return {
        list: list.map((row) => ({
          date: String((row as { date: unknown }).date ?? ''),
          total: Number((row as { total: unknown }).total ?? 0),
        })),
      };
    }
  }
  return { list: [] };
}

function coerceCountryList(data: unknown): {
  total: number;
  list: Array<{ country: string; total: number }>;
} {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const list = obj.list;
    const t = obj.total;
    if (Array.isArray(list)) {
      return {
        total: typeof t === 'number' ? t : Number(t ?? 0),
        list: list.map((row) => ({
          country: String((row as { country: unknown }).country ?? ''),
          total: Number((row as { total: unknown }).total ?? 0),
        })),
      };
    }
  }
  return { total: 0, list: [] };
}

export const reposHandler = os.total.repos.handler(
  async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.RepoTotal,
      input.eco_name,
    );
    return coerceTotal(data);
  },
);

export const actorsHandler = os.total.actors.handler(
  async ({ input, context }) => {
    // Contract uses lowercase 'core'; legacy DTO uses ActorsScopeType.Core ('Core').
    const key =
      input.scope === 'core' ? CacheKey.ActorCoreTotal : CacheKey.ActorTotal;
    const data = await getCache(context.container, key, input.eco_name);
    return coerceTotal(data);
  },
);

export const actorsLastQuarterNewHandler =
  os.total.actorsLastQuarterNew.handler(async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.ActorTotalNew,
      input.eco_name,
    );
    return coerceTotal(data);
  });

export const ecosystemsHandler = os.total.ecosystems.handler(
  async ({ context }) => {
    const data = await getCache(context.container, CacheKey.EcoTotal, ECO_ALL);
    return coerceTotal(data);
  },
);

export const actorsByDateHandler = os.total.actorsByDate.handler(
  async ({ input, context }) => {
    const key =
      input.period === 'month'
        ? CacheKey.ActorMonthTotal
        : CacheKey.ActorWeekTotal;
    const data = await getCache(context.container, key, input.eco_name);
    return coerceDateList(data);
  },
);

export const actorsByCountryHandler = os.total.actorsByCountry.handler(
  async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.ActorCountryStats,
      input.eco_name,
    );
    return coerceCountryList(data);
  },
);

export const totalRouter = os.total.router({
  repos: reposHandler,
  actors: actorsHandler,
  actorsLastQuarterNew: actorsLastQuarterNewHandler,
  ecosystems: ecosystemsHandler,
  actorsByDate: actorsByDateHandler,
  actorsByCountry: actorsByCountryHandler,
});
