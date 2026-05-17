import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { RPCHandler } from '@orpc/server/fetch';
import { Scalar } from '@scalar/hono-api-reference';
import { router } from '@/rpc-hono/router';
import { createAuthMiddleware } from '@/app/middleware/auth';
import { getOpenApiSpec } from '@/app/docs';
import type { Container } from '@/app/container';

export interface AppBindings {
  Variables: {
    container: Container;
    user?: { id: number; tag?: string };
  };
}

export interface CreateAppOptions {
  container: Container;
  jwtSecret: string;
}

/**
 * Build the Hono app for the api runtime. Single fetch handler exported via
 * `api/hono.ts` (Vercel function) and reused by tests + local `vercel dev`.
 */
export function createApp({ container, jwtSecret }: CreateAppOptions) {
  const app = new Hono<AppBindings>();

  app.use('*', honoLogger());
  app.use('*', cors({ origin: '*', credentials: true }));

  app.use('*', async (c, next) => {
    c.set('container', container);
    await next();
  });

  app.use('*', createAuthMiddleware(jwtSecret));

  app.get('/health', (c) =>
    c.json({ ok: true, runtime: 'hono', timestamp: new Date().toISOString() }),
  );

  app.get('/openapi.json', async (c) => c.json(await getOpenApiSpec()));
  app.get(
    '/doc/api',
    Scalar({
      url: '/openapi.json',
      pageTitle: 'Web3Insight API — Scalar Reference',
    }),
  );

  const rpcHandler = new RPCHandler(router);
  app.all('/rpc/*', async (c) => {
    const { response, matched } = await rpcHandler.handle(c.req.raw, {
      prefix: '/rpc',
      context: {
        container: c.get('container'),
        user: c.get('user'),
      },
    });
    if (matched && response) return response;
    return c.json({ error: 'RPC procedure not found' }, 404);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
