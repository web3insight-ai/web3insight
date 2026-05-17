import { ORPCError } from '@orpc/server';

/**
 * Throws NOT_IMPLEMENTED. Used to register oRPC procedures whose handlers haven't
 * been migrated from NestJS controllers yet. The existing REST endpoint still
 * works via the legacy `@Controller()` decorators — clients can call either form
 * during the migration window.
 */
export function notImplementedHandler() {
  return () => {
    throw new ORPCError('NOT_IMPLEMENTED', {
      message:
        'This RPC procedure is not yet migrated. Use the legacy REST endpoint.',
    });
  };
}
