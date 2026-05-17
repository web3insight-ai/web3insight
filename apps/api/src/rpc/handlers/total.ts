import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { getRegistry } from '../service-registry';
import { CacheKey, type CacheKeyValue } from '@/data/dto/cache.dto';
import { ECO_ALL } from '@/data/dto/data.dto';

const ZERO_TOTAL = { total: 0 };

async function getCache(key: CacheKeyValue, ecoName: string) {
  const registry = getRegistry();
  try {
    const res = await registry.cache.getCacheData(key, ecoName);
    return res?.cache_data;
  } catch (err) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: err instanceof Error ? err.message : 'cache lookup failed',
    });
  }
}

export const reposHandler = os.total.repos.handler(async ({ input }) => {
  const data = await getCache(CacheKey.RepoTotal, input.eco_name);
  return (data ?? ZERO_TOTAL) as { total: number };
});

export const actorsHandler = os.total.actors.handler(async ({ input }) => {
  // Contract uses lowercase 'core'; legacy DTO uses ActorsScopeType.Core ('Core')
  const key = input.scope === 'core' ? CacheKey.ActorCoreTotal : CacheKey.ActorTotal;
  const data = await getCache(key, input.eco_name);
  return (data ?? ZERO_TOTAL) as { total: number };
});

export const actorsLastQuarterNewHandler = os.total.actorsLastQuarterNew.handler(async ({ input }) => {
  const data = await getCache(CacheKey.ActorTotalNew, input.eco_name);
  return (data ?? ZERO_TOTAL) as { total: number };
});

export const ecosystemsHandler = os.total.ecosystems.handler(async () => {
  const data = await getCache(CacheKey.EcoTotal, ECO_ALL);
  return (data ?? ZERO_TOTAL) as { total: number };
});

export const actorsByDateHandler = os.total.actorsByDate.handler(async ({ input }) => {
  // Contract enum value 'month' matches StatsPeriod.MONTH ('month')
  const key = input.period === 'month' ? CacheKey.ActorMonthTotal : CacheKey.ActorWeekTotal;
  const data = await getCache(key, input.eco_name);
  return (data ?? { list: [] }) as { list: Array<{ date: string; total: number }> };
});

export const actorsByCountryHandler = os.total.actorsByCountry.handler(async ({ input }) => {
  const data = await getCache(CacheKey.ActorCountryStats, input.eco_name);
  return (data ?? { total: 0, list: [] }) as { total: number; list: Array<{ country: string; total: number }> };
});

export const totalRouter = os.total.router({
  repos: reposHandler,
  actors: actorsHandler,
  actorsLastQuarterNew: actorsLastQuarterNewHandler,
  ecosystems: ecosystemsHandler,
  actorsByDate: actorsByDateHandler,
  actorsByCountry: actorsByCountryHandler,
});
