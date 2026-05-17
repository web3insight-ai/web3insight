import { getContainer } from '../../src/app/container';
import { env } from '../../src/config/env';

/**
 * Vercel Cron: clears cached aggregates that downstream sync jobs will
 * repopulate. Replaces the legacy `cache:clear` nestjs-console command.
 *
 * Schedule defined in vercel.json. Bearer auth via CRON_SECRET — Vercel
 * automatically attaches the secret as `Authorization: Bearer ${CRON_SECRET}`.
 */
export const config = { runtime: 'nodejs', maxDuration: 300 };

export default function handler(req: Request): Response {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  const container = getContainer(env);
  // CacheService doesn't expose a bulk-delete; iterate known keys instead.
  // For now this is a no-op marker — Phase F task #6 adds the real clear logic
  // once we map which cache keys are safe to evict on this schedule.
  void container;
  return Response.json({ ok: true, cleared: 0, note: 'cache:clear stub' });
}
