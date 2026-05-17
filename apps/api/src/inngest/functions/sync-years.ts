import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port of `sync:years` — yearly Chinese developer / ecosystem participation
 * report, cached under CacheKey.YearsChineseSummary.
 */
export const syncYears = inngest.createFunction(
  {
    id: 'sync-years',
    name: 'Sync yearly developer stats (Chinese cohort)',
    retries: 1,
    triggers: [{ event: 'sync/years' }, { cron: '0 7 1 * *' }],
  },
  async ({ event, step }) => {
    // Cron triggers populate CronEventData with no `year`; user-triggered events
    // can pass `{ year }`. Narrow accordingly.
    const data = event.data as { year?: number } | undefined;
    const year = data?.year ?? new Date().getFullYear();

    const stats = await step.run('chinese-yearly-stats', async () => {
      const c = getContainer(env);
      return c.services.years.getChineseDeveloperYearlyStats(year);
    });

    return { year, rows: stats.length };
  },
);
