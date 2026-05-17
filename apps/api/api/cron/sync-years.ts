import { inngest } from '../../src/inngest/client';
import { env } from '../../src/config/env';

/**
 * Vercel Cron: dispatches the yearly Chinese-developer stats sync to Inngest.
 * Runs monthly (first of each month) per vercel.json schedule.
 */
export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  const year = new Date().getFullYear();
  await inngest.send({ name: 'sync/years', data: { year } });
  return Response.json({ ok: true, dispatched: 'sync/years', year });
}
