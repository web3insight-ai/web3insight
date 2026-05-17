import { jwtVerify } from 'jose';
import type { MiddlewareHandler } from 'hono';
import type { AppBindings } from '@/app/create-app';

/**
 * JWT auth middleware. Reads `auth-token` cookie or `Authorization: Bearer ...`
 * header, verifies via jose with `JWT_SECRET`, and stuffs the payload into
 * `c.var.user` for downstream Hono handlers and oRPC procedures.
 *
 * On invalid/missing token: continues without setting user (auth-optional).
 * Procedures that require auth use `os.use(requireUser)` middleware (added in
 * Phase D) to throw UNAUTHORIZED when context.user is undefined.
 */
export function createAuthMiddleware(
  jwtSecret: string,
): MiddlewareHandler<AppBindings> {
  const secret = new TextEncoder().encode(jwtSecret);

  return async (c, next) => {
    const cookie = c.req.header('cookie') ?? '';
    const cookieMatch = cookie.match(/(?:^|;\s*)auth-token=([^;]+)/);
    const headerToken = c.req
      .header('authorization')
      ?.replace(/^Bearer\s+/i, '');
    const rawToken = cookieMatch?.[1]
      ? decodeURIComponent(cookieMatch[1])
      : headerToken;

    if (rawToken) {
      try {
        const { payload } = await jwtVerify(rawToken, secret);
        if (payload.sub) {
          c.set('user', {
            id: Number(payload.sub),
            tag: typeof payload.tag === 'string' ? payload.tag : undefined,
          });
        }
      } catch {
        // Reason: invalid tokens are treated as anonymous, not 401. Procedures
        // that require auth opt in via the oRPC requireUser middleware.
      }
    }

    await next();
  };
}
