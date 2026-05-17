import { implement } from '@orpc/server';
import { contract } from '@web3insight/api-contract';
import type { HonoRpcContext } from './context';

/**
 * oRPC implementer for the Hono runtime. Hono handlers import `os` from here;
 * the legacy NestJS implementer (`src/rpc/orpc.ts`) coexists during migration
 * but will be deleted in Phase C/H.
 */
export const os = implement(contract).$context<HonoRpcContext>();
