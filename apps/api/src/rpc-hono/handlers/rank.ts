import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { CacheKey } from '@/data/dto/cache.dto';
import { ECO_ALL } from '@/data/dto/data.dto';
import type { Container } from '@/app/container';

/**
 * Rank handlers — port of api/controller/rank.controller.ts.
 * Most read from CacheService directly (the legacy controller injected
 * CacheDataService alongside RankService for the same purpose).
 */

function requireUser(user: { id: number } | undefined): void {
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
  }
}

async function getCacheData(
  container: Container,
  key: (typeof CacheKey)[keyof typeof CacheKey],
  ecoName: string,
) {
  const res = await container.services.cache.get(key, ecoName);
  return res?.cache_data;
}

export const ecosystemsTopHandler = os.rank.ecosystemsTop.handler(
  async ({ context }) => {
    requireUser(context.user);
    try {
      const res = await context.container.services.rank.ecoRankTotal(ECO_ALL);
      return (res?.cache_data ?? { list: [] }) as never;
    } catch (err) {
      throw new ORPCError('BAD_REQUEST', {
        message:
          err instanceof Error ? err.message : 'Failed to load ecosystems',
      });
    }
  },
);

export const reposTopHandler = os.rank.reposTop.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    const data = await getCacheData(
      context.container,
      CacheKey.RepoStarRank,
      input.eco_name,
    );
    return (data ?? { list: [] }) as never;
  },
);

export const reposTop7dHandler = os.rank.reposTop7d.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    const data = await getCacheData(
      context.container,
      CacheKey.RepoStarRank7d,
      input.eco_name,
    );
    return (data ?? { list: [] }) as never;
  },
);

export const reposTopByDev7dHandler = os.rank.reposTopByDev7d.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    const data = await getCacheData(
      context.container,
      CacheKey.RepoDevRank7d,
      input.eco_name,
    );
    return (data ?? { list: [] }) as never;
  },
);

export const actorsTopHandler = os.rank.actorsTop.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    const data = await getCacheData(
      context.container,
      CacheKey.ActorScoreRank,
      input.eco_name,
    );
    return (data ?? { list: [] }) as never;
  },
);

export const yearsRankReportHandler = os.rank.yearsRankReport.handler(
  async ({ context }) => {
    // Public per legacy controller (no @UseGuards on getReport).
    const data = await getCacheData(
      context.container,
      CacheKey.YearsChineseSummary,
      'ALL',
    );
    if (!data) {
      throw new ORPCError('NOT_FOUND', { message: 'Cache not found' });
    }
    return data as never;
  },
);

export const rankRouter = os.rank.router({
  ecosystemsTop: ecosystemsTopHandler,
  reposTop: reposTopHandler,
  reposTop7d: reposTop7dHandler,
  reposTopByDev7d: reposTopByDev7dHandler,
  actorsTop: actorsTopHandler,
  yearsRankReport: yearsRankReportHandler,
});
