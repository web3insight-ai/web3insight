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
 * Root router for the Hono runtime. All 47/47 oRPC procedures live here:
 *   total (6) · donate (5) · github (1) · repo (1) · rank (6)
 *   admin (4) · custom (11) · auth (13)
 * Auth is the Phase D Privy-only port — legacy GitHub OAuth + wallet bind +
 * magic number were intentionally dropped from the contract.
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
