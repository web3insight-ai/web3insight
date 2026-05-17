import { ORPCError } from '@orpc/server';
import { os } from '../orpc';

/**
 * Github proxy handler — auth-protected pass-through to api.github.com.
 * Port of api/controller/github.controller.ts which used `Req` + GithubService.get(req).
 * Here we build the equivalent path/query shape from oRPC input.
 */
export const proxyHandler = os.github.proxy.handler(
  async ({ input, context }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Authentication required',
      });
    }
    const query: Record<string, string> = {};
    if (input.query) {
      for (const [k, v] of Object.entries(input.query)) {
        if (typeof v === 'string') query[k] = v;
        else if (typeof v === 'number' || typeof v === 'boolean')
          query[k] = String(v);
        // skip object/array values — GitHub query strings don't accept nested.
      }
    }
    const result = await context.container.services.github.get({
      path: `/${input.path}`,
      query,
    });
    return (result as Record<string, unknown>) ?? {};
  },
);

export const githubRouter = os.github.router({
  proxy: proxyHandler,
});
