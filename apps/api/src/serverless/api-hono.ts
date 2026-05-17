// Reason: legacy DTOs in src/api/dto/* still use class-validator decorators,
// which require the reflect-metadata polyfill installed at process entry. The
// NestJS main.ts that used to load this was deleted in L5, so the bundled
// function crashed with `TypeError: Reflect.getMetadata is not a function`.
// Loading the polyfill once at the Hono entry restores decorator metadata for
// all downstream service imports.
import 'reflect-metadata';

import { createApp } from '../app/create-app';
import { getContainer } from '../app/container';
import { env } from '../config/env';

const app = createApp({
  container: getContainer(env),
  jwtSecret: env.JWT_SECRET,
});

/**
 * Vercel Build Output API serverless entry — bundled by
 * scripts/bundle-functions.ts into .vercel/output/functions/api/hono.func/.
 *
 * vercel.json catch-all rewrites every URL to `/api/hono?path=<original>`,
 * so we reconstruct the original pathname before passing to the Hono router.
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const original = url.searchParams.get('path');
  if (original) {
    url.searchParams.delete('path');
    url.pathname = original.startsWith('/') ? original : `/${original}`;
    return app.fetch(new Request(url, req));
  }
  return app.fetch(req);
}
