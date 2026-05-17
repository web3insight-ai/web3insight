import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { RPCHandler } from '@orpc/server/fetch';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
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

  const rpcHandler = new RPCHandler(router, {
    // Reason: surface RPC handler stack traces in Vercel runtime logs while
    // we still chase L7 bugs; otherwise the only visible signal is `<-- POST 500`.
    clientInterceptors: [
      async ({ next, path }) => {
        try {
          return await next();
        } catch (err) {
          console.error(`[rpc] ${path.join('.')} threw`, err);
          throw err;
        }
      },
    ],
  });
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

  // Legacy REST surface — serves /v1/* and /v2/* URLs straight from contract
  // route metadata via OpenAPIHandler. Keeps dashboard/web/dev-card fetchApi
  // calls working without per-app rewrites; same business logic as /rpc/*.
  const restHandler = new OpenAPIHandler(router, {
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });
  const mountRest = async (
    c: import('hono').Context<AppBindings>,
    prefix: string,
  ) => {
    const { response, matched } = await restHandler.handle(c.req.raw, {
      prefix,
      context: {
        container: c.get('container'),
        user: c.get('user'),
      },
    });
    if (matched && response) return response;
    return c.json({ error: 'Endpoint not found' }, 404);
  };
  app.all('/v1/*', (c) => mountRest(c, '/v1'));
  app.all('/v2/*', (c) => mountRest(c, '/v2'));

  return app;
}

export type App = ReturnType<typeof createApp>;
