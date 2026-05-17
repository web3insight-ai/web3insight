// Reason: legacy DTOs in src/api/dto/* still use class-validator decorators;
// reflect-metadata must be installed at process entry or `Reflect.getMetadata`
// crashes when the service modules load.
import 'reflect-metadata';

import type { IncomingMessage, ServerResponse } from 'node:http';

import { getContainer } from '../app/container';
import { env } from '../config/env';

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
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }
  }
  const container = getContainer(env);
  // Reason: CacheService doesn't expose a bulk-delete; the wired logic is
  // pending Phase F task #6 once we map which cache keys are safe to evict.
  void container;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ ok: true, cleared: 0, note: 'cache:clear stub' }));
}
