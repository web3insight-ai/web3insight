import type { IncomingMessage, ServerResponse } from 'node:http';

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
 * The `Nodejs` launcher invokes the handler with Node http (req, res) — NOT a
 * Web Request — so we adapt: build a `Request` from IncomingMessage, run it
 * through Hono's `app.fetch`, then pipe the `Response` back to ServerResponse.
 *
 * vercel.json catch-all rewrites every URL to `/api/hono?path=<original>`,
 * so we reconstruct the original pathname before passing to the Hono router.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const host =
    (req.headers['x-forwarded-host'] as string | undefined) ??
    req.headers.host ??
    'localhost';
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https';
  const url = new URL(req.url ?? '/', `${proto}://${host}`);

  const original = url.searchParams.get('path');
  if (original) {
    url.searchParams.delete('path');
    url.pathname = original.startsWith('/') ? original : `/${original}`;
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(', '));
  }

  const method = req.method ?? 'GET';
  const hasBody = method !== 'GET' && method !== 'HEAD';
  let body: Buffer | undefined;
  if (hasBody) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    body = chunks.length ? Buffer.concat(chunks) : undefined;
  }

  const webReq = new Request(url, {
    method,
    headers,
    body,
    // Reason: required by undici when a body stream/buffer is attached.
    ...(body ? { duplex: 'half' } : {}),
  } as RequestInit);

  const webRes = await app.fetch(webReq);

  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (webRes.body) {
    const buf = Buffer.from(await webRes.arrayBuffer());
    res.end(buf);
  } else {
    res.end();
  }
}
