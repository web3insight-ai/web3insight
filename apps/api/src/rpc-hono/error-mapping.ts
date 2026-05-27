import { ORPCError } from '@orpc/server';

/**
 * Shared service-layer Error → ORPCError mapper.
 *
 * Services throw plain `new Error('…')` instead of typed errors. Without this
 * mapping every business condition (resource missing, OAuth code rejected,
 * upstream provider down) surfaces to the REST/oRPC client as an opaque 500.
 *
 * Catalog of patterns — keep in sync with throws in
 * apps/api/src/services/*.service.ts when adding new ones:
 *   404 NOT_FOUND          — '… not found', '… not bound'
 *   400 BAD_REQUEST        — '… is required', 'Unsupported …'
 *   409 CONFLICT           — '… already bound …'
 *   502 BAD_GATEWAY        — upstream OAuth provider rejected the request
 *   503 SERVICE_UNAVAILABLE — '… not configured' (missing env var)
 *
 * ORPCError instances are passed through unchanged so handlers can throw
 * typed errors directly without being re-wrapped. Anything else (Drizzle
 * SQL errors, network blips, OOM, etc.) is re-thrown so the global error
 * handler still emits a 500 — those are not caller-induced.
 */
export async function mapServiceError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    const message = err instanceof Error ? err.message : '';
    if (!message) throw err;

    if (/(not found|not bound)$/i.test(message)) {
      throw new ORPCError('NOT_FOUND', { message });
    }
    if (/already bound /i.test(message)) {
      throw new ORPCError('CONFLICT', { message });
    }
    if (/is required$/i.test(message) || /^Unsupported /i.test(message)) {
      throw new ORPCError('BAD_REQUEST', { message });
    }
    if (/not configured$/i.test(message)) {
      throw new ORPCError('SERVICE_UNAVAILABLE', { message });
    }
    if (
      /^OpenBuild OAuth/i.test(message) ||
      /^Failed to get user from /i.test(message)
    ) {
      // Caller-supplied OAuth code or identity token was rejected by the
      // upstream provider — surface as 502 with the upstream message.
      throw new ORPCError('BAD_GATEWAY', { message });
    }

    // Upstream SDK errors that follow the {status, message} convention —
    // PrivyAPIError, Octokit RequestError, openapi-fetch, etc. — attach a
    // numeric `.status` field. Map it to the matching ORPCError so caller-
    // induced failures (bad Privy token → 400/401, GitHub 404, …) don't
    // disappear into a generic 500.
    const status = (err as { status?: unknown })?.status;
    if (typeof status === 'number') {
      if (status === 400)
        throw new ORPCError('BAD_REQUEST', { message: message || `${status}` });
      if (status === 401)
        throw new ORPCError('UNAUTHORIZED', { message: message || `${status}` });
      if (status === 403)
        throw new ORPCError('FORBIDDEN', { message: message || `${status}` });
      if (status === 404)
        throw new ORPCError('NOT_FOUND', { message: message || `${status}` });
      if (status === 409)
        throw new ORPCError('CONFLICT', { message: message || `${status}` });
      if (status === 422)
        throw new ORPCError('BAD_REQUEST', { message: message || `${status}` });
      if (status === 429)
        throw new ORPCError('TOO_MANY_REQUESTS', {
          message: message || `${status}`,
        });
      if (status >= 500)
        throw new ORPCError('BAD_GATEWAY', { message: message || `${status}` });
    }

    throw err;
  }
}
