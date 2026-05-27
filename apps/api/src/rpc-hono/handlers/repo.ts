import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { mapServiceError } from '../error-mapping';

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
    return (await mapServiceError(() =>
      context.container.services.repos.getRepoActiveDevelopers(input.repo_id),
    )) as never;
  },
);

export const repoRouter = os.repo.router({
  activeDeveloper: activeDeveloperHandler,
});
