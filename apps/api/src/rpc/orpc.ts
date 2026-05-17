import { implement } from '@orpc/server';
import { contract } from '@web3insight/api-contract';
import type { RpcContext } from './context';

/**
 * Single oRPC implementer for the entire contract. All handler files use this.
 *
 * Usage:
 * ```ts
 * import { os } from '../orpc';
 * export const reposTotalHandler = os.total.repos.handler(async ({ input, context }) => {
 *   return { total: 42 };
 * });
 * ```
 */
export const os = implement(contract).$context<RpcContext>();
