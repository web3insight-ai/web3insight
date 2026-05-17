import type { Container } from '@/app/container';

/**
 * oRPC context shape for the Hono runtime. Carried into every procedure handler
 * via Hono c.var → oRPC RPCHandler.handle({ context }).
 *
 * The legacy `src/rpc/context.ts` shape (req/res from express + service-registry
 * singleton) will be deleted once all handlers are ported off NestJS.
 */
export interface HonoRpcContext {
  readonly container: Container;
  readonly user?: {
    readonly id: number;
    readonly tag?: string;
  };
}

export type AuthenticatedHonoRpcContext = HonoRpcContext & {
  readonly user: NonNullable<HonoRpcContext['user']>;
};
