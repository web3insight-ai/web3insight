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
 * - apps/api (NestJS) to implement handlers via `implement(contract).$context<Ctx>()`
 * - apps/dashboard, apps/web, apps/dev-card to call typed RPC procedures via
 *   `createORPCClient(new RPCLink({ url }))`
 *
 * Each sub-router corresponds to one legacy NestJS controller under
 * `apps/api/src/api/controller/`.
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
