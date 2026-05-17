import { inngest } from '../../src/inngest/client';
import { env } from '../../src/config/env';

/**
 * Vercel Cron: dispatches the full eco-total sync to Inngest. Long-running
 * work happens in Inngest steps; this handler just returns 200 immediately.
 */
export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  await inngest.send({ name: 'sync/eco.total.full', data: {} });
  return Response.json({ ok: true, dispatched: 'sync/eco.total.full' });
}
