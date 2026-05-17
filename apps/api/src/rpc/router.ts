import { os } from './orpc';
import { totalRouter } from './handlers/total';
import {
  rankStubRouter,
  repoStubRouter,
  authStubRouter,
  adminStubRouter,
  customStubRouter,
  donateStubRouter,
  githubStubRouter,
} from './handlers/stubs';

/**
 * Root router composing all sub-contracts. As each NestJS controller is migrated,
 * replace its stub here with the real router from handlers/<name>.ts.
 *
 * Migration status:
 * - ✅ total (full)
 * - 🚧 rank / repo / auth / admin / custom / donate / github (stub returning NOT_IMPLEMENTED)
 */
export const router = os.router({
  total: totalRouter,
  rank: rankStubRouter,
  repo: repoStubRouter,
  auth: authStubRouter,
  admin: adminStubRouter,
  custom: customStubRouter,
  donate: donateStubRouter,
  github: githubStubRouter,
});

export type AppRouter = typeof router;
