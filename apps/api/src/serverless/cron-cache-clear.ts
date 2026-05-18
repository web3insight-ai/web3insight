import type { IncomingMessage, ServerResponse } from 'node:http';

import { getContainer } from '../app/container';
import { env } from '../config/env';
import { logger } from '../app/logger';

const cronLogger = logger.child({ entry: 'cron/cache-clear' });

/**
 * Vercel Cron entry: clears cached aggregates that downstream sync jobs will
 * repopulate. Replaces the legacy `cache:clear` nestjs-console command.
 *
 * Schedule defined in vercel.json. Bearer auth via CRON_SECRET — Vercel
 * automatically attaches the secret as `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Uses Node (req, res) signature because that's what the `Nodejs` launcher in
 * the Build Output API provides.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (env.CRON_SECRET) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      cronLogger.warn('cron unauthorized', {
        hasAuthHeader: Boolean(auth),
      });
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }
  }
  const container = getContainer(env);
  // Reason: CacheService doesn't expose a bulk-delete; the wired logic is
  // pending Phase F task #6 once we map which cache keys are safe to evict.
  void container;
  cronLogger.info('cache-clear stub invoked', { cleared: 0 });
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ ok: true, cleared: 0, note: 'cache:clear stub' }));
}
