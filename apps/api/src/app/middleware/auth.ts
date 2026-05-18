import { jwtVerify } from 'jose';
import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
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
    const cookieToken = getCookie(c, 'auth-token');
    const headerToken = c.req
      .header('authorization')
      ?.replace(/^Bearer\s+/i, '');
    const rawToken = cookieToken ?? headerToken;

    if (rawToken) {
      try {
        const { payload } = await jwtVerify(rawToken, secret);
        // Reason: legacy JwtPayload uses `uid` (string|number). New tokens may
        // use the standard `sub` field. Accept either so DATA_API_TOKEN
        // service tokens authenticate alongside modern user JWTs.
        const rawId = payload.uid ?? payload.sub;
        const id = rawId != null ? Number(rawId) : NaN;
        if (Number.isFinite(id)) {
          c.set('user', {
            id,
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
