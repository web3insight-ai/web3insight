import { inngest } from '../../src/inngest/client';
import { env } from '../../src/config/env';

/**
 * Vercel Cron: fires the incremental rank sync as an Inngest event so the
 * actual work runs in Inngest's durable runtime (no 800s function cap).
 *
 * Schedule in vercel.json: every 6 hours.
 */
export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  await inngest.send({ name: 'sync/db.rank', data: {} });
  return Response.json({ ok: true, dispatched: 'sync/db.rank' });
}
