import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * GitHub API passthrough proxy. Body and response are pass-through `unknown`
 * because the proxy preserves Octokit's response shape per upstream path.
 */
export const githubContract = oc.tag('Github').router({
  /** GET /v1/proxy/:path — passthrough to api.github.com/<path> */
  proxy: oc
    .route({ method: 'GET', path: '/proxy/{path}' })
    .input(z.object({
      path: z.string(),
      query: z.record(z.string(), z.unknown()).optional(),
    }))
    .output(z.record(z.string(), z.unknown())),
});

export type GithubContract = typeof githubContract;
