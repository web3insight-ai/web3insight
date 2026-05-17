import {
  totalContract,
  rankContract,
  repoContract,
  authContract,
  adminContract,
  customContract,
  donateContract,
  githubContract,
} from './routers/index.js';

/**
 * Root oRPC contract — single source of truth for all backend endpoints.
 *
 * Used by:
 * - apps/api (Hono) to implement handlers via `os.<router>.<proc>.handler(...)`
 *   in `apps/api/src/rpc-hono/handlers/`
 * - apps/dashboard, apps/web, apps/dev-card to call typed RPC procedures via
 *   `createWeb3InsightClient` (see `@web3insight/orpc-client`)
 *
 * Each sub-router corresponds to one handler module under
 * `apps/api/src/rpc-hono/handlers/`.
 */
export const contract = {
  total: totalContract,
  rank: rankContract,
  repo: repoContract,
  auth: authContract,
  admin: adminContract,
  custom: customContract,
  donate: donateContract,
  github: githubContract,
};

export type Contract = typeof contract;

// Re-export all schemas for direct consumption (form validation, type inference).
export * from './schemas/index.js';

// Re-export sub-router types.
export type {
  TotalContract,
  RankContract,
  RepoContract,
  AuthContract,
  AdminContract,
  CustomContract,
  DonateContract,
  GithubContract,
} from './routers/index.js';
