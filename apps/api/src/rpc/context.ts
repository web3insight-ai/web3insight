import type { Request, Response } from 'express';

/**
 * Request context passed into every oRPC handler.
 * Services are injected at module init via a service registry (see rpc.module.ts).
 */
export interface RpcContext {
  readonly req: Request;
  readonly res: Response;
  readonly headers: {
    readonly authorization?: string;
  };
  /** JWT-derived user payload if authenticated, else undefined. */
  readonly user?: {
    readonly id: number;
    readonly tag?: string;
  };
}

export type AuthenticatedRpcContext = RpcContext & {
  readonly user: NonNullable<RpcContext['user']>;
};
