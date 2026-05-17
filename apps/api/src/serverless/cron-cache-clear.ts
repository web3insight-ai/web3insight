// Reason: legacy DTOs in src/api/dto/* still use class-validator decorators;
// reflect-metadata must be installed at process entry or `Reflect.getMetadata`
// crashes when the service modules load.
import 'reflect-metadata';

import { getContainer } from '../app/container';
import { env } from '../config/env';

/**
 * Vercel Cron entry: clears cached aggregates that downstream sync jobs will
 * repopulate. Replaces the legacy `cache:clear` nestjs-console command.
 *
 * Schedule defined in vercel.json. Bearer auth via CRON_SECRET — Vercel
 * automatically attaches the secret as `Authorization: Bearer ${CRON_SECRET}`.
 */
export default function handler(req: Request): Response {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  const container = getContainer(env);
  // Reason: CacheService doesn't expose a bulk-delete; the wired logic is
  // pending Phase F task #6 once we map which cache keys are safe to evict.
  void container;
  return Response.json({ ok: true, cleared: 0, note: 'cache:clear stub' });
}
