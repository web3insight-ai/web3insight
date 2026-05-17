import { createApp } from '../src/app/create-app';
import { getContainer } from '../src/app/container';
import { env } from '../src/config/env';

/**
 * Vercel Function entry for the Hono runtime. Reached at /api/hono and (via
 * vercel.json rewrites added in Phase H) eventually all of /rpc/*, /v1/*, /v2/*,
 * /doc/*.
 *
 * During Phase B–C migration this lives alongside the legacy `api/index.ts`
 * (NestJS) and only handles requests explicitly aimed at /api/hono — that way
 * the existing prod traffic is untouched until cutover.
 */

const app = createApp({
  container: getContainer(env),
  jwtSecret: env.JWT_SECRET,
});

export default async function handler(req: Request): Promise<Response> {
  return app.fetch(req);
}

// Vercel's @vercel/node runtime sometimes hands an IncomingMessage instead of
// a Web Request when the function is invoked without rewrites pointing at it.
// The export above is sufficient for the Node 22 Web-Fetch entrypoint.
export const config = {
  runtime: 'nodejs',
};
