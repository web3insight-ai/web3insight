import { os } from './orpc';
import { totalRouter } from './handlers/total';
import { donateRouter } from './handlers/donate';
import { githubRouter } from './handlers/github';
import { repoRouter } from './handlers/repo';
import { rankRouter } from './handlers/rank';
import { adminRouter } from './handlers/admin';
import { customRouter } from './handlers/custom';
import { authRouter } from './handlers/auth';

/**
 * Root router for the Hono runtime. Migration status:
 * - ✅ total (6 procedures, via container.services.cache)
 * - ✅ donate (5 procedures, via container.services.donate)
 * - ✅ github (1 procedure, via container.services.github)
 * - ✅ repo (1 procedure, via container.services.repos)
 * - ✅ rank (6 procedures, via container.services.{cache,rank})
 * - ✅ admin (4 procedures, via container.services.{eco,repos})
 * - ✅ custom (11 procedures, via container.services.users)
 * - 🚧 auth (13 procedures, STUB — Phase D ports AuthService)
 *
 * Total: 34 of 47 procedures live; 13 auth procedures stubbed.
 */
export const router = os.router({
  total: totalRouter,
  rank: rankRouter,
  repo: repoRouter,
  auth: authRouter,
  admin: adminRouter,
  custom: customRouter,
  donate: donateRouter,
  github: githubRouter,
});

export type AppRouter = typeof router;
