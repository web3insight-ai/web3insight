import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';
import { logger as honoLogger } from 'hono/logger';
import { RPCHandler } from '@orpc/server/fetch';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { Scalar } from '@scalar/hono-api-reference';
import { router } from '@/rpc-hono/router';
import { createAuthMiddleware } from '@/app/middleware/auth';
import { getOpenApiSpec } from '@/app/docs';
import { logger } from '@/app/logger';
import type { Container } from '@/app/container';

export interface AppBindings {
  Variables: {
    container: Container;
    user?: { id: number; tag?: string };
    requestId: string;
  };
}

export interface CreateAppOptions {
  container: Container;
  jwtSecret: string;
  /** Comma-separated CORS allowlist. Unset → echo request Origin. */
  allowedOrigins?: string;
}

/**
 * Resolve the CORS Origin value for a request.
 *
 * `credentials: true` forbids the `*` wildcard, so we either echo the request's
 * Origin (when no allowlist is configured) or only echo when the origin is on
 * the configured list. Returning `null` makes Hono omit the CORS header and
 * the browser correctly blocks the response.
 */
function buildOriginPolicy(
  allowedOrigins?: string,
): (origin: string) => string | null {
  const allowlist = (allowedOrigins ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowlist.length === 0) {
    return (origin) => origin || null;
  }
  return (origin) => (allowlist.includes(origin) ? origin : null);
}

/**
 * Build the Hono app for the api runtime. Single fetch handler exported via
 * `api/hono.ts` (Vercel function) and reused by tests + local `vercel dev`.
 */
export function createApp({
  container,
  jwtSecret,
  allowedOrigins,
}: CreateAppOptions) {
  const app = new Hono<AppBindings>();

  app.use('*', requestId());
  app.use('*', secureHeaders());
  app.use(
    '*',
    bodyLimit({
      // Reason: every oRPC procedure body fits well under 1 MB. This caps a
      // class of trivial DoS where an attacker streams a huge POST body and
      // makes the Vercel function spin until the launcher timeout.
      maxSize: 1024 * 1024,
      onError: (c) => c.json({ error: 'Request body too large' }, 413),
    }),
  );

  // Structured access log — skip the health endpoint to keep cron noise out
  // of the log drain. Body logging is opt-in via LOG_LEVEL=debug.
  app.use('*', async (c, next) => {
    if (c.req.path === '/health') return next();
    return honoLogger((msg) => logger.info(msg, { reqId: c.get('requestId') }))(
      c,
      next,
    );
  });

  app.use(
    '*',
    cors({
      origin: buildOriginPolicy(allowedOrigins),
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposeHeaders: ['X-Request-Id'],
      maxAge: 86400,
    }),
  );

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
      async (options) => {
        try {
          return await options.next();
        } catch (err) {
          logger.error('rpc handler threw', {
            path: options.path.join('.'),
            err:
              err instanceof Error
                ? { message: err.message, stack: err.stack, name: err.name }
                : String(err),
          });
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
    return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  });

  // Legacy REST surface — serves /v1/* and /v2/* URLs straight from contract
  // route metadata via OpenAPIHandler. Keeps dashboard/web/dev-card fetchApi
  // calls working without per-app rewrites; same business logic as /rpc/*.
  const restHandler = new OpenAPIHandler(router);
  const mountRest = async (
    c: import('hono').Context<AppBindings>,
    prefix: `/${string}`,
  ) => {
    const { response, matched } = await restHandler.handle(c.req.raw, {
      prefix,
      context: {
        container: c.get('container'),
        user: c.get('user'),
      },
    });
    if (matched && response) return response;
    return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  };
  app.all('/v1/*', (c) => mountRest(c, '/v1'));
  app.all('/v2/*', (c) => mountRest(c, '/v2'));

  app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

  app.onError((err, c) => {
    logger.error('unhandled error', {
      reqId: c.get('requestId'),
      path: c.req.path,
      method: c.req.method,
      err:
        err instanceof Error
          ? { message: err.message, stack: err.stack, name: err.name }
          : String(err),
    });
    return c.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
      500,
    );
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
