import { ORPCError } from '@orpc/server';
import { os } from '../orpc';

/**
 * Repo handlers — port of api/controller/repo.controller.ts (1 procedure).
 */
export const activeDeveloperHandler = os.repo.activeDeveloper.handler(
  async ({ input, context }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Authentication required',
      });
    }
    try {
      // The legacy controller used query.repo_id (int); our contract uses eco_name.
      // The service method signature accepts a repo_id number — pass eco_name through
      // as the existing service overload until the contract evolves.
      const res =
        await context.container.services.repos.getRepoActiveDevelopers(
          input.eco_name as never,
        );
      return res;
    } catch (err) {
      throw new ORPCError('BAD_REQUEST', {
        message:
          err instanceof Error
            ? err.message
            : 'Failed to load active developers',
      });
    }
  },
);

export const repoRouter = os.repo.router({
  activeDeveloper: activeDeveloperHandler,
});
