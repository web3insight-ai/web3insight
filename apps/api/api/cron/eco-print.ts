import { getContainer } from '../../src/app/container';
import { env } from '../../src/config/env';

/**
 * Vercel Cron: legacy `eco:print` command. Short job — runs in-handler.
 * Logs the top-300 ecosystems for ops visibility (used to be a one-shot
 * console invocation, now scheduled weekly).
 */
export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  const c = getContainer(env);
  const text = await c.services.eco.printEcoTop300();
  return Response.json({ ok: true, length: text?.length ?? 0 });
}
