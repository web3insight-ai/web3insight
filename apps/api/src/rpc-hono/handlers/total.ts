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

export const reposHandler = os.total.repos.handler(
  async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.RepoTotal,
      input.eco_name,
    );
    return (data ?? ZERO_TOTAL) as { total: number };
  },
);

export const actorsHandler = os.total.actors.handler(
  async ({ input, context }) => {
    // Contract uses lowercase 'core'; legacy DTO uses ActorsScopeType.Core ('Core').
    const key =
      input.scope === 'core' ? CacheKey.ActorCoreTotal : CacheKey.ActorTotal;
    const data = await getCache(context.container, key, input.eco_name);
    return (data ?? ZERO_TOTAL) as { total: number };
  },
);

export const actorsLastQuarterNewHandler =
  os.total.actorsLastQuarterNew.handler(async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.ActorTotalNew,
      input.eco_name,
    );
    return (data ?? ZERO_TOTAL) as { total: number };
  });

export const ecosystemsHandler = os.total.ecosystems.handler(
  async ({ context }) => {
    const data = await getCache(context.container, CacheKey.EcoTotal, ECO_ALL);
    return (data ?? ZERO_TOTAL) as { total: number };
  },
);

export const actorsByDateHandler = os.total.actorsByDate.handler(
  async ({ input, context }) => {
    const key =
      input.period === 'month'
        ? CacheKey.ActorMonthTotal
        : CacheKey.ActorWeekTotal;
    const data = await getCache(context.container, key, input.eco_name);
    return (data ?? { list: [] }) as {
      list: Array<{ date: string; total: number }>;
    };
  },
);

export const actorsByCountryHandler = os.total.actorsByCountry.handler(
  async ({ input, context }) => {
    const data = await getCache(
      context.container,
      CacheKey.ActorCountryStats,
      input.eco_name,
    );
    return (data ?? { total: 0, list: [] }) as {
      total: number;
      list: Array<{ country: string; total: number }>;
    };
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
